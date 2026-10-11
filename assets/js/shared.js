window.PortalUIReady=(async function(){
 'use strict';
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.portalSafe=safe;
 if(!await Auth.requireRole('any',false))return false;
 const root=document.body.dataset.root||'';
 const modal=document.createElement('dialog');modal.id='save-dialog';modal.className='portal-dialog';modal.setAttribute('aria-labelledby','save-title');document.body.append(modal);
 const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.id='load-state-file';document.body.append(file);
 function close(){modal.close();}
 function show(title,body){modal.innerHTML=`<div class="portal-dialog-top"><h2 id="save-title">${title}</h2><button class="pbtn" id="close-save" aria-label="Dialog schließen">Schließen ×</button></div>${body}`;document.getElementById('close-save').onclick=close;if(!modal.open)modal.showModal();}
 function notify(message){let el=document.getElementById('save-status');if(!el){el=document.createElement('div');el.id='save-status';el.setAttribute('role','status');document.body.append(el);}el.textContent=message;el.hidden=false;setTimeout(()=>el.hidden=true,5000);}
 document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{Portal.download();notify('Deine Sicherungsdatei wurde zum Download bereitgestellt. Bewahre sie für das Weiterlernen auf.');});
 document.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{file.value='';file.click();});
 file.onchange=async()=>{
  const f=file.files[0];if(!f)return;
  try{
   if(f.size>524288)throw Error('Die Datei ist zu groß. Wähle eine Lernstand-Datei dieses Portals (höchstens 512 KB).');
   let raw;try{raw=JSON.parse(await f.text());}catch{throw Error('Die Datei ist keine lesbare JSON-Sicherung. Dein bisheriger Stand bleibt erhalten.');}
   const next=Portal.normalize(raw),s=Portal.stats(next);
   show('Lernstand laden',`<p>Prüfe die Sicherung, bevor du deinen aktuellen Stand ersetzt.</p><div class="import-summary"><strong>${safe(next.profile||'Ohne Kürzel')}</strong><p>${safe(new Date(next.updatedAt).toLocaleString('de-DE'))}</p><p>${s.answers}/${s.total} Lernaufgaben · ${s.escape}/16 Escape-Prüfungen${s.finished?' · Mission abgeschlossen':''}</p></div><p>Antworten, Videopositionen, Notizen und der Escape-Spielstand werden gemeinsam geladen.</p><div class="portal-actions"><button class="pbtn" id="backup-first">Aktuellen Stand zuerst sichern</button><button class="pbtn primary" id="confirm-import">Diesen Stand laden</button></div>`);
   document.getElementById('backup-first').onclick=()=>Portal.download();
   document.getElementById('confirm-import').onclick=()=>{try{Portal.importState(next);location.reload();}catch(e){show('Stand nicht geladen',`<p>${safe(e.message)}</p>`);}};
  }catch(e){show('Stand nicht geladen',`<p>${safe(e.message)}</p>`);}
 };
 function notices(){const s=Portal.storageStatus(),box=document.getElementById('portal-notices');if(!box)return;box.innerHTML=s.message?`<div class="portal-warning" role="alert">${safe(s.message)} ${s.conflict?'<button class="pbtn" id="refresh-state">Seite neu laden</button>':''}</div>`:'';document.getElementById('refresh-state')?.addEventListener('click',()=>location.reload());}
 window.addEventListener('portalnotice',notices);notices();
 document.querySelectorAll('[data-year]').forEach(e=>e.textContent='Physik 9 · Inverted Classroom');
 document.querySelectorAll('[data-print]').forEach(b=>b.onclick=()=>window.print());
 if(Auth.isPreview()){const e=document.createElement('div');e.className='preview-banner';e.textContent='Lehrkraft-Vorschau aktiv · Alle Lernkapitel und das Escape Game sind frei zugänglich. Abschlüsse werden dadurch nicht vergeben.';document.getElementById('portal-notices')?.append(e);}
 if(!await Gates.requirePage())return false;
 document.documentElement.dataset.authState='ready';
 return true;
})();
