import {env} from 'cloudflare:workers';

type InterviewEmail={name:string;email:string;title:string;client:string;round:string;interviewDate:string;feedbackUrl:string;reminder:boolean;expiresAt:number;sample?:boolean};
const runtime=()=>env as unknown as Record<string,string|undefined>;
const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char));

export function feedbackEmailState(){
 const e=runtime();
 return {
  providerConfigured:Boolean(e.BREVO_API_KEY&&e.FEEDBACK_FROM_ADDRESS),
  publicFormConfigured:Boolean(e.PUBLIC_FEEDBACK_URL&&e.FEEDBACK_TOKEN_SECRET),
  deliveryEnabled:e.FEEDBACK_DELIVERY_ENABLED==='true',
  senderAddress:e.FEEDBACK_FROM_ADDRESS||'',
 };
}

export function publicFeedbackUrl(token:string){
 const base=runtime().PUBLIC_FEEDBACK_URL?.replace(/\/$/,'');
 if(!base)throw new Error('Public feedback URL is not configured.');
 return `${base}/feedback/${encodeURIComponent(token)}`;
}

export async function sendFeedbackEmail(message:InterviewEmail){
 const e=runtime(),key=e.BREVO_API_KEY,from=e.FEEDBACK_FROM_ADDRESS,fromName=e.FEEDBACK_FROM_NAME||'NForce Talent';
 if(!key||!from)throw new Error('Brevo sender is not configured.');
 if(e.FEEDBACK_DELIVERY_ENABLED!=='true'&&!message.sample)throw new Error('Employee feedback delivery is paused.');
 const first=esc(message.name.split(' ')[0]||message.name),title=esc(message.title),client=esc(message.client),round=esc(message.round);
 const subject=message.sample?'[Sample] NForce Talent interview feedback request':message.reminder?`Reminder: interview feedback for ${message.title}`:`Interview feedback requested: ${message.title}`;
 const publicBase=(e.PUBLIC_FEEDBACK_URL||'').replace(/\/$/,'');
 const brandHeader=`<tr><td style="padding:0;font-size:0;line-height:0;border-bottom:5px solid #B11116"><img src="${esc(publicBase)}/email-header.jpg" width="560" alt="NForce Talent" style="display:block;width:100%;max-width:560px;height:auto;border:0"></td></tr>`;
 const htmlContent=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Arial,sans-serif;color:#24272b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8FAFC;padding:40px 16px"><tr><td align="center"><table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;background:#fff;border:1px solid #CBD5E1;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,.08)">${brandHeader}${message.sample?'<tr><td style="padding:10px 20px;background:#FEF2F2;color:#991B1B;text-align:center;font-size:12px;font-weight:800;letter-spacing:1px">SAMPLE EMAIL · NO ACTION REQUIRED</td></tr>':''}<tr><td style="padding:40px 40px 32px"><p style="margin:0 0 9px;font-size:12px;font-weight:700;letter-spacing:1.6px;color:#9c4655">INTERVIEW FOLLOW-UP</p><h1 style="font-family:'Space Grotesk',Arial,sans-serif;font-size:26px;line-height:1.28;font-weight:700;color:#0F172A;margin:0 0 20px;letter-spacing:-.01em">${message.reminder?'A quick reminder about your interview.':'Help us prepare for what comes next.'}</h1><p style="font-size:15px;line-height:1.75;margin:0 0 16px;color:#374151">Hi ${first},</p><p style="font-size:15px;line-height:1.75;margin:0 0 28px;color:#6B7280">Please share your recollection of the <strong style="color:#374151;font-weight:600">${round}</strong> for <strong style="color:#374151;font-weight:600">${title}</strong> with <strong style="color:#374151;font-weight:600">${client}</strong>. Your questions, answers and preparation notes will be visible only to authorized HR administrators.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;margin:0 0 32px"><tr><td style="padding:22px 24px 14px;font-size:14px;line-height:1.75;color:#6B7280"><p style="margin:0 0 8px"><strong style="color:#111827;font-weight:600">Interview:</strong> ${round}</p><p style="margin:0 0 8px"><strong style="color:#111827;font-weight:600">Date:</strong> ${esc(new Date(message.interviewDate).toLocaleString('en-US',{timeZone:'America/New_York',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}))} ET</p></td></tr></table><table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 32px"><tr><td style="background:#B11116;border-radius:10px;text-align:center"><a href="${esc(message.feedbackUrl)}" style="display:inline-block;font-family:Inter,Arial,sans-serif;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 40px">${message.sample?'Preview secure feedback form':'Open secure feedback form'}</a></td></tr></table><p style="font-size:13.5px;line-height:1.7;color:#94A3B8;margin:0 0 20px">No portal account is required. ${message.sample?'This sample does not create or modify an interview record.':`This private, single-use link expires on ${esc(new Date(message.expiresAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))}.`}</p><p style="font-size:13.5px;line-height:1.7;color:#94A3B8;margin:0">Need help? Contact your HR administrator.<br>This is an automated message, please do not reply.</p></td></tr><tr><td align="center" style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:22px 36px"><p style="margin:0;font-size:13px;color:#94A3B8">© ${new Date().getUTCFullYear()} NForce Talent · All rights reserved</p></td></tr></table></td></tr></table></body></html>`;
 const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':key,'content-type':'application/json'},body:JSON.stringify({sender:{email:from,name:fromName},to:[{email:message.email,name:message.name}],subject,htmlContent,tags:['nforce-talent',message.sample?'feedback-sample':message.reminder?'feedback-reminder':'feedback-request']})});
 const result=await response.json().catch(()=>({})) as {messageId?:string;message?:string;code?:string};
 if(!response.ok)throw new Error(result.message||result.code||`Brevo delivery failed (${response.status}).`);
 return {messageId:result.messageId||''};
}
