(function(root){
 'use strict';
 const C=typeof ENERGY_CORE!=='undefined'?ENERGY_CORE:require('./energy-core.js');
 const text=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 const symbols={v:'Geschwindigkeit v',Eh:'Höhenenergie Eₕ',Ek:'Kinetische Energie Eₖᵢₙ',Es:'Spannenergie Eₛₚ',h:'Höhe h',m:'Masse m',D:'Federhärte D',s:'Verformung s'};
 function normalize(task,value){
  const v=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  return {given:task.given.map((_,i)=>text(v.given?.[i],100)),unknown:text(v.unknown,20),unit:text(v.unit,20),formula:text(v.formula,250),calculation:text(v.calculation,1200),result:text(v.result,100),sentence:text(v.sentence,1200),selfcheck:v.selfcheck===true,submitted:v.submitted===true};
 }
 function numeric(value,unit){const raw=String(value||'').trim();return C.parse(unit&&raw.endsWith(unit)?raw.slice(0,-unit.length):raw);}
 function errors(task,value){
  const v=normalize(task,value),bad={};
  task.given.forEach((g,i)=>{const p=numeric(v.given[i],g.unit);if(!p||!C.near(p.value,g.value))bad['given-'+i]=`Lies die Angabe im Text und rechne bei Bedarf in ${g.unit} um.`;});
  if(v.unknown!==task.unknown)bad.unknown='Welche physikalische Größe sollst du bestimmen?';
  if(v.unit!==task.unit)bad.unit='Wähle die im Aufgabentext gefragte Einheit.';
  if(task.family!=='conversion'){const error=C.formulaCheck(v.formula,task,true);if(error)bad.formula=error;}
  try{
   const parts=v.calculation.replace(/≈/g,'=').split('=').map(s=>s.trim());
   if(!parts.length||parts.some(s=>!s)||!/[+*/:^·×]|sqrt|√/i.test(parts[0]))throw Error();
   const first=C.expression(parts[0],{},task.family).value;
   if(!C.near(first,task.raw,.00005))throw Error();
   for(const part of parts.slice(1)){const n=C.expression(part,{},task.family).value;if(!C.near(n,task.raw,.00005)&&!C.near(n,C.rounded(task.raw,task.precision)))throw Error();}
  }catch{bad.calculation='Zeige das Einsetzen und Rechnen mit Zahlen, z. B. 0,750 * 9,81 * 4,00. Nutze für Wurzeln sqrt(...). Einheiten stehen bei Gegeben und Ergebnis.';}
  const resultError=C.roundCheck(v.result,task.raw,task.precision);if(resultError)bad.result=resultError;
  if(v.sentence.trim().length<15)bad.sentence='Formuliere einen vollständigen Antwortsatz zur Frage.';
  if(!v.selfcheck)bad.selfcheck='Prüfe deinen Antwortsatz auf die gesuchte Größe, den Zahlenwert und die Einheit.';
  return bad;
 }
 function check(task,value){return value?.submitted===true&&Object.keys(errors(task,value)).length===0;}
 function example(task){return {given:task.given.map(g=>String(g.value).replace('.',',')),unknown:task.unknown,unit:task.unit,formula:task.formula,calculation:task.calculation,result:C.significant(task.raw,task.precision),sentence:task.sentence,selfcheck:true,submitted:true};}
 function teacherHtml(task,escape){return `<h3>${escape(task.prompt)}</h3><p><strong>Gegeben:</strong> ${task.given.map(g=>`${escape(g.label)} = ${escape(C.format(g.value))} ${escape(g.unit)}`).join('; ')}</p><p><strong>Gesucht:</strong> ${escape(symbols[task.unknown])} in ${escape(task.unit)}</p><p><strong>Lösung:</strong> ${escape(task.family==='conversion'?'Umrechnung von km/h in m/s: durch 3,6 teilen.':task.formula)}<br>${escape(task.calculation)}<br>Ergebnis: ${escape(C.significant(task.raw,task.precision))} ${escape(task.unit)}</p><p><strong>Antwortsatz:</strong> ${escape(task.sentence)}</p>`;}
 const api={normalize,errors,check,example,symbols,teacherHtml};root.Worksheet=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
