const crypto=require('node:crypto');
const APP='inverted-classroom-physics-9';
function seal(scope,password){
 if(!/^[a-z0-9-]+:(learn|escape)$/.test(scope)||typeof password!=='string'||!password.length||password.length>256)throw Error('Ungültige Freigabe.');
 const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),iterations=600000,key=crypto.pbkdf2Sync(password,salt,iterations,32,'sha256');
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(`${APP}:gate:1:${scope}`));
 const plaintext=Buffer.from(JSON.stringify({app:APP,version:1,scope}));
 return {scope,iterations,salt:salt.toString('base64'),iv:iv.toString('base64'),ciphertext:Buffer.concat([cipher.update(plaintext),cipher.final(),cipher.getAuthTag()]).toString('base64')};
}
function configure(passwords){return {app:APP,version:1,entries:Object.entries(passwords).map(([scope,password])=>seal(scope,password))};}
module.exports={seal,configure};
if(require.main===module){
 let input='';process.stdin.setEncoding('utf8');
 process.stdin.on('data',chunk=>{input+=chunk;if(input.length>65536)throw Error('Eingabe zu groß.');});
 process.stdin.on('end',()=>{try{
  const fs=require('node:fs'),path=require('node:path'),file=path.join(__dirname,'../assets/access/gates.json');
  const passwords=JSON.parse(input),config=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!passwords||typeof passwords!=='object'||Array.isArray(passwords))throw Error('Erwarte Bereich-Passwort-Paare.');
  const updates=configure(passwords).entries;
  config.entries=[...config.entries.filter(e=>!updates.some(u=>u.scope===e.scope)),...updates];
  fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');console.log('Freigaben aktualisiert.');
 }catch{console.error('Freigaben nicht aktualisiert. Prüfe die Eingabe.');process.exitCode=1;}finally{input='';}});
}
