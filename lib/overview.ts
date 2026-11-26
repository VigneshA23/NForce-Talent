type Row=Record<string,any>;
export function realRecords<T extends Record<string,any>>(data:T):T{
 const people=(data.people||[]).filter((p:Row)=>!p.sample),requirements=(data.requirements||[]).filter((r:Row)=>!r.sample);
 const pids=new Set(people.map((p:Row)=>p.id)),rids=new Set(requirements.map((r:Row)=>r.id));
 const applications=(data.applications||[]).filter((a:Row)=>pids.has(a.person_id)&&rids.has(a.requirement_id)),aids=new Set(applications.map((a:Row)=>a.id));
 const interviews=(data.interviews||[]).filter((i:Row)=>aids.has(i.application_id)),interviewIds=new Set(interviews.map((i:Row)=>i.id));
 return {...data,people,requirements,applications,interviews,feedback_requests:(data.feedback_requests||[]).filter((r:Row)=>interviewIds.has(r.interview_id)),submissions:(data.submissions||[]).filter((s:Row)=>aids.has(s.application_id)),tasks:(data.tasks||[]).filter((t:Row)=>!t.id.startsWith('demo-')),activity:(data.activity||[]).filter((a:Row)=>!a.entity_id?.startsWith('demo-')&&a.entity_id!=='sample')};
}
export function overviewSummary(input:Record<string,any>,now=Date.now()){
 const data=realRecords(input),pmap=Object.fromEntries(data.people.map((p:Row)=>[p.id,p])),amap=Object.fromEntries(data.applications.map((a:Row)=>[a.id,a]));
 const openRequirements=data.requirements.filter((r:Row)=>r.status==='Open');
 const upcoming=data.interviews.filter((i:Row)=>i.attendance==='Scheduled'&&new Date(i.end).getTime()>=now).sort((a:Row,b:Row)=>a.start.localeCompare(b.start));
 const needsFeedback=data.interviews.filter((i:Row)=>i.attendance==='Completed'&&((pmap[amap[i.application_id]?.person_id]?.kind==='Internal'&&!i.employee_feedback)||(i.kind==='Internal demo'&&!i.assessment)));
 const attendanceMissing=data.interviews.filter((i:Row)=>i.attendance==='Scheduled'&&new Date(i.end).getTime()<now).sort((a:Row,b:Row)=>a.start.localeCompare(b.start));
 const followUps=data.tasks.filter((t:Row)=>t.status==='Open').sort((a:Row,b:Row)=>a.due.localeCompare(b.due));
 return {openRequirements,upcoming,needsFeedback,attendanceMissing,followUps,availableEmployees:data.people.filter((p:Row)=>p.kind==='Internal'&&p.availability==='Available now'),nextWeek:upcoming.filter((i:Row)=>new Date(i.start).getTime()<now+7*86400000),overdue:followUps.filter((t:Row)=>new Date(t.due).getTime()<now)};
}
