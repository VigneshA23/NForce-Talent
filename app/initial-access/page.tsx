import InitialAccess from './setup';
import {platformMember,db} from '@/lib/workspace';
export const dynamic='force-dynamic';
export default async function InitialAccessPage(){let allowed=false;try{const m=await platformMember(),owner=await db().prepare("SELECT value FROM settings WHERE key='initial_owner'").first<{value:string}>(),credential=await db().prepare('SELECT member_id FROM portal_credentials WHERE member_id=?').bind(m.id).first();allowed=owner?.value===m.id&&m.role==='hr'&&!credential}catch{}return <InitialAccess allowed={allowed}/>}
