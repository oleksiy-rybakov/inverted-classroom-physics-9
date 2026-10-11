(async function(){
 'use strict';if(!await PortalUIReady)return;const $=id=>document.getElementById(id),safe=portalSafe;
 let media=[];try{const r=await fetch('../../assets/media/energy/media.json');if(!r.ok)throw Error();media=await r.json();}catch{}
 let index=Math.min(4,Portal.get().missions.energy.preparation.chapter),lastVideoSave=0;
 while(index>0&&!Portal.canChapter(index))index--;
 Portal.touch('learn');
 function badges(){const state=Portal.get(),st=Portal.stats(state);$('chapter-counter').textContent=`${st.chapters} / 5 Kapitel abgeschlossen`;
  $('chapter-nav').innerHTML=LESSONS.map((l,i)=>`<button class="chapter-link ${i===index?'active':''} ${Portal.chapterDone(state,l.id)?'complete':''}" data-chapter="${i}" ${Portal.canChapter(i)?'':'disabled'} ${i===index?'aria-current="step"':''}><span>${Portal.chapterDone(state,l.id)?'✓':String(i+1).padStart(2,'0')}</span><div>${l.short}<small>${Portal.chapterDone(state,l.id)?'Abgeschlossen':Portal.canChapter(i)?'Bereit':'Noch gesperrt'}</small></div>${Portal.canChapter(i)?'':'<b aria-label="Gesperrt">⌑</b>'}</button>`).join('');
  $('chapter-nav').querySelectorAll('button').forEach(b=>b.onclick=()=>switchChapter(Number(b.dataset.chapter)));
  const done=Portal.chapterDone(state,LESSONS[index].id);$('next-chapter').disabled=!done;$('next-chapter').textContent=index===4?(Gates.has('energy','escape')?'Escape Game öffnen →':'Escape Game freischalten →'):'Nächstes Kapitel →';
  $('chapter-result').textContent=done?'Kapitel abgeschlossen. Du kannst weitergehen oder die Inhalte wiederholen.':'Bearbeite die vier Schritte vollständig, um das nächste Kapitel freizuschalten.';
  $('ready-panel').hidden=st.chapters!==5;
 }
 function savePosition(){const video=$('lesson-video');if(video&&Number.isFinite(video.currentTime))Portal.update(s=>s.missions.energy.preparation.video[LESSONS[index].id]=video.currentTime);}
 function switchChapter(i){if(!Portal.canChapter(i))return;savePosition();index=i;Portal.update(s=>s.missions.energy.preparation.chapter=i);render();$('lesson-title').focus();window.scrollTo({top:0,behavior:'instant'});}
 function render(){const l=LESSONS[index],p=Portal.get().missions.energy.preparation,m=media.find(x=>x.id===l.id);
  $('lesson-number').textContent=`LERNKAPITEL ${String(index+1).padStart(2,'0')} / 05`;$('lesson-title').textContent=l.title;$('lesson-intro').textContent=l.intro;$('lesson-time').textContent=l.time;
  $('video-box').innerHTML=m?`<video id="lesson-video" controls preload="metadata" playsinline poster="../../assets/media/energy/${m.poster}"><source src="../../assets/media/energy/${m.video}" type="video/mp4"><track kind="subtitles" srclang="de" label="Deutsch" src="../../assets/media/energy/${m.captions}">Dein Browser unterstützt das Video nicht. Nutze die Lesefassung darunter.</video><div class="video-tools"><span>Erklärung in deinem Tempo</span><label>Tempo <select id="video-speed"><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label></div><div class="scene-jumps" aria-label="Video-Kapitel">${m.scenes.map((x,i)=>`<button data-scene="${i}" class="chip-button">${safe(x.title)}</button>`).join('')}</div>`:'<p>Der Film kann gerade nicht geladen werden. Du kannst mit der vollständigen Lesefassung und den Aufgaben weiterarbeiten.</p>';
  const video=$('lesson-video');if(video){video.onloadedmetadata=()=>{const pos=p.video[l.id]||0;if(pos>0&&pos<video.duration-1)video.currentTime=pos;};video.ontimeupdate=()=>{if(Date.now()-lastVideoSave>3000){savePosition();lastVideoSave=Date.now();}};video.onpause=savePosition;video.onended=savePosition;$('video-speed').onchange=e=>video.playbackRate=Number(e.target.value);$('video-box').querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{video.currentTime=m.scenes[Number(b.dataset.scene)].start;savePosition();});}
  $('reading').innerHTML=l.read.map(([h,t])=>`<h3>${h}</h3><p>${t}</p>`).join('')+(m?`<details><summary>Vollständiger gesprochener Text</summary>${m.scenes.map(x=>`<h4>${safe(x.title)}</h4><p>${safe(x.text)}</p>`).join('')}</details>`:'');
  $('rule').textContent=l.rule;$('lesson-note').value=p.notes[l.id]||'';
  $('lesson-note').oninput=e=>Portal.update(s=>s.missions.energy.preparation.notes[l.id]=e.target.value);
  WorksheetView.render($('tasks'),l,badges);badges();
 }
 $('next-chapter').onclick=()=>{if(!Portal.chapterDone(Portal.get(),LESSONS[index].id))return;if(index<4)switchChapter(index+1);else{savePosition();location.href='escape.html';}};
 $('open-question').value=Portal.get().missions.energy.preparation.question;
 $('open-question').oninput=e=>Portal.update(s=>s.missions.energy.preparation.question=e.target.value);
 if(Object.keys(Portal.get().missions.energy.preparation.legacyAnswers).length){const notice=document.createElement('p');notice.className='portal-warning';notice.textContent='Deine früheren Kurzantworten bleiben in der Sicherung erhalten. Bearbeite jetzt pro Video eine vollständige Rechenaufgabe. Notizen, Videopositionen und Escape-Spielstand wurden übernommen.';$('portal-notices').append(notice);}
 window.addEventListener('pagehide',savePosition);window.addEventListener('portalbeforelogout',savePosition);render();
})();
