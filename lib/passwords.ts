import {scrypt,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
export const passwordPolicy='Use 8–128 characters. A long, unique passphrase works best.';
export function validatePassword(value:unknown):asserts value is string{
 if(typeof value!=='string'||[...value].length<8||[...value].length>128)throw new Error(passwordPolicy);
 const common=['password','123456','qwerty','nforce','enforce','letmein','welcome','admin'];
 const compact=value.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(common.some(w=>new RegExp('^'+w+'[0-9]*$').test(compact))||new Set(value).size<5)throw new Error('Choose a less predictable passphrase.');
}
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt:16384:8:5:${salt}:${(await derive(password,salt)).toString('hex')}`}
export async function verifyPassword(password:string,stored:string){const parts=stored.split(':');if(parts.length!==6||parts.slice(0,4).join(':')!=='scrypt:16384:8:5')return false;const actual=await derive(password,parts[4]);const expected=Buffer.from(parts[5],'hex');return expected.length===actual.length&&timingSafeEqual(actual,expected)}
export const secretToken=()=>randomBytes(32).toString('base64url');
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
