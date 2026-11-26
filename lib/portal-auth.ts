import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {digest,secretToken} from './passwords';
export const COOKIE='__Host-nforce-session';
export const TTL=8*60*60;
export const REMEMBER_TTL=7*24*60*60;
const db=()=>env.DB as D1Database;
export async function portalSession(memberId:string,authId:string){
 const token=(await cookies()).get(COOKIE)?.value;if(!token||token.length>128)return false;
 const now=Date.now(),hash=digest(token);
 const row=await db().prepare('SELECT s.token_hash FROM portal_sessions s JOIN portal_credentials c ON c.member_id=s.member_id WHERE s.token_hash=? AND s.member_id=? AND s.auth_id=? AND s.expires_at>? AND s.last_seen > ? - CASE WHEN s.remembered=1 THEN 86400000 ELSE 1800000 END AND s.credential_version=c.version AND c.temporary=0').bind(hash,memberId,authId,now,now).first();
 if(!row)return false;
 await db().prepare('UPDATE portal_sessions SET last_seen=? WHERE token_hash=?').bind(now,hash).run();return true;
}
export async function createPortalSession(memberId:string,authId:string,version:number,remember=false){
 const token=secretToken(),now=Date.now();await db().batch([
 db().prepare('DELETE FROM portal_sessions WHERE expires_at<? OR last_seen < ? - CASE WHEN remembered=1 THEN 86400000 ELSE 1800000 END OR (member_id=? AND auth_id=?)').bind(now,now,memberId,authId),
 db().prepare('INSERT INTO portal_sessions(token_hash,member_id,auth_id,credential_version,expires_at,last_seen,remembered) VALUES(?,?,?,?,?,?,?)').bind(digest(token),memberId,authId,version,now+(remember?REMEMBER_TTL:TTL)*1000,now,remember?1:0)]);return token;
}
export const sessionCookie=(token:string,remember=false)=>`${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict${!token?'; Max-Age=0':remember?'; Max-Age='+REMEMBER_TTL:''}`;

export async function portalAccount(){
 const token=(await cookies()).get(COOKIE)?.value;if(!token||token.length>128)return null;
 const now=Date.now(),hash=digest(token);
 const member=await db().prepare("SELECT m.* FROM portal_sessions s JOIN members m ON m.id=s.member_id JOIN portal_credentials c ON c.member_id=m.id WHERE s.token_hash=? AND m.active=1 AND m.role IN ('hr','admin') AND c.temporary=0 AND s.credential_version=c.version AND s.expires_at>? AND s.last_seen > ? - CASE WHEN s.remembered=1 THEN 86400000 ELSE 1800000 END").bind(hash,now,now).first<any>();
 if(member)await db().prepare('UPDATE portal_sessions SET last_seen=? WHERE token_hash=?').bind(now,hash).run();return member;
}
