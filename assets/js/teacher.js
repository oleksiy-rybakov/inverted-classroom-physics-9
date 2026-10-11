(async function(){
 'use strict';await PortalUIReady;if(!await Auth.requireRole('teacher'))return;
 document.getElementById('main').innerHTML=Auth.teacherContent().teacherHtml;
 const button=document.getElementById('preview-toggle'),status=document.getElementById('preview-status');
 function show(){const on=Auth.isPreview();button.textContent=on?'Vorschau ausschalten':'Vorschau einschalten';status.textContent=on?'Vorschau aktiv. Es werden keine Abschlüsse vergeben.':'Normaler Lernweg: Freischaltung durch gelöste Aufgaben.';}
 button.onclick=()=>{if(Auth.setPreview(!Auth.isPreview()))location.reload();};show();
})();
