(function(root){
 'use strict';
 const APP='inverted-classroom-physics-9',VERSION=1;
 const utf8=new TextEncoder(),text=new TextDecoder();
 const bytes=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
 const base64=value=>btoa(String.fromCharCode(...new Uint8Array(value)));
 function validate(entry){
  if(!entry||!['student','teacher'].includes(entry.role)||entry.iterations!==600000||bytes(entry.salt).length!==16||bytes(entry.iv).length!==12)throw Error('Ungültige Anmeldekonfiguration.');
 }
 async function deriveRaw(password,entry){
  const material=await root.crypto.subtle.importKey('raw',utf8.encode(password),'PBKDF2',false,['deriveBits']);
  return new Uint8Array(await root.crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(entry.salt),iterations:entry.iterations,hash:'SHA-256'},material,256));
 }
 async function derive(password,entry){validate(entry);return deriveRaw(password,entry);}
 function validateGate(entry){
  if(!entry||!/^[a-z0-9-]+:(learn|escape)$/.test(entry.scope)||entry.iterations!==600000||bytes(entry.salt).length!==16||bytes(entry.iv).length!==12)throw Error('Ungültige Freigabekonfiguration.');
 }
 async function deriveGate(password,entry){validateGate(entry);return deriveRaw(password,entry);}
 async function openGate(rawKey,entry){
  validateGate(entry);
  const key=await root.crypto.subtle.importKey('raw',rawKey,{name:'AES-GCM'},false,['decrypt']);
  const plain=await root.crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(entry.iv),additionalData:utf8.encode(`${APP}:gate:1:${entry.scope}`)},key,bytes(entry.ciphertext));
  const payload=JSON.parse(text.decode(plain));
  if(payload.app!==APP||payload.version!==1||payload.scope!==entry.scope)throw Error('Ungültige Freigabe.');
  return payload;
 }
 async function open(rawKey,entry){
  validate(entry);
  const key=await root.crypto.subtle.importKey('raw',rawKey,{name:'AES-GCM'},false,['decrypt']);
  const plain=await root.crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(entry.iv),additionalData:utf8.encode(`${APP}:${VERSION}:${entry.role}`)},key,bytes(entry.ciphertext));
  const payload=JSON.parse(text.decode(plain));
  if(payload.app!==APP||payload.version!==VERSION||payload.role!==entry.role)throw Error('Ungültige Anmeldung.');
  return payload;
 }
 function destination(value,base,role){
  try{
   const url=new URL(value||'index.html',base);
   if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return new URL('index.html',base).href;
   const relative=url.pathname.slice(base.pathname.length);
   if(!['index.html','hilfe.html','lehrkraft.html','missions/energy/lernen.html','missions/energy/escape.html',''].includes(relative))return new URL('index.html',base).href;
   if(role==='student'&&relative==='lehrkraft.html')return new URL('index.html',base).href;
   return url.href;
  }catch{return new URL('index.html',base).href;}
 }
 const api={APP,VERSION,bytes,base64,derive,open,deriveGate,openGate,destination};
 root.PortalCrypto=Object.freeze(api);if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
