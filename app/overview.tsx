'use client';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import {overviewSummary} from '@/lib/overview';

type Row=Record<string,any>;
const INDIA_ZONE='Asia/Kolkata';
const date=(d:string,o:Intl.DateTimeFormatOptions)=>new Date(d).toLocaleString('en-US',{...o,timeZone:INDIA_ZONE});
const hasExactTime=(interview:Row)=>!String(interview.id||'').startsWith('import-i-')&&!/exact time not provided/i.test(String(interview.round||''));
const initials=(name:string)=>name.split(' ').filter(Boolean).map(part=>part[0]).slice(0,2).join('').toUpperCase();

export default function Overview({data,canWrite,onNavigate,onOpen,onComplete}:{data:Row;canWrite:boolean;onNavigate:(page:string,filter?:string)=>void;onOpen:(kind:string,row?:Row)=>void;onComplete:(id:string)=>void}){
 const now=Date.now(),today=new Date(now).toISOString(),s=overviewSummary(data,now);
 const pmap=Object.fromEntries(data.people.map((p:Row)=>[p.id,p])),rmap=Object.fromEntries(data.requirements.map((r:Row)=>[r.id,r])),amap=Object.fromEntries(data.applications.map((a:Row)=>[a.id,a]));
 const detail=(i:Row)=>{const a=amap[i.application_id];return {person:pmap[a?.person_id],req:rmap[a?.requirement_id]}};
 const hour=Number(date(today,{hour:'numeric',hourCycle:'h23'}));
 const attentionCount=s.needsFeedback.length+s.attendanceMissing.length+s.overdue.length;
 const openPositions=s.openRequirements.reduce((n:number,r:Row)=>n+r.openings,0);
 const cards=[
  {label:'Open requirements',value:s.openRequirements.length,note:`${openPositions} open position${openPositions===1?'':'s'}`,Icon:BriefcaseBusiness,tone:'wine',action:()=>onNavigate('Requirements','Open')},
  {label:'Available employees',value:s.availableEmployees.length,note:'Ready for a new opportunity',Icon:Users,tone:'sage',action:()=>onNavigate('Talent directory','Available')},
  {label:'Interviews this week',value:s.nextWeek.length,note:'Scheduled in the next 7 days',Icon:CalendarDays,tone:'blue',action:()=>onNavigate('Interviews')},
  {label:'Feedback needed',value:s.needsFeedback.length,note:'Completed interviews to review',Icon:MessageSquare,tone:'gold',action:()=>document.getElementById('overview-attention')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})},
 ];
 return <div className="overview-page">
  <section className="overview-hero">
   <div className="overview-hero-main">
    <span className="overview-eyebrow"><Sparkles size={13}/>HR COMMAND CENTER</span>
    <h1>Good {hour<12?'morning':hour<17?'afternoon':'evening'}, {data.member.name.split(' ')[0]}.</h1>
    <p>Here is what needs attention across talent, requirements, and interviews today.</p>
    <div className="overview-actions">
     {canWrite&&<><button className="btn primary" onClick={()=>onOpen('interview')}><Plus size={17}/>Schedule interview</button><button className="btn overview-secondary" onClick={()=>onOpen('requirement')}><BriefcaseBusiness size={17}/>New requirement</button></>}
     <button className="overview-text-link" onClick={()=>onNavigate('Follow-ups')}>Review follow-ups <ArrowUpRight size={17}/></button>
    </div>
   </div>
   <div className="overview-hero-side">
    <div className="overview-date-card"><CalendarDays size={21}/><div><span>{date(today,{weekday:'long'})}</span><b>{date(today,{month:'long',day:'numeric',year:'numeric'})}</b><small>India Standard Time</small></div></div>
    <div className={`overview-focus ${attentionCount?'has-attention':''}`}>
     <span>{attentionCount?<AlertCircle size={18}/>:<Check size={18}/>}</span>
     <div><small>TODAY&apos;S FOCUS</small><b>{attentionCount?`${attentionCount} item${attentionCount===1?'':'s'} need attention`:'Everything is on track'}</b><p>{attentionCount?'Feedback, attendance, or overdue follow-ups.':'No overdue work or missing updates.'}</p></div>
    </div>
   </div>
  </section>

  <div className="overview-stats" aria-label="Talent operations summary">{cards.map(c=><button className={`overview-stat ${c.tone}`} key={c.label} onClick={c.action}>
   <span className="overview-stat-top"><span className="overview-stat-icon"><c.Icon size={20}/></span><ArrowUpRight size={17}/></span>
   <strong>{c.value}</strong><span className="overview-stat-label">{c.label}</span><span className="overview-stat-note">{c.note}</span>
  </button>)}</div>

  <div className="overview-primary-grid">
   <section className="overview-panel overview-attention-panel" id="overview-attention">
    <OverviewHeading eyebrow="PRIORITY QUEUE" title="Needs attention" description="The updates that are holding up a clear view of progress." action="View interviews" onClick={()=>onNavigate('Interviews')}/>
    {s.needsFeedback.length+s.attendanceMissing.length?<div className="overview-rows">{[...s.needsFeedback.map((i:Row)=>({...i,attention:'feedback'})),...s.attendanceMissing.map((i:Row)=>({...i,attention:'attendance'}))].slice(0,5).map((i:Row)=>{const {person,req}=detail(i);return <button className="overview-attention-row" key={i.id} onClick={()=>onOpen('interviewDetail',i)}>
     <span className={`overview-attention-icon ${i.attention}`} >{i.attention==='feedback'?<MessageSquare size={18}/>:<ClipboardCheck size={18}/>}</span>
     <span className="overview-row-copy"><b>{person?.name||'Candidate'}</b><span>{req?.title||'Interview'} <i/> {req?.client||'NForce One'}</span><small>{i.attention==='attendance'?'Confirm attendance for this past interview':!i.employee_feedback&&person?.kind==='Internal'?'Employee recollection is still pending':'Internal interviewer assessment is still pending'}</small></span>
     <span className="overview-row-action">Review <ArrowRight size={15}/></span>
    </button>})}</div>:<OverviewEmpty Icon={Check} title="You are all caught up" text="Missing interview feedback and attendance confirmations will appear here."/>}
    <div className="overview-panel-note"><AlertCircle size={15}/><span>Interview feedback records the experience and coaching notes. The client hiring result is tracked separately.</span></div>
   </section>

   <section className="overview-panel">
    <OverviewHeading eyebrow="NEXT UP" title="Upcoming interviews" description="Client and practice interviews in chronological order." action="View calendar" onClick={()=>onNavigate('Interviews')}/>
    {s.upcoming.length?<div className="overview-rows">{s.upcoming.slice(0,4).map((i:Row)=>{const {person,req}=detail(i);return <button className="overview-interview" key={i.id} onClick={()=>onOpen('interviewDetail',i)}>
     <span className="overview-day"><b>{date(i.start,{day:'2-digit'})}</b><small>{date(i.start,{month:'short'}).toUpperCase()}</small></span>
     <span className="overview-row-copy"><b>{person?.name||'Candidate'}</b><span>{req?.title||'Interview'} <i/> {req?.client||'NForce One'}</span><small><Clock3 size={13}/>{hasExactTime(i)?`${date(i.start,{weekday:'short',hour:'numeric',minute:'2-digit'})} IST`:`${date(i.start,{weekday:'short',month:'short',day:'numeric'})} · Time not provided`}</small></span>
     <span className={`overview-type ${i.kind==='Internal demo'?'internal':''}`}>{i.kind==='Internal demo'?'Practice':'Client'}</span>
    </button>})}</div>:<OverviewEmpty Icon={CalendarDays} title="No interviews scheduled" text="New client and internal practice interviews will appear here."/>}
   </section>
  </div>

  <div className="overview-secondary-grid">
   <section className="overview-panel">
    <OverviewHeading eyebrow="CLIENT DEMAND" title="Open requirements" description="Active roles the recruiting team is working to fill." action="View all" onClick={()=>onNavigate('Requirements','Open')}/>
    {s.openRequirements.length?<div className="overview-rows compact">{s.openRequirements.slice(0,4).map((r:Row)=>{const count=data.applications.filter((a:Row)=>a.requirement_id===r.id).length;return <button className="overview-requirement" key={r.id} onClick={()=>onOpen('requirementDetail',r)}>
     <span className="overview-role-icon"><BriefcaseBusiness size={18}/></span><span className="overview-row-copy"><b>{r.title}</b><span>{r.client} <i/> {r.openings} opening{r.openings!==1?'s':''}</span><small>{count} linked candidate{count===1?'':'s'}</small></span>{r.priority==='High'&&<span className="overview-priority">High</span>}<ArrowUpRight size={16}/>
    </button>})}</div>:<OverviewEmpty Icon={BriefcaseBusiness} title="No open requirements" text="Create a requirement when a client has a role to fill."/>}
   </section>

   <section className="overview-panel">
    <OverviewHeading eyebrow="INTERNAL TALENT" title="Available now" description="Employees ready to be considered for a requirement." action="View talent" onClick={()=>onNavigate('Talent directory','Available')}/>
    {s.availableEmployees.length?<div className="overview-rows compact">{s.availableEmployees.slice(0,4).map((p:Row)=><button className="overview-person" key={p.id} onClick={()=>onOpen('personDetail',p)}>
     <span className="overview-avatar">{initials(p.name)}</span><span className="overview-row-copy"><b>{p.name}</b><span>{p.title||'NForce employee'}</span><small><MapPin size={12}/>{p.location||'Location not added'}</small></span><span className="overview-ready"><i/>Ready</span>
    </button>)}</div>:<OverviewEmpty Icon={Users} title="No employees marked available" text="Availability updates from the Talent directory will appear here."/>}
   </section>

   <section className="overview-panel">
    <OverviewHeading eyebrow="FOLLOW-THROUGH" title="Follow-ups" description={s.overdue.length?`${s.overdue.length} overdue · ordered by due date`:'Open tasks ordered by due date.'} action="View all" onClick={()=>onNavigate('Follow-ups')}/>
    {s.followUps.length?<div className="overview-rows compact">{s.followUps.slice(0,4).map((t:Row)=>{const overdue=new Date(t.due).getTime()<now;return <div className="overview-task" key={t.id}><button className="overview-check" aria-label={`Mark ${t.title} complete`} onClick={()=>onComplete(t.id)}><Check size={16}/></button><span className="overview-row-copy"><b>{t.title}</b><span className={overdue?'overview-overdue':''}>{overdue?'Overdue · ':''}{date(t.due,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})} IST</span></span></div>})}</div>:<OverviewEmpty Icon={ClipboardCheck} title="No open follow-ups" text="Add a follow-up when an action needs an owner and due date."/>}
    {canWrite&&<button className="overview-panel-footer" onClick={()=>onOpen('task')}><Plus size={16}/>Add follow-up</button>}
   </section>
  </div>
 </div>;
}

function OverviewHeading({eyebrow,title,description,action,onClick}:{eyebrow:string;title:string;description:string;action?:string;onClick?:()=>void}){return <header className="overview-panel-heading"><div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action&&<button onClick={onClick}>{action}<ArrowRight size={15}/></button>}</header>}
function OverviewEmpty({Icon,title,text}:{Icon:any;title:string;text:string}){return <div className="overview-empty"><span><Icon size={23}/></span><h3>{title}</h3><p>{text}</p></div>}
