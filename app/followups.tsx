'use client';

import {useMemo,useState} from 'react';
import {AlertCircle,CalendarClock,Check,CheckCircle2,Clock3,Download,Filter,Link2,Mail,Pencil,Plus,Search,ShieldCheck,UserRound,Users,X} from 'lucide-react';

type Row=Record<string,any>;
type Data={member:Row;tasks:Row[];members:Row[];people:Row[];requirements:Row[];applications:Row[];interviews:Row[];emailConfigured:boolean};

const INDIA_ZONE='Asia/Kolkata';
const zoneLabel=(zone:string)=>({'Asia/Kolkata':'India Standard Time',UTC:'UTC'}[zone]||'India Standard Time');
const fmt=(value:string,options:Intl.DateTimeFormatOptions,zone=INDIA_ZONE)=>new Date(value).toLocaleString('en-US',{...options,timeZone:zone});
const initials=(name:string)=>name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'?';
const startOfToday=()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()};
const endOfToday=()=>startOfToday()+86400000;

function related(task:Row,data:Data){
 const type=task.related_type||'None',id=task.related_id;
 if(type==='Requirement'){const r=data.requirements.find(x=>x.id===id);return r?{title:r.title,subtitle:r.client}:null}
 if(type==='Person'){const p=data.people.find(x=>x.id===id);return p?{title:p.name,subtitle:p.title}:null}
 if(type==='Application'){const a=data.applications.find(x=>x.id===id),p=data.people.find(x=>x.id===a?.person_id),r=data.requirements.find(x=>x.id===a?.requirement_id);return a?{title:p?.name||'Application',subtitle:`${r?.title||'Requirement'} · ${r?.client||''}`}:null}
 if(type==='Interview'){const i=data.interviews.find(x=>x.id===id),a=data.applications.find(x=>x.id===i?.application_id),p=data.people.find(x=>x.id===a?.person_id),r=data.requirements.find(x=>x.id===a?.requirement_id);return i?{title:p?.name||'Interview',subtitle:`${i.round} · ${r?.client||''}`}:null}
 return null;
}

export default function FollowupsPage({data,canWrite,query,filter,onQuery,onFilter,onOpen,onAct,onExport,busy}:{data:Data;canWrite:boolean;query:string;filter:string;onQuery:(value:string)=>void;onFilter:(value:string)=>void;onOpen:(kind:string,row?:Row)=>void;onAct:(action:string,body:Row)=>Promise<any>;onExport:(rows:Row[])=>void;busy:boolean}){
 const [category,setCategory]=useState('All categories');
 const now=Date.now(),todayStart=startOfToday(),todayEnd=endOfToday();
 const enriched=useMemo<Row[]>(()=>data.tasks.map(task=>({...task,assignee:data.members.find(m=>m.id===task.owner_id),connection:related(task,data)})),[data]);
 const overdue=(t:Row)=>t.status==='Open'&&new Date(t.due).getTime()<todayStart;
 const today=(t:Row)=>t.status==='Open'&&new Date(t.due).getTime()>=todayStart&&new Date(t.due).getTime()<todayEnd;
 const upcoming=(t:Row)=>t.status==='Open'&&new Date(t.due).getTime()>=todayEnd;
 const counts={Overdue:enriched.filter(overdue).length,Today:enriched.filter(today).length,Upcoming:enriched.filter(upcoming).length,Completed:enriched.filter(t=>t.status==='Done').length};
 const matches=(t:Row)=>`${t.title} ${t.notes||''} ${t.priority||''} ${t.category||''} ${t.assignee?.name||''} ${t.connection?.title||''} ${t.connection?.subtitle||''}`.toLowerCase().includes(query.toLowerCase());
 const inFilter=(t:Row)=>filter==='All'||filter==='My tasks'&&t.owner_id===data.member.id&&t.status==='Open'||filter==='Overdue'&&overdue(t)||filter==='Today'&&today(t)||filter==='Upcoming'&&upcoming(t)||filter==='Completed'&&t.status==='Done';
 const visible=enriched.filter(matches).filter(t=>category==='All categories'||t.category===category).filter(inFilter).sort((a,b)=>a.status===b.status?String(a.due).localeCompare(String(b.due)):a.status==='Open'?-1:1);
 const sections=filter==='All'&&!query&&category==='All categories'?[{label:'Overdue',note:'Past due and still open.',rows:visible.filter(overdue),tone:'late'},{label:'Today',note:'Actions due before the day closes.',rows:visible.filter(today),tone:'today'},{label:'Upcoming',note:'The next actions already on the calendar.',rows:visible.filter(upcoming),tone:'upcoming'},{label:'Completed recently',note:'Closed follow-ups retained for history.',rows:visible.filter(t=>t.status==='Done').sort((a,b)=>String(b.completed_at||b.due).localeCompare(String(a.completed_at||a.due))).slice(0,8),tone:'done'}]:[{label:filter==='All'?'Filtered follow-ups':filter,note:`${visible.length} follow-up${visible.length===1?'':'s'} in this view.`,rows:visible,tone:'upcoming'}];
 const metrics=[{label:'Overdue',value:counts.Overdue,note:'Needs immediate attention',icon:AlertCircle,target:'Overdue',tone:'red'},{label:'Due today',value:counts.Today,note:'Commitments for today',icon:Clock3,target:'Today',tone:'gold'},{label:'Upcoming',value:counts.Upcoming,note:'Planned next actions',icon:CalendarClock,target:'Upcoming',tone:'blue'},{label:'Completed',value:counts.Completed,note:'Retained in the activity trail',icon:CheckCircle2,target:'Completed',tone:'green'}];
 return <div className="followups-page">
  <section className="followups-hero"><div><span>ACTION CENTER</span><h1>Follow-ups</h1><p>Turn every interview, requirement, and talent conversation into a clear next action—with one owner and one due date.</p></div>{canWrite&&<button className="btn primary" onClick={()=>onOpen('task')}><Plus size={17}/>Add follow-up</button>}</section>
  <section className="followup-metrics" aria-label="Follow-up summary">{metrics.map(({label,value,note,icon:Icon,target,tone})=><button key={label} className={`followup-metric ${tone} ${filter===target?'active':''}`} aria-pressed={filter===target} onClick={()=>onFilter(filter===target?'All':target)}><span><Icon size={20}/></span><div><strong>{value}</strong><b>{label}</b><small>{note}</small></div></button>)}</section>
  <section className="followup-explainer" aria-label="How follow-ups work"><div className="followup-explainer-title"><span><ShieldCheck size={19}/></span><div><small>WHAT THIS PAGE IS FOR</small><h2>Internal actions for HR and Admin</h2><p>A follow-up is a task someone inside NForce One must complete. It is not the employee interview-feedback email.</p></div></div><div className="followup-explainer-steps"><div><b>1</b><span><strong>Create the action</strong><small>Example: confirm the client result or schedule the next round.</small></span></div><div><b>2</b><span><strong>Assign an owner and due date</strong><small>Connect it to the relevant person, interview, application, or requirement.</small></span></div><div><b>3</b><span><strong>Close it when completed</strong><small>The task stays in history for accountability and reporting.</small></span></div></div><footer><Mail size={15}/><span>Employee interview recollections are handled separately under <strong>Feedback Requests</strong>, where the secure email form is sent automatically.</span></footer></section>
  <section className="followup-board">
   <header className="followup-toolbar"><div className="followup-tabs">{['All','My tasks','Overdue','Today','Upcoming','Completed'].map(name=><button key={name} className={filter===name?'active':''} onClick={()=>onFilter(name)}>{name}<span>{name==='All'?enriched.length:name==='My tasks'?enriched.filter(t=>t.owner_id===data.member.id&&t.status==='Open').length:counts[name as keyof typeof counts]||0}</span></button>)}</div><div className="followup-tools"><label className="followup-search"><Search size={16}/><span className="sr-only">Search follow-ups</span><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search action, owner, person, client, or role"/>{query&&<button aria-label="Clear follow-up search" onClick={()=>onQuery('')}><X size={13}/></button>}</label><label className="followup-category"><Filter size={15}/><span className="sr-only">Filter category</span><select value={category} onChange={e=>setCategory(e.target.value)}>{['All categories','Interview','Requirement','Talent','Client','General'].map(x=><option key={x}>{x}</option>)}</select></label><button className="btn followup-export" onClick={()=>onExport(visible)}><Download size={15}/>Export</button></div></header>
   <div className="followup-sections">{sections.map(section=>section.rows.length?<section className={`followup-section ${section.tone}`} key={section.label}><header><div><span>{section.label.toUpperCase()}</span><h2>{section.label}</h2><p>{section.note}</p></div><b>{section.rows.length}</b></header><div className="followup-list">{section.rows.map(task=><FollowupRow key={task.id} task={task} data={data} canWrite={canWrite} busy={busy} onOpen={onOpen} onAct={onAct}/>)}</div></section>:null)}</div>
   {!visible.length&&<div className="followup-empty"><CheckCircle2 size={30}/><h2>{query||filter!=='All'||category!=='All categories'?'No follow-ups match this view':'No follow-ups are waiting'}</h2><p>{query||filter!=='All'||category!=='All categories'?'Clear the search or change the filters.':'Create a follow-up when a conversation needs a clear owner and due date.'}</p>{query||filter!=='All'||category!=='All categories'?<button className="btn" onClick={()=>{onQuery('');onFilter('All');setCategory('All categories')}}>Clear filters</button>:canWrite&&<button className="btn primary" onClick={()=>onOpen('task')}><Plus size={15}/>Add follow-up</button>}</div>}
   <footer className="followup-automation"><span><Mail size={18}/></span><div><b>Reminder delivery is intentionally off</b><p>{data.emailConfigured?'The company sender is connected, but scheduled follow-up reminders will remain off until the automation phase is approved.':'No reminder email is being sent. Connect the company sender and scheduler before enabling automated reminders.'}</p></div><small>{data.emailConfigured?'SENDER CONNECTED':'SETUP REQUIRED'}</small></footer>
  </section>
 </div>;
}

function FollowupRow({task,data,canWrite,busy,onOpen,onAct}:{task:Row;data:Data;canWrite:boolean;busy:boolean;onOpen:(kind:string,row?:Row)=>void;onAct:(action:string,body:Row)=>Promise<any>}){
 const zone=task.timezone||INDIA_ZONE,isDone=task.status==='Done',isLate=!isDone&&new Date(task.due).getTime()<startOfToday(),assignee=task.assignee||data.members.find(m=>m.id===task.owner_id),connection=task.connection||related(task,data);
 return <article className={`followup-row ${isDone?'completed':''} ${isLate?'overdue':''}`}>
  <button className="followup-check" disabled={!canWrite||busy} onClick={()=>onAct('taskStatus',{id:task.id,status:isDone?'Open':'Done'})} aria-label={isDone?`Reopen ${task.title}`:`Complete ${task.title}`}>{isDone&&<Check size={14}/>}</button>
  <div className="followup-main"><div className="followup-labels"><span className={`followup-priority ${(task.priority||'Normal').toLowerCase()}`}>{task.priority||'Normal'} priority</span><span>{task.category||'General'}</span></div><h3>{task.title}</h3>{task.notes&&<p>{task.notes}</p>}{connection&&<div className="followup-connection"><Link2 size={13}/><b>{connection.title}</b><span>{connection.subtitle}</span></div>}</div>
  <div className="followup-owner"><span>{initials(assignee?.name||'Unassigned')}</span><div><small>OWNER</small><b>{assignee?.name||'Unassigned'}</b></div></div>
  <div className="followup-due"><small>{isDone?'COMPLETED':isLate?'OVERDUE':'DUE'}</small><b>{fmt(isDone&&task.completed_at?task.completed_at:task.due,{weekday:'short',month:'short',day:'numeric'},zone)}</b><span>{fmt(isDone&&task.completed_at?task.completed_at:task.due,{hour:'numeric',minute:'2-digit'},zone)} · {zoneLabel(zone)}</span></div>
  {canWrite&&<button className="followup-edit" onClick={()=>onOpen('taskEdit',task)} aria-label={`Edit ${task.title}`}><Pencil size={15}/></button>}
 </article>;
}
