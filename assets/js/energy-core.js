const ENERGY_CORE = (()=>{
  function parse(raw){
    let s=String(raw??'').trim().replace(/[−–]/g,'-').replace(/\s/g,'').replace(/,/g,'.').replace(/×|·|\*/g,'x');
    s=s.replace(/x10\^?([+-]?\d+)$/i,'e$1');
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return null;
    const value=Number(s);if(!Number.isFinite(value))return null;
    const mantissa=s.split(/e/i)[0].replace(/^[+-]/,'');
    const significant=mantissa.replace('.','').replace(/^0+/,'').length || 1;
    const ambiguous=!s.toLowerCase().includes('e')&&!mantissa.includes('.')&&/[1-9]\d*0$/.test(mantissa);
    return {value,significant,ambiguous};
  }
  const near=(a,b,tol=1e-8)=>a!==null&&Math.abs(a-b)<=Math.max(Math.abs(b)*tol,1e-10);
  const rounded=(v,n)=>Number(v.toPrecision(n));
  function roundCheck(raw,value,n){const p=parse(raw);if(!p)return 'Gib eine Zahl ein, zum Beispiel 1,90 oder 1,90e3.';if(!near(p.value,rounded(value,n),1e-9))return 'Der gerundete Zahlenwert stimmt noch nicht. Prüfe die Zieleinheit und die erste weggelassene Ziffer.';if(p.ambiguous)return 'Schreibe die gültigen Ziffern eindeutig, z. B. 1,35e5 statt 135000.';if(p.significant!==n)return `Der Wert stimmt, aber deine Schreibweise zeigt ${p.significant} statt ${n} gültige Ziffern. Beachte auch Nullen nach dem Komma.`;return '';}
  function format(v,n=8){return Number(v.toPrecision(n)).toLocaleString('de-DE',{useGrouping:false,maximumSignificantDigits:n});}
  function significant(v,n){let s=v.toPrecision(n);if(!s.includes('e')&&!s.includes('.')&&s.endsWith('0'))s=v.toExponential(n-1);return s.replace('.',',');}
  function normalizeSymbols(raw,family){return String(raw).replace(/[₁₂]/g,x=>x==='₁'?'1':'2').replace(/Eₖᵢₙ|E_?kin|E_k\b/gi,'Ek').replace(/Eₛₚ|E_?spann|E_?sp|E_s\b/gi,'Es').replace(/Eₕ|E_?h|E_?pot/gi,'Eh').replace(/(Ek|Eh|Es)[_,]?\s*([12])/g,'$1$2').replace(/([hv])_\s*([12])/g,'$1$2').replace(/\bE\b/g,({height:'Eh',kinetic:'Ek',spring:'Es'}[family]||'E')).replace(/wurzel/gi,'sqrt');}
  function expression(raw,env,family){
    let source=normalizeSymbols(raw,family).replace(/√/g,'sqrt').replace(/²/g,'^2').replace(/½/g,'(1/2)').replace(/·|×/g,'*').replace(/:/g,'/').replace(/−/g,'-').replace(/,/g,'.').replace(/\s/g,'');
    const tokens=[];let p=0;
    while(p<source.length){const m=/^(sqrt|E[hsk][12]?|[hv][12]|[mghvDs]|\d+(?:\.\d*)?|\.\d+|[+*/^()\-])/.exec(source.slice(p));if(!m)throw Error('Syntax');tokens.push(m[0]);p+=m[0].length;}
    if(tokens.length>100)throw Error('Too long');
    const variable=/^(E[hsk][12]?|[hv][12]|[mghvDs])$/;
    const stream=[];const end=t=>t===')'||/^\d|^\./.test(t)||variable.test(t);const start=t=>t==='('||t==='sqrt'||/^\d|^\./.test(t)||variable.test(t);
    tokens.forEach((t,i)=>{if(i&&end(tokens[i-1])&&start(t))stream.push('*');stream.push(t);});
    let pos=0;const used=new Set();
    function atom(){const t=stream[pos++];if(t==='sqrt')return Math.sqrt(atom());if(t==='('){const v=sum();if(stream[pos++]!==')')throw Error('Klammer');return v;}if(t in env){used.add(t);return env[t];}if(t&&/^\d|^\./.test(t))return Number(t);throw Error('Ausdruck');}
    function power(){let a=atom();if(stream[pos]==='^'){pos++;a=a**unary();}return a;}
    function unary(){if(stream[pos]==='-'){pos++;return -unary();}if(stream[pos]==='+'){pos++;return unary();}return power();}
    function product(){let a=unary();while(['*','/'].includes(stream[pos])){const op=stream[pos++],b=unary();a=op==='*'?a*b:a/b;}return a;}
    function sum(){let a=product();while(['+','-'].includes(stream[pos])){const op=stream[pos++],b=product();a=op==='+'?a+b:a-b;}return a;}
    const value=sum();if(pos!==stream.length||!Number.isFinite(value))throw Error('Ungültig');return {value,used};
  }
  function formulaCheck(raw,t,mode){
    const isolated=mode===true||mode==='form',expanded=mode==='expanded';
    const parts=String(raw||'').split('=');if(parts.length!==2)return 'Schreibe eine Gleichung mit einem Gleichheitszeichen. Beispiel: E_h = m*g*h.';
    const balances={fall:['Eh','Ek'],launch:['Es','Ek'],brake:['Ek','Es'],lift:['Es','Eh'],climb:['Ek','Eh'],transfer:['Ek1','Eh1','Ek2','Eh2']};
    const variables={fall:['m','g','h','v'],launch:['D','s','m','v'],brake:['m','v','D','s'],lift:['D','s','m','g','h'],climb:['m','v','g','h'],transfer:['m','v1','h1','g','v2','h2']};
    const needed={Eh:['m','g','h'],h:['Eh','m','g'],Ek:['m','v'],v:['Ek','m'],Es:['D','s'],s:['Es','D'],m:['Ek','v'],D:['Es','s'],fall:['g','h'],launch:['D','s','m'],brake:['v','m','D'],lift:['D','s','m','g'],climb:['v','g'],transfer:['v1','g','h1','h2']}[balances[t.family]?t.family:t.unknown];
    try{
      for(const [m,h,v,D,s] of [[2.3,4.7,3.2,71,.13],[8.1,1.4,6.3,125,.29],[.72,9.2,1.7,330,.071]]){
        const e={m,h,v,D,s,g:9.81};
        if(['fall','climb'].includes(t.family))e.v=Math.sqrt(2*e.g*h);
        if(['launch','brake'].includes(t.family))e.v=s*Math.sqrt(D/m);
        if(t.family==='lift')e.h=D*s*s/(2*m*e.g);
        e.Eh=m*e.g*e.h;e.Ek=.5*m*e.v*e.v;e.Es=.5*D*s*s;
        if(t.family==='transfer'){e.h1=h+2;e.h2=h*.3+.2;e.v1=v;e.v2=Math.sqrt(v*v+2*e.g*(e.h1-e.h2));e.Ek1=.5*m*v*v;e.Eh1=m*e.g*e.h1;e.Ek2=.5*m*e.v2*e.v2;e.Eh2=m*e.g*e.h2;}
        const a=expression(parts[0],e,t.family),b=expression(parts[1],e,t.family);
        if(!near(a.value,b.value,1e-8))return 'Die Gleichung stimmt noch nicht. Prüfe Faktoren, Potenzen, Wurzeln und Klammern.';
        if(isolated){
          const lhs=normalizeSymbols(parts[0],t.family).trim();
          if(lhs!==t.unknown||b.used.has(t.unknown))return 'Die gesuchte Größe muss allein links stehen und darf rechts nicht mehr vorkommen.';
          if(!needed.every(x=>b.used.has(x)))return 'Stelle mit den Größen um; Zahlenwerte werden erst im nächsten Schritt eingesetzt.';
        }else{
          const all=new Set([...a.used,...b.used]);
          const required=balances[t.family]?(expanded?variables[t.family]:balances[t.family]):{height:['Eh','m','g','h'],kinetic:['Ek','m','v'],spring:['Es','D','s']}[t.family];
          if(!required.every(x=>all.has(x)))return expanded?'Ersetze jeden Energieanteil durch seine Formel mit m, g, h, v, D oder s. Führe die Zustandsindizes mit.':'Stelle die Energiebilanz zuerst mit den Energiegrößen auf. Im Abschluss werden alle vier Energieanteile benötigt.';
          if(balances[t.family]&&[...all].some(x=>!required.includes(x)))return expanded?'In dieser Zeile sollen alle Energiegrößen durch ihre Formeln ersetzt sein.':'Verwende hier nur die Energiegrößen. Die Formeln dafür gehören in das nächste Feld.';
          if(normalizeSymbols(parts[0],t.family).replace(/\s/g,'')===normalizeSymbols(parts[1],t.family).replace(/\s/g,''))return 'Verbinde mit der Gleichung die Energie vor und nach dem Vorgang.';
        }
      }
      return '';
    }catch{return 'Prüfe die Schreibweise. Nutze *, /, ^2 und sqrt(...). Setze Produkte im Nenner in Klammern.';}
  }
  function verify(t,values,D){
    const errors={};const number=(key,expected,tolerance=1e-8)=>{const p=parse(values[key]);if(!p||!near(p.value,expected,tolerance))errors[key]='Prüfe den Zahlenwert und die Umrechnung. Verwende ein Komma oder einen Punkt als Dezimalzeichen.';};
    if(t.kind==='convert')t.items.forEach((x,i)=>number('q'+i,x[2]));
    else if(t.kind==='digits')t.items.forEach((x,i)=>{const e=roundCheck(values['q'+i],x[2],x[1]);if(e)errors['q'+i]=e;});
    else {
      t.given.forEach((g,i)=>{if(values['given'+i]!==g.symbol)errors['given'+i]='Ordne dieser Angabe die passende physikalische Größe zu.';number('si'+i,g.si);});
      if(values.unknown!==t.unknown)errors.unknown='Prüfe, welche Größe im Aufgabentext gesucht ist.';
      if(values.unit!==t.unit)errors.unit='Verwende die im Aufgabentext verlangte Zieleinheit.';
      const baseError=formulaCheck(values.base,t,false);if(baseError)errors.base=baseError;
      if(D.isBalance(t)){const expandedError=formulaCheck(values.expanded,t,'expanded');if(expandedError)errors.expanded=expandedError;}
      const formError=formulaCheck(values.form,t,true);if(formError)errors.form=formError;
      number('raw',D.result(t),.00005);
      for(const [key,expected]of Object.entries(D.energyCheck(t)))number(key,expected,.00005);
      const n=D.precision(t);if(Number(values.sig)!==n)errors.sig='Zähle die gültigen Ziffern der gegebenen Werte. Exakte Faktoren wie 2 und Umrechnungsfaktoren begrenzen sie nicht.';
      const e=roundCheck(values.round,D.result(t)*t.factor,n);if(e)errors.round=e;
      if(String(values.sentence||'').trim().length<15)errors.sentence='Formuliere einen vollständigen Antwortsatz zur gesuchten Größe.';
      if(!values.selfcheck)errors.selfcheck='Prüfe deinen Antwortsatz auf Größe, Zahlenwert und Einheit und bestätige den Selbstcheck.';
    }
    return errors;
  }
  function restoreState(raw,defaults,D){
    if(!raw||![1,2].includes(raw.version)||!Array.isArray(raw.answers))return null;
    const n=D.tasks.length,old=raw.version===1,s={...defaults,...raw,version:2,migrated:old};
    s.answers=Array.from({length:n},(_,i)=>raw.answers[i]&&typeof raw.answers[i]==='object'?{...raw.answers[i]}:{});
    s.solved=Array.from({length:n},(_,i)=>raw.solved?.[i]===true&&(!old||i<10));
    s.attempts=Array.from({length:n},(_,i)=>Math.max(0,Number(raw.attempts?.[i])||0));
    s.hints=Array.from({length:n},(_,i)=>Math.max(0,Math.min(3,Number(raw.hints?.[i])||0)));
    s.seen=Array.isArray(raw.seen)?raw.seen.filter(x=>Number.isInteger(x)&&x>=0&&x<=6&&(!old||x<5)):[];
    s.finished=raw.finished===true&&s.solved.every(Boolean);
    s.current=Math.max(0,Math.min(n-1,Math.trunc(Number(raw.current)||0)));
    if(!D.taskAvailable(s.current,s.solved,s.training))s.current=s.solved.findIndex(x=>!x);
    if(old)D.tasks.forEach((t,i)=>{const a=s.answers[i];if(D.isBalance(t)&&a.base&&!formulaCheck(a.base,t,'expanded')){a.expanded=a.base;a.base='';}});
    return s;
  }
  return {parse,near,rounded,roundCheck,format,significant,normalizeSymbols,expression,formulaCheck,verify,restoreState};
})();
if(typeof module!=='undefined')module.exports=ENERGY_CORE;

