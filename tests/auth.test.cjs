const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{webcrypto}=require('node:crypto');
const base=path.join(__dirname,'../assets/js'),C=require(path.join(base,'auth-crypto.js'));
const {configure,open}=require('../scripts/manage-access.cjs');
const fixture=configure({studentPassword:'student-test-only',teacherPassword:'teacher-test-only'},{teacherHtml:'<h1>Confidential teacher fixture</h1>',escapeHtml:'Teacher solution fixture'});
const SESSION=C.APP+':session:v1',LOGOUT=C.APP+':logout:v1';
const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
function browser({session=new Map(),local=new Map(),page='login',configuration=fixture}={}){
 const listeners={},main={className:'',innerHTML:''},root={};
 const document={currentScript:{src:'https://school.example/physics/assets/js/auth.js'},body:{dataset:{page}},documentElement:{dataset:{}},hidden:false,addEventListener:()=>{},querySelector:s=>s==='main'?main:null,querySelectorAll:()=>[],getElementById:()=>({})};
 const context=vm.createContext({window:root,document,crypto:webcrypto,PortalCrypto:C,URL,Date,JSON,CustomEvent:class{},sessionStorage:storage(session),localStorage:storage(local),fetch:async()=>({ok:true,json:async()=>configuration}),location:{pathname:'/physics/lehrkraft.html',search:'',hash:'',replace:url=>root.redirected=url},setInterval:()=>{}});
 Object.assign(root,{crypto:webcrypto,addEventListener:(type,fn)=>listeners[type]=fn,dispatchEvent:()=>{}});
 vm.runInContext(fs.readFileSync(path.join(base,'auth.js'),'utf8'),context);
 return {A:root.Auth,session,local,listeners,main,root};
}
test('Passwörter öffnen nur das eigene authentifizierte Rollenpaket',async()=>{
 const student=fixture.entries[0],teacher=fixture.entries[1],studentKey=await C.derive('student-test-only',student);
 assert.equal((await C.open(studentKey,student)).role,'student');
 await assert.rejects(C.open(studentKey,teacher));
 await assert.rejects(C.open(await C.derive('wrong-password',teacher),teacher));
 const teacherKey=await C.derive('teacher-test-only',teacher);
 assert.match((await C.open(teacherKey,teacher)).teacherHtml,/Confidential/);
 const damaged={...teacher,ciphertext:teacher.ciphertext.slice(0,-12)+'AAAAAAAAAAAA'};
 await assert.rejects(C.open(teacherKey,damaged));
 assert.throws(()=>open(teacher,'student-test-only'));
});
test('Schülerrolle: Lehrkraftbereich, Vorschau und Trainingsmodus bleiben gesperrt',async()=>{
 const b=browser();await b.A.ready;await assert.rejects(b.A.login('incorrect'));assert.equal(b.A.role(),null);
 assert.equal(await b.A.login('student-test-only'),'student');
 assert.equal(b.A.setPreview(true),false);assert.equal(b.A.setTraining(true),false);
 assert.equal(await b.A.requireRole('teacher'),false);assert.match(b.main.innerHTML,/ZUGRIFF BESCHRÄNKT/);
 assert.throws(()=>b.A.teacherContent());assert.equal(b.A.isPreview(),false);
});
test('Lehrerrolle: Inhalt, Vorschau und Trainingsmodus überstehen einen Seitenwechsel',async()=>{
 const first=browser();await first.A.login('teacher-test-only');
 assert.equal(first.A.setPreview(true),true);assert.equal(first.A.setTraining(true),true);
 const next=browser({session:first.session,local:first.local});await next.A.ready;
 assert.equal(await next.A.requireRole('teacher'),true);assert.equal(next.A.isTeacher(),true);assert.equal(next.A.isPreview(),true);assert.equal(next.A.isTraining(),true);assert.match(next.A.teacherContent().escapeHtml,/solution/);
});
test('Manipuliertes Rollenfeld und abgelaufene Sitzung ergeben keine Lehrerrechte',async()=>{
 const b=browser();await b.A.login('student-test-only');const saved=JSON.parse(b.session.get(SESSION));
 b.session.set(SESSION,JSON.stringify({...saved,role:'teacher',preview:true,training:true}));
 const forged=browser({session:b.session,local:b.local});await forged.A.ready;assert.equal(forged.A.role(),null);
 b.session.set(SESSION,JSON.stringify({...saved,expiresAt:Date.now()-1}));
 const expired=browser({session:b.session,local:b.local});await expired.A.ready;assert.equal(expired.A.role(),null);
});
test('Abmelden löscht nur die Anmeldung und sperrt andere offene Tabs',async()=>{
 const first=browser();first.local.set(C.APP+':v1','saved learning progress');await first.A.login('teacher-test-only');
 const second=browser({session:new Map(first.session),local:first.local,page:'teacher'});await second.A.ready;
 first.A.logout();assert.equal(first.session.has(SESSION),false);assert.equal(first.local.get(C.APP+':v1'),'saved learning progress');
 second.listeners.storage({key:LOGOUT});assert.equal(second.A.role(),null);assert.match(second.root.redirected,/anmelden.html/);
});
test('Nicht angemeldet: direkte Seitenaufrufe führen zur Anmeldung',async()=>{
 const b=browser({page:'teacher'});assert.equal(await b.A.requireRole('teacher'),false);assert.match(b.root.redirected,/anmelden.html\?next=lehrkraft.html/);
});
test('Weiterleitung bleibt im eigenen Portal und umgeht keine Lehrerrolle',()=>{
 const baseUrl=new URL('https://school.example/physics/');
 for(const target of ['https://evil.example/','//evil.example/','javascript:alert(1)','../outside.html','assets/access/config.json','lehrkraft.html'])assert.equal(C.destination(target,baseUrl,'student'),baseUrl+'index.html');
 assert.equal(C.destination('missions/energy/lernen.html',baseUrl,'student'),baseUrl+'missions/energy/lernen.html');
 assert.equal(C.destination('lehrkraft.html',baseUrl,'teacher'),baseUrl+'lehrkraft.html');
});
test('Passwortwechsel entwertet den bisherigen Sitzungsschlüssel',async()=>{
 const b=browser();await b.A.login('teacher-test-only');
 const changed=configure({studentPassword:'another-student-test',teacherPassword:'another-teacher-test'},{teacherHtml:'new',escapeHtml:'new'});
 const next=browser({session:b.session,local:b.local,configuration:changed});await next.A.ready;assert.equal(next.A.role(),null);
});
test('Lehrkraft-Inhalte fehlen in öffentlichem HTML und in der Spieloberfläche',()=>{
 const teacher=fs.readFileSync(path.join(__dirname,'../lehrkraft.html'),'utf8'),game=fs.readFileSync(path.join(base,'energy-game.js'),'utf8');
 assert.doesNotMatch(teacher,/Didaktische Hinweise|teacher-solutions|Unterrichtshinweise|Musterlösungen/);
 assert.doesNotMatch(game,/function solutions\(/);assert.match(game,/if\(!Auth.isTeacher\(\)\)return/);
 const config=fs.readFileSync(path.join(__dirname,'../assets/access/config.json'),'utf8');assert.doesNotMatch(config,/teacherHtml|escapeHtml|<h[123]>/);
});
