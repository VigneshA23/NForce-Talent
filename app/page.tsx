import TalentWorkspace from './workspace';
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();return <TalentWorkspace identity={user?{name:user.displayName,email:user.email}:null} signInPath={chatGPTSignInPath('/')}/>}
