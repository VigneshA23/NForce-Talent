import {cookies} from 'next/headers';
import {session,db,event} from '@/lib/workspace';
import {COOKIE,portalSession,createPortalSession,sessionCookie} from '@/lib/portal-auth';
import {hashPassword,verifyPassword,validatePassword,secretToken,digest} from '@/lib/passwords';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const reply=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{...headers,...(cookie?{'Set-Cookie':cookie}:{})}});
const invalid=()=>reply({error:'Unable to sign in. Check your details or contact your HR Administrator.'},401);
// Work is performed for incorrect passwords and nonmatching emails too.
const dummy='pbkdf2:sha256:310000:00000000000000000000000000000000:'+('00'.repeat(32));
export async function GET(){
 try{const m=await session();return reply({email:m.email,name:m.name,configured:true,authenticated:true,canBootstrap:false})}catch{}
 return reply({email:'',configured:true,authenticated:false,canBootstrap:false});
}
export async function POST(request:Request){let stage='request';try{
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')return reply({error:'Refresh the page and try again.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Unsupported request.'},415);
 const raw=await request.text();if(raw.length>8192)return reply({error:'Request too large.'},413);let b:any;try{b=JSON.parse(raw)}catch{return reply({error:'Invalid request.'},400)}
 stage='database-binding';const d=db(),now=Date.now();
 if(b.action==='logout'){const t=(await cookies()).get(COOKIE)?.value;if(t)await d.prepare('DELETE FROM portal_sessions WHERE token_hash=?').bind(digest(t)).run();return reply({ok:true},200,sessionCookie(''))}
 const email=typeof b.email==='string'?b.email.trim().toLowerCase().slice(0,254):'';
 const m=['issueTemp','issueReset'].includes(b.action)?await session():await d.prepare("SELECT * FROM members WHERE lower(email)=? AND active=1 AND role IN ('hr','admin')").bind(email).first<any>()||{id:'unknown:'+digest(email),email,role:''};
 if(!['login','setup','recover','reset','issueReset','issueTemp'].includes(b.action))return reply({error:'Unsupported request.'},400);
 const key=`${m.id}:${['issueReset','issueTemp','bootstrapTemp'].includes(b.action)?'admin':'password'}`;
 stage='rate-write';await d.prepare('INSERT INTO auth_limits(key,count,window_start) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start<? THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start<? THEN ? ELSE window_start END').bind(key,now,now-900000,now-900000,now).run();
 stage='rate-read';const rate=await d.prepare('SELECT count FROM auth_limits WHERE key=?').bind(key).first<{count:number}>();if((rate?.count||0)>10)return reply({error:'Too many attempts. Please wait 15 minutes before trying again.'},429);
 if(b.action==='issueTemp'){
  const actor=await session();if(actor.role!=='hr')return reply({error:'Access denied.'},403);
  const target=await d.prepare("SELECT * FROM members WHERE id=? AND active=1 AND role IN ('hr','admin')").bind(typeof b.memberId==='string'?b.memberId:'').first<any>();if(!target)return reply({error:'Select an active HR Administrator or Administrator.'},400);
  const temporaryPassword=secretToken().slice(0,24),passwordHash=await hashPassword(temporaryPassword),recoveryHash=digest(secretToken());
  const statement=d.prepare('INSERT INTO portal_credentials(member_id,password_hash,recovery_hash,version,updated_at,temporary,temporary_expires_at) VALUES(?,?,?,1,?,1,?) ON CONFLICT(member_id) DO UPDATE SET password_hash=excluded.password_hash,recovery_hash=excluded.recovery_hash,version=portal_credentials.version+1,updated_at=excluded.updated_at,temporary=1,temporary_expires_at=excluded.temporary_expires_at').bind(target.id,passwordHash,recoveryHash,now,now+86400000);
  const result=await statement.run();if(!result.meta.changes)return reply({error:'Access was already provisioned. Sign in or contact HR.'},409);
  await d.batch([d.prepare('DELETE FROM portal_sessions WHERE member_id=?').bind(target.id),d.prepare('DELETE FROM password_resets WHERE member_id=?').bind(target.id),event(actor,'Issued temporary portal password',target.id)]);
  return reply({temporaryPassword,expiresIn:86400});
 }
 if(b.action==='issueReset'){
  const actor=await session();if(actor.role!=='hr')return reply({error:'Access denied.'},403);
  const target=typeof b.memberId==='string'?await d.prepare("SELECT id FROM members WHERE id=? AND active=1 AND role IN ('hr','admin')").bind(b.memberId).first<{id:string}>():null;if(!target)return reply({error:'Select an active HR Administrator or Administrator.'},400);
  const token=secretToken();await d.batch([d.prepare('DELETE FROM password_resets WHERE member_id=? OR expires_at<?').bind(target.id,now),d.prepare('INSERT INTO password_resets(token_hash,member_id,expires_at) VALUES(?,?,?)').bind(digest(token),target.id,now+900000),event(actor,'Issued password reset link',target.id)]);return reply({token,expiresIn:900});
 }
 stage='credential-read';const c=await d.prepare('SELECT * FROM portal_credentials WHERE member_id=?').bind(m.id).first<any>();
 if(b.action==='login'){
  const pw=typeof b.password==='string'&&b.password.length<=512?b.password:'';
  stage='password';const matches=await verifyPassword(pw,c?.password_hash||dummy);
  if(!c||!matches||typeof b.email!=='string'||b.email.trim().toLowerCase()!==m.email.toLowerCase())return invalid();
  if(c.temporary){
   if(!c.temporary_expires_at||c.temporary_expires_at<=now)return invalid();
   const challenge=secretToken();await d.batch([d.prepare('DELETE FROM password_resets WHERE member_id=?').bind(m.id),d.prepare('INSERT INTO password_resets(token_hash,member_id,expires_at) VALUES(?,?,?)').bind(digest(challenge),m.id,now+600000),d.prepare('DELETE FROM auth_limits WHERE key=?').bind(key)]);
   return reply({ok:true,mustChangePassword:true,token:challenge},200,sessionCookie(''));
  }
  stage='session';const token=await createPortalSession(m.id,m.id,c.version,b.remember===true);await d.batch([d.prepare('DELETE FROM auth_limits WHERE key=?').bind(key),d.prepare('UPDATE members SET last_login_at=? WHERE id=?').bind(now,m.id)]);return reply({ok:true},200,sessionCookie(token,b.remember===true));
 }
 validatePassword(b.password);
 if(typeof b.email!=='string'||b.email.trim().toLowerCase()!==m.email.toLowerCase())return invalid();
 if(b.action==='setup'){
  if(!c?.temporary||c.temporary_expires_at<=now||typeof b.token!=='string'||b.token.length>128)return invalid();
  if(!await d.prepare('SELECT token_hash FROM password_resets WHERE token_hash=? AND member_id=? AND expires_at>?').bind(digest(b.token),m.id,now).first())return invalid();
  if(await verifyPassword(b.password,c.password_hash))return reply({error:'Choose a new password different from your temporary password.'},400);
 }
 if(b.action==='recover'&&(!c||typeof b.recoveryCode!=='string'||digest(b.recoveryCode.trim())!==c.recovery_hash))return invalid();
 if(b.action==='reset'){
  if(typeof b.token!=='string'||b.token.length>128)return invalid();
  const token=await d.prepare('SELECT token_hash FROM password_resets WHERE token_hash=? AND member_id=? AND expires_at>?').bind(digest(b.token),m.id,now).first();if(!token)return invalid();
 }
 const recoveryCode=secretToken(),passwordHash=await hashPassword(b.password),version=(c?.version||0)+1;
 // Atomic conditional write prevents two setup/reset requests consuming the same authorization.
 let condition=b.action==='recover'?'EXISTS(SELECT 1 FROM portal_credentials WHERE member_id=? AND recovery_hash=?)':'EXISTS(SELECT 1 FROM password_resets WHERE member_id=? AND token_hash=? AND expires_at>?)';
 const extra:any[]=b.action==='recover'?[m.id,c.recovery_hash]:[m.id,digest(b.token),now];
 if(b.action!=='recover'&&c){condition+=' AND EXISTS(SELECT 1 FROM portal_credentials WHERE member_id=? AND version=?'+(b.action==='setup'?' AND temporary=1 AND temporary_expires_at>?':'')+')';extra.push(m.id,c.version);if(b.action==='setup')extra.push(now)}
 const result=await d.prepare(`INSERT INTO portal_credentials(member_id,password_hash,recovery_hash,version,updated_at) SELECT ?,?,?,?,? WHERE ${condition} ON CONFLICT(member_id) DO UPDATE SET password_hash=excluded.password_hash,recovery_hash=excluded.recovery_hash,version=excluded.version,updated_at=excluded.updated_at,temporary=0,temporary_expires_at=NULL`).bind(m.id,passwordHash,digest(recoveryCode),version,now,...extra).run();
 if(!result.meta.changes)return invalid();
 await d.batch([d.prepare('DELETE FROM portal_sessions WHERE member_id=?').bind(m.id),d.prepare('DELETE FROM password_resets WHERE member_id=?').bind(m.id),d.prepare('DELETE FROM auth_limits WHERE key=?').bind(key),event(m,b.action==='setup'?'Created portal password':'Reset portal password',m.id)]);
 // Require a fresh login after setup; recovery secret is displayed once and is never logged.
 return reply({ok:true,recoveryCode},200,sessionCookie(''));
 }catch(e){const msg=e instanceof Error?e.message:'';if(msg.startsWith('Use 8')||msg.startsWith('Choose a less'))return reply({error:msg},400);return reply({error:'Unable to complete sign-in. Please try again or contact your HR Administrator.',reference:stage},400)}}
