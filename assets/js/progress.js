(function(root){
 'use strict';
 const KEY='inverted-classroom-physics-9:v1',APP='inverted-classroom-physics-9';
 const lessons=typeof LESSONS!=='undefined'?LESSONS:require('./lessons.js');
 const W=typeof Worksheet!=='undefined'?Worksheet:require('./worksheet.js');
 const all=lessons.flatMap(l=>l.tasks);
 const clone=v=>JSON.parse(JSON.stringify(v));
 const txt=(v,n=2400)=>typeof v==='string'?v.slice(0,n):'';
 const num=(v,max)=>Number.isFinite(v)?Math.min(max,Math.max(0,v)):0;
 function numeric(v,unit=''){
  let s=String(v??'').trim().replace(/\u2212/g,'-');
  if(unit&&s.endsWith(unit))s=s.slice(0,-unit.length).trim();
  s=s.replace(/\s/g,'').replace(',','.');
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return null;
  const value=Number(s);return Number.isFinite(value)?value:null;
 }
 function check(task,value){
  if(task.type==='worksheet')return W.check(task,value);
  if(task.type==='choice')return String(value)===task.answer;
  const n=numeric(value,task.unit);if(n===null||Math.abs(n-task.answer)>(task.tolerance??Math.max(1,Math.abs(task.answer))*1e-8))return false;
  if(task.type==='significant'){
   const mantissa=String(value).trim().replace(',','.').split(/[eE]/)[0].replace(/^[+-]/,'');
   const digits=mantissa.replace('.','').replace(/^0+/,'').length;
   return digits===task.sig;
  }
  return true;
 }
 function fresh(){return {app:APP,version:2,updatedAt:new Date().toISOString(),profile:'',settings:{preview:false},last:'learn',missions:{energy:{preparation:{chapter:0,answers:{},legacyAnswers:{},hints:{},notes:{},video:{},question:''},escape:null}}};}
 function normalizeEscape(v){
  if(v===null||v===undefined)return null;
  if(typeof v!=='object'||Array.isArray(v)||![1,2].includes(v.version)||!Array.isArray(v.answers)||!Array.isArray(v.solved)||v.answers.length>16||v.solved.length>16)throw Error('Der Escape-Spielstand ist unvollständig oder gehört zu einer anderen Version.');
  const answers=Array.from({length:16},(_,i)=>{
   const raw=v.answers[i];if(raw!==undefined&&(!raw||typeof raw!=='object'||Array.isArray(raw)))throw Error('Ungültige Antworten im Escape-Spielstand.');
   const a={};for(const [k,val] of Object.entries(raw||{}))if(/^(q\d|given\d|si\d|unknown|unit|base|expanded|form|algebra|raw|sig|round|sentence|selfcheck|E[hk][12])$/.test(k))a[k]=typeof val==='boolean'?val:txt(val,2400);
   return a;
  });
  const solved=Array.from({length:16},(_,i)=>v.solved[i]===true&&(v.version===2||i<10));
  return {version:2,team:txt(v.team,45)||'Team Joule',current:Math.floor(num(v.current,15)),answers,solved,attempts:Array.from({length:16},(_,i)=>Math.floor(num(v.attempts?.[i],100000))),hints:Array.from({length:16},(_,i)=>Math.floor(num(v.hints?.[i],3))),notes:txt(v.notes,5000),seconds:Math.floor(num(v.seconds,31536000)),seen:Array.isArray(v.seen)?v.seen.filter(i=>Number.isInteger(i)&&i>=0&&i<=6):[],finished:v.finished===true&&solved.every(Boolean),training:false,scenes:v.scenes!==false,voice:v.voice!==false,reduced:v.reduced===true};
 }
 function normalize(raw){
  if(!raw||raw.app!==APP)throw Error('Das ist keine Sicherung für dieses Physik-9-Portal.');
  if(![1,2].includes(raw.version))throw Error('Diese Sicherung stammt aus einer anderen Portal-Version. Der aktuelle Stand bleibt erhalten.');
  if(!raw.missions?.energy?.preparation||typeof raw.missions.energy.preparation!=='object')throw Error('Die Sicherung enthält keine vollständige Energie-Mission.');
  const s=fresh(),p=raw.missions.energy.preparation;
  s.updatedAt=typeof raw.updatedAt==='string'&&!isNaN(Date.parse(raw.updatedAt))?raw.updatedAt:s.updatedAt;
  s.profile=txt(raw.profile,45);s.settings.preview=false;s.last=raw.last==='escape'?'escape':'learn';
  const q=s.missions.energy.preparation;q.chapter=Math.floor(num(p.chapter,4));q.question=txt(p.question,1500);
  if(!p.answers||typeof p.answers!=='object'||Array.isArray(p.answers))throw Error('Die gespeicherten Lernantworten sind ungültig.');
  for(const t of all){if(p.answers[t.id]!==undefined)q.answers[t.id]=W.normalize(t,p.answers[t.id]);q.hints[t.id]=p.hints?.[t.id]===true;}
  for(const [id,value] of Object.entries({...p.legacyAnswers,...p.answers}))if(/^(?:[bhks][1-4]|e[1-5])$/.test(id))q.legacyAnswers[id]=txt(value,180);
  for(const l of lessons){q.notes[l.id]=txt(p.notes?.[l.id],2000);q.video[l.id]=num(p.video?.[l.id],3600);}
  s.missions.energy.escape=normalizeEscape(raw.missions.energy.escape);
  return s;
 }
 function chapterDone(s,id){return lessons.find(l=>l.id===id).tasks.every(t=>check(t,s.missions.energy.preparation.answers[t.id]));}
 function stats(s){const p=s.missions.energy.preparation,e=s.missions.energy.escape;return {answers:all.filter(t=>check(t,p.answers[t.id])).length,total:all.length,chapters:lessons.filter(l=>chapterDone(s,l.id)).length,escape:e?.solved.filter(Boolean).length||0,finished:e?.finished===true};}
 function missionUnlocked(m,s,visited=new Set()){
  if(!m.available||visited.has(m.id))return false;
  visited.add(m.id);
  return m.requires.every(id=>s.missions[id]?.escape?.finished===true);
 }
 let data=fresh(),storage=null,lastStored=null,storageError='',conflict=false,corrupt=false,replacing=false;
 if(root.document){try{storage=root.localStorage;const raw=storage.getItem(KEY);lastStored=raw;if(raw)data=normalize(JSON.parse(raw));}catch(e){storageError='Der gespeicherte Stand konnte nicht gelesen werden. Er bleibt unverändert. Lade eine gültige Sicherung oder sichere deine neue Arbeit als Datei.';corrupt=true;}}
 function get(){return clone(data);}
 function notice(){if(root.document)root.dispatchEvent(new CustomEvent('portalnotice',{detail:{message:storageError,conflict}}));}
 function persist(){
  if(conflict){notice();return false;}
  data.updatedAt=new Date().toISOString();
  if(corrupt){notice();return false;}
  if(storage)try{const serialized=JSON.stringify(data);storage.setItem(KEY,serialized);lastStored=serialized;}catch(e){storageError='Automatisches Speichern ist hier nicht möglich. Nutze „Stand sichern“, bevor du die Seite verlässt.';notice();return false;}
  if(root.document)root.dispatchEvent(new CustomEvent('portalchange'));
  return true;
 }
 function update(fn){if(conflict||replacing){notice();return false;}fn(data);data.settings.preview=false;if(data.missions.energy.escape)data.missions.energy.escape.training=false;return persist();}
 const api={KEY,APP,fresh,normalize,normalizeEscape,numeric,check,stats,chapterDone,missionUnlocked,get,
  update,freeze:()=>{replacing=true;},storageStatus:()=>({message:storageError,conflict}),
  setAnswer:(id,value)=>{const task=all.find(t=>t.id===id);return task?update(s=>s.missions.energy.preparation.answers[id]=W.normalize(task,value)):false;},
  touch:where=>update(s=>s.last=where),
  updateEscape:v=>update(s=>s.missions.energy.escape=normalizeEscape(v)),
  canEscape:()=>!!root.Auth?.isPreview()||stats(data).chapters===lessons.length,
  canChapter:i=>!!root.Auth?.isPreview()||lessons.slice(0,i).every(l=>chapterDone(data,l.id)),
  importState:raw=>{const next=normalize(raw);if(conflict)throw Error('Ein anderer Tab hat den Stand geändert. Lade diese Seite zuerst neu.');if(!storage)throw Error('Der Browser bietet keinen dauerhaften Speicher. Öffne das Portal in einem normalen Browserfenster und lade die Datei dort.');if(storage)try{storage.setItem(KEY+':previous',JSON.stringify(data));storage.setItem(KEY,JSON.stringify(next));}catch(e){throw Error('Der Browser kann die importierte Sicherung nicht dauerhaft speichern. Der aktuelle Stand wurde nicht ersetzt.');}data=next;corrupt=false;storageError='';persist();replacing=true;return get();},
  reset:()=>{data=fresh();corrupt=false;conflict=false;persist();},
  download:()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Physik-9-Lernstand-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
 };
 if(root.document)root.addEventListener('storage',e=>{if(e.key===KEY){
  // Notifications can arrive after navigation or after a newer local write.
  // A value already loaded or saved by this page is not a competing edit.
  try{if(storage&&storage.getItem(KEY)===lastStored)return;}catch(err){}
  conflict=true;storageError='In einem anderen Tab wurde der Lernstand geändert. Sichere bei Bedarf diesen Stand als Datei und lade die Seite neu, bevor du weiterarbeitest.';notice();}});
 root.Portal=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
