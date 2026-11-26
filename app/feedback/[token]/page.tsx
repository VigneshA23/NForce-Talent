import FeedbackForm from './feedback-form';
export const dynamic='force-dynamic';
export default async function FeedbackPage({params}:{params:Promise<{token:string}>}){const {token}=await params;return <FeedbackForm token={token}/>}
