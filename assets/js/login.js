(async function(){
 'use strict';
 await Auth.ready;document.documentElement.dataset.authState='ready';
 const form=document.getElementById('login-form'),password=document.getElementById('login-password'),message=document.getElementById('login-message'),submit=document.getElementById('login-submit');
 const next=new URLSearchParams(location.search).get('next');
 if(Auth.isAuthenticated()){
  document.getElementById('existing-session').hidden=false;
  document.getElementById('continue-session').href=Auth.destination(next);
  document.getElementById('current-role').textContent=Auth.isTeacher()?'Lehrkraft':'Schüler/in';
 }
 if(Auth.problem()){message.textContent=Auth.problem();submit.disabled=true;}
 document.getElementById('show-password').onchange=e=>password.type=e.target.checked?'text':'password';
 form.onsubmit=async e=>{
  e.preventDefault();if(submit.disabled)return;
  submit.disabled=true;submit.textContent='Anmeldung wird geprüft …';message.textContent='';form.setAttribute('aria-busy','true');
  try{await Auth.login(password.value);password.value='';location.replace(Auth.destination(next));}
  catch(error){message.textContent=error.message;password.select();}
  finally{submit.disabled=false;submit.textContent='Anmelden →';form.removeAttribute('aria-busy');}
 };
})();
