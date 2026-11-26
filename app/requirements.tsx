'use client';
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  Download,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Target,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

type Row=Record<string,any>;
type Data={member:Row;people:Row[];requirements:Row[];applications:Row[];interviews:Row[];submissions:Row[]};

const safe=(value:any,fallback='Not provided')=>typeof value==='string'&&value.trim()?value.trim():fallback;
const skills=(value:any)=>typeof value==='string'?value.split(',').map(v=>v.trim()).filter(Boolean):[];
const age=(value:any,status='Open')=>{if(!value)return status==='Closed'?'Closed':'Date unavailable';const days=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/86400000));if(status==='Closed')return `Closed · ${days} day${days===1?'':'s'} active`;return days===0?'Opened today':days===1?'Open 1 day':`Open ${days} days`};
const initials=(name:string)=>safe(name,'?').split(' ').map(v=>v[0]).slice(0,2).join('').toUpperCase();
const finalDecision=(value:any)=>['Selected','Rejected','Withdrawn'].includes(String(value||''));
const visibleBrief=(value:any,title:any,client:any)=>{const text=safe(value,'');if(!text||/source documents?|historical .*interview requirement/i.test(text))return `${safe(title,'This role')} opportunity with ${safe(client,'the client')}. Detailed responsibilities, qualifications, and experience expectations have not yet been added.`;return text};

export default function RequirementsPage({data,canWrite,query,filter,onQuery,onFilter,onOpen,onExport}:{data:Data;canWrite:boolean;query:string;filter:string;onQuery:(value:string)=>void;onFilter:(value:string)=>void;onOpen:(kind:string,row?:Row)=>void;onExport:(rows:Row[])=>void}){
 const counts={All:data.requirements.length,Open:data.requirements.filter(r=>r.status==='Open').length,High:data.requirements.filter(r=>r.priority==='High'&&r.status==='Open').length,'On hold':data.requirements.filter(r=>r.status==='On hold').length,Closed:data.requirements.filter(r=>r.status==='Closed').length};
 const visible=data.requirements.filter(r=>`${r.title||''} ${r.client||''} ${r.location||''} ${r.skills||''}`.toLowerCase().includes(query.toLowerCase())).filter(r=>filter==='All'||r.status===filter||r.priority===filter).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
 const openings=data.requirements.filter(r=>r.status==='Open').reduce((total,r)=>total+Number(r.openings||0),0);
 const withoutCandidates=data.requirements.filter(r=>r.status==='Open'&&!data.applications.some(a=>a.requirement_id===r.id)).length;
 const metrics=[
  {label:'Open requirements',value:counts.Open,note:'Active client demand',Icon:BriefcaseBusiness,tone:'wine'},
  {label:'Open positions',value:openings,note:'Across active requirements',Icon:Target,tone:'blue'},
  {label:'High priority',value:counts.High,note:'Needs focused attention',Icon:CalendarClock,tone:'gold'},
  {label:'No candidates yet',value:withoutCandidates,note:'Pipeline has not started',Icon:UserPlus,tone:'sage'},
 ];
 return <div className="requirements-page">
  <section className="requirements-hero"><div><span>CLIENT REQUIREMENTS</span><h1>Requirements</h1><p>Manage every client role, job description, candidate pipeline, and hiring outcome from one reliable record.</p></div>{canWrite&&<button className="btn primary requirement-new" onClick={()=>onOpen('requirement')}><Plus size={18}/>New requirement</button>}</section>
  <section className="requirement-metrics" aria-label="Requirement summary">{metrics.map(({label,value,note,Icon,tone})=><article className={`requirement-metric ${tone}`} key={label}><span><Icon size={20}/></span><div><strong>{value}</strong><b>{label}</b><small>{note}</small></div></article>)}</section>
  <section className="requirements-workspace">
   <header className="requirements-tools"><div className="requirement-tabs" role="group" aria-label="Filter requirements">{Object.entries(counts).map(([name,count])=><button className={filter===name?'active':''} key={name} onClick={()=>onFilter(name)}>{name}<span>{count}</span></button>)}</div><div className="requirements-tool-actions"><label className="requirements-search"><Search size={17}/><span className="sr-only">Search requirements</span><input value={query} onChange={e=>onQuery(e.target.value)} placeholder="Search role, client, or skills"/>{query&&<button aria-label="Clear requirement search" onClick={()=>onQuery('')}><X size={14}/></button>}</label><button className="btn requirement-export" onClick={()=>onExport(visible)}><Download size={16}/>Export</button></div></header>
   <div className="requirements-table-wrap"><table className="requirements-table"><thead><tr><th>REQUIREMENT</th><th>PIPELINE</th><th>OPENINGS</th><th>PRIORITY</th><th>STATUS</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{visible.map(r=>{const apps=data.applications.filter(a=>a.requirement_id===r.id),interviews=data.interviews.filter(i=>apps.some(a=>a.id===i.application_id));return <tr key={r.id} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen('requirementDetail',r)}}} onClick={()=>onOpen('requirementDetail',r)}><td><div className="requirement-title-cell"><span><Building2 size={19}/></span><div><b>{safe(r.title,'Untitled requirement')}</b><p>{safe(r.client,'Client not added')}</p><small>{age(r.created_at,r.status)}</small></div></div></td><td><div className="pipeline-cell"><div className="pipeline-avatars">{apps.slice(0,3).map(a=><span key={a.id}>{initials(data.people.find(p=>p.id===a.person_id)?.name||'Candidate')}</span>)}</div><b>{apps.length}</b><small>{interviews.length} interview{interviews.length===1?'':'s'}</small></div></td><td><strong className="openings-count">{Number(r.openings||0)}</strong></td><td><RequirementPill value={safe(r.priority,'Normal')}/></td><td><RequirementPill value={safe(r.status,'Open')}/></td><td><button className="requirement-open" aria-label={`View ${safe(r.title,'requirement')}`} onClick={e=>{e.stopPropagation();onOpen('requirementDetail',r)}}><Eye size={17}/></button></td></tr>})}</tbody></table></div>
   <div className="requirements-mobile-list">{visible.map(r=>{const apps=data.applications.filter(a=>a.requirement_id===r.id),interviews=data.interviews.filter(i=>apps.some(a=>a.id===i.application_id));return <button key={r.id} onClick={()=>onOpen('requirementDetail',r)}><header><span><Building2 size={18}/></span><div><b>{safe(r.title,'Untitled requirement')}</b><p>{safe(r.client,'Client not added')}</p></div><Eye size={16}/></header><div className="mobile-requirement-meta"><span><Users size={13}/>{apps.length} people · {interviews.length} interviews</span></div><footer><div><RequirementPill value={safe(r.priority,'Normal')}/><RequirementPill value={safe(r.status,'Open')}/></div><small>{Number(r.openings||0)} opening{Number(r.openings||0)===1?'':'s'} · {age(r.created_at,r.status)}</small></footer></button>})}</div>
   {!visible.length&&<div className="requirements-empty"><span><SlidersHorizontal size={25}/></span><h2>{query||filter!=='All'?'No requirements match these filters':'No requirements yet'}</h2><p>{query||filter!=='All'?'Clear the search or choose another status.':'Create the first client requirement to begin building a candidate pipeline.'}</p>{(query||filter!=='All')?<button className="btn" onClick={()=>{onQuery('');onFilter('All')}}>Clear filters</button>:canWrite&&<button className="btn primary" onClick={()=>onOpen('requirement')}><Plus size={16}/>New requirement</button>}</div>}
   <footer className="requirements-footer"><span>Showing <b>{visible.length}</b> of {data.requirements.length} requirements</span><span>Counts are calculated from connected candidate and interview records.</span></footer>
  </section>
 </div>;
}

export function RequirementDetail({requirement,data,canWrite,onOpen,onAct}:{requirement:Row;data:Data;canWrite:boolean;onOpen:(kind:string,row?:Row)=>void;onAct:(action:string,body:Row)=>Promise<boolean>}){
 const apps=data.applications.filter(a=>a.requirement_id===requirement.id),appIds=new Set(apps.map(a=>a.id)),interviews=data.interviews.filter(i=>appIds.has(i.application_id)),activeApps=apps.filter(a=>!finalDecision(a.client_result)&&a.client_result!=='On hold'),submitted=activeApps.filter(a=>a.stage==='Submitted').length,interviewStage=activeApps.filter(a=>a.stage==='Interview').length,selected=apps.filter(a=>a.client_result==='Selected').length,rejected=apps.filter(a=>a.client_result==='Rejected').length;
 const updateStatus=(status:string)=>onAct('requirementStatus',{id:requirement.id,status});
 return <div className="requirement-detail">
  <div className="requirement-detail-title"><span><Building2 size={21}/></span><div><h2 id="dialog-title">{safe(requirement.title,'Untitled requirement')}</h2><p>{safe(requirement.client,'Client not added')}{requirement.location&&requirement.location!=='Not provided'&&<> <i/> {requirement.location}</>}</p></div></div>
  <div className="requirement-detail-actions"><RequirementPill value={safe(requirement.status,'Open')}/><RequirementPill value={safe(requirement.priority,'Normal')}/><span className="jd-version"><FileText size={14}/>JD version {Number(requirement.jd_version||1)}</span>{canWrite&&<button className="btn" onClick={()=>onOpen('requirementEdit',requirement)}><Pencil size={15}/>Edit</button>}</div>
  <div className="requirement-detail-stats"><div><strong>{Number(requirement.openings||0)}</strong><span>Openings</span></div><div><strong>{apps.length}</strong><span>People linked</span></div><div><strong>{submitted}</strong><span>Submitted</span></div><div><strong>{interviews.length}</strong><span>Interviews</span></div><div><strong>{selected}</strong><span>Selected</span></div></div>
  <section className="requirement-brief"><header><div><span>ROLE BRIEF</span><h3>Job description</h3></div><small>{age(requirement.created_at,requirement.status)}</small></header><p>{visibleBrief(requirement.jd,requirement.title,requirement.client)}</p>{skills(requirement.skills).length?<div className="requirement-skills">{skills(requirement.skills).map(skill=><span key={skill}>{skill}</span>)}</div>:<div className="requirement-missing">Required skills have not been added.</div>}</section>
  <section className="pipeline-summary"><header><div><span>CANDIDATE PIPELINE</span><h3>People connected to this requirement</h3></div>{canWrite&&requirement.status==='Open'&&<button className="btn primary" onClick={()=>onOpen('application',{requirement_id:requirement.id})}><UserPlus size={16}/>Add person</button>}</header><div className="pipeline-stage-grid"><span><b>{activeApps.filter(a=>a.stage==='Screening').length}</b>Screening</span><span><b>{submitted}</b>Submitted</span><span><b>{interviewStage}</b>Interview</span><span><b>{apps.filter(a=>a.client_result==='On hold').length}</b>On hold</span><span className="selected"><b>{selected}</b>Selected</span><span className="rejected"><b>{rejected}</b>Not selected</span></div>
   {apps.length?<div className="requirement-candidates">{apps.map(a=>{const person=data.people.find(p=>p.id===a.person_id),personInterviews=data.interviews.filter(i=>i.application_id===a.id),lastInterview=[...personInterviews].sort((x,y)=>String(y.start).localeCompare(String(x.start)))[0],isFinal=finalDecision(a.client_result),canProgress=canWrite&&requirement.status==='Open'&&!isFinal;return <article key={a.id} className={isFinal?`decision-${String(a.client_result).toLowerCase()}`:''}><button className="candidate-profile" onClick={()=>onOpen('personDetail',person)}><span>{initials(person?.name||'Candidate')}</span><div><b>{safe(person?.name,'Candidate')}</b><p>{safe(person?.title)} <i/> {safe(person?.kind,'Profile')}</p></div></button><div className="candidate-progress">{isFinal?<><span className={`decision-badge ${String(a.client_result).toLowerCase()}`}><CheckCircle2 size={14}/>{a.client_result}</span><small className="decision-label">Final client decision</small></>:<><RequirementPill value={safe(a.client_result==='On hold'?'On hold':a.stage,'Screening')}/><span>Client decision: <b>{safe(a.client_result,'Pending')}</b></span></>}{lastInterview&&<small><CalendarDays size={13}/>{new Date(lastInterview.start).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'Asia/Kolkata'})}</small>}</div>{canWrite&&<div className="candidate-actions">{canProgress&&a.stage==='Screening'&&<button title="Record submission" onClick={()=>onOpen('submission',a)}><Send size={15}/><span>Submit</span></button>}{canProgress&&['Submitted','Interview'].includes(a.stage)&&<button title={a.stage==='Interview'?'Schedule next interview':'Schedule interview'} onClick={()=>onOpen('interview',{application_id:a.id})}><CalendarDays size={15}/><span>{a.stage==='Interview'?'Next interview':'Schedule'}</span></button>}{canProgress&&<button title="Record client decision" onClick={()=>onOpen('result',a)}><CheckCircle2 size={15}/><span>Record decision</span></button>}{isFinal&&<button className="decision-action" title="Review or update client decision" onClick={()=>onOpen('result',a)}><Eye size={15}/><span>View decision</span></button>}</div>}</article>})}</div>:<div className="pipeline-empty"><Users size={25}/><div><b>No people linked yet</b><p>Connect an internal employee or external candidate to start tracking this requirement.</p></div></div>}
  </section>
  {canWrite&&<footer className="requirement-status-actions"><div><b>Requirement status</b><p>Keep the requirement lifecycle accurate for reporting.</p></div><div>{requirement.status!=='Open'&&<button className="btn" onClick={()=>updateStatus('Open')}><CheckCircle2 size={15}/>Reopen</button>}{requirement.status==='Open'&&<button className="btn" onClick={()=>updateStatus('On hold')}><CirclePause size={15}/>Place on hold</button>}{requirement.status!=='Closed'&&<button className="btn danger-outline" onClick={()=>updateStatus('Closed')}>Close requirement</button>}</div></footer>}
 </div>;
}

function RequirementPill({value}:{value:string}){const key=value.toLowerCase().replaceAll(' ','-');return <span className={`requirement-pill ${key}`}><i/>{value}</span>}
