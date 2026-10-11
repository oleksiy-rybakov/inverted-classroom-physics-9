(function(){
 'use strict';
 const C=PortalCrypto,KEY=C.APP+':releases:v1';
 let entries=[],unlocked=new Map(),problem='';
 function save(){sessionStorage.setItem(KEY,JSON.stringify({session:Auth.sessionTag(),keys:Object.fromEntries([...unlocked].map(([scope,key])=>[scope,C.base64(key)]))}));}
 function clear(){unlocked.clear();try{sessionStorage.removeItem(KEY);}catch{}}
 async function restore(){
  await Auth.ready;if(!Auth.isAuthenticated())return;
  try{
   const response=await fetch(new URL('assets/access/gates.json',Auth.base),{cache:'no-store'});if(!response.ok)throw Error();
   const config=await response.json();if(config.app!==C.APP||config.version!==1||!Array.isArray(config.entries))throw Error();entries=config.entries;
  }catch{problem='Die Freigaben können gerade nicht geladen werden. Bitte lade die Seite erneut.';return;}
  try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');if(!saved||saved.session!==Auth.sessionTag()){clear();return;}
   for(const entry of entries){if(!saved.keys?.[entry.scope])continue;try{const key=C.bytes(saved.keys[entry.scope]);await C.openGate(key,entry);unlocked.set(entry.scope,key);}catch{}}
  }catch{clear();}
 }
 const ready=restore();
 function has(mission,phase){return Auth.isAuthenticated()&&(Auth.isTeacher()||unlocked.has(`${mission}:${phase}`));}
 async function unlock(mission,phase,password){
  await ready;if(!Auth.isAuthenticated())throw Error('Melde dich zuerst an.');
  const scope=`${mission}:${phase}`,entry=entries.find(x=>x.scope===scope);if(!entry)throw Error('Dieser Bereich ist noch nicht freigegeben.');
  if(typeof password!=='string'||!password||password.length>256)throw Error('Gib das Freigabepasswort ein.');
  let key;try{key=await C.deriveGate(password,entry);await C.openGate(key,entry);}catch{throw Error('Das Freigabepasswort stimmt nicht. Achte auf Groß- und Kleinschreibung.');}
  unlocked.set(scope,key);try{save();}catch{unlocked.delete(scope);throw Error('Der Browser kann die Freigabe nicht speichern. Erlaube den Sitzungsspeicher.');}
 }
 function show(content){document.body.dataset.accessLocked='true';document.querySelector('main').innerHTML=`<section class="phase-lock">${content}</section>`;document.documentElement.dataset.authState='ready';}
 function link(relative,label){return `<a class="pbtn" href="${new URL(relative,Auth.base).href}">${label}</a>`;}
 function blocked(title,description,action=''){
  show(`<span class="eyebrow">MISSION NOCH GESPERRT</span><h1>${title}</h1><p>${description}</p>${action||link('index.html','Zur Missionsübersicht')}`);return false;
 }
 function passwordGate(mission,phase){
  const isEscape=phase==='escape',entry=entries.find(x=>x.scope===`${mission.id}:${phase}`);
  if(problem)return blocked('Freigabe nicht erreichbar.',problem);
  if(!entry)return blocked('Hier geht es später weiter.','Deine Lehrkraft gibt diesen Bereich frei, sobald er bereit ist.');
  show(`<span class="eyebrow">MISSION ${mission.number} · ${isEscape?'ESCAPE GAME':'LERNEN & VORBEREITEN'}</span><h1>${isEscape?'Die Bergstation wartet.':'Bereit für deine nächste Mission?'}</h1><p>${isEscape?'Du hast die Vorbereitung abgeschlossen. Das Escape Game besitzt ein eigenes Freigabepasswort.':'Die Lernvideos und Aufgaben dieser Mission werden mit einem eigenen Passwort freigeschaltet.'} Du erhältst es von deiner Lehrkraft.</p><form id="phase-form"><label for="phase-password">${isEscape?'Passwort für das Escape Game':'Passwort für die Mission'}</label><input id="phase-password" type="password" autocomplete="off" required maxlength="256" aria-describedby="phase-message"><p id="phase-message" role="alert"></p><button class="pbtn primary" id="phase-submit">${isEscape?'Escape Game freischalten':'Mission freischalten'} →</button></form><p class="small">Die Freigabe gilt bis zum Abmelden. Dein Lernstand bleibt unabhängig davon gespeichert.</p>${link('index.html','← Zur Missionsübersicht')}`);
  const form=document.getElementById('phase-form'),button=document.getElementById('phase-submit');
  form.onsubmit=async e=>{e.preventDefault();if(button.disabled)return;button.disabled=true;const input=document.getElementById('phase-password'),message=document.getElementById('phase-message');message.textContent='Freigabe wird geprüft …';try{await unlock(mission.id,phase,input.value);input.value='';location.reload();}catch(error){message.textContent=error.message;input.select();button.disabled=false;}};
  return false;
 }
 async function requirePage(){
  await ready;const {mission:id,phase}=document.body.dataset;if(!id)return true;
  const mission=MISSIONS.find(m=>m.id===id);
  if(!mission||(!mission.available&&!Auth.isTeacher()))return blocked('Diese Mission ist noch nicht verfügbar.','Sobald die Mission fertig ist, erscheint sie in deiner Übersicht.');
  if(Auth.isTeacher())return true;
  if(!Portal.missionUnlocked(mission,Portal.get()))return blocked('Zuerst die vorherige Mission abschließen.','Danach kannst du diese Mission mit dem zugehörigen Passwort öffnen.');
  if(!has(id,'learn'))return passwordGate(mission,'learn');
  if(phase==='escape'){
   if(!Portal.canEscape())return blocked('Zuerst die Vorbereitung abschließen.','Bearbeite die fünf Videoaufgaben vollständig. Anschließend kannst du das Escape Game mit seinem eigenen Passwort öffnen.',link(`missions/${mission.folder}/lernen.html`,'Zur Vorbereitung →'));
   if(!has(id,'escape'))return passwordGate(mission,'escape');
  }
  return true;
 }
 window.Gates=Object.freeze({ready,has,unlock,requirePage,clear});
 window.addEventListener('portalbeforelogout',clear);
})();
