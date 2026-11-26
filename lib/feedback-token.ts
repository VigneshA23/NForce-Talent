import {env} from 'cloudflare:workers';
import {digest} from './passwords';

const encoder=new TextEncoder();
const runtime=()=>env as unknown as Record<string,string|undefined>;
const base64url=(bytes:Uint8Array)=>{
 let binary='';
 for(const byte of bytes)binary+=String.fromCharCode(byte);
 return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
};

async function signingKey(){
 const secret=runtime().FEEDBACK_TOKEN_SECRET;
 if(!secret)throw new Error('Feedback token signing is not configured.');
 return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}

export async function createFeedbackToken(requestId:string){
 const signature=await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(requestId));
 return `${requestId}.${base64url(new Uint8Array(signature))}`;
}

export async function verifyFeedbackToken(value:string){
 const dot=value.lastIndexOf('.');
 if(dot<1)return null;
 const requestId=value.slice(0,dot),supplied=value.slice(dot+1),expected=(await createFeedbackToken(requestId)).slice(dot+1);
 if(supplied.length!==expected.length)return null;
 let difference=0;
 for(let i=0;i<supplied.length;i++)difference|=supplied.charCodeAt(i)^expected.charCodeAt(i);
 return difference===0?requestId:null;
}

export const feedbackTokenHash=(value:string)=>digest(value);
