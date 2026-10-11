/* Neue Mission: eigenen Ordner mit lernen.html + escape.html anlegen und hier eintragen. */
const MISSIONS = [
 {id:'energy',number:'01',title:'Die letzte Fahrt',topic:'Mechanische Energie',folder:'energy',available:true,requires:[],lessons:5,tasks:21,gameTasks:16,prepTime:'45–60 Min.',escapeTime:'120–160 Min.'},
 {id:'mission-02',number:'02',title:'Die nächste Entdeckung',topic:'Neue Mission',available:false,requires:['energy']},
 {id:'mission-03',number:'03',title:'Ein neues Kapitel',topic:'Neue Mission',available:false,requires:['mission-02']}
];
if(typeof module!=='undefined')module.exports=MISSIONS;
