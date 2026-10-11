(function(){
 const button=document.getElementById('preview-toggle'),status=document.getElementById('preview-status');
 function show(){const on=Portal.get().settings.preview;button.textContent=on?'Vorschau ausschalten':'Vorschau einschalten';status.textContent=on?'Vorschau aktiv. Es werden keine Abschlüsse vergeben.':'Normaler Lernweg: Freischaltung durch gelöste Aufgaben.';}
 button.onclick=()=>{Portal.update(s=>s.settings.preview=!s.settings.preview);location.reload();};show();
 document.getElementById('teacher-solutions').innerHTML=LESSONS.map((l,i)=>`<details class="reading-wrap"><summary>${i+1}. ${l.title}</summary>${l.tasks.map((t,j)=>`<p><strong>${i+1}.${j+1}</strong> ${portalSafe(t.solution)}</p>`).join('')}</details>`).join('');
})();
