export function sampleRows(owner:string){
const now=new Date();const day=(n:number,h=14)=>{const d=new Date(now);d.setUTCDate(d.getUTCDate()+n);d.setUTCHours(h,0,0,0);return d.toISOString()};
return {people:[
['demo-p1','Arjun Mehta','arjun@example.com','Internal','Senior Java Developer','Java, Spring Boot, PostgreSQL','Albany, NY','Available now','Platform Modernization'],
['demo-p2','Priya Sharma','priya@example.com','Internal','Full Stack Developer','React, TypeScript, Node.js','Dallas, TX','Available in 2 weeks','Retail Experience'],
['demo-p3','Rohan Patel','rohan@example.com','External','Cloud Engineer','AWS, Terraform, Kubernetes','Jersey City, NJ','Available now',''],
['demo-p4','Sneha Rao','sneha@example.com','External','Data Engineer','Python, SQL, Airflow','Remote, US','Available in 30 days',''],
['demo-p5','Kiran Das','kiran@example.com','Internal','QA Automation Engineer','Playwright, Java, Selenium','Albany, NY','Available now','Quality Engineering'],
['demo-p6','Maya Iyer','maya@example.com','External','Frontend Engineer','React, TypeScript, Accessibility','Austin, TX','Available in 2 weeks',''],
['demo-p7','Aditya Sen','aditya@example.com','Internal','Backend Developer','Java, REST APIs, Kafka','New York, NY','On project','Payments Platform'],
['demo-p8','Nisha Reddy','nisha@example.com','Internal','Business Analyst','SQL, Agile, Financial Services','Remote, US','Available now','Business Transformation']
],requirements:[
['demo-r1','Senior Java Developer','Northstar Financial','Jersey City, NJ · Hybrid','Java, Spring Boot, PostgreSQL','Design and develop backend services for a financial platform. Strong Java, Spring Boot, REST API and SQL skills required. Hybrid working in Jersey City.','High','Open',2],
['demo-r2','Full Stack Engineer','Atlas Retail','Dallas, TX · Hybrid','React, TypeScript, Node.js','Build accessible customer-facing experiences and reliable APIs. Strong React, TypeScript and Node.js experience required.','High','Open',1],
['demo-r3','Cloud Platform Engineer','Evergreen Health','Remote, US','AWS, Terraform, Kubernetes','Maintain secure AWS infrastructure and delivery pipelines. Hands-on Terraform, container and observability experience required.','Normal','Open',1],
['demo-r4','Senior Data Engineer','Northstar Financial','New York, NY · Hybrid','Python, SQL, Airflow','Develop tested data pipelines and improve data quality. Strong Python, SQL and orchestration knowledge required.','Normal','Open',2],
['demo-r5','QA Automation Engineer','Atlas Retail','Remote, US','Playwright, Java, Selenium','Own automation for a web application. Build maintainable browser and API tests and collaborate with developers.','Normal','On hold',1]
],applications:[
['demo-a1','demo-p1','demo-r1','Interview','Pending'],['demo-a2','demo-p2','demo-r2','Interview','Pending'],['demo-a3','demo-p3','demo-r3','Submitted','Pending'],['demo-a4','demo-p4','demo-r4','Screening','Pending'],['demo-a5','demo-p5','demo-r5','Shortlisted','Pending'],['demo-a6','demo-p6','demo-r2','Submitted','Pending'],['demo-a7','demo-p7','demo-r1','Shortlisted','Pending'],['demo-a8','demo-p8','demo-r4','Screening','Pending']
],interviews:[
['demo-i1','demo-a1','Client','Client technical round',day(2,19),day(2,20),null,'Client panel','Scheduled',null,null,0],
['demo-i2','demo-a2','Internal demo','Full stack readiness',day(0,20),day(0,21),owner,'You','Scheduled',null,null,0],
['demo-i3','demo-a3','Client','Cloud architecture discussion',day(3,16),day(3,17),null,'Client panel','Scheduled',null,null,0],
['demo-i4','demo-a1','Internal demo','Backend readiness',day(-2,18),day(-2,19),null,'Internal technical panel','Completed',JSON.stringify({topics:'Java, microservices and SQL',questions:[{question:'How would you investigate a slow API?',answer:'Explained tracing, query analysis and caching.'}],strengths:'Explaining system design decisions',improvements:'More hands-on SQL tuning practice',performance:'Good',result:'Pending',notes:'Prepared to discuss project examples.'}),JSON.stringify({readiness:'Ready with preparation',strengths:'Good Java fundamentals and clear communication.',gaps:'Practice query execution plans and indexing.',recommendation:'Review SQL tuning examples before the client round.',technical:4,communication:4,problemSolving:3}),1],
['demo-i5','demo-a6','Client','Frontend technical round',day(-1,17),day(-1,18),null,'Client panel','Completed',null,null,0]
],tasks:[['demo-t1','Collect frontend interview debrief',day(0,16)],['demo-t2','Confirm Arjun’s availability with delivery team',day(0,18)],['demo-t3','Follow up on cloud engineer submission',day(1,15)]],created:day(-7)};
}
