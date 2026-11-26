'use client';

import {useMemo,useState} from 'react';
import {Activity,BriefcaseBusiness,CalendarCheck2,CheckCircle2,ClipboardList,Download,FileSpreadsheet,Filter,History,Search,Target,TrendingUp,UserRoundCheck,Users,X} from 'lucide-react';

type Row=Record<string,any>;
type Data={people:Row[];requirements:Row[];applications:Row[];interviews:Row[];submissions:Row[];activity:Row[]};
type ExportKind='applications'|'requirements'|'interviews'|'employee-history'|'activity';

const fmt=(value:string,options:Intl.DateTimeFormatOptions={month:'short',day:'numeric',year:'numeric'})=>new Date(value).toLocaleString('en-US',{...options,timeZone:'Asia/Kolkata'});
const initials=(name:string)=>name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'?';
const stamp=(row:Row)=>row.created_at||row.start||row.completed_at||'';

export default function ReportsPage({data,onNavigate,onOpen,onExport}:{data:Data;onNavigate:(page:string,filter?:string)=>void;onOpen:(kind:string,row:Row)=>void;onExport:(kind:ExportKind,rows:Row[])=>void}){
 const [scope,setScope]=useState('All time'),[query,setQuery]=useState(''),[actor,setActor]=useState('All people');
 const threshold=useMemo(()=>{const now=new Date();if(scope==='Last 30 days')now.setDate(now.getDate()-30);else if(scope==='Last 90 days')now.setDate(now.getDate()-90);else if(scope==='This year')now.setMonth(0,1);else return 0;now.setHours(0,0,0,0);return now.getTime()},[scope]);
 const within=(row:Row)=>!threshold||!stamp(row)||new Date(stamp(row)).getTime()>=threshold;
 const applications=data.applications.filter(within),requirements=data.requirements.filter(within),interviews=data.interviews.filter(within),submissions=data.submissions.filter(within);
 const pmap=Object.fromEntries(data.people.map(p=>[p.id,p])),rmap=Object.fromEntries(data.requirements.map(r=>[r.id,r])),amap=Object.fromEntries(data.applications.map(a=>[a.id,a]));
 const activeRequirements=data.requirements.filter(r=>r.status==='Open');
 const completed=interviews.filter(i=>i.attendance==='Completed');
 const decided=applications.filter(a=>a.client_result&&a.client_result!=='Pending'&&a.client_result!=='Not communicated');
 const selected=applications.filter(a=>a.client_result==='Selected');
 const selectionRate=decided.length?Math.round(selected.length/decided.length*100):0;
 const feedbackReady=completed.filter(i=>i.employee_feedback||i.hr_feedback||i.assessment).length;
 const feedbackRate=completed.length?Math.round(feedbackReady/completed.length*100):0;
 const distinctPipeline=new Set(applications.map(a=>a.person_id)).size;
 const funnel=[
  {label:'Role connections',value:applications.length,note:'Distinct applications'},
  {label:'Resume submissions',value:submissions.length,note:'Recorded submissions'},
  {label:'Interview activity',value:interviews.length,note:'Scheduled or completed conversations'},
  {label:'Client decision',value:decided.length,note:'Official result recorded'},
 ];
 const maxFunnel=Math.max(1,...funnel.map(x=>x.value));
 const requirementRows:Row[]=activeRequirements.map(r=>{const apps=data.applications.filter(a=>a.requirement_id===r.id),appIds=new Set(apps.map(a=>a.id)),ints=data.interviews.filter(i=>appIds.has(i.application_id)),decisions=apps.filter(a=>a.client_result&&a.client_result!=='Pending'&&a.client_result!=='Not communicated');return {...r,pipeline:apps.length,interviewCount:ints.length,decisionCount:decisions.length,coverage:Math.min(100,Math.round(apps.length/Math.max(1,Number(r.openings))*100))} as Row}).sort((a,b)=>b.coverage-a.coverage||String(a.created_at).localeCompare(String(b.created_at)));
 const activityRows=data.activity.filter(within).filter(a=>actor==='All people'||a.actor_name===actor).filter(a=>`${a.actor_name} ${a.action} ${a.entity_id}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 const actors=['All people',...Array.from(new Set(data.activity.map(a=>a.actor_name).filter(Boolean)))];
 const reports=[
  {kind:'applications' as ExportKind,title:'Application register',text:'Every person-to-requirement connection, current stage, and official client result.',icon:ClipboardList,rows:applications},
  {kind:'interviews' as ExportKind,title:'Interview register',text:'Interview schedule, attendance, panel, type, and connected employee or candidate.',icon:CalendarCheck2,rows:interviews},
  {kind:'employee-history' as ExportKind,title:'Employee interview history',text:'A person-by-person history of interviews, feedback status, and client outcomes.',icon:UserRoundCheck,rows:interviews},
  {kind:'requirements' as ExportKind,title:'Requirements register',text:'Client demand, JD version, openings, priority, ownership, and current status.',icon:BriefcaseBusiness,rows:requirements},
  {kind:'activity' as ExportKind,title:'Activity ledger',text:'Permanent operational history showing who changed what and when.',icon:History,rows:activityRows},
 ];
 return <div className="reports-page">
  <section className="reports-hero"><div><span>OPERATIONS INTELLIGENCE</span><h1>Reports &amp; insights</h1><p>Understand demand, interview progress, client decisions, and team activity from the records your HR team already maintains.</p></div><label className="reports-scope"><Filter size={15}/><span>Reporting period</span><select value={scope} onChange={e=>setScope(e.target.value)}>{['All time','Last 30 days','Last 90 days','This year'].map(x=><option key={x}>{x}</option>)}</select></label></section>
  <section className="report-metrics" aria-label="Reporting summary">
   <button onClick={()=>onNavigate('Requirements','Open')}><span className="ruby"><BriefcaseBusiness size={20}/></span><div><strong>{activeRequirements.length}</strong><b>Open requirements</b><small>{activeRequirements.reduce((n,r)=>n+Number(r.openings||0),0)} positions still open</small></div></button>
   <button onClick={()=>onNavigate('Talent directory')}><span className="blue"><Users size={20}/></span><div><strong>{distinctPipeline}</strong><b>People in pipeline</b><small>{applications.length} role connections in period</small></div></button>
   <button onClick={()=>onNavigate('Interviews','Completed')}><span className="gold"><CalendarCheck2 size={20}/></span><div><strong>{completed.length}</strong><b>Completed interviews</b><small>{feedbackRate}% have useful feedback</small></div></button>
   <button onClick={()=>onNavigate('Talent directory')}><span className="sage"><Target size={20}/></span><div><strong>{selected.length}</strong><b>Client selections</b><small>{selectionRate}% of recorded decisions</small></div></button>
  </section>
  <section className="reports-grid reports-primary">
   <article className="report-card pipeline-card"><CardHead eyebrow="PIPELINE" title="Pipeline movement" text="Recorded activity volume in the selected period—never an estimated conversion."/><div className="pipeline-funnel">{funnel.map(step=><div className="pipeline-step" key={step.label}><div className="pipeline-step-copy"><div><b>{step.label}</b><small>{step.note}</small></div><strong>{step.value}</strong></div><div><i style={{width:`${Math.max(step.value?12:0,step.value/maxFunnel*100)}%`}}/></div></div>)}</div><footer><span><TrendingUp size={15}/>Each bar represents a recorded business event.</span><button onClick={()=>onExport('applications',applications)}><Download size={14}/>Export applications</button></footer></article>
   <article className="report-card readiness-card"><CardHead eyebrow="RECORD QUALITY" title="Decision readiness" text="Where the team has enough information to move forward confidently."/><div className="readiness-score"><div className="score-ring" style={{'--score':`${feedbackRate*3.6}deg`} as React.CSSProperties}><span><strong>{feedbackRate}%</strong><small>feedback coverage</small></span></div><div className="readiness-copy"><div><span className="good"><CheckCircle2 size={15}/></span><p><b>{feedbackReady} complete interview records</b><small>Employee, HR, or interviewer feedback is present.</small></p></div><div><span className="warn"><Activity size={15}/></span><p><b>{Math.max(0,completed.length-feedbackReady)} records need context</b><small>Completed interviews without useful feedback.</small></p></div><div><span className="neutral"><Target size={15}/></span><p><b>{decided.length} official client decisions</b><small>{selected.length} selected · {Math.max(0,decided.length-selected.length)} not selected or other.</small></p></div></div></div></article>
  </section>
  <section className="report-card requirement-health"><CardHead eyebrow="CLIENT DEMAND" title="Requirement health" text="Coverage shows how many connected people are available for each open position." action={<button onClick={()=>onNavigate('Requirements')}>View requirements</button>}/><div className="requirement-health-table"><div className="health-head"><span>Requirement</span><span>Openings</span><span>Pipeline</span><span>Interviews</span><span>Decisions</span><span>Coverage</span></div>{requirementRows.map(r=><button className="health-row" key={r.id} onClick={()=>onOpen('requirementDetail',r)}><span><b>{r.title}</b><small>{r.client}</small></span><strong>{r.openings}</strong><strong>{r.pipeline}</strong><strong>{r.interviewCount}</strong><strong>{r.decisionCount}</strong><span className="coverage"><i><em style={{width:`${r.coverage}%`}}/></i><b>{r.coverage}%</b></span></button>)}{!requirementRows.length&&<div className="report-empty">No open requirements are available for this report.</div>}</div></section>
  <section className="reports-grid reports-bottom">
   <article className="report-card export-center"><CardHead eyebrow="DOWNLOAD CENTER" title="Operational registers" text="Exports use the current reporting period and preserve spreadsheet-safe formatting."/><div className="export-list">{reports.map(({kind,title,text,icon:Icon,rows})=><button key={kind} onClick={()=>onExport(kind,rows)}><span><Icon size={17}/></span><div><b>{title}</b><small>{text}</small></div><em>{rows.length} rows</em><Download size={15}/></button>)}</div></article>
   <article className="report-card activity-card"><CardHead eyebrow="AUDIT TRAIL" title="Recent activity" text="Original contributions stay with their author, even when ownership changes."/><div className="activity-controls"><label><Search size={15}/><span className="sr-only">Search activity</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search action, person, or record"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear activity search"><X size={13}/></button>}</label><select aria-label="Filter activity author" value={actor} onChange={e=>setActor(e.target.value)}>{actors.map(x=><option key={x}>{x}</option>)}</select></div><div className="report-activity-list">{activityRows.slice(0,6).map(row=><div key={row.id}><span>{initials(row.actor_name||'System')}</span><div><b>{row.action}</b><small>{row.actor_name||'System'} · {String(row.entity_id||'Record').startsWith('preview')?'Sample record':String(row.entity_id||'Record').slice(0,10)}</small></div><time>{fmt(row.created_at,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></div>)}{!activityRows.length&&<div className="report-empty"><History size={24}/><b>No activity matches this view</b><span>Change the reporting period, author, or search.</span></div>}</div></article>
  </section>
  <footer className="reports-definition"><FileSpreadsheet size={17}/><div><b>Clear reporting definitions</b><p>A selection is counted only when an official client result is recorded. Interview feedback, internal assessments, and client decisions remain separate records.</p></div></footer>
 </div>;
}

function CardHead({eyebrow,title,text,action}:{eyebrow:string;title:string;text:string;action?:React.ReactNode}){return <header className="report-card-head"><div><span>{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>{action}</header>}
