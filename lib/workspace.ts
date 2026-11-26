import { env } from 'cloudflare:workers';
import {portalAccount} from './portal-auth';
export type Member={id:string;email:string;name:string;role:'admin'|'hr';person_id:string|null;auth_id:string|null;active:number};
export function db(){return env.DB as D1Database}
export async function platformMember():Promise<Member>{return session()}
export async function session():Promise<Member>{const m=await portalAccount() as Member|null;if(!m)throw new Error('UNAUTHENTICATED');if(!['hr','admin'].includes(m.role))throw new Error('FORBIDDEN');return m;}
export function errorResponse(error:unknown){const m=error instanceof Error?error.message:'Request failed';const status=m==='UNAUTHENTICATED'?401:m==='FORBIDDEN'?403:m==='CONFLICT'?409:400;return Response.json({error:status===401?'Please sign in to continue.':status===403?'You do not have access to this action.':status===409?'This record changed. Refresh and try again.':m},{status,headers:{'Cache-Control':'no-store'}})}
export function canWrite(m:Member){if(!['hr','admin'].includes(m.role))throw new Error('FORBIDDEN')}
export async function ownRequirement(_m:Member,id:string){const r=await db().prepare('SELECT * FROM requirements WHERE id=?').bind(id).first<any>();if(!r)throw new Error('Requirement not found');return r}
export async function ownPerson(_m:Member,id:string){const r=await db().prepare('SELECT * FROM people WHERE id=?').bind(id).first<any>();if(!r)throw new Error('Person not found');return r}
export async function ownApplication(_m:Member,id:string){const a=await db().prepare('SELECT * FROM applications WHERE id=?').bind(id).first<any>();if(!a)throw new Error('Application not found');return a}
export function event(m:Member,action:string,id:string){return db().prepare('INSERT INTO activity(id,actor_id,actor_name,action,entity_id,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),m.id,m.name,action,id,new Date().toISOString())}
