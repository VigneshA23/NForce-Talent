import {z} from 'zod';
import {db} from '@/lib/workspace';
import {dispatchFeedbackRequests} from '@/lib/feedback-delivery';
import {publicFeedbackUrl,sendFeedbackEmail} from '@/lib/brevo';

export const dynamic='force-dynamic';
const requestSchema=z.object({jsonrpc:z.literal('2.0'),id:z.union([z.string(),z.number(),z.null()]).optional(),method:z.string(),params:z.record(z.unknown()).optional()});
const argumentsSchema=z.object({limit:z.number().int().min(1).max(50).optional()});
const tools=[{name:'process_due_feedback_requests',description:'Send due NForce Talent employee interview-feedback requests and one pending reminder through the configured Brevo sender.',inputSchema:{type:'object',properties:{limit:{type:'integer',minimum:1,maximum:50,description:'Maximum eligible interviews to process in this run.'}},additionalProperties:false}},{name:'send_sample_feedback_email',description:'Send one clearly labelled NForce Talent sample feedback-request email without creating or changing an interview record.',inputSchema:{type:'object',properties:{email:{type:'string',format:'email',description:'Exact sample recipient email address.'},name:{type:'string',description:'Recipient display name.'}},required:['email'],additionalProperties:false}}];

const result=(id:string|number|null|undefined,value:unknown)=>Response.json({jsonrpc:'2.0',id:id??null,result:value},{headers:{'Cache-Control':'no-store'}});
const failure=(id:string|number|null|undefined,code:number,message:string)=>Response.json({jsonrpc:'2.0',id:id??null,error:{code,message}},{headers:{'Cache-Control':'no-store'}});

async function requireOwner(request:Request){
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!userId)throw new Error('Authenticated Site owner required.');
 const owner=await db().prepare("SELECT value FROM settings WHERE key='initial_owner'").first<{value:string}>();
 if(!owner||owner.value!==userId)throw new Error('Only the NForce Talent owner can run employee email delivery.');
}

export async function POST(request:Request){
 let id:string|number|null|undefined=null;
 try{
  const body=requestSchema.parse(await request.json());id=body.id;
  if(body.method==='server/discover')return result(id,{supportedVersions:['2026-07-28'],capabilities:{tools:{}}});
  if(body.method==='tools/list')return result(id,{tools});
  if(body.method==='tools/call'){
   const params=z.object({name:z.string(),arguments:z.record(z.unknown()).optional()}).parse(body.params||{});
   await requireOwner(request);
   if(params.name==='process_due_feedback_requests'){
    const args=argumentsSchema.parse(params.arguments||{}),summary=await dispatchFeedbackRequests({limit:args.limit||25});
    return result(id,{content:[{type:'text',text:`Checked ${summary.checked}; sent ${summary.sent}; reminders ${summary.reminded}; failed ${summary.failed}; skipped ${summary.skipped}.`}],structuredContent:summary,isError:false});
   }
   if(params.name==='send_sample_feedback_email'){
    const args=z.object({email:z.string().email(),name:z.string().trim().min(1).max(120).optional()}).parse(params.arguments||{}),now=Date.now();
    const delivered=await sendFeedbackEmail({name:args.name||'Vignesh',email:args.email,title:'Senior Java Developer',client:'Northstar Financial',round:'Client technical interview',interviewDate:new Date(now-24*60*60*1000).toISOString(),feedbackUrl:publicFeedbackUrl('preview'),reminder:false,expiresAt:now+7*24*60*60*1000,sample:true});
    return result(id,{content:[{type:'text',text:`Sample feedback email sent to ${args.email}.`}],structuredContent:{sent:true,recipient:args.email,messageId:delivered.messageId},isError:false});
   }
   return failure(id,-32601,'Unknown tool.');
  }
  return failure(id,-32601,'Method not found.');
 }catch(error){
  const message=error instanceof Error?error.message:'Request failed.';
  return failure(id,-32000,message);
 }
}
