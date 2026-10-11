(async function(){
 await PortalUIReady;if(!Auth.isAuthenticated())return;
 const $=id=>document.getElementById(id);
 function render(){const s=Portal.get(),st=Portal.stats(s),escapeOpen=Portal.canEscape();
  $('nickname').value=s.profile;
  $('progress-number').textContent=st.finished?'01':'00';
  $('learn-progress').textContent=`${st.answers} / ${st.total} Lernaufgaben`;
  $('escape-progress').textContent=`${st.escape} / 16 Prüfungen`;
  $('energy-status').textContent=st.finished?'Abgeschlossen':escapeOpen?'Escape Game freigeschaltet':st.answers?'In Bearbeitung':'Bereit zum Start';
  $('energy-status').classList.toggle('done',st.finished);
  $('energy-progress').style.width=(st.answers+st.escape)/37*100+'%';
  $('energy-progress').parentElement.setAttribute('aria-label',`${st.answers+st.escape} von 37 Aufgaben gelöst`);
  $('continue-link').href=escapeOpen&&s.last==='escape'?'missions/energy/escape.html':'missions/energy/lernen.html';
  $('continue-link').textContent=st.finished?'Mission wiederholen ↗':st.answers||st.escape?'Mission fortsetzen ↗':'Mission beginnen ↗';
  $('escape-link').hidden=!escapeOpen;$('escape-lock').hidden=escapeOpen;
  $('future-missions').innerHTML=MISSIONS.filter(m=>m.id!=='energy').map(m=>{const unlocked=Portal.missionUnlocked(m,s),prerequisites=m.requires.every(id=>s.missions[id]?.escape?.finished===true);const label=m.available?(unlocked?'Bereit zum Start':'Noch gesperrt'):'In Vorbereitung';return `<article class="future-card"><div class="mission-topline"><span class="eyebrow">MISSION ${portalSafe(m.number)}</span><span class="status-pill">${label}</span></div><span class="future-icon" aria-hidden="true">${m.number==='02'?'⌁':'◇'}</span><h3>${portalSafe(m.title)}</h3><p>${m.available?portalSafe(m.topic):'Hier wächst deine Lernwelt weiter. Thema, Lernvideos und Escape Game folgen.'}</p>${unlocked&&m.folder?`<a class="pbtn" href="missions/${encodeURIComponent(m.folder)}/lernen.html">Mission beginnen →</a>`:`<small>${prerequisites?'Voraussetzungen erfüllt':m.requires.map(id=>'Nach Mission '+(MISSIONS.find(x=>x.id===id)?.number||id)).join(' · ')}</small>`}</article>`;}).join('');
  $('last-saved').textContent=st.answers||s.missions.energy.escape?`Letzter Stand: ${new Date(s.updatedAt).toLocaleString('de-DE')}`:'Dein Fortschritt wird auf diesem Gerät gespeichert.';
 }
 render();window.addEventListener('portalchange',render);
 $('nickname').onchange=e=>Portal.update(s=>s.profile=e.target.value.trim().slice(0,45));
})();
