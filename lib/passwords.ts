import {scrypt,randomBytes,createHash} from 'node:crypto';
export const passwordPolicy='Use 8–128 characters. A long, unique passphrase works best.';
export function validatePassword(value:unknown):asserts value is string{
 if(typeof value!=='string'||[...value].length<8||[...value].length>128)throw new Error(passwordPolicy);
 const common=['password','123456','qwerty','nforce','enforce','letmein','welcome','admin'];
 const compact=value.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(common.some(w=>new RegExp('^'+w+'[0-9]*$').test(compact))||new Set(value).size<5)throw new Error('Choose a less predictable passphrase.');
}
const PBKDF2_ITERATIONS=310000;
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>new Uint8Array(value.match(/.{1,2}/g)?.map(byte=>Number.parseInt(byte,16))||[]);
const safeEqual=(actual:Uint8Array,expected:Uint8Array)=>{
 if(actual.length!==expected.length)return false;
 let difference=0;
 for(let i=0;i<actual.length;i++)difference|=actual[i]^expected[i];
 return difference===0;
};
const derivePbkdf2=async(password:string,saltHex:string,iterations=PBKDF2_ITERATIONS)=>{
 const key=await globalThis.crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await globalThis.crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(saltHex),iterations},key,256);
 return new Uint8Array(bits);
};
const deriveScrypt=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString('hex');
 return `pbkdf2:sha256:${PBKDF2_ITERATIONS}:${salt}:${hex(await derivePbkdf2(password,salt))}`;
}
export async function verifyPassword(password:string,stored:string){
 const parts=stored.split(':');
 try{
  if(parts.length===5&&parts[0]==='pbkdf2'&&parts[1]==='sha256'){
   const iterations=Number(parts[2]);
   if(!Number.isSafeInteger(iterations)||iterations<100000||iterations>1000000)return false;
   const actual=Buffer.from(await derivePbkdf2(password,parts[3],iterations));
   const expected=Buffer.from(parts[4],'hex');
   return safeEqual(actual,expected);
  }
  if(parts.length===6&&parts.slice(0,4).join(':')==='scrypt:16384:8:5'){
   const actual=await deriveScrypt(password,parts[4]);
   const expected=Buffer.from(parts[5],'hex');
   return safeEqual(actual,expected);
  }
  return false;
 }catch{return false}
}
export const secretToken=()=>randomBytes(32).toString('base64url');
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
