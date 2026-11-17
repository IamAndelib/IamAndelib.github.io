(function(){
'use strict';
var d=document.documentElement,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var SKINS=['dark','light','matrix','vt320'],SKIN_NAMES={dark:'Dark',light:'Light',matrix:'Matrix',vt320:'VT320'};
var SECTIONS=[
  {id:'whoami',key:'H',name:'whoami'},{id:'projects',key:'P',name:'Projects'},{id:'work',key:'W',name:'Work'},
  {id:'research',key:'R',name:'Research'},{id:'writing',key:'B',name:'Writing'},{id:'skills',key:'S',name:'Skills'},
  {id:'education',key:'E',name:'Education'},{id:'afk',key:'A',name:'Beyond the screen'},{id:'contact',key:'C',name:'Contact'}];
var LINKS=[['GitHub','https://github.com/IamAndelib'],['GitLab','https://gitlab.com/IamAndelib'],['LinkedIn','https://www.linkedin.com/in/andelibababa/'],['ResearchGate','https://www.researchgate.net/profile/Andelib-Ababa'],['dev.to','https://dev.to/better_call_sriz'],['YouTube','https://www.youtube.com/@better_call_sriz'],['Royal Road','https://www.royalroad.com/profile/953691/fictions'],['Pinterest','https://www.pinterest.com/better_call_sriz/'],['Ko-fi','https://ko-fi.com/iamandelib']];
var EMAIL='andelibtarefsrizon@gmail.com';
var shortcutsOn=store('shortcuts')!=='off';

/* ---- toast ---- */
var toastT;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show')},1800)}

/* ---- skins ---- */
function setSkin(s,persist){if(SKINS.indexOf(s)<0)return;d.setAttribute('data-skin',s);if(persist!==false)store('skin',s);
  $$('[data-skin-btn]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-skin-btn')===s))});rain.sync();underlines()}
/* setext underlines: whole characters only, recomputed when font or width changes */
function underlines(){var hs=$$('.setext');if(!hs.length)return;var pr=document.createElement('span');pr.style.cssText='position:absolute;visibility:hidden;white-space:pre;font-family:var(--font-ui);font-size:var(--fs);letter-spacing:0';pr.textContent='==========';document.body.appendChild(pr);
  var cw=pr.getBoundingClientRect().width/10;document.body.removeChild(pr);if(!cw)return;hs.forEach(function(h){var n=Math.max(3,Math.floor(h.getBoundingClientRect().width/cw+0.02));h.style.setProperty('--u','"'+(h.tagName==='H3'?'-':'=').repeat(n)+'"')})}
var uT;window.addEventListener('resize',function(){clearTimeout(uT);uT=setTimeout(underlines,120)});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(underlines);
$$('[data-skin-btn]').forEach(function(b){b.addEventListener('click',function(){setSkin(b.getAttribute('data-skin-btn'));toast('skin → '+SKIN_NAMES[b.getAttribute('data-skin-btn')])})});
if(window.matchMedia){var mq=matchMedia('(prefers-color-scheme: light)');var follow=function(){if(!store('skin')&&!/[?&]skin=/.test(location.search))setSkin(mq.matches?'light':'dark',false)};
  if(mq.addEventListener)mq.addEventListener('change',follow)}

/* ---- matrix rain (hero only) ---- */
var rain=(function(){var c=$('#rain'),ctx=c.getContext&&c.getContext('2d'),cols=[],fs=16,raf=0,visible=true,last=0;
  var glyphs='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEF<>/{}=';
  function size(){var r=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);c.width=Math.max(1,r.width*dpr);c.height=Math.max(1,r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=Math.ceil(r.width/fs),rows=r.height/fs;cols=[];for(var i=0;i<n;i++)cols.push(Math.random()*rows*1.2-rows*0.2);for(var k=0;k<24;k++)step(r)}
  function frame(t){raf=requestAnimationFrame(frame);if(t-last<55)return;last=t;step(c.getBoundingClientRect())}
  function step(r){var fg=getComputedStyle(d).getPropertyValue('--fg').trim()||'#90ca3d';
    ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fillRect(0,0,r.width,r.height);ctx.fillStyle=fg;ctx.font=fs+'px "Departure Mono",monospace';
    for(var i=0;i<cols.length;i++){var y=cols[i]*fs;ctx.fillText(glyphs[(Math.random()*glyphs.length)|0],i*fs,y);cols[i]+=1;if(y>r.height&&Math.random()>0.975)cols[i]=0}}
  function on(){return !reduce&&ctx&&d.getAttribute('data-skin')==='matrix'}
  function start(){if(!raf&&visible&&on()){raf=requestAnimationFrame(frame)}}
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
  function sync(){if(!ctx)return;if(on()){c.classList.add('on');size();start()}else{c.classList.remove('on');stop()}}
  if('IntersectionObserver' in window){new IntersectionObserver(function(e){visible=e[0].isIntersecting;visible?start():stop()}).observe(c)}
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  window.addEventListener('resize',function(){if(on())size()});
  return {sync:sync}})();

/* ---- boot log (first visit only) ---- */
var boot=$('#boot'),booting=false,bootTimer=0,bootFinal=boot.innerHTML;
function bootDone(){if(!booting)return;booting=false;clearTimeout(bootTimer);boot.innerHTML=bootFinal;store('booted','1')}
if(!reduce&&!store('booted')){booting=true;var lines=bootFinal.split('\n'),i=0;boot.innerHTML='';
  (function next(){if(!booting)return;if(i>=lines.length){bootDone();return}boot.innerHTML+=(i?'\n':'')+lines[i++];bootTimer=setTimeout(next,i===1?220:170)})();
  ['keydown','pointerdown','wheel','touchstart'].forEach(function(ev){window.addEventListener(ev,bootDone,{once:true,passive:true})})}

/* ---- navigation ---- */
function go(id){var s=document.getElementById(id);if(!s)return;var h=s.querySelector('h1,h2');s.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  if(h){h.focus({preventScroll:true});if(!reduce){h.classList.remove('flash');void h.offsetWidth;h.classList.add('flash')}}
  try{history.replaceState(null,'','#'+id)}catch(e){}}
var where=$('#where'),navLinks=$$('.nav a');
if('IntersectionObserver' in window){var seen={};var io=new IntersectionObserver(function(es){es.forEach(function(e){seen[e.target.id]=e.isIntersecting});
  var cur=null;SECTIONS.forEach(function(s){if(seen[s.id]&&!cur)cur=s.id});if(cur){where.textContent=cur;cwd=cur==='whoami'?'':cur;$('#term-cwd').textContent=cwd;navLinks.forEach(function(a){a.setAttribute('aria-current',String(a.getAttribute('data-sec')===cur))})}},{rootMargin:'-45% 0px -50% 0px'});
  SECTIONS.forEach(function(s){var el=document.getElementById(s.id);if(el)io.observe(el)})}

/* ---- clipboard ---- */
function selectEmail(){var el=$('#email'),r=document.createRange();r.selectNodeContents(el);var sel=getSelection();sel.removeAllRanges();sel.addRange(r)}
function copyEmail(){var done=function(){toast('copied '+EMAIL)},fail=function(){go('contact');selectEmail();toast('selected, press Ctrl+C to copy')};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(EMAIL).then(done,fail)}else fail()}catch(e){fail()}}
$('#copy-email').addEventListener('click',copyEmail);
function openLink(u){var a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.appendChild(a);a.click();a.remove()}

/* ---- command palette ---- */
var pal=$('#pal'),q=$('#pal-q'),list=$('#pal-list'),sel=0,shown=[],lastFocus=null;
function commands(){var c=[];
  SECTIONS.forEach(function(s){c.push({g:'go to',label:s.name,hint:s.key==='H'?'[H]':'['+s.key+']',run:function(){go(s.id)}})});
  SKINS.forEach(function(s,i){c.push({g:'skin',label:'Skin: '+SKIN_NAMES[s],hint:'['+(i+1)+']',run:function(){setSkin(s);toast('skin → '+SKIN_NAMES[s])}})});
  c.push({g:'actions',label:'Copy email address',hint:EMAIL,run:copyEmail});
  c.push({g:'actions',label:'Open terminal',hint:'[`]',run:function(){openTerm()}});
  c.push({g:'actions',label:'Keyboard shortcuts: '+(shortcutsOn?'turn off':'turn on'),hint:shortcutsOn?'on':'off',run:function(){shortcutsOn=!shortcutsOn;store('shortcuts',shortcutsOn?'on':'off');toast('single-key shortcuts '+(shortcutsOn?'on':'off'))}});
  LINKS.forEach(function(l){c.push({g:'open',label:'Open '+l[0],hint:'↗',run:function(){openLink(l[1])}})});
  return c}
function render(){var t=q.value.trim().toLowerCase(),all=commands();shown=all.filter(function(c){return !t||c.label.toLowerCase().indexOf(t)>-1||(t.length>2&&c.g.indexOf(t)>-1)});
  if(sel>=shown.length)sel=Math.max(0,shown.length-1);list.innerHTML='';var g=null;
  if(!shown.length){var e=document.createElement('div');e.className='pal-empty';e.textContent='no match. try "skin", "copy" or a section name';list.appendChild(e);q.removeAttribute('aria-activedescendant');return}
  shown.forEach(function(c,i){if(c.g!==g){g=c.g;var h=document.createElement('div');h.className='grp';h.setAttribute('role','presentation');h.textContent=g;list.appendChild(h)}
    var o=document.createElement('div');o.id='opt-'+i;o.setAttribute('role','option');o.setAttribute('aria-selected',String(i===sel));
    var a=document.createElement('span');a.textContent=c.label;var b=document.createElement('span');b.className='h';b.textContent=c.hint;o.appendChild(a);o.appendChild(b);
    o.addEventListener('mousemove',function(){if(sel!==i){sel=i;mark()}});o.addEventListener('click',function(){runSel(i)});list.appendChild(o)});mark()}
function mark(){$$('[role=option]',list).forEach(function(o,i){o.setAttribute('aria-selected',String(i===sel));if(i===sel){o.scrollIntoView({block:'nearest'});q.setAttribute('aria-activedescendant',o.id)}})}
function runSel(i){var c=shown[i];if(!c)return;closePal(true);c.run()}
function openPal(){closeTerm();lastFocus=document.activeElement;pal.hidden=false;q.value='';sel=0;render();q.focus()}
function closePal(keepFocus){if(pal.hidden)return;pal.hidden=true;if(!keepFocus&&lastFocus&&lastFocus.focus)lastFocus.focus()}
q.addEventListener('input',function(){sel=0;render()});
q.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,shown.length);mark()}
  else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+shown.length)%Math.max(1,shown.length);mark()}
  else if(e.key==='Enter'){e.preventDefault();runSel(sel)}else if(e.key==='Tab'){e.preventDefault()}});
pal.addEventListener('mousedown',function(e){if(e.target===pal)closePal()});
$('#open-pal').addEventListener('click',openPal);

/* ---- terminal ---- */
var term=$('#term'),out=$('#term-out'),tin=$('#term-in'),hist=[],hi=0,cwd='';
function print(txt,cls){var s=document.createElement('div');if(cls)s.className=cls;s.textContent=txt;out.appendChild(s);out.scrollTop=out.scrollHeight}
var DIRS=SECTIONS.map(function(s){return s.id});
var CMDS={
  help:function(){print('commands:\n  help              this list\n  whoami            who is this?\n  ls                list sections\n  cd <section>      jump to a section (cd ~ for top)\n  theme <name>      dark | light | matrix | vt320\n  contact           how to reach me\n  clear             clear the screen\n  exit              close the terminal')},
  whoami:function(){var row=document.createElement('div');row.className='term-frog';var f=$('.brand svg');if(f){var g=f.cloneNode(true);g.removeAttribute('class');row.appendChild(g)}var t=document.createElement('div');t.textContent='Andelib Taref Ababa\nDeveloper · Instructional designer · Forestry & ecology researcher\nSylhet, Bangladesh  ·  mascot: DJ Frog';row.appendChild(t);out.appendChild(row);out.scrollTop=out.scrollHeight},
  ls:function(){print(DIRS.map(function(x){return x+'/'}).join('  '))},
  cd:function(a){var t=(a[0]||'~').replace(/^~?\/?|\/$/g,'').toLowerCase();if(!t||t==='..'||t==='~'){go('whoami');print('→ ~','c');return}
    var m=DIRS.filter(function(x){return x.indexOf(t)===0})[0];if(!m){print('cd: no such section: '+t+'  (try ls)','e');return}go(m);print('→ ~/'+m,'c')},
  theme:function(a){var t=(a[0]||'').toLowerCase();if(t==='vt'||t==='amber')t='vt320';if(SKINS.indexOf(t)<0){print('usage: theme dark|light|matrix|vt320  (now: '+d.getAttribute('data-skin')+')','e');return}setSkin(t);print('skin set to '+SKIN_NAMES[t],'c')},
  contact:function(){print('email         '+EMAIL+'\n'+LINKS.map(function(l){return (l[0].toLowerCase()+'              ').slice(0,14)+l[1].replace(/^https:\/\/(www\.)?/,'').replace(/\/$/,'')}).join('\n'))},
  clear:function(){out.innerHTML=''},
  exit:function(){closeTerm()},
  sudo:function(){print('guest is not in the sudoers file. This incident will be reported.','e')},
  echo:function(a){print(a.join(' '))}
};
CMDS.theme.alias=1;CMDS.skin=CMDS.theme;CMDS.cls=CMDS.clear;
function exec(line){print('guest@iamandelib:~$ '+line,'c');var p=line.trim().split(/\s+/),c=(p.shift()||'').toLowerCase();if(!c)return;hist.push(line);hi=hist.length;
  if(CMDS[c])CMDS[c](p);else print('command not found: '+c+'. type help','e')}
function openTerm(){closePal(true);term.hidden=false;if(!out.childNodes.length)print('andelib.sh — type help for commands, ESC to close');tin.focus()}
function closeTerm(){if(term.hidden)return;term.hidden=true;tin.blur()}
$('#term-form').addEventListener('submit',function(e){e.preventDefault();var v=tin.value;tin.value='';exec(v)});
tin.addEventListener('keydown',function(e){
  if(e.key==='ArrowUp'){e.preventDefault();if(hi>0){hi--;tin.value=hist[hi]}}
  else if(e.key==='ArrowDown'){e.preventDefault();if(hi<hist.length-1){hi++;tin.value=hist[hi]}else{hi=hist.length;tin.value=''}}
  else if(e.key==='Tab'){e.preventDefault();var p=tin.value.split(/\s+/);var pool=p.length>1?(p[0]==='theme'?SKINS:DIRS):Object.keys(CMDS);var last=p[p.length-1];var m=pool.filter(function(x){return x.indexOf(last)===0});if(m.length===1){p[p.length-1]=m[0];tin.value=p.join(' ')+(p.length>1?'':' ')}else if(m.length>1)print(m.join('  '),'c')}
  else if(e.key==='`'&&!tin.value){e.preventDefault();closeTerm()}});
$('#open-term').addEventListener('click',openTerm);

/* ---- keyboard ---- */
function typing(t){return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)}
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.key==='k'||e.key==='K')){e.preventDefault();pal.hidden?openPal():closePal();return}
  if(e.key==='Escape'){if(!pal.hidden){e.preventDefault();closePal();return}if(!term.hidden){e.preventDefault();closeTerm();return}}
  if(e.ctrlKey||e.metaKey||e.altKey||typing(e.target)||!pal.hidden)return;
  if(!term.hidden&&e.key!=='`')return;
  if(e.key==='/'){e.preventDefault();openPal();return}
  if(e.key==='`'){e.preventDefault();term.hidden?openTerm():closeTerm();return}
  if(!shortcutsOn||e.shiftKey)return;
  if(/^[1-4]$/.test(e.key)){var s=SKINS[+e.key-1];setSkin(s);toast('skin → '+SKIN_NAMES[s]);return}
  var k=e.key.toUpperCase();for(var i=0;i<SECTIONS.length;i++){if(SECTIONS[i].key===k){e.preventDefault();go(SECTIONS[i].id);return}}});

/* ---- live data (falls back silently to the baked HTML) ---- */
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
async function refreshStars(){try{var cards=$$('.card[data-repo]'),raw=sget('gh-stars'),map=null;
    if(raw){try{map=JSON.parse(raw)}catch(e){map=null}}
    if(!map||typeof map!=='object'){map={};
      await Promise.all(cards.map(async function(c){var repo=c.getAttribute('data-repo');
        try{var r=await fetch('https://api.github.com/repos/IamAndelib/'+encodeURIComponent(repo),{headers:{Accept:'application/vnd.github+json'}});
          if(!r.ok)return;var j=await r.json();if(j&&typeof j.stargazers_count==='number')map[repo]=j.stargazers_count}catch(e){/* keep baked */}}));
      sset('gh-stars',JSON.stringify(map))/* {} when rate-limited/offline: no retry this session */}
    var total=0;cards.forEach(function(c){var n=map[c.getAttribute('data-repo')],b=$('[data-stars]',c);
      if(b&&typeof n==='number'&&n>0)b.textContent=n;total+=b?(parseInt(b.textContent,10)||0):0});
    var t=$('#star-total');if(t&&total>0)t.textContent=total}catch(e){/* keep baked numbers */}}
async function refreshArticles(){try{var raw=sget('devto'),arr;
    if(raw){arr=JSON.parse(raw)}else{var r=await fetch('https://dev.to/api/articles?username=better_call_sriz&per_page=6');if(!r.ok)throw new Error('devto '+r.status);arr=await r.json();
      if(!Array.isArray(arr)||!arr.length)throw new Error('empty');sset('devto',JSON.stringify(arr))}
    var ul=$('#writing-list'),frag=document.createDocumentFragment();
    arr.slice(0,6).forEach(function(a){if(!a||typeof a.url!=='string'||!/^https:\/\/dev\.to\//.test(a.url)||!a.title)return;var li=document.createElement('li'),d1=document.createElement('span'),d2=document.createElement('span'),l=document.createElement('a'),t=document.createElement('span');
      d1.className='r1 dim';d1.textContent=String(a.published_at||'').slice(0,10);d2.className='r2';d2.style.color='var(--fg)';l.href=a.url;l.textContent=a.title;t.className='tags';
      t.textContent=(a.tag_list||[]).map(function(x){return '#'+x}).join(' ')+(a.reading_time_minutes?' · '+a.reading_time_minutes+' min read':'');d2.appendChild(l);d2.appendChild(t);li.appendChild(d1);li.appendChild(d2);frag.appendChild(li)});
    if(frag.childNodes.length){ul.innerHTML='';ul.appendChild(frag)}}catch(e){/* keep baked articles */}}

/* ---- init ---- */
setSkin(d.getAttribute('data-skin'),false);
refreshStars();refreshArticles();
})();
