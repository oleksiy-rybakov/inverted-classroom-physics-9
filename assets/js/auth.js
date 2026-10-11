(function(){
 'use strict';
 const C=PortalCrypto,base=new URL('../../',document.currentScript.src);
 const SESSION=C.APP+':session:v1',LOGOUT=C.APP+':logout:v1',MAX_AGE=12*60*60*1000;
 let config=null,configurationReady=false,active=null,problem='',leaving=false;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const epoch=()=>{try{return localStorage.getItem(LOGOUT)||'';}catch{return '';}};
 function clear(){active=null;try{sessionStorage.removeItem(SESSION);}catch{}}
 function valid(){return !!active&&active.expiresAt>Date.now()&&active.epoch===epoch();}
 function role(){return valid()?active.payload.role:null;}
 function loginUrl(){const next=location.pathname.slice(base.pathname.length)+location.search+location.hash;return new URL('anmelden.html?next='+encodeURIComponent(next),base).href;}
 function redirect(){if(leaving)return;leaving=true;document.documentElement.dataset.authState='pending';location.replace(loginUrl());}
 function storeSession(){
  const value={version:1,id:active.id,role:active.payload.role,key:C.base64(active.key),expiresAt:active.expiresAt,epoch:active.epoch,preview:active.preview,training:active.training};
  sessionStorage.setItem(SESSION,JSON.stringify(value));
 }
 async function restore(){
  try{
   if(!window.crypto?.subtle)throw Error('Die Anmeldung benötigt eine sichere HTTPS-Verbindung und einen aktuellen Browser.');
   const response=await fetch(new URL('assets/access/config.json',base),{cache:'no-store'});
   if(!response.ok)throw Error('Die Anmeldung ist gerade nicht erreichbar. Bitte lade die Seite erneut.');
   config=await response.json();
   if(config.app!==C.APP||config.version!==1||!Array.isArray(config.entries)||config.entries.length!==2)throw Error('Die Anmeldung konnte nicht geladen werden.');
   configurationReady=true;
   const serialized=sessionStorage.getItem(SESSION);if(!serialized)return;
   const saved=JSON.parse(serialized),entry=config.entries.find(e=>e.role===saved.role);
   if(saved.version!==1||!entry||!Number.isFinite(saved.expiresAt)||saved.expiresAt<=Date.now()||saved.expiresAt>Date.now()+MAX_AGE||saved.epoch!==epoch()){clear();return;}
   const key=C.bytes(saved.key),payload=await C.open(key,entry);
   active={id:typeof saved.id==='string'?saved.id:crypto.randomUUID(),key,payload,expiresAt:saved.expiresAt,epoch:saved.epoch,preview:payload.role==='teacher'&&saved.preview===true,training:payload.role==='teacher'&&saved.training===true};
   if(!saved.id)storeSession();
  }catch(e){clear();if(!configurationReady)problem=e.message||'Die Anmeldung ist nicht verfügbar.';}
 }
 const ready=restore();
 async function login(password){
  await ready;if(problem)throw Error(problem);
  if(!password)throw Error('Bitte gib dein Passwort ein.');
  if(password.length>256)throw Error('Das Passwort ist zu lang.');
  let accepted=null;
  for(const entry of config.entries){
   try{const key=await C.derive(password,entry);const payload=await C.open(key,entry);accepted={key,payload};break;}catch{}
  }
  if(!accepted)throw Error('Das Passwort stimmt nicht. Bitte versuche es erneut.');
  active={...accepted,id:crypto.randomUUID(),expiresAt:Date.now()+MAX_AGE,epoch:epoch(),preview:false,training:false};
  try{storeSession();}catch{clear();throw Error('Dieser Browser blockiert den Sitzungsspeicher. Erlaube ihn, um dich anzumelden.');}
  return role();
 }
 function logout(){
  if(leaving)return;leaving=true;
  window.dispatchEvent(new CustomEvent('portalbeforelogout'));
  window.Portal?.freeze();
  clear();try{localStorage.setItem(LOGOUT,crypto.randomUUID());}catch{}
  document.documentElement.dataset.authState='pending';location.replace(new URL('anmelden.html',base).href);
 }
 function mount(){
  document.querySelectorAll('[data-teacher-only]').forEach(e=>e.hidden=role()!=='teacher');
  if(document.querySelector('.auth-account'))return;
  const host=document.querySelector('.site-nav,.portal-bar');if(!host)return;
  const account=document.createElement('div');account.className='auth-account';
  account.innerHTML=`<span class="auth-role">${role()==='teacher'?'Lehrkraft':'Schüler/in'}</span><button type="button" data-logout>Abmelden</button>`;
  account.querySelector('button').onclick=logout;host.append(account);
 }
 async function requireRole(required='any',reveal=true){
  await ready;
  if(problem){document.body.innerHTML=`<main class="auth-error"><h1>Anmeldung nicht verfügbar</h1><p>${safe(problem)}</p><button onclick="location.reload()">Erneut versuchen</button></main>`;document.documentElement.dataset.authState='ready';return false;}
  if(!valid()){redirect();return false;}
  mount();if(reveal)document.documentElement.dataset.authState='ready';
  if(required==='teacher'&&role()!=='teacher'){
   const main=document.querySelector('main');main.className='wrap article';main.innerHTML=`<span class="eyebrow">ZUGRIFF BESCHRÄNKT</span><h1>Dieser Bereich ist für Lehrkräfte.</h1><p>Du bist als Schüler/in angemeldet. Dein Zugang gilt für Lernvideos, Aufgaben und Missionen.</p><div class="teacher-actions"><a class="pbtn primary" href="${base.href}">Zu meinen Missionen</a><button class="pbtn" id="change-role">Mit anderem Passwort anmelden</button></div>`;
   document.getElementById('change-role').onclick=logout;return false;
  }
  return true;
 }
 function teacherContent(){if(role()!=='teacher')throw Error('Nur für Lehrkräfte.');return active.payload;}
 function preference(key,value){if(role()!=='teacher')return false;active[key]=value===true;storeSession();return true;}
 const api={ready,login,logout,requireRole,role,isTeacher:()=>role()==='teacher',isAuthenticated:valid,teacherContent,
  isPreview:()=>role()==='teacher'&&active.preview,isTraining:()=>role()==='teacher'&&active.training,
  setPreview:v=>preference('preview',v),setTraining:v=>preference('training',v),
  destination:value=>C.destination(value,base,role()),base:base.href,problem:()=>problem,sessionTag:()=>valid()?active.id:null};
 window.Auth=Object.freeze(api);
 async function checkSession(){await ready;if(problem||document.body.dataset.page==='login')return;if(!valid()){window.Portal?.freeze();clear();redirect();}}
 window.addEventListener('storage',e=>{if(e.key===LOGOUT){window.Portal?.freeze();clear();if(document.body.dataset.page!=='login')redirect();}});
 window.addEventListener('pageshow',checkSession);window.addEventListener('focus',checkSession);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkSession();});
 setInterval(checkSession,15000);
})();
