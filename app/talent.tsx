'use client';

import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react';

type Row=Record<string,any>;
type Data={people:Row[];requirements:Row[];applications:Row[];interviews:Row[];submissions:Row[]};

const safe=(value:any,fallback='Not provided')=>typeof value==='string'&&value.trim()?value.trim():fallback;
const initials=(name:string)=>safe(name,'?').split(' ').map(part=>part[0]).slice(0,2).join('').toUpperCase();
const skillList=(value:any)=>typeof value==='string'?value.split(',').map(v=>v.trim()).filter(Boolean):[];
const INDIA_ZONE='Asia/Kolkata';
const day=(value:any)=>value?new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:INDIA_ZONE}):'Date unavailable';
const cleanRound=(value:any)=>safe(value,'Interview').replace(/\s*-\s*exact time not provided\s*$/i,'');
const feedbackPending=(person:Row,data:Data)=>{const appIds=new Set(data.applications.filter(a=>a.person_id===person.id).map(a=>a.id));return data.interviews.filter(i=>appIds.has(i.application_id)&&i.attendance==='Completed'&&!i.employee_feedback).length};

export default function TalentPage({data,canWrite,query,filter,onQuery,onFilter,onOpen,onExport}:{data:Data;canWrite:boolean;query:string;filter:string;onQuery:(value:string)=>void;onFilter:(value:string)=>void;onOpen:(kind:string,row?:Row)=>void;onExport:(rows:Row[])=>void}){
 const all=data.people;
 const counts={All:all.length,Internal:all.filter(p=>p.kind==='Internal').length,External:all.filter(p=>p.kind==='External').length,Available:all.filter(p=>p.availability==='Available now').length,'Needs feedback':all.filter(p=>feedbackPending(p,data)>0).length};
 const visible=all.filter(p=>`${p.name||''} ${p.email||''} ${p.title||''} ${p.skills||''} ${p.location||''} ${p.project||''}`.toLowerCase().includes(query.toLowerCase())).filter(p=>filter==='All'||p.kind===filter||filter==='Available'&&p.availability==='Available now'||filter==='Needs feedback'&&feedbackPending(p,data)>0).sort((a,b)=>safe(a.name).localeCompare(safe(b.name)));
 const metrics=[
  {label:'Internal employees',value:counts.Internal,note:'Company talent records',Icon:Users,tone:'wine',target:'Internal'},
  {label:'External candidates',value:counts.External,note:'Sourced for requirements',Icon:UserRound,tone:'blue',target:'External'},
  {label:'Available now',value:counts.Available,note:'Confirmed availability',Icon:UserCheck,tone:'sage',target:'Available'},
  {label:'Feedback needed',value:counts['Needs feedback'],note:'Completed interviews awaiting input',Icon:CalendarCheck2,tone:'gold',target:'Needs feedback'},
 ];
 return <div className="talent-page">
  <section className="talent-hero"><div><span>PEOPLE &amp; INTERVIEW HISTORY</span><h1>Talent directory</h1><p>Keep every employee and candidate connected to their requirements, interviews, feedback, and official outcomes.</p></div>{canWrite&&<button className="btn primary talent-new" onClick={()=>onOpen('person')}><Plus size={18}/>Add person</button>}</section>
  <section className="talent-metrics" aria-label="Talent summary">{metrics.map(({label,value,note,Icon,tone,target})=><button type="button" aria-pressed={filter===target} className={`talent-metric ${tone} ${filter===target?'active':''}`} key={label} onClick={()=>onFilter(filter===target?'All':target)}><span><Icon size={20}/></span><div><strong>{value}</strong><b>{label}</b><small>{note}</small></div></button>)}</section>
  <section className="talent-workspace">
   <header className="talent-tools"><div className="talent-tabs" role="group" aria-label="Filter people">{Object.entries(counts).map(([name,count])=><button className={filter===name?'active':''} key={name} onClick={()=>onFilter(name)}>{name}<span>{count}</span></button>)}</div><div className="talent-tool-actions"><label className="talent-search"><Search size={17}/><span className="sr-only">Search people</span><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search name, role, skill, location, or project"/>{query&&<button aria-label="Clear people search" onClick={()=>onQuery('')}><X size={14}/></button>}</label><button className="btn talent-export" onClick={()=>onExport(visible)}><Download size={16}/>Export</button></div></header>
   <div className="talent-table-wrap"><table className="talent-table"><thead><tr><th>PERSON</th><th>SKILLS</th><th>AVAILABILITY &amp; PROJECT</th><th>PIPELINE</th><th>INTERVIEW STATUS</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{visible.map(person=><TalentRow key={person.id} person={person} data={data} onOpen={onOpen}/>)}</tbody></table></div>
   <div className="talent-mobile-list">{visible.map(person=>{const apps=data.applications.filter(a=>a.person_id===person.id),appIds=new Set(apps.map(a=>a.id)),interviews=data.interviews.filter(i=>appIds.has(i.application_id)),pending=feedbackPending(person,data);return <button key={person.id} onClick={()=>onOpen('personDetail',person)}><header><span className={`talent-avatar ${person.kind==='External'?'external':''}`}>{initials(person.name)}</span><div><b>{safe(person.name)}</b><p>{safe(person.title)}</p></div><Eye size={16}/></header><div className="talent-mobile-meta"><span><MapPin size={13}/>{safe(person.location)}</span><span><BriefcaseBusiness size={13}/>{apps.length} opportunities · {interviews.length} interviews</span></div><footer><PersonPill value={safe(person.kind)}/><PersonPill value={safe(person.availability)}/>{pending>0&&<span className="feedback-needed">{pending} feedback pending</span>}</footer></button>})}</div>
   {!visible.length&&<div className="talent-empty"><span><SlidersHorizontal size={25}/></span><h2>{query||filter!=='All'?'No people match these filters':'No people have been added'}</h2><p>{query||filter!=='All'?'Clear the search or select another group.':'Add an employee or external candidate to begin tracking their interview history.'}</p>{query||filter!=='All'?<button className="btn" onClick={()=>{onQuery('');onFilter('All')}}>Clear filters</button>:canWrite&&<button className="btn primary" onClick={()=>onOpen('person')}><Plus size={16}/>Add person</button>}</div>}
   <footer className="talent-footer"><span>Showing <b>{visible.length}</b> of {all.length} people · Select a row to view its complete history.</span><span>External candidates do not receive portal access.</span></footer>
  </section>
 </div>;
}

function TalentRow({person,data,onOpen}:{person:Row;data:Data;onOpen:(kind:string,row?:Row)=>void}){
 const apps=data.applications.filter(a=>a.person_id===person.id),appIds=new Set(apps.map(a=>a.id)),interviews=data.interviews.filter(i=>appIds.has(i.application_id)),pending=feedbackPending(person,data),latest=[...interviews].sort((a,b)=>String(b.start).localeCompare(String(a.start)))[0];
 return <tr tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen('personDetail',person)}}} onClick={()=>onOpen('personDetail',person)}><td><div className="talent-person-cell"><span className={`talent-avatar ${person.kind==='External'?'external':''}`}>{initials(person.name)}</span><div><b>{safe(person.name)}</b><p>{safe(person.title)}</p><small><Mail size={11}/>{safe(person.email)}</small></div></div></td><td><div className="talent-skills">{skillList(person.skills).slice(0,3).map(skill=><span key={skill}>{skill}</span>)}{skillList(person.skills).length>3&&<small>+{skillList(person.skills).length-3}</small>}</div></td><td><div className="talent-availability"><PersonPill value={safe(person.availability)}/><p>{person.kind==='Internal'?safe(person.project,'No current project recorded'):'External candidate'}</p><small><MapPin size={12}/>{safe(person.location)}</small></div></td><td><div className="talent-pipeline"><b>{apps.length}</b><span>opportunit{apps.length===1?'y':'ies'}</span><small>{interviews.length} interview{interviews.length===1?'':'s'}</small></div></td><td>{pending?<div className="talent-followup needs"><span><CalendarCheck2 size={15}/></span><div><b>{pending} feedback pending</b><small>Completed interview needs input</small></div></div>:latest?<div className="talent-followup"><span><CheckCircle2 size={15}/></span><div><b>{safe(latest.attendance)}</b><small>Latest interview · {day(latest.start)}</small></div></div>:<div className="talent-followup quiet"><span><Sparkles size={15}/></span><div><b>No interviews yet</b><small>Ready to connect to an opportunity</small></div></div>}</td><td><button className="talent-open" aria-label={`View ${safe(person.name,'person')}`} onClick={e=>{e.stopPropagation();onOpen('personDetail',person)}}><Eye size={17}/></button></td></tr>;
}

export function PersonDetail({person,data,canWrite,onOpen}:{person:Row;data:Data;canWrite:boolean;onOpen:(kind:string,row?:Row)=>void}){
 const apps=data.applications.filter(a=>a.person_id===person.id).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))),appIds=new Set(apps.map(a=>a.id)),interviews=data.interviews.filter(i=>appIds.has(i.application_id)),completed=interviews.filter(i=>i.attendance==='Completed').length,pending=feedbackPending(person,data);
 return <div className="person-detail">
  <header className="person-detail-head"><span className={`talent-avatar large ${person.kind==='External'?'external':''}`}>{initials(person.name)}</span><div><h2 id="dialog-title">{safe(person.name)}</h2><p>{safe(person.title)}</p><div><PersonPill value={safe(person.kind)}/><PersonPill value={safe(person.availability)}/></div></div>{canWrite&&<button className="btn" onClick={()=>onOpen('personEdit',person)}><Pencil size={15}/>Edit profile</button>}</header>
  <section className="person-contact"><span><Mail size={15}/><div><small>Email</small><b>{safe(person.email)}</b></div></span><span><MapPin size={15}/><div><small>Location</small><b>{safe(person.location)}</b></div></span><span><BriefcaseBusiness size={15}/><div><small>{person.kind==='Internal'?'Current project':'Record type'}</small><b>{person.kind==='Internal'?safe(person.project,'No project recorded'):'External candidate'}</b></div></span></section>
  <div className="person-skill-list">{skillList(person.skills).map(skill=><span key={skill}>{skill}</span>)}{!skillList(person.skills).length&&<small>No skills have been recorded.</small>}</div>
  <section className="person-stats"><div><strong>{apps.length}</strong><span>Opportunities</span></div><div><strong>{interviews.length}</strong><span>Interviews</span></div><div><strong>{completed}</strong><span>Completed</span></div><div className={pending?'attention':''}><strong>{pending}</strong><span>Feedback pending</span></div></section>
  <section className="person-history"><header><div><span>COMPLETE HISTORY</span><h3>Requirements and interviews</h3><p>Every opportunity remains attached to this person for long-term reporting.</p></div>{canWrite&&<button className="btn primary" onClick={()=>onOpen('application',{person_id:person.id})}><Plus size={16}/>Link requirement</button>}</header>
   {apps.length?<div className="person-opportunities">{apps.map(app=>{const req=data.requirements.find(r=>r.id===app.requirement_id),appInterviews=data.interviews.filter(i=>i.application_id===app.id).sort((a,b)=>String(b.start).localeCompare(String(a.start))),submissionCount=data.submissions.filter(s=>s.application_id===app.id).length,isFinal=['Selected','Rejected','Withdrawn'].includes(app.client_result),canProgress=canWrite&&req?.status==='Open'&&!isFinal;return <article key={app.id}><div className="opportunity-head"><span><FileText size={18}/></span><div><b>{safe(req?.title,'Requirement unavailable')}</b><p>{safe(req?.client,'Client unavailable')} <i/> JD version {Number(app.jd_version||1)}</p></div>{!isFinal&&<PersonPill value={safe(app.stage,'Screening')}/>}<DecisionBadge value={safe(app.client_result,'Pending')}/></div><div className="opportunity-facts"><span>{submissionCount} resume submission{submissionCount===1?'':'s'}</span><span>{appInterviews.length} interview{appInterviews.length===1?'':'s'}</span>{!['Not provided','Not communicated'].includes(safe(app.result_source,'Not provided'))&&<span>Source: {safe(app.result_source)}</span>}</div>{canWrite&&<div className="opportunity-actions">{canProgress&&app.stage==='Screening'&&<button onClick={()=>onOpen('submission',app)}>Record submission</button>}{canProgress&&['Submitted','Interview'].includes(app.stage)&&<button onClick={()=>onOpen('interview',{application_id:app.id})}><CalendarDays size={13}/>{app.stage==='Interview'?'Schedule next interview':'Schedule interview'}</button>}{canProgress&&<button onClick={()=>onOpen('result',app)}>Record decision</button>}{isFinal&&<button onClick={()=>onOpen('result',app)}><Eye size={13}/>View decision</button>}</div>}{appInterviews.length?<div className="person-interview-history">{appInterviews.map(interview=><button key={interview.id} onClick={()=>onOpen('interviewDetail',interview)}><span className="interview-date"><b>{new Date(interview.start).toLocaleDateString('en-US',{day:'2-digit',timeZone:INDIA_ZONE})}</b><small>{new Date(interview.start).toLocaleDateString('en-US',{month:'short',timeZone:INDIA_ZONE})}</small></span><div><b>{cleanRound(interview.round)}</b><p>{safe(interview.kind)} <i/> {safe(interview.interviewer_name,'Interviewer not recorded')}</p></div><PersonPill value={safe(interview.attendance)}/><span className={`reflection-state ${interview.employee_feedback?'received':interview.attendance==='Completed'?'pending':''}`}>{interview.employee_feedback?'Employee feedback received':interview.attendance==='Completed'?'Employee feedback pending':'Feedback after completion'}</span><Eye size={15}/></button>)}</div>:<p className="person-no-interviews">No interviews have been scheduled for this opportunity.</p>}</article>})}</div>:<div className="person-history-empty"><BriefcaseBusiness size={26}/><div><b>No requirements linked</b><p>Connect this person to an open requirement to begin tracking submissions and interviews.</p></div></div>}
  </section>
  <footer className="person-detail-note"><CheckCircle2 size={15}/>Employee recollections, internal assessments, and official client decisions remain separate records.</footer>
 </div>;
}

function PersonPill({value}:{value:string}){const key=value.toLowerCase().replaceAll(' ','-');return <span className={`person-pill ${key}`}><i/>{value}</span>}

function DecisionBadge({value}:{value:string}){
 const key=value.toLowerCase().replaceAll(' ','-');
 const copy=value==='Selected'?'Selected by client':value==='Rejected'?'Not selected by client':value==='On hold'?'Client decision on hold':value==='Withdrawn'?'Application withdrawn':'Decision pending';
 return <div className={`official-decision ${key}`}><span>{value==='Selected'?<CheckCircle2 size={17}/>:value==='Rejected'?<X size={17}/>:<CalendarCheck2 size={17}/>}</span><div><small>OFFICIAL CLIENT RESULT</small><b>{copy}</b></div></div>;
}
