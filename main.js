<script>
(()=>{
"use strict";
const SB_URL="https://fyigspfkjegdhhlajlit.supabase.co",
SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWdzcGZramVnZGhobGFqbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDI3NTcsImV4cCI6MjA4ODQ3ODc1N30.M8Slo1--ZDlbG9MVEFwLnguqchkTjAi5O-c9B7-ABd0";
const R=document.getElementById("J"),$=id=>document.getElementById(id),$a=s=>R.querySelectorAll(s);
function show(id){$a(".P").forEach(p=>p.classList.add("H"));$(id).classList.remove("H")}
const LS=k=>{try{return JSON.parse(localStorage.getItem("jojo_ak_"+k))}catch{return null}};
const SS=(k,v)=>{try{localStorage.setItem("jojo_ak_"+k,JSON.stringify(v))}catch{}};

let AT=[];
const PN={1:"第1部",2:"第2部",3:"第3部",4:"第4部",5:"第5部",6:"第6部",7:"第7部",8:"第8部",9:"第9部",0:"スピンオフ/その他"};
let CH=[],ld={},st={total:0,correct:0,pop:{},qCounts:[],bestQ:999,streak:0,maxStreak:0,recent:[],fast:{},hard:{}},rq=[],pendingReqs=[],on=false,admH="",admOK=false;

function exp(c){const a={};AT.forEach(x=>{a[x.k]=0});Object.assign(a,c.attrs||{});return{id:c.id,name:c.name,part:c.part,emoji:c.emoji||"❓",desc:c.description||"",a}}
async function sha(s){return[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("")}
function findSim(nm){const q=nm.toLowerCase().replace(/[\s・=]/g,"");if(q.length<2)return[];return CH.filter(c=>{const n=c.name.toLowerCase().replace(/[\s・=]/g,"");return n.includes(q)||q.includes(n)||(q.length>2&&n.includes(q.slice(0,3)))}).slice(0,5)}
function findPendingSim(nm){const q=nm.toLowerCase();return pendingReqs.filter(r=>r.char_name.toLowerCase().includes(q)||q.includes(r.char_name.toLowerCase())).slice(0,3)}

async function sG(p){const r=await fetch(SB_URL+"/rest/v1/"+p,{headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY}});return r.ok?r.json():null}
async function sP(p,b){try{await fetch(SB_URL+"/rest/v1/"+p,{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(b)})}catch{}}
async function sRpc(f,a){const r=await fetch(SB_URL+"/rest/v1/rpc/"+f,{method:"POST",headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(a||{})});return r.ok?r.json():null}

async function init(){
  ld=LS("learn")||{};
  const saved=LS("stats");
  if(saved){st={...st,...saved};st.qCounts=st.qCounts||[];st.fast=st.fast||{};st.hard=st.hard||{};st.recent=st.recent||[];st.streak=st.streak||0;st.maxStreak=st.maxStreak||0;st.bestQ=st.bestQ||999}
  rq=LS("reqs")||[];
  try{
    const ca=await sRpc("get_custom_attrs");
    if(ca&&ca.length)AT=ca.map(a=>({k:a.key,q:a.question,l:a.label,i:Number(a.info)||1.5}));
    if(!AT.length){$("pI").textContent="⚠️ 質問データが読み込めません";$("ds").innerHTML='<span class="dd off"></span>エラー';return}
    const cs=await sG("characters?is_active=eq.true&select=id,name,part,emoji,description,attrs");
    if(cs&&cs.length)CH=cs.map(exp);
    try{const r=await sRpc("get_learned_attrs");if(r&&r.length)r.forEach(x=>{const c=CH.find(c=>c.name===x.char_name);if(c){const o=c.a[x.attr_key]??0;c.a[x.attr_key]=o*.6+Number(x.learned_value)*.4}})}catch{}
    try{const pr=await sRpc("get_pending_requests");if(pr)pendingReqs=pr}catch{}
    on=true;
  }catch(e){console.log("offline:",e);$("ds").innerHTML='<span class="dd off"></span>接続エラー'}
  aLL();ui();
}
function aLL(){CH.forEach(c=>{const d=ld[c.name];if(!d)return;Object.keys(d).forEach(k=>{const v=d[k],t=(v.yes||0)+(v.py||0)+(v.uk||0)+(v.pn||0)+(v.no||0);if(t<3)return;const w=((v.yes||0)*1+(v.py||0)*.65+(v.uk||0)*.5+(v.pn||0)*.35)/t;const o=c.a[k]??0;const b=Math.min(.4,t/40);c.a[k]=o*(1-b)+w*b})})}
function ui(){$("pI").textContent=`${on?"🟢":"🟡"} ${CH.length}キャラ・${AT.length}問`;$("ds").innerHTML=on?'<span class="dd on"></span>オンライン':'<span class="dd lc"></span>ローカル';$("s3").textContent=CH.length}

/* エンジン */
const MQ=20,EX_MQ=10,TH=.52,EA=7,AW={yes:1,py:.65,uk:0,pn:-.65,no:-1};let G={};
function uid(){return crypto.randomUUID?.()??("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:r&3|8).toString(16)}))}
function nG(){G={id:uid(),pr:CH.map(c=>({n:c.name,p:1/CH.length})),ak:new Set(),qc:0,h:[],sn:[],cq:null,gn:"",guessed:new Set(),extra:false,maxQ:MQ}}
function bU(a,v){const w=AW[v];G.pr.forEach(p=>{const c=CH.find(x=>x.name===p.n);const val=c.a[a]??0;let l;if(w>0)l=.1+.9*val*Math.abs(w);else if(w<0)l=.1+.9*(1-val)*Math.abs(w);else l=1;p.p*=l});const t=G.pr.reduce((s,p)=>s+p.p,0);if(t>0)G.pr.forEach(p=>p.p/=t)}
function pQ(){let b=null,bs=-1;AT.forEach(q=>{if(G.ak.has(q.k))return;let y=0,n=0;G.pr.forEach(p=>{const c=CH.find(x=>x.name===p.n);const v=c.a[q.k]??0;y+=p.p*v;n+=p.p*(1-v)});const bl=1-Math.abs(y-n),ph=Math.min(1,G.qc/12),sc=bl*(1-ph*.3)+q.i*ph*.3;if(sc>bs){bs=sc;b=q}});return b}
function gT(n){return[...G.pr].sort((a,b)=>b.p-a.p).filter(p=>!G.guessed.has(p.n)).slice(0,n).map(p=>({...CH.find(c=>c.name===p.n),prob:p.p}))}
function sGu(){if(G.qc<EA)return false;const t=gT(2);return t[0].prob>=TH||G.qc>=G.maxQ||(t.length>=2&&t[0].prob>t[1].prob*2.5&&G.qc>=10)}

/* タブ */
$a(".t[data-t]").forEach(t=>t.onclick=()=>{$a(".t[data-t]").forEach(x=>x.classList.remove("a"));t.classList.add("a");({play:()=>show("pS"),req:()=>{show("pReq");rR();showExQ()},vote:()=>{show("pV");bV()},stats:()=>{show("pSt");rSt()},admin:()=>show("pAdm")})[t.dataset.t]()});

/* 遊ぶ */
$("go").onclick=()=>{if(!CH.length||!AT.length)return;nG();show("pQ");sQ()};
function sQ(){const q=pQ();if(!q||G.qc>=G.maxQ){dGu();return}G.cq=q;$("qN").textContent=G.qc+1;$("qM").textContent=G.maxQ;$("bar").style.width=(G.qc/G.maxQ*100)+"%";$("qT").textContent=q.q;const t3=gT(3);$("top3").innerHTML=t3.map((c,i)=>`<div class="ci${i?"":" tp"}">${c.emoji} ${c.name} ${(c.prob*100).toFixed(0)}%</div>`).join("");$("bk").disabled=!G.sn.length}
$("aG").onclick=e=>{const b=e.target.closest(".an");if(!b)return;const v=b.dataset.v,q=G.cq;G.sn.push({pr:G.pr.map(p=>({...p})),ak:new Set(G.ak),qc:G.qc,h:[...G.h]});G.ak.add(q.k);G.qc++;G.h.push({a:q.k,v});bU(q.k,v);sGu()?dGu():sQ()};
$("bk").onclick=()=>{if(!G.sn.length)return;const s=G.sn.pop();G.pr=s.pr;G.ak=s.ak;G.qc=s.qc;G.h=s.h;sQ()};
function dGu(){show("pT");setTimeout(()=>{const t=gT(7),g=t[0];$("rE").textContent=g.emoji;$("rN").textContent=g.name;$("rP").textContent=PN[g.part]||"";$("rD").textContent=g.desc;const pct=Math.min(99,Math.round(g.prob*100));$("cP").textContent=pct+"%";const bar=$("cB");bar.style.width="0%";bar.style.background=pct>70?"linear-gradient(90deg,#5efc8d,#20e8a0)":pct>40?"linear-gradient(90deg,#f7d94e,#e8a020)":"linear-gradient(90deg,#fc5e5e,#e84020)";setTimeout(()=>{bar.style.width=pct+"%"},100);
const df=G.qc<=8?"easy":G.qc<=15?"med":"hard";const dfl=G.qc<=8?"余裕":G.qc<=15?"普通":"苦戦";
$("qcB").innerHTML=`${G.qc}問でたどり着きました！ <span class="diff-badge diff-${df}">${dfl}</span>`;
(async()=>{try{const d=gStCache||(await sRpc("get_global_stats"));if(d){gStCache=d;const p=(d.popular||[]).find(x=>x.name===g.name);if(p)$("qcB").insertAdjacentHTML("afterend",`<div style="font-size:.72em;color:#888;margin-top:4px">🎮 このキャラは ${p.count}回 プレイされました</div>`)}}catch{}})();
$("wL").innerHTML=t.slice(1,6).map(c=>`<div class="fb" data-n="${c.name}">${c.emoji} ${c.name}</div>`).join("");$("fA").style.display="block";["wA","wSA","wNA"].forEach(x=>$(x).classList.add("H"));$("fM").textContent="";G.gn=g.name;show("pR")},1400)}
function isSpam(hist){if(hist.length<5)return false;const c={};hist.forEach(h=>{c[h.v]=(c[h.v]||0)+1});const mx=Math.max(...Object.values(c));return mx/hist.length>=0.8}
function canLearn(nm){const lt=LS("learntime")||{};const arr=lt[nm]||[];const day=Date.now()-24*60*60*1000;const recent=arr.filter(t=>t>day);return recent.length<3}
function markLearned(nm){const lt=LS("learntime")||{};const arr=lt[nm]||[];const day=Date.now()-24*60*60*1000;lt[nm]=[...arr.filter(t=>t>day),Date.now()];SS("learntime",lt)}
function rec(gn,an,ok){if(isSpam(G.h)){console.log("spam detected, skip learn");st.total++;SS("stats",st);return}const nm=an||gn;if(!canLearn(nm)){console.log("learn limit reached for",nm);st.total++;if(ok)st.correct++;st.pop[nm]=(st.pop[nm]||0)+1;SS("stats",st);return}markLearned(nm);if(!ld[nm])ld[nm]={};G.h.forEach(h=>{if(!ld[nm][h.a])ld[nm][h.a]={};ld[nm][h.a][h.v]=(ld[nm][h.a][h.v]||0)+1});SS("learn",ld);st.total++;if(ok){st.correct++;st.streak++;if(st.streak>st.maxStreak)st.maxStreak=st.streak;st.qCounts.push(G.qc);if(G.qc<st.bestQ)st.bestQ=G.qc;if(!st.fast[nm]||G.qc<st.fast[nm])st.fast[nm]=G.qc}else{st.streak=0;st.hard[nm]=(st.hard[nm]||0)+1}st.pop[nm]=(st.pop[nm]||0)+1;st.recent=[ok?1:0,...(st.recent||[])].slice(0,10);SS("stats",st);aLL();sP("game_sessions",[{id:G.id,guessed_name:gn,actual_name:nm,was_correct:ok,total_questions:G.qc}]);sP("answer_logs",G.h.map((h,i)=>({session_id:G.id,attr_key:h.a,answer:h.v,question_no:i+1})))}
$("fY").onclick=()=>{$("fA").style.display="none";$("fM").innerHTML='<span style="color:#5efc8d">🎉 やったッ！読みどおりだぜッ！</span>';rec(G.gn,G.gn,true)};
$("fN").onclick=()=>{$("fA").style.display="none";G.guessed.add(G.gn);$("wA").classList.remove("H");$("fM").innerHTML='<span style="color:#fcb85e">正解を教えてください 👇</span>'};
$("wL").onclick=e=>{const b=e.target.closest(".fb");if(!b)return;$("wA").classList.add("H");$("fM").innerHTML=`<span style="color:#5efc8d">💡 ${b.dataset.n} を学習しました！</span>`;rec(G.gn,b.dataset.n,false)};
$("wCont").onclick=()=>{$("wA").classList.add("H");$("fM").textContent="";G.extra=true;G.maxQ=G.qc+EX_MQ;show("pQ");sQ()};
$("wNone").onclick=()=>{$("wA").classList.add("H");$("wSA").classList.remove("H");$("wSr").value="";$("wSl").innerHTML=""};
$("wSr").oninput=()=>{const q=$("wSr").value.trim().toLowerCase();if(!q){$("wSl").innerHTML="";return}$("wSl").innerHTML=CH.filter(c=>c.name.toLowerCase().includes(q)).slice(0,8).map(c=>`<div class="sri" data-n="${c.name}">${c.emoji} ${c.name}</div>`).join("")||'<div style="text-align:center;font-size:.73em;color:#666;padding:6px">見つかりません</div>'};
$("wSl").onclick=e=>{const it=e.target.closest(".sri");if(!it)return;$("wSA").classList.add("H");$("fM").innerHTML=`<span style="color:#5efc8d">💡 ${it.dataset.n} を学習しました！</span>`;rec(G.gn,it.dataset.n,false)};
$("wNew").onclick=()=>{$("wSA").classList.add("H");$("wNA").classList.remove("H");$("wI").value="";$("wDup").classList.add("H")};
$("wI").oninput=()=>{const nm=$("wI").value.trim();const s=findSim(nm);const p=findPendingSim(nm);let msg=[];if(s.length)msg.push("登録済み: "+s.map(c=>c.name).join(", "));if(p.length)msg.push("リクエスト済み: "+p.map(r=>r.char_name).join(", "));msg.length?($("wDup").classList.remove("H"),$("wDup").textContent="⚠️ "+msg.join(" / ")):$("wDup").classList.add("H")};
$("wSb").onclick=async()=>{const nm=$("wI").value.trim();if(!nm)return;const r=await sRpc("submit_char_request",{p_name:nm,p_part:0,p_note:"ゲーム中"});if(r==="EXISTS"){rec(G.gn,nm,false);$("fM").innerHTML=`<span style="color:#5efc8d">💡 ${nm} を学習！</span>`}else if(r==="VOTED"){rec(G.gn,nm,false);$("fM").innerHTML=`<span style="color:#5efc8d">🗳️ ${nm} に投票しました！</span>`}else{rq.push({name:nm,date:new Date().toISOString(),status:"pending"});SS("reqs",rq);rec(G.gn,nm,false);$("fM").innerHTML=`<span style="color:#5efc8d">✨ ${nm} をリクエストしました！</span>`}$("wNA").classList.add("H")};
$("ag").onclick=()=>{nG();show("pQ");sQ()};

/* リクエスト */
$a(".rqt").forEach(t=>t.onclick=()=>{$a(".rqt").forEach(x=>x.classList.remove("a"));t.classList.add("a");$a(".rqS").forEach(x=>x.classList.add("H"));$({char:"rqChar",qst:"rqQst"}[t.dataset.s]).classList.remove("H");if(t.dataset.s==="qst")showExQ()});
$("rNm").oninput=()=>{const nm=$("rNm").value.trim();const s=findSim(nm);const p=findPendingSim(nm);let msg=[];if(s.length)msg.push("登録済み: "+s.map(c=>c.name).join(", "));if(p.length)msg.push("リクエスト済み: "+p.map(r=>r.char_name).join(", "));if(msg.length){$("rDup").classList.remove("H");$("rDup").textContent="⚠️ "+msg.join(" / ");$("rSb").disabled=!!CH.find(c=>c.name===nm)}else{$("rDup").classList.add("H");$("rSb").disabled=false}};
$("rSb").onclick=async()=>{const nm=$("rNm").value.trim();if(!nm){$("rMs").innerHTML='<span style="color:#fc5e5e">名前を入力してください</span>';return}const r=await sRpc("submit_char_request",{p_name:nm,p_part:parseInt($("rPt").value)||0,p_note:$("rNo").value.trim()});if(r==="EXISTS"){$("rMs").innerHTML='<span style="color:#fc5e5e">そのキャラは登録済みです</span>'}else if(r==="VOTED"){$("rMs").innerHTML='<span style="color:#5efc8d">🗳️ 既にリクエストされています。投票しました！</span>';$("rNm").value="";$("rPt").value="";$("rNo").value="";$("rDup").classList.add("H")}else{rq.push({name:nm,date:new Date().toISOString(),status:"pending"});SS("reqs",rq);$("rNm").value="";$("rPt").value="";$("rNo").value="";$("rMs").innerHTML='<span style="color:#5efc8d">📩 リクエストを送信しました！</span>';$("rDup").classList.add("H");rR()}};
async function rR(){const el=$("rLs");if(!rq.length){el.innerHTML='<div style="text-align:center;font-size:.7em;color:#666;padding:6px">まだありません</div>';return}
  const active=CH.map(c=>c.name);rq.forEach(r=>{if(active.includes(r.name))r.status="approved"});SS("reqs",rq);
  el.innerHTML=[...rq].reverse().slice(0,15).map(r=>`<div class="ri"><span>${r.name}</span><span class="rbg ${r.status==="approved"?"rap":"rpd"}">${r.status==="approved"?"✅ 追加済み":"⏳ 審査中"}</span></div>`).join("")}
$("rqQsb").onclick=()=>{const q=$("rqQi").value.trim();if(!q){$("rqQms").innerHTML='<span style="color:#fc5e5e">質  を入力してください</span>';return}sP("question_requests",[{question_text:q,note:$("rqQn").value.trim()}]);$("rqQi").value="";$("rqQn").value="";$("rqQms").innerHTML='<span style="color:#5efc8d">📩 質問アイデアを送信しました！</span>'};
function showExQ(){$("rqExQ").innerHTML=AT.map(a=>`<div class="eq-item">${a.l} — ${a.q}</div>`).join("");$("rqExSr").value="";$("rqExSr").oninput=()=>{const q=$("rqExSr").value.trim().toLowerCase();$("rqExQ").querySelectorAll(".eq-item").forEach(r=>{r.style.display=(!q||r.textContent.toLowerCase().includes(q))?"":"none"})}}

/* 育てる */
let VG={ch:null,qs:[],qi:0,ans:{},sn:[]};
function bV(){$("vSr").value="";$("vSl").innerHTML="";$("vGame").classList.add("H")}
function canVote(nm){const vt=LS("votetime")||{};const last=vt[nm];if(!last)return true;return Date.now()-last>24*60*60*1000}
function markVoted(nm){const vt=LS("votetime")||{};vt[nm]=Date.now();SS("votetime",vt)}
$("vSr").oninput=()=>{const q=$("vSr").value.trim().toLowerCase();if(!q){$("vSl").innerHTML="";return}$("vSl").innerHTML=CH.filter(c=>c.name.toLowerCase().includes(q)).slice(0,10).map(c=>`<div class="sri" data-n="${c.name}">${c.emoji} ${c.name}</div>`).join("")||'<div style="text-align:center;font-size:.73em;color:#666;padding:6px">見つかりません</div>'};
$("vSl").onclick=e=>{const it=e.target.closest(".sri");if(!it)return;const ch=CH.find(c=>c.name===it.dataset.n);if(!ch)return;if(!canVote(ch.name)){$("vSl").innerHTML=`<div style="text-align:center;font-size:.73em;color:#fcb85e;padding:6px">⏰ ${ch.name}は24時間以内に回答済みです</div>`;return}VG={ch,qs:[...AT].sort(()=>Math.random()-.5).slice(0,15),qi:0,ans:{},sn:[]};$("vSl").innerHTML="";$("vSr").value="";$("vGame").classList.remove("H");$("vDone").classList.add("H");$("vCe").textContent=ch.emoji;$("vCn").textContent=ch.name;svQ()};
function svQ(){if(VG.qi>=VG.qs.length){fV();return}$("vBar").style.width=(VG.qi/VG.qs.length*100)+"%";$("vQn").textContent=`${VG.qi+1}/${VG.qs.length}`;$("vQq").textContent=`${VG.ch.name}は…${VG.qs[VG.qi].q}`;$("vBk").disabled=VG.qi===0}
$("vAg").onclick=e=>{const b=e.target.closest(".an");if(!b||VG.qi>=VG.qs.length)return;VG.sn.push({qi:VG.qi,ans:{...VG.ans}});VG.ans[VG.qs[VG.qi].k]={yes:100,py:75,uk:50,pn:25,no:0}[b.dataset.v];VG.qi++;svQ()};
$("vBk").onclick=()=>{if(!VG.sn.length)return;const s=VG.sn.pop();VG.qi=s.qi;VG.ans=s.ans;svQ()};
function isVoteSpam(ans){const vals=Object.values(ans);if(vals.length<5)return false;const c={};vals.forEach(v=>{c[v]=(c[v]||0)+1});const mx=Math.max(...Object.values(c));return mx/vals.length>=0.8}
function fV(){$("vQq").textContent="";$("vQn").textContent="";$("vBar").style.width="100%";$("vDone").classList.remove("H");if(isVoteSpam(VG.ans)){$("vDMsg").textContent="回答の偏りが大きいため学習をスキップしました";return}$("vDMsg").textContent=`${Object.keys(VG.ans).length}個の属性を学習に反映しました`;markVoted(VG.ch.name);const sid=uid();sP("attr_votes",Object.entries(VG.ans).map(([k,v])=>({char_name:VG.ch.name,attr_key:k,vote:v,session_id:sid})));const nm=VG.ch.name;if(!ld[nm])ld[nm]={};Object.entries(VG.ans).forEach(([k,v])=>{if(!ld[nm][k])ld[nm][k]={};const a=v>=75?"yes":v<=25?"no":"uk";ld[nm][k][a]=(ld[nm][k][a]||0)+1});SS("learn",ld);aLL()}
$("vAn").onclick=bV;

/* 統計 */
$a(".stt").forEach(t=>t.onclick=()=>{$a(".stt").forEach(x=>x.classList.remove("a"));t.classList.add("a");$a(".stS").forEach(x=>x.classList.add("H"));$({me:"stMe",all:"stAll"}[t.dataset.s]).classList.remove("H");if(t.dataset.s==="all")rGSt()});
let gStCache=null;
function rSt(){
  $("s1").textContent=st.total;
  $("s2").textContent=st.total?Math.round(st.correct/st.total*100)+"%":"-%";
  $("s3").textContent=CH.length;
  $("s4").textContent=st.streak;
  $("s5").textContent=st.maxStreak||0;
  $("s6").textContent=st.bestQ<999?st.bestQ+"問":"-";
  const rc=st.recent||[];
  $("skB").innerHTML=Array.from({length:10},(_,i)=>i<rc.length?`<div class="streak-dot ${rc[i]?"w":"l"}"></div>`:`<div class="streak-dot e"></div>`).join("");
  const rk=Object.entries(st.pop).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const mx=rk.length?rk[0][1]:1;
  $("rkL").innerHTML=rk.length?rk.map(([nm,ct],i)=>{const c=CH.find(x=>x.name===nm);return`<div class="rr"><span class="rps">${i+1}</span><span>${c?c.emoji:"❓"}</span><span class="rnm">${nm}</span><div class="rb"><div class="rf" style="width:${ct/mx*100}%"></div></div><span class="rpc">${ct}回</span></div>`}).join(""):'<div style="text-align:center;font-size:.7em;color:#666;padding:6px">まだデータがありません</div>';
  const hk=Object.entries(st.hard||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
  $("rkH").innerHTML=hk.length?hk.map(([nm,ct],i)=>{const c=CH.find(x=>x.name===nm);return`<div class="rr"><span class="rps">${i+1}</span><span>${c?c.emoji:"❓"}</span><span class="rnm">${nm}</span><span class="rpc">${ct}回ハズレ</span></div>`}).join(""):'<div style="text-align:center;font-size:.7em;color:#666;padding:6px">-</div>';
}
async function rGSt(){
  if(gStCache){renderGSt(gStCache);return}
  $("gs1").textContent="…";$("gs2").textContent="…";$("gs3").textContent="…";
  $("gPop").innerHTML=$("gHard").innerHTML=$("gEasy").innerHTML='<div style="text-align:center;font-size:.7em;color:#888;padding:6px">読み込み中...</div>';
  const d=await sRpc("get_global_stats");
  if(!d)return;
  gStCache=d;renderGSt(d);
}
function renderGSt(d){
  $("gs1").textContent=d.total_games||0;
  $("gs2").textContent=d.total_games?Math.round((d.total_correct||0)/d.total_games*100)+"%":"-%";
  $("gs3").textContent=d.avg_questions?d.avg_questions+"問":"-";
  const pop=d.popular||[];
  const pmx=pop.length?pop[0].count:1;
  $("gPop").innerHTML=pop.length?pop.map((r,i)=>{const c=CH.find(x=>x.name===r.name);return`<div class="rr"><span class="rps">${i+1}</span><span>${c?c.emoji:"❓"}</span><span class="rnm">${r.name}</span><div class="rb"><div class="rf" style="width:${r.count/pmx*100}%"></div></div><span class="rpc">${r.count}回</span></div>`}).join(""):'<div style="text-align:center;font-size:.7em;color:#666;padding:6px">-</div>';
  const hard=d.hardest||[];
  $("gHard").innerHTML=hard.length?hard.map((r,i)=>{const c=CH.find(x=>x.name===r.name);return`<div class="rr"><span class="rps">${i+1}</span><span>${c?c.emoji:"❓"}</span><span class="rnm">${r.name}</span><div class="rb"><div class="rf" style="width:${r.rate}%;background:#fc5e5e"></div></div><span class="rpc">${r.rate}%</span></div>`}).join(""):'<div style="text-align:center;font-size:.7em;color:#666;padding:6px">まだデータが足りません</div>';
  const easy=d.easiest||[];
  $("gEasy").innerHTML=easy.length?easy.map((r,i)=>{const c=CH.find(x=>x.name===r.name);return`<div class="rr"><span class="rps">${i+1}</span><span>${c?c.emoji:"❓"}</span><span class="rnm">${r.name}</span><span style="font-size:.72em;color:#5efc8d;font-weight:700">${r.avg_q}問</span></div>`}).join(""):'<div style="text-align:center;font-size:.7em;color:#666;padding:6px">まだデータが足りません</div>';
}

/* ===== 管理 ===== */
$("aGo").onclick=async()=>{const h=await sha($("aPw").value);const r=await sRpc("admin_verify",{p_pass_hash:h});if(r==="OK"){admH=h;admOK=true;$("aL").classList.add("H");$("aP").classList.remove("H");initAdmAdd()}else{$("aEr").textContent="パスワードが違います"}};
$a(".amt").forEach(t=>t.onclick=()=>{$a(".amt").forEach(x=>x.classList.remove("a"));t.classList.add("a");$a(".aS").forEach(x=>x.classList.add("H"));({add:()=>{$("aAdd").classList.remove("H");initAdmAdd()},reqs:()=>{$("aReqs").classList.remove("H");loadReqs()},chars:()=>{$("aChars").classList.remove("H");loadChars()},qs:()=>{$("aQs").classList.remove("H");loadQs()}})[t.dataset.s]()});

/* 管理：追加 */
let AD={qs:[],qi:0,ans:{},sn:[]};
function initAdmAdd(){AD={qs:[...AT].sort(()=>Math.random()-.5).slice(0,20),qi:0,ans:{},sn:[]};$("adF").classList.add("H");$("adMs").textContent="";$("adNm").value="";$("adPt").value="";$("adEm").value="";$("adDs").value="";$("adDup").classList.add("H");shAdQ()}
$("adNm").oninput=()=>{const s=findSim($("adNm").value.trim());s.length?($("adDup").classList.remove("H"),$("adDup").textContent="⚠️ 似たキャラがいます: "+s.map(c=>c.name).join(", ")):$("adDup").classList.add("H")};
function shAdQ(){if(AD.qi>=AD.qs.length){shAdFin();return}$("adBar").style.width=(AD.qi/AD.qs.length*100)+"%";$("adQn").textContent=`${AD.qi+1}/${AD.qs.length}`;$("adQq").textContent=AD.qs[AD.qi].q;$("adBk").disabled=AD.qi===0}
$("adAg").onclick=e=>{const b=e.target.closest(".an");if(!b||AD.qi>=AD.qs.length)return;AD.sn.push({qi:AD.qi,ans:{...AD.ans}});AD.ans[AD.qs[AD.qi].k]=parseFloat(b.dataset.v);AD.qi++;shAdQ()};
$("adBk").onclick=()=>{if(!AD.sn.length)return;const s=AD.sn.pop();AD.qi=s.qi;AD.ans=s.ans;shAdQ()};
function shAdFin(){$("adBar").style.width="100%";$("adQn").textContent="";$("adQq").textContent="✅ 20問完了！";$("adF").classList.remove("H");const asked=new Set(Object.keys(AD.ans));mkFin(AT.filter(a=>!asked.has(a.k)),"adFL","adFSr")}
function mkFin(items,lid,sid){$(lid).innerHTML=items.map(a=>`<div class="adm-ar" data-k="${a.k}"><span class="adm-al">${a.l}</span><div class="adm-abs"><button class="ab" data-v="1">⭕</button><button class="ab" data-v=".65">🔵</button><button class="ab" data-v=".35">🟠</button><button class="ab" data-v="0">❌</button></div></div>`).join("");$(lid).onclick=e=>{const b=e.target.closest(".ab");if(!b)return;b.closest(".adm-ar").querySelectorAll(".ab").forEach(x=>x.classList.remove("ay","ap","am","an2"));b.classList.add({"1":"ay",".65":"ap",".35":"am","0":"an2"}[b.dataset.v])};if($(sid))$(sid).oninput=()=>{const q=$(sid).value.trim().toLowerCase();$(lid).querySelectorAll(".adm-ar").forEach(r=>{r.style.display=(!q||r.querySelector(".adm-al").textContent.toLowerCase().includes(q))?"":"none"})}}
async function doAdd(){
  if(!admOK)return;const nm=$("adNm").value.trim();if(!nm){$("adMs").innerHTML='<span style="color:#fc5e5e">名前を入力してください</span>';return}
  const attrs={};AT.forEach(a=>{attrs[a.k]=0});Object.entries(AD.ans).forEach(([k,v])=>{attrs[k]=v});
  $a("#adFL .adm-ar").forEach(r=>{const sel=r.querySelector(".ab.ay,.ab.ap,.ab.am,.ab.an2");if(sel)attrs[r.dataset.k]=parseFloat(sel.dataset.v)});
  $("adMs").innerHTML='<span style="color:#888">送信中...</span>';
  const r=await sRpc("admin_add_character",{p_pass_hash:admH,p_name:nm,p_part:parseInt($("adPt").value)||0,p_emoji:$("adEm").value.trim()||"❓",p_description:$("adDs").value.trim(),p_attrs:attrs});
  if(r==="OK"){$("adMs").innerHTML=`<span style="color:#5efc8d">✅ ${nm} を追加しました！</span>`;const a={};AT.forEach(x=>{a[x.k]=0});Object.assign(a,attrs);const ex=CH.findIndex(c=>c.name===nm);if(ex>=0)CH[ex]={name:nm,part:parseInt($("adPt").value)||0,emoji:$("adEm").value.trim()||"❓",desc:$("adDs").value.trim(),a};else CH.push({name:nm,part:parseInt($("adPt").value)||0,emoji:$("adEm").value.trim()||"❓",desc:$("adDs").value.trim(),a});ui();setTimeout(initAdmAdd,1500)}
  else $("adMs").innerHTML=`<span style="color:#fc5e5e">${r||"エラー"}</span>`}
$("adFD").onclick=$("adFS").onclick=doAdd;

/* 管理：リクエスト */
$a(".arqt").forEach(t=>t.onclick=()=>{$a(".arqt").forEach(x=>x.classList.remove("a"));t.classList.add("a");$a(".arS").forEach(x=>x.classList.add("H"));$({chr:"arChr",qr:"arQr"}[t.dataset.s]).classList.remove("H")});
async function loadReqs(){
  $("aRqL").innerHTML='<div style="text-align:center;font-size:.74em;color:#888;padding:8px">読み込み中...</div>';
  const rs=await sRpc("get_pending_requests");
  if(!rs||!rs.length)$("aRqL").innerHTML='<div style="text-align:center;font-size:.74em;color:#666;padding:8px">なし 🎉</div>';
  else{$("aRqL").innerHTML=rs.map(r=>`<div class="adm-req" data-n="${r.char_name}"><div class="adm-req-top"><span class="adm-req-nm">${r.char_name}</span><span class="rbg rpd">🗳️ ${r.vote_count||1}票</span></div><div class="adm-req-info">${r.part?PN[r.part]+" / ":""}${r.note||""}</div><div class="adm-req-btns"><button class="bt bs bg arq-a">✅ 承認</button><button class="bt bs bd arq-r">❌ 却下</button></div></div>`).join("");
  $a(".arq-a").forEach(b=>b.onclick=async e=>{const nm=e.target.closest(".adm-req").dataset.n;const r=await sRpc("admin_approve_request",{p_pass_hash:admH,p_char_name:nm});if(r==="OK"){e.target.closest(".adm-req").innerHTML=`<span style="color:#5efc8d">✅ ${nm} を追加！</span>`;const a={};AT.forEach(x=>{a[x.k]=0});CH.push({name:nm,part:0,emoji:"❓",desc:"承認追加",a});ui()}});
  $a(".arq-r").forEach(b=>b.onclick=async e=>{const nm=e.target.closest(".adm-req").dataset.n;await sRpc("admin_reject_request",{p_pass_hash:admH,p_char_name:nm});e.target.closest(".adm-req").innerHTML='<span style="color:#888">処理済み</span>'})}
  $("aRqQL").innerHTML='<div style="text-align:center;font-size:.74em;color:#888;padding:8px">読み込み中...</div>';
  const qr=await sRpc("get_pending_question_requests");
  if(!qr||!qr.length)$("aRqQL").innerHTML='<div style="text-align:center;font-size:.74em;color:#666;padding:8px">なし</div>';
  else{$("aRqQL").innerHTML=qr.map(r=>`<div class="adm-req" data-id="${r.id}"><div class="adm-req-nm">${r.question_text}</div><div class="adm-req-info">${r.note||""}</div><div class="adm-req-btns"><button class="bt bs bd aqr-d" data-id="${r.id}">✅ 確認済み</button></div></div>`).join("");
  $a(".aqr-d").forEach(b=>b.onclick=async()=>{await sRpc("admin_dismiss_question_request",{p_pass_hash:admH,p_id:parseInt(b.dataset.id)});b.closest(".adm-req").innerHTML='<span style="color:#888">処理済み</span>'})}
}

/* 管理：キャラ一覧・編集 */
let admCC=[];
async function loadChars(){const cs=await sRpc("get_all_characters");if(!cs)return;admCC=cs;rnCL("");$("aEd").classList.add("H")}
$("aCsr").oninput=()=>rnCL($("aCsr").value.trim().toLowerCase());
function rnCL(q){const f=(q?admCC.filter(c=>c.name.toLowerCase().includes(q)):admCC).slice().sort((a,b)=>{const pa=a.part||99;const pb=b.part||99;return pa-pb});$("aCL").innerHTML=f.map(c=>`<div class="adm-ch${c.is_active?"":" style=\"opacity:.35\""}" data-n="${c.name}"><span>${c.emoji||"❓"}</span><span class="adm-ch-nm">${c.name}</span><span class="adm-ch-pt">${PN[c.part]||""}</span><button class="adm-ch-del" data-n="${c.name}">🗑️</button></div>`).join("");$a(".adm-ch-nm").forEach(el=>el.onclick=()=>openEd(el.closest(".adm-ch").dataset.n));$a(".adm-ch-del").forEach(b=>b.onclick=async e=>{e.stopPropagation();if(!confirm(`「${b.dataset.n}」を削除しますか？`))return;const r=await sRpc("admin_deactivate_character",{p_pass_hash:admH,p_name:b.dataset.n});if(r==="OK"){b.closest(".adm-ch").style.opacity=".2";b.closest(".adm-ch").style.pointerEvents="none";CH=CH.filter(c=>c.name!==b.dataset.n);ui()}})}
function openEd(nm){
  const c=admCC.find(x=>x.name===nm);if(!c)return;
  $("aEdN").textContent=nm;$("aEd").dataset.n=nm;$("aEdNm").value=c.name;$("aEdEm").value=c.emoji||"";$("aEdPt").value=c.part??"";$("aEdDs").value=c.description||"";$("aEdMs").textContent="";$("aEd").classList.remove("H");
  const attrs=c.attrs||{};
  $("aEdL").innerHTML=AT.map(a=>{const v=attrs[a.k]??0;return`<div class="adm-ar" data-k="${a.k}"><span class="adm-al">${a.l}（${a.q}）</span><div class="adm-abs"><button class="ab${v>=.8?" ay":""}" data-v="1">⭕</button><button class="ab${v>=.5&&v<.8?" ap":""}" data-v=".65">🔵</button><button class="ab${v>=.2&&v<.5?" am":""}" data-v=".35">🟠</button><button class="ab${v<.2?" an2":""}" data-v="0">❌</button></div></div>`}).join("");
  $("aEdL").onclick=e=>{const b=e.target.closest(".ab");if(!b)return;b.closest(".adm-ar").querySelectorAll(".ab").forEach(x=>x.classList.remove("ay","ap","am","an2"));b.classList.add({"1":"ay",".65":"ap",".35":"am","0":"an2"}[b.dataset.v])};
  $("aEdSr").value="";$("aEdSr").oninput=()=>{const q=$("aEdSr").value.trim().toLowerCase();$("aEdL").querySelectorAll(".adm-ar").forEach(r=>{r.style.display=(!q||r.querySelector(".adm-al").textContent.toLowerCase().includes(q))?"":"none"})}}
$("aEdSv").onclick=async()=>{
  const origNm=$("aEd").dataset.n,newNm=$("aEdNm").value.trim();if(!newNm)return;
  const c=admCC.find(x=>x.name===origNm);const old=c?c.attrs||{}:{};
  const attrs={};AT.forEach(a=>{attrs[a.k]=old[a.k]??0});$a("#aEdL .adm-ar").forEach(r=>{const sel=r.querySelector(".ab.ay,.ab.ap,.ab.am,.ab.an2");if(sel)attrs[r.dataset.k]=parseFloat(sel.dataset.v)});
  $("aEdMs").innerHTML='<span style="color:#888">保存中...</span>';
  if(newNm!==origNm){const rr=await sRpc("admin_rename_character",{p_pass_hash:admH,p_old_name:origNm,p_new_name:newNm});if(rr!=="OK"){$("aEdMs").innerHTML=`<span style="color:#fc5e5e">${rr||"リネーム失敗"}</span>`;return}$("aEd").dataset.n=newNm;$("aEdN").textContent=newNm;const lc=CH.find(x=>x.name===origNm);if(lc)lc.name=newNm}
  await sRpc("admin_update_character",{p_pass_hash:admH,p_name:newNm,p_part:parseInt($("aEdPt").value)||0,p_emoji:$("aEdEm").value.trim()||"❓",p_description:$("aEdDs").value.trim()});
  const r=await sRpc("admin_update_attrs",{p_pass_hash:admH,p_name:newNm,p_attrs:attrs});
  if(r==="OK"){$("aEdMs").innerHTML='<span style="color:#5efc8d">✅ 保存しました！</span>';const cc=CH.find(x=>x.name===newNm);if(cc){cc.part=parseInt($("aEdPt").value)||0;cc.emoji=$("aEdEm").value.trim()||"❓";cc.desc=$("aEdDs").value.trim();AT.forEach(a=>{cc.a[a.k]=attrs[a.k]})}}
  else $("aEdMs").innerHTML=`<span style="color:#fc5e5e">${r||"エラー"}</span>`};
$("aEdCl").onclick=()=>$("aEd").classList.add("H");

/* 管理：質問 */
let bulkChars=[];
async function loadQs(){
  let all=[];
  try{const ca=await sRpc("get_custom_attrs");if(ca)all=ca.map(a=>({k:a.key,q:a.question,l:a.label,i:Number(a.info)}))}catch{}
  try{const cs=await sRpc("get_all_characters");if(cs)bulkChars=cs.filter(c=>c.is_active)}catch{}
  $("qList").innerHTML=all.map(a=>`<div class="adm-qi" data-k="${a.k}"><span class="adm-qi-nm">${a.l} — ${a.q} <span style="color:#f7d94e;font-size:.8em">[${a.i}]</span></span><div class="adm-qi-act"><button class="adm-qi-btn qe-btn" data-k="${a.k}" data-q="${a.q}" data-l="${a.l}" data-i="${a.i}">✏️</button><button class="adm-qi-btn qb-btn" data-k="${a.k}" data-l="${a.l}">📋</button><button class="adm-qi-del" data-k="${a.k}">🗑️</button></div></div>`).join("");
  $a(".qe-btn").forEach(b=>b.onclick=()=>{$("qEdit").classList.remove("H");$("qBulk").classList.add("H");$("qEdK").textContent=b.dataset.k;$("qEdQ").value=b.dataset.q;$("qEdL").value=b.dataset.l;$("qEdI").value=b.dataset.i||"1.5";$("qEdMs").textContent="";$("qEdit").dataset.k=b.dataset.k});
  $a(".qb-btn").forEach(b=>b.onclick=()=>{openBulk(b.dataset.k,b.dataset.l)});
  $a(".adm-qi-del").forEach(b=>b.onclick=async()=>{if(!confirm(`質問「${b.dataset.k}」を削除しますか？`))return;await sRpc("admin_deactivate_attr",{p_pass_hash:admH,p_key:b.dataset.k});AT=AT.filter(a=>a.k!==b.dataset.k);b.closest(".adm-qi").style.opacity=".2";b.closest(".adm-qi").style.pointerEvents="none"});
  $("qSr").oninput=()=>{const q=$("qSr").value.trim().toLowerCase();$("qList").querySelectorAll(".adm-qi").forEach(r=>{r.style.display=(!q||r.querySelector(".adm-qi-nm").textContent.toLowerCase().includes(q))?"":"none"})};
  $("qEdit").classList.add("H");$("qBulk").classList.add("H");$("qMs").textContent="";$("qKey").value="";$("qQ").value="";$("qLb").value="";$("qInfo").value="1.5";$("qDup").classList.add("H")}

function openBulk(key,label){
  $("qEdit").classList.add("H");$("qBulk").classList.remove("H");$("qBkN").textContent=label+" ("+key+")";$("qBulk").dataset.k=key;$("qBkMs").textContent="";$("qBkSr").value="";
  renderBulkList(key,"");
  $("qBkSr").oninput=()=>renderBulkList(key,$("qBkSr").value.trim().toLowerCase());
}
function renderBulkList(key,q){
  const f=q?bulkChars.filter(c=>c.name.toLowerCase().includes(q)):bulkChars;
  $("qBkL").innerHTML=f.map(c=>{const v=(c.attrs||{})[key]??0;return`<div class="bci" data-n="${c.name}"><span>${c.emoji||"❓"}</span><span class="bci-nm">${c.name}</span><span class="bci-cur">${v>0?v.toFixed(1):"-"}</span><div class="bci-abs"><button class="ab${v>=.8?" ay":""}" data-v="1">⭕</button><button class="ab${v>=.5&&v<.8?" ap":""}" data-v=".65">🔵</button><button class="ab${v>=.2&&v<.5?" am":""}" data-v=".35">🟠</button><button class="ab${v<.2&&v>=0?" an2":""}" data-v="0">❌</button></div></div>`}).join("");
  $("qBkL").onclick=e=>{const b=e.target.closest(".ab");if(!b)return;const row=b.closest(".bci");row.querySelectorAll(".ab").forEach(x=>x.classList.remove("ay","ap","am","an2"));b.classList.add({"1":"ay",".65":"ap",".35":"am","0":"an2"}[b.dataset.v]);row.querySelector(".bci-cur").textContent=b.dataset.v}}
$("qBkSv").onclick=async()=>{
  const key=$("qBulk").dataset.k;const vals={};
  $("qBkL").querySelectorAll(".bci").forEach(r=>{const sel=r.querySelector(".ab.ay,.ab.ap,.ab.am,.ab.an2");if(sel)vals[r.dataset.n]=parseFloat(sel.dataset.v)});
  if(!Object.keys(vals).length){$("qBkMs").innerHTML='<span style="color:#fc5e5e">変更がありません</span>';return}
  $("qBkMs").innerHTML='<span style="color:#888">保存中...</span>';
  const r=await sRpc("admin_bulk_set_attr",{p_pass_hash:admH,p_attr_key:key,p_char_values:vals});
  if(r==="OK"){$("qBkMs").innerHTML=`<span style="color:#5efc8d">✅ ${Object.keys(vals).length}キャラ更新しました！</span>`;
    Object.entries(vals).forEach(([nm,v])=>{const c=CH.find(x=>x.name===nm);if(c)c.a[key]=v;const bc=bulkChars.find(x=>x.name===nm);if(bc){if(!bc.attrs)bc.attrs={};bc.attrs[key]=v}})}
  else $("qBkMs").innerHTML=`<span style="color:#fc5e5e">${r||"エラー"}</span>`};
$("qBkCl").onclick=()=>$("qBulk").classList.add("H");

$("qEdSv").onclick=async()=>{const k=$("qEdit").dataset.k,q=$("qEdQ").value.trim(),l=$("qEdL").value.trim(),iv=parseFloat($("qEdI").value);if(!q||!l){$("qEdMs").innerHTML='<span style="color:#fc5e5e">入力してください</span>';return}if(isNaN(iv)||iv<0.1||iv>3){$("qEdMs").innerHTML='<span style="color:#fc5e5e">重要度は0.1〜3.0で入力</span>';return}const r=await sRpc("admin_update_attr",{p_pass_hash:admH,p_key:k,p_question:q,p_label:l,p_info:iv});if(r==="OK"){$("qEdMs").innerHTML='<span style="color:#5efc8d">✅ 保存！</span>';const a=AT.find(x=>x.k===k);if(a){a.q=q;a.l=l;a.i=iv}loadQs()}else $("qEdMs").innerHTML=`<span style="color:#fc5e5e">${r||"エラー"}</span>`};
$("qEdCl").onclick=()=>$("qEdit").classList.add("H");
$("qKey").oninput=()=>{AT.find(a=>a.k===$("qKey").value.trim())?($("qDup").classList.remove("H"),$("qDup").textContent="⚠️ このキーは既に存在します"):$("qDup").classList.add("H")};
$("qSb").onclick=async()=>{const k=$("qKey").value.trim(),q=$("qQ").value.trim(),l=$("qLb").value.trim(),iv=parseFloat($("qInfo").value);if(!k||!q||!l){$("qMs").innerHTML='<span style="color:#fc5e5e">全項目入力してください</span>';return}if(!/^[a-zA-Z0-9_]+$/.test(k)){$("qMs").innerHTML='<span style="color:#fc5e5e">キーは英数字とアンダースコアのみです</span>';return}if(AT.find(a=>a.k===k)){$("qMs").innerHTML='<span style="color:#fc5e5e">このキーは既に存在します</span>';return}if(isNaN(iv)||iv<0.1||iv>3){$("qMs").innerHTML='<span style="color:#fc5e5e">重要度は0.1〜3.0で入力</span>';return}const r=await sRpc("admin_add_attr",{p_pass_hash:admH,p_key:k,p_question:q,p_label:l,p_info:iv});if(r==="OK"){$("qMs").innerHTML=`<span style="color:#5efc8d">✅「${l}」を追加しました！</span>`;AT.push({k,q,l,i:iv});$("qKey").value="";$("qQ").value="";$("qLb").value="";$("qInfo").value="1.5";loadQs()}else $("qMs").innerHTML=`<span style="color:#fc5e5e">${r||"エラー"}</span>`};

init();
})();
</script>
</p>
