import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {session,errorResponse,canWrite} from '@/lib/workspace';
import {dispatchFeedbackRequests} from '@/lib/feedback-delivery';

export const dynamic='force-dynamic';
const bodySchema=z.object({interviewId:z.string().min(1).max(100).optional(),force:z.boolean().optional(),limit:z.number().int().min(1).max(50).optional()});

async function authorized(request:Request){
 const runtime=env as unknown as Record<string,string|undefined>,authorization=request.headers.get('authorization');
 if(runtime.FEEDBACK_JOB_KEY&&authorization===`Bearer ${runtime.FEEDBACK_JOB_KEY}`)return;
 const member=await session();canWrite(member);
}

export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid request origin'},{status:403});
  await authorized(request);
  const body=bodySchema.parse(await request.json().catch(()=>({})));
  return Response.json(await dispatchFeedbackRequests(body),{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  if(error instanceof z.ZodError)return Response.json({error:'Invalid delivery request.'},{status:400});
  return errorResponse(error);
 }
}
