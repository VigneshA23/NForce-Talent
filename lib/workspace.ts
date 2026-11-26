import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import {portalAccount} from './portal-auth';
export type Member={id:string;email:string;name:string;role:'admin'|'hr';person_id:string|null;auth_id:string|null;active:number};
export function db(){return env.DB as D1Database}
export async function platformMember():Promise<Member>{
const identity=await getChatGPTUser();if(!identity)throw new Error('UNAUTHENTICATED');
const d=db();await d.prepare("INSERT OR IGNORE INTO settings(key,value) SELECT 'initial_owner',? WHERE NOT EXISTS(SELECT 1 FROM members)").bind(identity.userId).run();
const owner=await d.prepare("SELECT value FROM settings WHERE key='initial_owner'").first<{value:string}>();
if(owner?.value===identity.userId)await d.prepare("INSERT OR IGNORE INTO members(id,email,name,role,auth_id,active) VALUES(?,?,?,'hr',?,1)").bind(identity.userId,identity.email.toLowerCase(),identity.fullName||'Workspace owner',identity.userId).run();
const member=await d.prepare("SELECT * FROM members WHERE (auth_id=? OR lower(email)=?) AND active=1 AND role IN ('hr','admin')").bind(identity.userId,identity.email.toLowerCase()).first<Member>();if(!member)throw new Error('FORBIDDEN');
if(!member.auth_id)await d.prepare('UPDATE members SET auth_id=? WHERE id=? AND auth_id IS NULL').bind(identity.userId,member.id).run();return {...member,auth_id:member.auth_id||identity.userId};
}
export async function session():Promise<Member>{const identity=await getChatGPTUser();if(!identity)throw new Error('UNAUTHENTICATED');const m=await portalAccount(identity.userId) as Member|null;if(!m)throw new Error('UNAUTHENTICATED');if(!['hr','admin'].includes(m.role))throw new Error('FORBIDDEN');return m;}
export function errorResponse(error:unknown){const m=error instanceof Error?error.message:'Request failed';const status=m==='UNAUTHENTICATED'?401:m==='FORBIDDEN'?403:m==='CONFLICT'?409:400;return Response.json({error:status===401?'Please sign in to continue.':status===403?'You do not have access to this action.':status===409?'This record changed. Refresh and try again.':m},{status,headers:{'Cache-Control':'no-store'}})}
export function canWrite(m:Member){if(!['hr','admin'].includes(m.role))throw new Error('FORBIDDEN')}
export async function ownRequirement(_m:Member,id:string){const r=await db().prepare('SELECT * FROM requirements WHERE id=?').bind(id).first<any>();if(!r)throw new Error('Requirement not found');return r}
export async function ownPerson(_m:Member,id:string){const r=await db().prepare('SELECT * FROM people WHERE id=?').bind(id).first<any>();if(!r)throw new Error('Person not found');return r}
export async function ownApplication(_m:Member,id:string){const a=await db().prepare('SELECT * FROM applications WHERE id=?').bind(id).first<any>();if(!a)throw new Error('Application not found');return a}
export function event(m:Member,action:string,id:string){return db().prepare('INSERT INTO activity(id,actor_id,actor_name,action,entity_id,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),m.id,m.name,action,id,new Date().toISOString())}
