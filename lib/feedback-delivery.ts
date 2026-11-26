import {db} from './workspace';
import {createFeedbackToken,feedbackTokenHash} from './feedback-token';
import {feedbackEmailState,publicFeedbackUrl,sendFeedbackEmail} from './brevo';

type DispatchOptions={interviewId?:string;force?:boolean;limit?:number};
type Candidate={interview_id:string;end:string;round:string;name:string;email:string;title:string;client:string;request_id:string|null;status:string|null;sent_at:number|null;last_sent_at:number|null;opened_at:number|null;submitted_at:number|null;expires_at:number|null;reminder_count:number|null};

export async function dispatchFeedbackRequests(options:DispatchOptions={}){
 const state=feedbackEmailState();
 if(!state.providerConfigured)throw new Error('Brevo sender is not configured.');
 if(!state.publicFormConfigured)throw new Error('Secure feedback form is not configured.');
 if(!state.deliveryEnabled)throw new Error('Employee feedback delivery is paused.');
 const now=Date.now(),initialCutoff=new Date(now-24*60*60*1000).toISOString(),reminderCutoff=now-2*24*60*60*1000,d=db(),limit=Math.min(Math.max(options.limit||20,1),50);
 const query=`SELECT i.id interview_id,i.end,i.round,p.name,p.email,r.title,r.client,
 f.id request_id,f.status,f.sent_at,f.last_sent_at,f.opened_at,f.submitted_at,f.expires_at,f.reminder_count
 FROM interviews i JOIN applications a ON a.id=i.application_id JOIN people p ON p.id=a.person_id JOIN requirements r ON r.id=a.requirement_id
 LEFT JOIN feedback_requests f ON f.interview_id=i.id
 WHERE p.kind='Internal' AND i.attendance='Completed' AND i.employee_feedback IS NULL
 ${options.interviewId?'AND i.id=?':''}
 ORDER BY i.end ASC LIMIT ?`;
 const result=options.interviewId?await d.prepare(query).bind(options.interviewId,limit).all<Candidate>():await d.prepare(query).bind(limit).all<Candidate>();
 const summary={checked:result.results.length,sent:0,reminded:0,failed:0,skipped:0,items:[] as {interviewId:string;status:string;error?:string}[]};
 for(const row of result.results){
  const initial=!row.request_id,reminder=!initial&&Boolean(row.sent_at)&&!row.submitted_at&&(row.reminder_count||0)<1;
  const due=initial?row.end<=initialCutoff:reminder&&Boolean(row.last_sent_at&&row.last_sent_at<=reminderCutoff)&&Boolean(row.expires_at&&row.expires_at>now);
  const retry=!initial&&row.status==='Failed'&&Boolean(row.expires_at&&row.expires_at>now);
  if(!options.force&&!due&&!retry){summary.skipped++;continue}
  if(!initial&&['Submitted','Expired'].includes(row.status||'')){summary.skipped++;continue}
  const requestId=row.request_id||crypto.randomUUID(),token=await createFeedbackToken(requestId),expiresAt=row.expires_at||now+7*24*60*60*1000,scheduledAt=new Date(row.end).getTime()+24*60*60*1000,isReminder=Boolean(row.sent_at);
  try{
   if(initial){
    await d.prepare("INSERT INTO feedback_requests(id,interview_id,token_hash,status,scheduled_at,expires_at,reminder_count,created_by,created_at) VALUES(?,?,?,'Sending',?,?,0,'automation',?)").bind(requestId,row.interview_id,feedbackTokenHash(token),scheduledAt,expiresAt,now).run();
   }else{
    const claimed=await d.prepare("UPDATE feedback_requests SET status='Sending',token_hash=?,last_error=NULL WHERE id=? AND status IN ('Failed','Sent','Opened')").bind(feedbackTokenHash(token),requestId).run();
    if(!claimed.meta.changes){summary.skipped++;continue}
   }
   const delivered=await sendFeedbackEmail({name:row.name,email:row.email,title:row.title,client:row.client,round:row.round,interviewDate:row.end,feedbackUrl:publicFeedbackUrl(token),reminder:isReminder,expiresAt});
   await d.batch([
    d.prepare("UPDATE feedback_requests SET status=?,sent_at=COALESCE(sent_at,?),last_sent_at=?,reminder_count=reminder_count+?,delivery_id=?,last_error=NULL WHERE id=?").bind(row.opened_at?'Opened':'Sent',now,now,isReminder?1:0,delivered.messageId,requestId),
    d.prepare("INSERT INTO activity(id,actor_id,actor_name,action,entity_id,created_at) VALUES(?,'feedback-automation','Feedback automation',?,?,?)").bind(crypto.randomUUID(),isReminder?'Sent employee feedback reminder':'Sent employee feedback request',row.interview_id,new Date(now).toISOString()),
   ]);
   if(isReminder)summary.reminded++;else summary.sent++;
   summary.items.push({interviewId:row.interview_id,status:isReminder?'Reminder sent':'Sent'});
  }catch(error){
   const message=error instanceof Error?error.message:'Delivery failed';
   await d.prepare("UPDATE feedback_requests SET status='Failed',last_error=? WHERE id=?").bind(message.slice(0,1000),requestId).run().catch(()=>undefined);
   summary.failed++;summary.items.push({interviewId:row.interview_id,status:'Failed',error:message});
  }
 }
 return summary;
}
