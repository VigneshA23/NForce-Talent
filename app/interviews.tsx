'use client';

import {
  AlertCircle,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';

type Row=Record<string,any>;
type Data={people:Row[];requirements:Row[];applications:Row[];interviews:Row[];members:Row[];emailConfigured:boolean;feedbackDeliveryEnabled:boolean};

const safe=(value:any,fallback='Not provided')=>typeof value==='string'&&value.trim()?value.trim():fallback;
const initials=(name:string)=>safe(name,'?').split(' ').map(part=>part[0]).slice(0,2).join('').toUpperCase();
const parse=(value:any)=>{try{return value?JSON.parse(value):null}catch{return null}};
const INDIA_ZONE='Asia/Kolkata';
const hasExactTime=(interview:Row)=>!String(interview.id||'').startsWith('import-i-')&&!/exact time not provided/i.test(String(interview.round||''));
const cleanRound=(value:any)=>safe(value,'Interview').replace(/\s*-\s*exact time not provided\s*$/i,'');
const zoneLabel=(value:string)=>({
 'Asia/Kolkata':'India Standard Time',
 UTC:'UTC',
}[value]||value||'Time zone not provided');
const format=(value:string,options:Intl.DateTimeFormatOptions,zone=INDIA_ZONE)=>new Date(value).toLocaleString('en-US',{...options,timeZone:zone});
const details=(interview:Row,data:Data)=>{const application=data.applications.find(a=>a.id===interview.application_id),person=data.people.find(p=>p.id===application?.person_id),requirement=data.requirements.find(r=>r.id===application?.requirement_id);return {application,person,requirement}};
const isScheduled=(i:Row)=>['Scheduled','Rescheduled'].includes(i.attendance);
const isUpcoming=(i:Row,now:number)=>isScheduled(i)&&new Date(i.end).getTime()>=now;
const needsAttendance=(i:Row,now:number)=>isScheduled(i)&&new Date(i.end).getTime()<now;
const reasons=(i:Row,data:Data,now:number)=>{const {person}=details(i,data),items:string[]=[];if(needsAttendance(i,now))items.push('Confirm attendance');if(i.attendance==='Completed'&&person?.kind==='Internal'&&!i.employee_feedback)items.push('Employee feedback');if(i.attendance==='Completed'&&i.kind==='Internal demo'&&!i.assessment)items.push('Internal assessment');return items};

export default function InterviewsPage({data,canWrite,query,filter,onQuery,onFilter,onOpen,onAct,onExport,busy}:{data:Data;canWrite:boolean;query:string;filter:string;onQuery:(value:string)=>void;onFilter:(value:string)=>void;onOpen:(kind:string,row?:Row)=>void;onAct:(action:string,body:Row)=>Promise<any>;onExport:(rows:Row[])=>void;busy:boolean}){
 const now=Date.now(),all=data.interviews;
 const counts={Upcoming:all.filter(i=>isUpcoming(i,now)).length,'Needs attention':all.filter(i=>reasons(i,data,now).length).length,Completed:all.filter(i=>i.attendance==='Completed').length,Cancelled:all.filter(i=>['Cancelled','Candidate no-show'].includes(i.attendance)).length};
 const matches=(i:Row)=>{const {person,requirement}=details(i,data);return `${person?.name||''} ${person?.email||''} ${person?.title||''} ${requirement?.title||''} ${requirement?.client||''} ${i.round||''} ${i.interviewer_name||''}`.toLowerCase().includes(query.toLowerCase())};
 const inFilter=(i:Row)=>filter==='All'||filter==='Upcoming'&&isUpcoming(i,now)||filter==='Needs attention'&&reasons(i,data,now).length>0||filter==='Completed'&&i.attendance==='Completed'||filter==='Client'&&i.kind==='Client'||filter==='Internal demo'&&i.kind==='Internal demo';
 const sortRows=(rows:Row[])=>[...rows].sort((a,b)=>isUpcoming(a,now)&&isUpcoming(b,now)?String(a.start).localeCompare(String(b.start)):String(b.start).localeCompare(String(a.start)));
 const visible=sortRows(all.filter(matches).filter(inFilter));
 const attention=visible.filter(i=>reasons(i,data,now).length>0),upcoming=visible.filter(i=>isUpcoming(i,now)&&!reasons(i,data,now).length),history=visible.filter(i=>!attention.includes(i)&&!upcoming.includes(i));
 const sections=filter==='All'&&!query?[{label:'Needs attention',note:'Attendance, feedback, or assessment requires an update.',rows:attention,tone:'attention'},{label:'Upcoming interviews',note:'Scheduled conversations in chronological order.',rows:upcoming,tone:'upcoming'},{label:'Interview history',note:'Completed, cancelled, and past interview records.',rows:history,tone:'history'}]:[{label:filter==='All'?'Search results':filter,note:`${visible.length} interview${visible.length===1?'':'s'} in this view.`,rows:visible,tone:'history'}];
 const metrics=[
  {label:'Upcoming',value:counts.Upcoming,note:'Scheduled conversations',Icon:CalendarClock,target:'Upcoming',tone:'wine'},
  {label:'Needs attention',value:counts['Needs attention'],note:'Updates holding up the record',Icon:AlertCircle,target:'Needs attention',tone:'gold'},
  {label:'Completed',value:counts.Completed,note:'Confirmed interviews',Icon:CheckCircle2,target:'Completed',tone:'sage'},
  {label:'Client interviews',value:all.filter(i=>i.kind==='Client').length,note:'External conversations',Icon:Users,target:'Client',tone:'blue'},
 ];
 return <div className="interviews-page">
  <section className="interviews-hero"><div><span>INTERVIEW OPERATIONS</span><h1>Interviews</h1><p>Schedule every conversation, close attendance gaps, collect useful feedback, and keep the official client decision connected.</p></div>{canWrite&&<button className="btn primary interviews-new" onClick={()=>onOpen('interview')}><Plus size={18}/>Schedule interview</button>}</section>
  <section className="interview-metrics" aria-label="Interview summary">{metrics.map(({label,value,note,Icon,target,tone})=><button type="button" aria-pressed={filter===target} className={`interview-metric ${tone} ${filter===target?'active':''}`} key={label} onClick={()=>onFilter(filter===target?'All':target)}><span><Icon size={20}/></span><div><strong>{value}</strong><b>{label}</b><small>{note}</small></div></button>)}</section>
  <section className="interview-control-panel">
   <header className="interview-tools"><div className="interview-tabs" role="group" aria-label="Filter interviews">{['All','Upcoming','Needs attention','Completed','Client','Internal demo'].map(name=><button className={filter===name?'active':''} key={name} onClick={()=>onFilter(name)}>{name}<span>{name==='All'?all.length:name==='Client'?all.filter(i=>i.kind==='Client').length:name==='Internal demo'?all.filter(i=>i.kind==='Internal demo').length:counts[name as keyof typeof counts]||0}</span></button>)}</div><div className="interview-tool-actions"><label className="interview-search"><Search size={17}/><span className="sr-only">Search interviews</span><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search person, client, role, round, or interviewer"/>{query&&<button aria-label="Clear interview search" onClick={()=>onQuery('')}><X size={14}/></button>}</label><button className="btn interview-export" onClick={()=>onExport(visible)}><Download size={16}/>Export</button></div></header>
   <div className="interview-sections">{sections.map(section=>section.rows.length?<section className={`interview-section ${section.tone}`} key={section.label}><header><div><span>{section.label.toUpperCase()}</span><h2>{section.label}</h2><p>{section.note}</p></div><b>{section.rows.length}</b></header><div>{section.rows.map(interview=><InterviewCard key={interview.id} interview={interview} data={data} now={now} onOpen={onOpen}/>)}</div></section>:null)}</div>
   {!visible.length&&<div className="interview-empty"><CalendarDays size={28}/><h2>{query||filter!=='All'?'No interviews match this view':'No interviews scheduled yet'}</h2><p>{query||filter!=='All'?'Clear the search or choose another interview group.':'Schedule a client interview or internal demo after linking a person to a requirement.'}</p>{query||filter!=='All'?<button className="btn" onClick={()=>{onQuery('');onFilter('All')}}>Clear filters</button>:canWrite&&<button className="btn primary" onClick={()=>onOpen('interview')}><Plus size={16}/>Schedule interview</button>}</div>}
   <footer className="interview-automation"><span><Mail size={18}/></span><div><b>Next-day employee feedback requests</b><p>{data.feedbackDeliveryEnabled?'Automatic requests are active for completed internal employee interviews. A reminder follows two days later when feedback is still missing.':data.emailConfigured?'The company sender is connected, but automatic delivery is paused.':'No email is being sent yet. Connect the company sender and scheduler before enabling automatic next-day requests.'}</p></div><small>{data.feedbackDeliveryEnabled?'AUTOMATION ACTIVE':data.emailConfigured?'SENDER CONNECTED':'SETUP REQUIRED'}</small></footer>
  </section>
 </div>;
}

function InterviewCard({interview,data,now,onOpen}:{interview:Row;data:Data;now:number;onOpen:(kind:string,row?:Row)=>void}){
 const {application,person,requirement}=details(interview,data),attention=reasons(interview,data,now),zone=interview.timezone||INDIA_ZONE,timeKnown=hasExactTime(interview);
 const followup=attention.length?attention.join(' · '):interview.employee_feedback?'Employee feedback received':interview.attendance==='Completed'?'Record reviewed':'Feedback after completion';
 return <button className="interview-row" onClick={()=>onOpen('interviewDetail',interview)}><span className="interview-date-block"><b>{format(interview.start,{day:'2-digit'},zone)}</b><small>{format(interview.start,{month:'short'},zone)}</small></span><span className={`interview-avatar ${person?.kind==='External'?'external':''}`}>{initials(person?.name||'Candidate')}</span><span className="interview-person"><b>{safe(person?.name,'Candidate')}</b><small>{safe(person?.title,'Role not recorded')}</small></span><span className="interview-context"><b>{safe(requirement?.title,'Requirement unavailable')}</b><small>{safe(requirement?.client,'Client unavailable')} · {cleanRound(interview.round)}</small></span><span className={`interview-schedule ${timeKnown?'':'time-unknown'}`}><b><Clock3 size={13}/>{timeKnown?format(interview.start,{weekday:'short',hour:'numeric',minute:'2-digit'},zone):'Time not provided'}</b><small>{timeKnown?zoneLabel(zone):'Interview date only'}</small></span><span className="interview-panel"><b>{safe(interview.interviewer_name,'Not recorded')}</b><small>{interview.kind==='Internal demo'?'Internal interviewer':'Client interviewer / panel'}</small></span><span className="interview-state"><InterviewPill value={safe(interview.attendance,'Scheduled')}/><small className={attention.length?'needs':''}>{followup}</small></span><span className="interview-open"><Eye size={17}/></span><span className="sr-only">Open {safe(person?.name,'candidate')} interview details</span></button>;
}

export function InterviewDetail({interview,data,canWrite,busy,onOpen,onAct}:{interview:Row;data:Data;canWrite:boolean;busy:boolean;onOpen:(kind:string,row?:Row)=>void;onAct:(action:string,body:Row)=>Promise<any>}){
 const {application,person,requirement}=details(interview,data),feedback=parse(interview.employee_feedback),hrFeedback=parse(interview.hr_feedback),assessment=parse(interview.assessment),zone=interview.timezone||INDIA_ZONE,completed=interview.attendance==='Completed',timeKnown=hasExactTime(interview);
 const feedbackState=person?.kind==='Internal'?(feedback?'Received':'Pending'):'Not requested';
 const steps=[{label:'Scheduled',done:true},{label:'Attendance',done:completed||['Cancelled','Candidate no-show'].includes(interview.attendance),current:isScheduled(interview)},{label:'Employee feedback',done:!!feedback||person?.kind==='External',current:completed&&!feedback&&person?.kind==='Internal'},{label:'Client decision',done:application?.client_result&&application.client_result!=='Pending',current:completed&&application?.client_result==='Pending'}];
 return <div className="interview-detail">
  <header className="interview-detail-head"><span className={`interview-avatar large ${person?.kind==='External'?'external':''}`}>{initials(person?.name||'Candidate')}</span><div><span>{interview.kind==='Internal demo'?'INTERNAL DEMO':'CLIENT INTERVIEW'}</span><h2 id="dialog-title">{cleanRound(interview.round)}</h2><p>{safe(person?.name,'Candidate')} · {safe(requirement?.title,'Requirement unavailable')} at {safe(requirement?.client,'Client unavailable')}</p></div><div className="interview-detail-badges"><InterviewPill value={safe(interview.attendance,'Scheduled')}/><InterviewPill value={safe(interview.kind)}/></div></header>
  <section className="interview-detail-facts"><div><CalendarDays size={17}/><span><small>{timeKnown?'Date and time':'Interview date'}</small><b>{format(interview.start,{weekday:'long',month:'long',day:'numeric'},zone)}</b><p>{timeKnown?`${format(interview.start,{hour:'numeric',minute:'2-digit'},zone)} – ${format(interview.end,{hour:'numeric',minute:'2-digit'},zone)} · ${zoneLabel(zone)}`:'Exact time was not provided'}</p></span></div><div><UserRound size={17}/><span><small>{interview.kind==='Internal demo'?'Internal interviewer':'Client interviewer / panel'}</small><b>{safe(interview.interviewer_name)}</b><p>{interview.kind==='Internal demo'?'Assigned through NForce Talent':'External access is not required'}</p></span></div><div><Video size={17}/><span><small>Meeting access</small><b>{interview.meeting_url?'Secure meeting link saved':'No meeting link recorded'}</b>{interview.meeting_url?<a href={interview.meeting_url} target="_blank" rel="noopener noreferrer">Open meeting <ExternalLink size={12}/></a>:<p>Add a link by editing the schedule.</p>}</span></div></section>
  <section className="interview-progress" aria-label="Interview workflow status">{steps.map((step,index)=><div className={`${step.done?'done':''} ${step.current?'current':''}`} key={step.label}><span>{step.done?<Check size={13}/>:index+1}</span><b>{step.label}</b></div>)}</section>
  {canWrite&&<section className="interview-detail-actions">{isScheduled(interview)&&<><button className="btn primary" disabled={busy} onClick={()=>onAct('attendance',{id:interview.id,attendance:'Completed'})}><Check size={15}/>Mark completed</button><button className="btn" onClick={()=>onOpen('interviewEdit',interview)}><Pencil size={14}/>Edit or reschedule</button><button className="btn" disabled={busy} onClick={()=>onAct('attendance',{id:interview.id,attendance:'Candidate no-show'})}>Mark no-show</button><button className="btn danger-soft" disabled={busy} onClick={()=>onAct('attendance',{id:interview.id,attendance:'Cancelled'})}>Cancel interview</button></>}{completed&&<><button className="btn" onClick={()=>onOpen('hrFeedback',interview)}><MessageSquareText size={15}/>{hrFeedback?'Update HR notes':'Add HR notes'}</button>{application&&<button className="btn" onClick={()=>onOpen('result',application)}><FileText size={15}/>Record client decision</button>}</>}</section>}
  <section className="interview-result-strip"><div><small>Employee feedback</small><b>{feedbackState}</b></div><div><small>HR notes</small><b>{hrFeedback?'Recorded':'Not recorded'}</b></div><div><small>Internal assessment</small><b>{interview.kind==='Internal demo'?(assessment?'Submitted':'Pending'):'Not applicable'}</b></div><div className={`official-outcome ${safe(application?.client_result,'Pending').toLowerCase().replaceAll(' ','-')}`}><small>Official client decision</small><InterviewPill value={safe(application?.client_result,'Pending')}/></div></section>
  <section className="interview-detail-grid">
   <article><header><span><MessageSquareText size={16}/></span><div><h3>Employee feedback</h3><p>Questions, answers, performance, and preparation recollection.</p></div></header>{feedback?<div className="interview-feedback-body"><span className="interview-source">EMPLOYEE RECOLLECTION · NOT THE OFFICIAL CLIENT DECISION</span><p><b>Topics discussed</b>{safe(feedback.topics)}</p>{feedback.questions?.map((q:Row,n:number)=><div className="interview-question" key={n}><b>{n+1}. {safe(q.question,'Question')}</b><p>{safe(q.answer,'Answer not captured')}</p></div>)}<p><b>What went well</b>{safe(feedback.strengths)}</p><p><b>Preparation for next time</b>{safe(feedback.improvements)}</p><InterviewPill value={safe(feedback.performance,'Not assessed')}/></div>:<div className="interview-pending"><Mail size={21}/><div><b>{person?.kind==='External'?'Employee feedback is not required':'Awaiting employee feedback'}</b><p>{person?.kind==='External'?'External candidate records are managed by HR.':'The employee will receive the feedback request after email automation is enabled.'}</p></div></div>}</article>
   <article><header><span><ShieldCheck size={16}/></span><div><h3>HR interview notes</h3><p>Internal notes entered by HR or an administrator.</p></div></header>{hrFeedback?<div className="interview-feedback-body"><span className="interview-source">INTERNAL HR RECORD</span><InterviewPill value={safe(hrFeedback.overall,'Not evaluated')}/><p><b>Summary</b>{safe(hrFeedback.summary)}</p><p><b>Strengths</b>{safe(hrFeedback.strengths)}</p><p><b>Improvements</b>{safe(hrFeedback.improvements)}</p><p><b>Next step</b>{safe(hrFeedback.nextStep)}</p><small>Recorded by {safe(hrFeedback.recordedBy,'HR')}</small></div>:<div className="interview-pending"><FileText size={21}/><div><b>No HR notes recorded</b><p>{completed?'Add internal notes without changing the official client decision.':'HR notes become available after attendance is confirmed.'}</p></div></div>}</article>
  </section>
  {interview.kind==='Internal demo'&&<section className="interview-assessment"><header><div><span>INTERNAL ASSESSMENT</span><h3>Readiness and coaching</h3></div><InterviewPill value={assessment?safe(assessment.readiness):'Pending'}/></header>{assessment?<><div className="assessment-copy"><p><b>Observed strengths</b>{safe(assessment.strengths)}</p><p><b>Development areas</b>{safe(assessment.gaps)}</p><p><b>Recommended preparation</b>{safe(assessment.recommendation)}</p></div><div className="assessment-ratings">{[['Technical',assessment.technical],['Communication',assessment.communication],['Problem solving',assessment.problemSolving]].map(([label,value])=><span key={label as string}><small>{label}</small><b>{value===null||value===undefined?'Not assessed':`${value}/5`}</b></span>)}</div>{canWrite&&!interview.released&&<button className="btn" onClick={()=>onAct('release',{id:interview.id})}>Release coaching feedback</button>}</>:<p className="interview-assessment-empty">The assigned internal interviewer can submit an assessment after the interview is marked completed.</p>}</section>}
  <footer className="interview-detail-note"><ShieldCheck size={15}/>Employee recollection, HR notes, internal assessment, and the official client decision remain separate records.</footer>
 </div>;
}

function InterviewPill({value}:{value:string}){const key=value.toLowerCase().replaceAll(' ','-');return <span className={`interview-pill ${key}`}><i/>{value}</span>}
