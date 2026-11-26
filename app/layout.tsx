import type { Metadata } from 'next';
import './globals.css';
import './redesign.css';
import './login-graphite.css';
import './hr-workspace.css';
import './overview.css';
import './requirements.css';
import './talent.css';
import './interviews.css';
import './followups.css';
import './reports.css';
import './access.css';
import './feedback-requests.css';
import './feedback-email-brand.css';
import './public-feedback.css';
export const metadata:Metadata={title:'NForce Talent',description:'One workspace for talent, opportunities and what comes next.',icons:{icon:'/nforce-circle.png?v=4',shortcut:'/nforce-circle.png?v=4',apple:'/nforce-circle.png?v=4'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
