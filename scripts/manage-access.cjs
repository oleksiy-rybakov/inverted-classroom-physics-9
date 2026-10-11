// The CLI reads credentials from stdin; it never writes passwords or decrypted
// teacher material to disk. Keep input out of the repository and shell arguments.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const APP='inverted-classroom-physics-9',ITERATIONS=600000;
function seal(role,password,content={}){
 if(typeof password!=='string'||!password.length||password.length>256)throw Error('Für jede Rolle ist ein Passwort erforderlich (max. 256 Zeichen).');
 const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),key=crypto.pbkdf2Sync(password,salt,ITERATIONS,32,'sha256');
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(`${APP}:1:${role}`));
 const data=Buffer.from(JSON.stringify({...content,app:APP,version:1,role}));
 const ciphertext=Buffer.concat([cipher.update(data),cipher.final(),cipher.getAuthTag()]);
 return {role,iterations:ITERATIONS,salt:salt.toString('base64'),iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64')};
}
function open(entry,password){
 const key=crypto.pbkdf2Sync(password,Buffer.from(entry.salt,'base64'),entry.iterations,32,'sha256'),data=Buffer.from(entry.ciphertext,'base64');
 const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(entry.iv,'base64'));decipher.setAAD(Buffer.from(`${APP}:1:${entry.role}`));decipher.setAuthTag(data.subarray(-16));
 return JSON.parse(Buffer.concat([decipher.update(data.subarray(0,-16)),decipher.final()]).toString('utf8'));
}
function configure({studentPassword,teacherPassword},teacherContent){
 if(studentPassword===teacherPassword)throw Error('Die Rollen müssen unterschiedliche Passwörter besitzen.');
 return {app:APP,version:1,entries:[seal('student',studentPassword),seal('teacher',teacherPassword,teacherContent)]};
}
module.exports={configure,open,seal};
if(require.main===module){
 process.stderr.write('Zugangsdaten als JSON über stdin bereitstellen. Es werden keine Passwörter ausgegeben.\n');
 let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>{input+=chunk;if(input.length>16384)process.exit(1);});
 process.stdin.on('end',()=>{try{const values=JSON.parse(input),file=path.join(__dirname,'../assets/access/config.json'),old=JSON.parse(fs.readFileSync(file,'utf8'));const teacher=open(old.entries.find(x=>x.role==='teacher'),values.currentTeacherPassword);const config=configure(values,teacher);fs.writeFileSync(file,JSON.stringify(config,null,2)+'\n');process.stdout.write('Beide Zugänge aktualisiert. Bestehende Sitzungen werden bei der nächsten Prüfung ungültig.\n');}catch{process.stderr.write('Zugänge unverändert: Eingabe und bisheriges Lehrerpasswort prüfen.\n');process.exitCode=1;}});
}
