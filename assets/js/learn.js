(async function(){
 'use strict';const $=id=>document.getElementById(id),safe=portalSafe;
 let media=[];try{const r=await fetch('../../assets/media/energy/media.json');if(!r.ok)throw Error();media=await r.json();}catch{}
 let index=Math.min(4,Portal.get().missions.energy.preparation.chapter),lastVideoSave=0;
 while(index>0&&!Portal.canChapter(index))index--;
 Portal.touch('learn');
 function badges(){const state=Portal.get(),st=Portal.stats(state);$('chapter-counter').textContent=`${st.chapters} / 5 Kapitel abgeschlossen`;
  $('chapter-nav').innerHTML=LESSONS.map((l,i)=>`<button class="chapter-link ${i===index?'active':''} ${Portal.chapterDone(state,l.id)?'complete':''}" data-chapter="${i}" ${Portal.canChapter(i)?'':'disabled'} ${i===index?'aria-current="step"':''}><span>${Portal.chapterDone(state,l.id)?'✓':String(i+1).padStart(2,'0')}</span><div>${l.short}<small>${Portal.chapterDone(state,l.id)?'Abgeschlossen':Portal.canChapter(i)?'Bereit':'Noch gesperrt'}</small></div>${Portal.canChapter(i)?'':'<b aria-label="Gesperrt">⌑</b>'}</button>`).join('');
  $('chapter-nav').querySelectorAll('button').forEach(b=>b.onclick=()=>switchChapter(Number(b.dataset.chapter)));
  const done=Portal.chapterDone(state,LESSONS[index].id);$('next-chapter').disabled=!done;$('next-chapter').textContent=index===4?'Escape Game öffnen →':'Nächstes Kapitel →';
  $('chapter-result').textContent=done?'Kapitel abgeschlossen. Du kannst weitergehen oder die Inhalte wiederholen.':'Löse die Aufgaben, um den nächsten Abschnitt freizuschalten.';
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
  $('tasks').innerHTML=l.tasks.map((t,i)=>{const solved=Portal.check(t,p.answers[t.id]);return `<form class="exercise ${solved?'solved':''}" data-task="${t.id}" novalidate><div class="exercise-head"><span class="eyebrow">AUFGABE ${index+1}.${i+1}</span><span class="exercise-status">${solved?'✓ Gelöst':'Noch offen'}</span></div><h3 id="label-${t.id}">${safe(t.prompt)}</h3>${t.type==='choice'?`<fieldset aria-labelledby="label-${t.id}" class="choices">${t.options.map((o,j)=>`<label><input type="radio" name="${t.id}" value="${j}" ${p.answers[t.id]===String(j)?'checked':''}><span>${safe(o)}</span></label>`).join('')}</fieldset>`:`<div class="answer-unit"><input type="text" inputmode="decimal" name="answer" aria-labelledby="label-${t.id}" value="${safe(p.answers[t.id]||'')}" maxlength="180" autocomplete="off"><span>${safe(t.unit)}</span></div>`}<div class="exercise-actions"><button type="submit" class="pbtn primary">Antwort prüfen</button><button type="button" class="hint-button">Hinweis</button></div><p class="task-hint" ${p.hints[t.id]?'':'hidden'}>${safe(t.hint)}</p><p class="task-feedback ${solved?'correct':''}" role="status">${solved?safe(t.solution):''}</p></form>`;}).join('');
  $('tasks').querySelectorAll('form').forEach(form=>{const t=l.tasks.find(t=>t.id===form.dataset.task),fb=form.querySelector('.task-feedback');
   const value=()=>t.type==='choice'?form.querySelector('input:checked')?.value||'':form.querySelector('input').value;
   form.oninput=()=>{Portal.setAnswer(t.id,value());form.classList.remove('solved');form.querySelector('.exercise-status').textContent='Eingabe geändert';fb.textContent='';badges();};
   form.onsubmit=e=>{e.preventDefault();const v=value(),ok=Portal.check(t,v);Portal.setAnswer(t.id,v);form.classList.toggle('solved',ok);form.querySelector('.exercise-status').textContent=ok?'✓ Gelöst':'Noch offen';fb.className='task-feedback '+(ok?'correct':'incorrect');fb.textContent=ok?t.solution:!v.trim()?'Trage zuerst eine Antwort ein.':t.type==='significant'?'Prüfe Zahlenwert und Anzahl der gültigen Ziffern. Die Endnull zählt mit.':'Das passt noch nicht. Prüfe deinen Rechenweg und nutze bei Bedarf den Hinweis.';badges();};
   form.querySelector('.hint-button').onclick=()=>{form.querySelector('.task-hint').hidden=false;Portal.update(s=>s.missions.energy.preparation.hints[t.id]=true);};
  });badges();
 }
 $('next-chapter').onclick=()=>{if(!Portal.chapterDone(Portal.get(),LESSONS[index].id))return;if(index<4)switchChapter(index+1);else{savePosition();location.href='escape.html';}};
 $('open-question').value=Portal.get().missions.energy.preparation.question;
 $('open-question').oninput=e=>Portal.update(s=>s.missions.energy.preparation.question=e.target.value);
 window.addEventListener('pagehide',savePosition);render();
})();
