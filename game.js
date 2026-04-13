
const SB_URL = 'https://ccydnfgfhxfmbzhtnzvc.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjeWRuZmdmaHhmbWJ6aHRuenZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDU2NDAsImV4cCI6MjA5MTA4MTY0MH0.ZHKrmk5jNDtolpmIlRiEMhU110Zo2xCPU98jYE1Tu8M';

async function sbFetch(path, options={}){
    try{
        const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
            headers:{
                'apikey': SB_KEY,
                'Authorization': `Bearer ${SB_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': options.prefer||'',
            },
            ...options
        });
        if(!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : true;
    } catch{ return null; }
}

async function submitOnlineScore(playerName, score, levelReached, streak, accuracy){
    return sbFetch('leaderboard', {
        method: 'POST',
        prefer: 'return=minimal',
        body: JSON.stringify({
            player_name: playerName,
            score,
            level_reached: levelReached,
            best_streak: streak,
            accuracy
        })
    });
}

async function fetchOnlineLeaderboard(){
    return sbFetch('leaderboard?select=*&order=score.desc&limit=10');
}

async function renderOnlineLeaderboard(containerId, playerScore){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = `<div style="font-size:9px;color:rgba(255,215,0,0.4);letter-spacing:2px;margin-bottom:8px;">LOADING ONLINE SCORES...</div>`;
    const rows = await fetchOnlineLeaderboard();
    if(!rows || !rows.length){
        container.innerHTML = `<div style="font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:1px;">No scores yet — be the first!</div>`;
        return;
    }
    const medals = ['🥇','🥈','🥉'];
    container.innerHTML = rows.map((e,i)=>{
        const isMe = e.score === playerScore;
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
            border-radius:10px;margin-bottom:5px;font-size:11px;
            background:${isMe?'rgba(255,215,0,0.1)':'rgba(255,255,255,0.03)'};
            border:1px solid ${isMe?'rgba(255,215,0,0.4)':'rgba(255,255,255,0.06)'};
            ${isMe?'box-shadow:0 0 12px rgba(255,215,0,0.2);':''}">
            <span style="width:26px;">${i<3?medals[i]:'#'+(i+1)}</span>
            <span style="flex:1;text-align:left;color:${isMe?'rgba(255,215,0,0.95)':'rgba(0,255,255,0.9)'};
                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${isMe?'⚡ YOU':e.player_name}</span>
            <span style="color:rgba(255,255,255,0.4);font-size:9px;margin-right:4px;">LV${e.level_reached}</span>
            <span style="font-weight:900;color:${isMe?'#ffd700':'#ff1493'};">${e.score.toLocaleString()}</span>
        </div>`;
    }).join('');
}

// Name prompt for the home screen
function promptPlayerName(callback){
    const existing = localStorage.getItem('digitalBreak_playerName');
    if(existing){ if(callback) callback(existing); return; }
    
    const overlay = document.createElement('div');
    overlay.id = 'namePromptOverlay';
    overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);';
    overlay.innerHTML=`
        <div style="background:linear-gradient(160deg, #0a0512, #1a0a2e);border:2px solid #ffd700;border-radius:24px;padding:35px 25px;width:100%;max-width:400px;text-align:center;font-family:Orbitron,monospace;box-shadow:0 0 50px rgba(255,215,0,0.2);">
            <div style="font-size:30px;margin-bottom:15px;">⚡</div>
            <div style="font-size:16px;font-weight:900;color:#ffd700;letter-spacing:4px;margin-bottom:10px;text-transform:uppercase;">Identify Yourself</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;margin-bottom:25px;line-height:1.6;">Enter your hacker alias to track your progress on the global leaderboard.</div>
            <input id="_nameInput" maxlength="15" placeholder="ALIAS..."
                autocomplete="off" style="width:100%;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.3);
                border-radius:12px;padding:15px;color:#ffd700;font-family:Orbitron,monospace;
                font-size:18px;letter-spacing:3px;text-align:center;outline:none;margin-bottom:20px;">
            <button id="_nameSubmit" style="width:100%;background:linear-gradient(45deg, #ffd700, #ff8800);
                border:none;color:#000;padding:16px;border-radius:12px;font-family:Orbitron,monospace;
                font-size:14px;font-weight:900;letter-spacing:3px;cursor:pointer;box-shadow:0 10px 20px rgba(255,136,0,0.3);">INITIALIZE SESSION</button>
        </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#_nameInput');
    setTimeout(()=>input.focus(), 500);
    
    overlay.querySelector('#_nameSubmit').onclick = ()=>{
        const name = input.value.trim().toUpperCase() || "ANONYMOUS";
        localStorage.setItem('digitalBreak_playerName', name);
        overlay.style.opacity = '0';
        setTimeout(()=>overlay.remove(), 500);
        if(callback) callback(name);
    };
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') overlay.querySelector('#_nameSubmit').click(); });
}


// ══════════════════════════════════════════
//  LEADERBOARD
// ══════════════════════════════════════════
const LEADERBOARD_KEY = 'digitalBreakV21_lb';
const SECRET_MESSAGES = [
    "Suggest more secret messages you'd like the gave to have, via my contact details below! 📩",
    "Well Done! 6 7!!😛",
    "Why is 6 afraid of 7? Because 7, 8, 9. But why was 7 afraid tho? Because 7 knew that 6, 8, 9 too 💀",
    //"You understood the assignment periodt. We don't make the rules, you just followed them perfectly.",
    //"POV: you just violated the algorithm and the algorithm is embarrassed 🤖",
    //"Respectfully... you ate and left absolutely no crumbs. The plate is clean. 🍽️",
    "Oh you played so well, you're the birthday game winner",
    "The audacity to WIN?? In THIS economy?? We love to see it bestie 😭",
    "You won. Cool. Anyway, my therapist says I need to stop attaching my self-worth to your performance. Congrats I guess. 🖤",
    "Level cleared. That's one more small victory before the void consumes us all. Treat yourself. ☠️",
    "POV: you succeeded and honestly? That's suspicious. What are you hiding?",
    "You did it. The voices are quiet. For now. 🧠",
    "Another win. Another day further from God. Let's go bestie. ⛓️",
    "Congratulations. You are now statistically less likely to uninstall out of shame. Progress.",
    "You cleared the level. The level did not clear you. This time. 🔪",
    "My disappointment is immeasurable and my day is… actually okay because you won. Don't get used to it.",
    "You passed. The bar was in hell but you limbo'd under it anyway. 🔥",
    "Winning is fun they said. Nobody mentions the crushing weight of expectation for the next level. Anyway here's your dopamine. 💊",
    "Level complete. Your reward? Slightly less existential dread. Spend it wisely.",
    "You won. The game is embarrassed. I am tired. We are all feeling things. Let's move on.",
    "Congratulations. You have temporarily delayed my villain arc. Appreciate it.",
    "You cleared it. The funeral is tomorrow. Bring snacks. ⚰️",
    "Another win. The cemetery of failed attempts grows fuller. Rest in peace to them. Not you though. You're too annoying to die.",
    "You did the thing. The thing is done. Now we both pretend this fixes anything.",
    "Level cleared. My will to live has increased by 3%. That's not nothing.",
    "Congratulations. You are now contractually obligated to keep playing. Read the fine print. (There is no fine print. I'm just lonely.)",
    "You won. Donate to my therapy fund or don't. Either way the level is over.",
    "Shout out to my South African players. Wozo'thathu kiss.💋💋💋",
    //"Main character behaviour fully detected. Stay built different 💅",
    //"IYKYK. And you clearly knew. The rest of them don't. Keep it that way 🤫",
    //"You're giving 'I don't miss' energy and honestly the game felt it 🎯",
    "On to the next. But first screenshot this because nobody is going to believe you 📸",
    //"The devs are shaking. (hi it's Aya. I'm shaking. Congrats bestie 💋)",
    "Girl math: spending 60 seconds on this game = certified that girl energy ✨",
    //"Lowkey ate. Highkey ate. Midkey absolutely demolished it 🔥",
    //"The haters said you couldn't. The haters were statistically incorrect 📊",
    "This is your sign to quit while you're ahead. But we both know you won’t. Onto the next level.",
    "Objectively: slay. Subjectively: also slay. Spiritually: you need help but congrats.",
    "Lock in? No chomam you welded the doors shut. That's different.",
    "You just did something that made the dev open their laptop again.",
    //"The game's code is crying. You love to see it. 💻😭",
    "That wasn't a level clear. That was a level MURDER. And you got away with it.",
    "Udlalile mfwethu. I hope bazokushada one day. 🙏🏽💋",
    "Real ones finish. You? Certified real one. The simulation acknowledges you fr.",
    "POV: it's 3am, your eyes hurt, your thumb is sore, and you WON. No notes. 🌙",
    "This is your villain origin story except you're the hero actually. Or maybe both 😈",
    //"NPC behaviour? Not today. Main character only. Congrats on existing correctly 💅",
    "Bro really said 'let me speedrun this' and then DID IT. Unhinged. Iconic. 🏃",
    //"The way you ate this game up... it's giving chosen one energy and I don't say that lightly.",
    "Touch grass? Maybe. But first savour this W because you earned it bestie 🌿",
    //"You just broke the matrix and the matrix is embarrassed. The glitch in the system is you. 🕶️",
    //"Not to flex but you just did a thing that was supposed to be hard and made it look easy. The audacity. The simulation is reeling. 🌀",
    "I hope ungumntu oOn ebomini.",
];
const PB_KEY='digitalBreakV21_pb';
const PROGRESS_KEY='digitalBreakV21_progress';

function saveProgress(){
    try{
        const data={
            clearedLevels:[...clearedLevels],
            highestUnlocked:Math.min(Math.max(...[...clearedLevels,0])+1,LEVELS.length),
            totalLevelScore: totalLevelScore
        };
        localStorage.setItem(PROGRESS_KEY,JSON.stringify(data));
    }catch{}
}

function loadProgress(){
    try{
        const raw=localStorage.getItem(PROGRESS_KEY);
        if(!raw) return;
        const data=JSON.parse(raw);
        if(data.clearedLevels) data.clearedLevels.forEach(lv=>clearedLevels.add(lv));
        if(data.totalLevelScore) totalLevelScore = data.totalLevelScore;
    }catch{}
}

function clearProgress(){
    try{localStorage.removeItem(PROGRESS_KEY);}catch{}
    clearedLevels=new Set();
    totalLevelScore = 0;
    renderLevelPills();
}

function getPersonalBest(lv){
    try{
        const key=lv?`${PB_KEY}_lv${lv}`:PB_KEY;
        return parseInt(localStorage.getItem(key))||0;
    }catch{return 0;}
}
function savePersonalBest(sc,lv){
    try{
        if(lv){
            const key=`${PB_KEY}_lv${lv}`;
            const prev=getPersonalBest(lv);
            if(sc>prev)localStorage.setItem(key,sc);
        }
        // Also save overall best
        const prev=getPersonalBest();
        if(sc>prev)localStorage.setItem(PB_KEY,sc);
    }catch{}
}

function checkNewPersonalBest(sc){
    const pb=getPersonalBest(null);
    if(sc>pb){
        savePersonalBest(sc);
        updatePersonalBestDisplay();
        const t=document.getElementById('newBestToast');
        t.classList.add('show');
        setTimeout(()=>t.classList.remove('show'),2200);
        playSound('newbest');
        return true;
    }
    return false;
}
//xX_H4ck3r_Xx

const SEED_PLAYERS = [
    {name:"ndinguBeyonce",score:1820,diff:"normal"},
    {name:"umamakho_wifi",score:1650,diff:"normal"},
    {name:"404_Skillz_Azikho",   score:1420,diff:"easy"},
    {name:"TryHard99",    score:1280,diff:"easy"},
];

function getLeaderboard(){
    try{const r=localStorage.getItem(LEADERBOARD_KEY);return r?JSON.parse(r):[...SEED_PLAYERS];}
    catch{return[...SEED_PLAYERS];}
}

function saveLeaderboard(lb){try{localStorage.setItem(LEADERBOARD_KEY,JSON.stringify(lb));}catch{}}
function addToLeaderboard(sc,diff){
    const adjs=["Sweaty","Trembling","Lucky","Desperate","Average","Mid-tier","Shaking","Confused"];
    const nouns=["Gamer","Clicker","Tryhard","Keyboard","Legend","Potato","NPC","Bot", "Big Boss", "President General among amazwe"];
    const name=adjs[Math.floor(Math.random()*adjs.length)]+" "+nouns[Math.floor(Math.random()*nouns.length)];
    let lb=getLeaderboard();
    lb.push({name,score:sc,diff,isNew:true});
    lb.sort((a,b)=>b.score-a.score);
    lb=lb.slice(0,7);
    saveLeaderboard(lb.map(e=>({...e,isNew:false})));
    return lb;
}

function renderLeaderboard(lb,playerScore){
    const c=document.getElementById('leaderboardRows');
    c.innerHTML='';
    const medals=['🥇','🥈','🥉'];
    lb.forEach((e,i)=>{
        const isMe=e.score===playerScore&&e.isNew;
        const row=document.createElement('div');
        row.className='lb-row'+(isMe?' new-entry':'');
        row.style.animationDelay=`${i*.07}s`;
        const dl={easy:'ROOKIE',normal:'HACKER',insane:'LEGEND'}[e.diff]||'';
        row.innerHTML=`<span class="lb-rank">${i<3?medals[i]:'#'+(i+1)}</span>
            <span class="lb-name">${isMe?'⚡ YOU':e.name}</span>
            <span class="lb-score">${e.score.toLocaleString()}</span>
            <span class="lb-diff">${dl}</span>`;
        c.appendChild(row);
    });
}

// ══════════════════════════════════════════
//  ROASTS
// ══════════════════════════════════════════
const roasts=[
    "You died. The game is embarrassed for you. I'm embarrassed for you. Log off. 💀",
    "Respectfully? That was tragic. The cringe is immeasurable. Try again I guess.",
    "POV: you failed so hard the simulation felt secondhand embarrassment. Touch grass. Then touch the retry button. 🌿",
    "Skill issue. And not even a cool skill issue. Just sad. Embarrassing for your bloodline.",
    "You blew it. The ancestors are disappointed. The dev is disappointed. Your future self? Also disappointed.",
    "That wasn't a loss. That was a public health crisis. Do better bestie. 🚑",
    "Failed. The bar was on the floor and you brought a shovel. Impressive in the worst way.",
    "You died. The void is hungry and honestly? You fed it well. Congrats on being useful for once. 🕳️",
    "Loss. And not the cute 'character development' loss. The 'delete the app and think about your choices' loss.",
    "Bro really said 'let me fail in the most humiliating way possible' and then COMMITTED. No notes. Just shame.",
    "You lost. The game isn't even hard. That's the scary part. Seek help or seek the retry button. Your call.",
    "Game over. The voices are laughing at you. Not the fun voices. The mean ones. 🧠",
    "Failure. Your reward? Nothing. Not even pity. Get back in the trenches soldier.",
    "You died. The only thing lower than your score is my will to live. Twins! 🖤",
    "Lost again. At this point I'm starting to think it's personal. Against you. By you.",
    "L bozo. Ratio. Also you failed. Also your wifi is probably fine. That was just you. 📉",
    "Unalived by a game. That's the legacy you're building. Your tombstone: 'tried. failed. cried.' ⚰️",
    "Fail screen. The game is fine. The problem is between the chair and the screen. That's you btw.",
    "You lost. Don't blame lag. Don't blame the cat. Blame the mirror bestie.",
    "Dead. The level ate you and didn't even season you. Tragic. Unflavored. Try again. 🍽️",
    "Game over. My disappointment is louder than your click. And your click was loud.",
    "You failed so hard I felt it in my bones. And I don't have bones. I'm code. That's how bad it was. 💻",
    "Loss. The only thing faster than your failure was your confidence beforehand. Unmatched delusion. Love that for you.",
    "You died. The afterlife is just replaying this fail screen forever. Welcome to hell bestie. 🔥",
    "Failed. The algorithm saw that and said 'not even I can save this'. And the algorithm saves EVERYTHING.",
];
function getSavageRoast(sc,target){
    if(sc>=target*1.5)return"Okay fine. That was actually kinda impressive.";
    if(sc>=target*1.25)return"Not bad. Not good either. But... not bad.";
    return roasts[Math.floor(Math.random()*roasts.length)];
}

// ══════════════════════════════════════════
//  CONFETTI
// ══════════════════════════════════════════
let confettiPieces=[],confettiAnimId=null;
function startConfetti(){
    const canvas=document.getElementById('confettiCanvas');
    canvas.style.display='block';
    canvas.width=window.innerWidth;canvas.height=window.innerHeight;
    const ctx=canvas.getContext('2d');
    const colors=['#ff1493','#00ffff','#ffdd00','#00ff00','#ff6b00','#ff69b4','#fff'];
    confettiPieces=[];
    for(let i=0;i<120;i++)confettiPieces.push({
        x:Math.random()*canvas.width,y:-10-Math.random()*200,
        w:6+Math.random()*8,h:3+Math.random()*5,
        color:colors[Math.floor(Math.random()*colors.length)],
        speed:1.5+Math.random()*3,angle:Math.random()*Math.PI*2,
        spin:(Math.random()-.5)*.2,drift:(Math.random()-.5)*1.5,opacity:.9
    });
    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let alive=false;
        confettiPieces.forEach(p=>{
            p.y+=p.speed;p.x+=p.drift;p.angle+=p.spin;p.opacity-=.003;
            if(p.y<canvas.height+20&&p.opacity>0)alive=true;
            ctx.save();ctx.globalAlpha=Math.max(0,p.opacity);
            ctx.translate(p.x,p.y);ctx.rotate(p.angle);
            ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
            ctx.restore();
        });
        if(alive)confettiAnimId=requestAnimationFrame(animate);
        else canvas.style.display='none';
    }
    if(confettiAnimId)cancelAnimationFrame(confettiAnimId);
    animate();
}

// ══════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════
function shareScore(){
    const text=`🔥 I just cleared Level ${currentLevel} of Digital Break V2.1! Total score: ${totalLevelScore.toLocaleString()} pts · Best streak: ${bestStreak} 🔥 Can you beat me? ⚡`;
    if(navigator.share)navigator.share({title:'Digital Break V2.1',text}).catch(()=>copyFallback(text));
    else copyFallback(text);
}
function copyFallback(text){
    try{navigator.clipboard.writeText(text).then(()=>{
        document.getElementById('shareConfirm').textContent='✅ Copied!';
        setTimeout(()=>document.getElementById('shareConfirm').textContent='',3000);
    });}catch{document.getElementById('shareConfirm').textContent='⚠️ Could not copy';}
}

// ══════════════════════════════════════════
//  WIN SCREEN
// ══════════════════════════════════════════
let countdownInterval=null;

function runHackLoader(callback){
    const loader=document.getElementById('hackLoader');
    const bolt=document.getElementById('hackBolt');
    const lines=[
        document.getElementById('hline1'),
        document.getElementById('hline2'),
        document.getElementById('hline3'),
        document.getElementById('hline4'),
    ];
    // Reset all lines
    lines.forEach(l=>{l.style.width='0';l.style.transition='none';});
    bolt.style.opacity='0';
    loader.classList.add('active');

    // Stagger each line typing in
    const delays=[0, 700, 1400, 2000];
    const durations=[600, 600, 500, 500];
    lines.forEach((l,i)=>{
        setTimeout(()=>{
            l.style.transition=`width ${durations[i]}ms steps(28)`;
            l.style.width='100%';
        },delays[i]);
    });

    // Bolt fades in after lines
    setTimeout(()=>{ bolt.style.opacity='1'; playSound('lightning'); },2200);

    // Done — hide loader and fire callback
    setTimeout(()=>{
        loader.classList.remove('active');
        bolt.style.opacity='0';
        callback();
    },3200);
}

function showWinScreen(finalScore,tc,sh,diff,targetSc,isNewBest=false){
    document.getElementById('winScoreBadge').textContent=`${finalScore.toLocaleString()} PTS`;
    document.getElementById('winStreakBadge').textContent=`🔥 Best Streak: ${bestStreak} hits`;
    const acc=tc>0?Math.round((sh/tc)*100):0;
    const accLine=
        acc>=95?"Surgical precision. You don't miss. Period.":
        acc>=85?"Elite accuracy. The targets didn't stand a chance.":
        acc>=75?"Solid aim — clean and composed under pressure.":
        acc>=65?"Good accuracy. You kept it together when it counted.":
        acc>=55?"Decent aim. A few misses but the W is still the W.":
        acc>=45?"A little shaky but you got the job done regardless.":
        "Listen... the aim needs work. But the heart was there 💀";
    document.getElementById('winAccuracy').textContent=`Accuracy: ${acc}% — ${accLine}`;
    document.getElementById('roastText').textContent=
        isNewBest ? '🏆 NEW PERSONAL BEST! You actually outdid yourself. Respect.' :
        getSavageRoast(finalScore,targetSc);

    // Submit to online leaderboard
    const lvReached = Math.max(...[...clearedLevels, currentLevel]);
    const avgAcc = totalClicksAllLevels>0?Math.round((totalHitsAllLevels/totalClicksAllLevels)*100):0;
    const avgStreak = levelsCompleted>0?Math.round(totalStreakAllLevels/levelsCompleted):bestStreak;
    promptPlayerName(name=>{
        submitOnlineScore(name, totalLevelScore||finalScore, lvReached, avgStreak, avgAcc);
    });
    // Render online board into existing container
    document.getElementById('leaderboardRows').innerHTML='';
    renderOnlineLeaderboard('leaderboardRows', finalScore);

    document.getElementById('secretText').textContent=SECRET_MESSAGES[Math.floor(Math.random()*SECRET_MESSAGES.length)];
    document.getElementById('countdownSection').style.display='block';
    document.getElementById('secretReveal').style.display='none';

    const overlay=document.getElementById('winOverlay');
    overlay.style.display='block';overlay.scrollTop=0;
    startConfetti();
    switchMusicTo('win');

    let count=5;
    document.getElementById('countdownNum').textContent=count;
    if(countdownInterval)clearInterval(countdownInterval);
    countdownInterval=setInterval(()=>{
        count--;
        if(count<=0){
            clearInterval(countdownInterval);
            document.getElementById('countdownSection').style.display='none';
            document.getElementById('secretReveal').style.display='block';
            startConfetti();
        }else{
            document.getElementById('countdownNum').textContent=count;
        }
    },1000);
}

function showLevelComplete(lv,lvScore,acc){
    clearedLevels.add(lv);
    saveProgress();
    renderLevelPills();
    updateStartButton();

    // 2s transition loader
    const tl=document.createElement('div');
    tl.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:1200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font-family:Orbitron,monospace;';
    tl.innerHTML=`
        <div id="_tlCheck" style="font-size:52px;opacity:0;transform:scale(0.4) translateY(-20px);transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);">✅</div>
        <div style="font-size:10px;letter-spacing:5px;color:rgba(0,255,136,0.7);opacity:0;transition:opacity 0.4s ease 0.25s;" id="_tlText">LEVEL ${lv} CLEARED</div>
        <div style="width:140px;height:2px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:6px;overflow:hidden;">
            <div id="_tlBar" style="height:100%;width:0%;background:linear-gradient(90deg,#00ff88,#00ffff);transition:width 1.7s ease;box-shadow:0 0 8px rgba(0,255,136,0.6);"></div>
        </div>`;
    document.body.appendChild(tl);
    setTimeout(()=>{
        const c=document.getElementById('_tlCheck'),t=document.getElementById('_tlText'),b=document.getElementById('_tlBar');
        if(c){c.style.opacity='1';c.style.transform='scale(1) translateY(0)';}
        if(t)t.style.opacity='1';
        if(b)b.style.width='100%';
    },60);
    setTimeout(()=>{
        tl.style.transition='opacity 0.35s ease';
        tl.style.opacity='0';
        setTimeout(()=>{tl.remove();_showLevelCompleteInner(lv,lvScore,acc);},360);
    },1800);
}

function _showLevelCompleteInner(lv,lvScore,acc){
    const overlay=document.getElementById('levelCompleteOverlay');
    if(!overlay)return;
    const lcPbw=document.getElementById('progressBarWrap');
    if(lcPbw)lcPbw.style.display='none';

    // Populate content
    document.getElementById('lcLevel').textContent=`LEVEL ${lv} CLEARED`;
    document.getElementById('lcScore').textContent=`${lvScore.toLocaleString()} PTS`;
    const accComment=
        acc>=95?'Surgical. You do not miss.':
        acc>=85?'Elite aim — clean and composed.':
        acc>=75?'Solid accuracy. Kept it together.':
        acc>=65?'Good aim. Held it when it counted.':
        acc>=50?'Decent. A few misses but the W counts.':
        acc>=35?'Shaky aim but the heart was there 💀':
        'Listen... the accuracy needs work. But you still cleared it somehow 😭';
    document.getElementById('lcAccuracy').textContent=`Accuracy: ${acc}% — ${accComment}`;
    document.getElementById('lcTotal').textContent=
        `Total so far: ${totalLevelScore.toLocaleString()} pts`;

    // Teaser for next level
    const next=LEVELS[lv]; // lv is 1-indexed, array is 0-indexed so lv = next level's index
    document.getElementById('lcNextNote').textContent=
        next ? `Level ${lv+1}: ${next.note}` : '';

    // Random message for this level
    const lcMsg=document.getElementById('lcMessage');
    if(lcMsg)lcMsg.textContent=SECRET_MESSAGES[Math.floor(Math.random()*SECRET_MESSAGES.length)];

    overlay.style.display='block';
    overlay.scrollTop=0;
    setTimeout(()=>{ overlay.scrollTop=0; },50);
    startConfetti();
    switchMusicTo('win');
    playSound('levelcomplete');
}

function goToNextLevel(){
    currentLevel++;
    levelData=LEVELS[currentLevel-1];
    const overlay=document.getElementById('levelCompleteOverlay');
    if(overlay)overlay.style.display='none';
    document.getElementById('confettiCanvas').style.display='none';
    if(confettiAnimId){cancelAnimationFrame(confettiAnimId);confettiAnimId=null;}
    loadLevel(currentLevel);
}

function showEpicGameComplete(finalScore,tc,sh){
    const acc=tc>0?Math.round((sh/tc)*100):0;
    clearedLevels.add(12);
    saveProgress();
    renderLevelPills();
    updateStartButton();
    checkNewPersonalBest(finalScore);

    // Build the overlay
    const el=document.createElement('div');
    el.id='epicCompleteOverlay';
    el.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:1000;overflow-y:scroll;-webkit-overflow-scrolling:touch;padding:30px 15px 80px;font-family:Orbitron,monospace;text-align:center;color:#fff;';

    const msg=SECRET_MESSAGES[Math.floor(Math.random()*SECRET_MESSAGES.length)];
    const lbHtml = `<div id="epicLbRows"><div style="font-size:9px;color:rgba(255,215,0,0.4);letter-spacing:2px;">LOADING GLOBAL SCORES...</div></div>`;

    el.innerHTML=`
    <div style="max-width:480px;margin:0 auto;">
        <div style="font-size:11px;letter-spacing:6px;color:rgba(255,215,0,0.4);margin-bottom:10px;">ALL 12 LEVELS</div>
        <div style="font-size:clamp(22px,6vw,38px);font-weight:900;letter-spacing:4px;
            background:linear-gradient(135deg,#ffd700,#ff8800,#ff1493,#ffd700);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;
            background-clip:text;margin-bottom:6px;
            animation:flicker 2.5s infinite;">
            ⚡ SYSTEM FULLY BREACHED ⚡
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-bottom:8px;">YOU ARE THE 1%</div>
        <div style="font-size:9px;color:rgba(255,215,0,0.35);letter-spacing:2px;margin-bottom:24px;
            background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.1);
            border-radius:8px;padding:6px 14px;display:inline-block;">
            ⚡ MORE LEVELS DROPPING SOON — STAY READY
        </div>

        <div style="background:linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,140,0,0.06));
            border:2px solid rgba(255,215,0,0.6);border-radius:18px;padding:22px 18px;
            margin-bottom:18px;box-shadow:0 0 60px rgba(255,215,0,0.2);">
            <div style="font-size:11px;letter-spacing:3px;color:rgba(255,215,0,0.5);margin-bottom:8px;">TOTAL SCORE</div>
            <div style="font-size:clamp(32px,8vw,52px);font-weight:900;color:#ffd700;
                text-shadow:0 0 30px rgba(255,215,0,0.6);letter-spacing:3px;">${finalScore.toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px;">PTS · ${acc}% accuracy · ${bestStreak} best streak</div>
        </div>

        <div style="background:rgba(0,255,100,0.06);border:1px solid rgba(0,255,136,0.25);
            border-radius:14px;padding:16px 18px;margin-bottom:18px;">
            <div style="font-size:9px;letter-spacing:3px;color:rgba(0,255,136,0.5);margin-bottom:8px;">🔓 CLASSIFIED TRANSMISSION</div>
            <div style="font-size:13px;color:#00ff88;line-height:1.7;letter-spacing:0.5px;
                animation:glow 2s ease-in-out infinite alternate;">${msg}</div>
        </div>

        <div style="margin-bottom:18px;">
            <div style="font-size:10px;letter-spacing:3px;color:rgba(255,215,0,0.4);margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">
                <span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,0.3));"></span>
                HALL OF FAME
                <span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,0,0.3),transparent);"></span>
            </div>
            ${lbHtml}
        </div>

        <div style="
            font-size:9px;color:rgba(255,255,255,0.35);letter-spacing:1px;
            line-height:1.9;margin:0 0 16px;
            background:rgba(255,215,0,0.05);
            border:1px solid rgba(255,215,0,0.15);
            border-radius:10px;padding:12px 16px;">
            📸 You cleared all 12 levels — screenshot this & post it!<br>
            Tag <span style="color:rgba(255,215,0,0.8);font-weight:900;">@ayabukwaaaa</span> on IG & TikTok &nbsp;·&nbsp;
            <span style="color:rgba(255,215,0,0.8);font-weight:900;">@cachemeoutside.dev</span> on TikTok<br>
            <span style="color:rgba(0,255,136,0.7);font-weight:900;">let's make digital break trend ⚡</span>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">
            <button onclick="shareScore()" style="
                background:linear-gradient(45deg,#1da1f2,#0d8fd4);color:#fff;border:none;
                padding:13px 22px;border-radius:30px;font-family:Orbitron,monospace;
                font-weight:bold;font-size:11px;cursor:pointer;letter-spacing:1px;
                min-height:46px;touch-action:manipulation;">📤 SHARE YOUR WIN</button>
            <button onclick="saveScoreCard()" style="
                background:linear-gradient(45deg,#833ab4,#fd1d1d,#fcb045);color:#fff;border:none;
                padding:13px 22px;border-radius:30px;font-family:Orbitron,monospace;
                font-weight:bold;font-size:11px;cursor:pointer;letter-spacing:1px;
                min-height:46px;touch-action:manipulation;">📸 SAVE FOR STORY</button>
        </div>
        <div id="shareConfirm" style="font-size:11px;color:#00ff00;min-height:16px;letter-spacing:1px;margin-bottom:10px;"></div>
        
        <button onclick="document.getElementById('epicCompleteOverlay').remove();loadLevel(12);"
            style="width:100%;padding:14px;
            background:rgba(255,215,0,0.05);
            border:1px solid rgba(255,215,0,0.2);color:rgba(255,215,0,0.5);
            font-size:11px;font-weight:900;letter-spacing:3px;
            font-family:Orbitron,monospace;
            cursor:pointer;border-radius:14px;margin-bottom:10px;
            touch-action:manipulation;-webkit-tap-highlight-color:transparent;">
            🔁 REPLAY LEVEL 12
        </button>

        <button onclick="document.getElementById('epicCompleteOverlay').remove();restartGame();"
            style="width:100%;padding:16px;
            background:linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,140,0,0.07));
            border:1px solid rgba(255,215,0,0.5);color:rgba(255,215,0,0.96);
            font-size:12px;font-weight:900;letter-spacing:4px;font-family:Orbitron,monospace;
            cursor:pointer;border-radius:14px;margin-bottom:16px;
            animation:breachGlow 2.5s ease-in-out infinite;touch-action:manipulation;">
            ⚡ PLAY AGAIN FROM START</button>

        <div style="font-size:8px;color:rgba(255,255,255,0.15);letter-spacing:1px;line-height:2;margin-top:10px;">
            Geniusly created by <span style="color:rgba(255,215,0,0.4);">Ayabukwa🌟</span><br>
            <a href="tel:0845067825" style="color:rgba(255,215,0,0.3);text-decoration:none;">084 506 7825</a>
            &nbsp;·&nbsp;
            <a href="mailto:unakomtumtum0@gmail.com" style="color:rgba(255,215,0,0.3);text-decoration:none;">unakomtumtum0@gmail.com</a>
        </div>
    </div>`;

    document.body.appendChild(el);
    // Submit and load online leaderboard
    const lvReached = 12;
    const avgAcc = totalClicksAllLevels>0?Math.round((totalHitsAllLevels/totalClicksAllLevels)*100):acc;
    const avgStreak = levelsCompleted>0?Math.round(totalStreakAllLevels/levelsCompleted):bestStreak;
    promptPlayerName(name=>{
        submitOnlineScore(name, finalScore, lvReached, avgStreak, avgAcc);
        renderOnlineLeaderboard('epicLbRows', finalScore);
    });
    startConfetti();
    switchMusicTo('win');
    playSound('newbest');

    // Fix the shareConfirm reference — point to the one inside epic overlay
    setTimeout(()=>{
        const eb=el.querySelector('#shareConfirm');
        if(eb)eb.id='shareConfirmEpic';
    },100);
}

// ══════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════
let gameState='start';
let targets=[],obstacles=[],powerups=[],particles=[],stars=[];
let shakeX=0,shakeY=0,shakeDuration=0,hitFlashAlpha=0;
let demoTargets=[],demoFrame=0;
let score=0,timeLeft=60,combo=1,lives=3;
let gameTimer,lastHitTime=0;
let difficulty='normal',targetScore=1500;
let totalClicks=0,successfulHits=0;
let shieldTime=0,slowTime=0,multiTime=0;
let currentStreak=0,bestStreak=0,streakToastTimer=null;
let totalLevelScore=0;
let totalClicksAllLevels=0;
let totalHitsAllLevels=0;
let totalStreakAllLevels=0;
let levelsCompleted=0; // cumulative score across all levels for display
let bossTarget=null,bossAlertTimer=null;
let isPanic=false;
let p5Canvas=null;
let lastInputTS=0;
let gameStartTime=0,gameDuration=0;
let inputLock=false;
let isPaused=false;

const difficultySettings={
    easy:  {time:45,targetScore:600, obstacleCount:2,description:"45 seconds, fewer obstacles, forgiving gameplay"},
    normal:{time:60,targetScore:1200,obstacleCount:4,description:"60 seconds, moving obstacles, power-ups enabled"},
    insane:{time:75,targetScore:1800,obstacleCount:4,description:"75 seconds, maximum chaos, expert-level challenge"}
};

// ── LEVEL PROGRESSION ──
const LEVELS=[
    {lv:1,  time:50, target:220,  obstacles:0, powerups:false, boss:false, panicAt:7,  speedRamp:0.15, note:"Basics only — hit glowing targets"},
    {lv:2,  time:50, target:360,  obstacles:0, powerups:false, boss:false, panicAt:7,  speedRamp:0.2,  note:"Gold targets appear — worth 3x!"},
    {lv:3,  time:55, target:520,  obstacles:1, powerups:false, boss:false, panicAt:8,  speedRamp:0.28, note:"First obstacle — watch out!"},
    {lv:4,  time:55, target:700,  obstacles:2, powerups:true,  boss:false, panicAt:8,  speedRamp:0.35, note:"Power-ups unlocked — collect green circles"},
    {lv:5,  time:60, target:900,  obstacles:2, powerups:true,  boss:true,  panicAt:10, speedRamp:0.42, note:"Boss target appears — hit it 3 times!"},
    {lv:6,  time:60, target:1100, obstacles:3, powerups:true,  boss:true,  panicAt:10, speedRamp:0.50, note:"More obstacles, faster targets"},
    {lv:7,  time:65, target:1320, obstacles:3, powerups:true,  boss:true,  panicAt:10, speedRamp:0.58, note:"Two bosses possible — stay sharp"},
    {lv:8,  time:65, target:1540, obstacles:4, powerups:true,  boss:true,  panicAt:10, speedRamp:0.65, note:"Targets are smaller — precision required"},
    {lv:9,  time:70, target:1800, obstacles:4, powerups:true,  boss:true,  panicAt:12, speedRamp:0.75, note:"Speed ramps harder as time runs out"},
    {lv:10, time:70, target:2100, obstacles:4, powerups:true,  boss:true,  panicAt:12, speedRamp:0.82, note:"Panic starts earlier — 12 seconds!"},
    {lv:11, time:75, target:2450, obstacles:5, powerups:true,  boss:true,  panicAt:13, speedRamp:0.90, note:"Obstacles speed up — full pressure"},
    {lv:12, time:80, target:2850, obstacles:5, powerups:true,  boss:true,  panicAt:15, speedRamp:1.0,  note:"Full chaos. This is it."},
];

// current level state — these sit alongside existing vars
let currentLevel=1;
let levelData=LEVELS[0]; // always reflects active level config
// Tracks which levels the player has cleared this session
let clearedLevels=new Set();

// Lock prevents ontouchstart + onclick double-fire
let diffLock=false;
function selectDifficulty(diff){
    difficulty=diff;
    targetScore=difficultySettings[diff].targetScore;
}
let diffCardLock=false;
function selectDiffCard(diff){
    if(diffCardLock)return;
    diffCardLock=true;setTimeout(()=>{diffCardLock=false;},400);
    selectDifficulty(diff);
    document.querySelectorAll('.diff-card').forEach(b=>b.classList.remove('selected'));
    const card=document.querySelector(`.diff-card[data-difficulty="${diff}"]`);
    if(card)card.classList.add('selected');
    const labels={easy:'ROOKIE',normal:'HACKER',insane:'LEGEND'};
    document.getElementById('difficultyDesc').innerHTML=
        `<strong style="color:rgba(255,215,0,0.8);">${labels[diff]} MODE:</strong> ${difficultySettings[diff].description}`;
}

// Audio context for iOS haptic-style feedback
let audioCtx=null;
function getAudioCtx(){
    if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')audioCtx.resume();
    return audioCtx;
}
function iosHaptic(type){
    try{
        const ctx=getAudioCtx();
        const patterns={
            hit:[[80,0.3,0.04]],
            bonus:[[100,0.4,0.04],[150,0.3,0.04]],
            perfect:[[60,0.5,0.06]],
            obstacle:[[50,0.6,0.1],[60,0.5,0.08]],
            powerup:[[120,0.35,0.05]],
            streak:[[80,0.4,0.04],[100,0.5,0.04],[120,0.4,0.04]],
            boss:[[60,0.6,0.08],[80,0.4,0.05],[100,0.7,0.1]]
        };
        const steps=patterns[type]||patterns.hit;
        let time=ctx.currentTime;
        steps.forEach(([freq,gain,dur])=>{
            const osc=ctx.createOscillator();
            const g=ctx.createGain();
            osc.connect(g);g.connect(ctx.destination);
            osc.frequency.setValueAtTime(freq,time);
            osc.type='sine';
            g.gain.setValueAtTime(gain,time);
            g.gain.exponentialRampToValueAtTime(0.001,time+dur);
            osc.start(time);osc.stop(time+dur+0.01);
            time+=dur+0.02;
        });
    }catch{}
}
function androidVibrate(type){
    // Precise patterns: [vibrate,pause,vibrate,...] in ms
    const p={
        hit:[40],
        bonus:[30,40,30,40,30],
        perfect:[80],
        obstacle:[180],
        powerup:[60],
        streak:[50,30,50],
        boss:[80,40,160]
    };
    try{navigator.vibrate(p[type]||[40]);}catch{}
}
function triggerVibration(type='hit'){
    const isAndroid=/Android/i.test(navigator.userAgent);
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
    if(isAndroid&&'vibrate'in navigator)androidVibrate(type);
    else if(isIOS)iosHaptic(type);
    else if('vibrate'in navigator)androidVibrate(type);
}

// ══════════════════════════════════════════
//  STREAK
// ══════════════════════════════════════════
function onSuccessfulHit(){
    currentStreak++;
    if(currentStreak>bestStreak)bestStreak=currentStreak;
    document.getElementById('streakCount').textContent=currentStreak;
    if(currentStreak>0&&currentStreak%10===0){
        const bonus=currentStreak*5;score+=bonus;
        triggerVibration('streak');playSound('streak');
        showStreakToast(`🔥 ${currentStreak} STREAK! +${bonus}pts`);
    }
}
function breakStreak(){currentStreak=0;document.getElementById('streakCount').textContent=0;}
function showStreakToast(msg){
    const t=document.getElementById('streakToast');
    t.textContent=msg;t.classList.add('show');
    if(streakToastTimer)clearTimeout(streakToastTimer);
    streakToastTimer=setTimeout(()=>t.classList.remove('show'),1600);
}

// ══════════════════════════════════════════
//  BOSS
// ══════════════════════════════════════════
function trySpawnBoss(){
    if(!levelData.boss)return;
    const maxBosses=currentLevel>=7?2:1;
    if((bossTarget?1:0)>=maxBosses||timeLeft<=15||Math.random()>=.012)return;
    document.getElementById('bossAlert').classList.add('show');
    triggerVibration('boss');
    if(bossAlertTimer)clearTimeout(bossAlertTimer);
    bossAlertTimer=setTimeout(()=>{
        document.getElementById('bossAlert').classList.remove('show');
        bossTarget={x:width/2,y:height/2,vx:(Math.random()<.5?1:-1)*1.5,vy:(Math.random()<.5?1:-1)*1.5,size:90,phase:0,activeTime:0,maxActiveTime:300,points:50,armour:3,hitFlash:0};
    },1200);
}
function updateAndDisplayBoss(){
    if(!bossTarget)return;
    let b=bossTarget;
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<50||b.x>width-50)b.vx*=-1;
    if(b.y<50||b.y>height-50)b.vy*=-1;
    b.x=constrain(b.x,50,width-50);b.y=constrain(b.y,50,height-50);
    b.phase+=.1;b.activeTime++;if(b.hitFlash>0)b.hitFlash--;
    if(b.activeTime>b.maxActiveTime){bossTarget=null;return;}
    push();translate(b.x,b.y);
    for(let r=b.size*1.6;r>0;r-=15){let a=map(r,0,b.size*1.6,200,0);stroke(b.hitFlash>0?color(255,80,80,a):color(255,215,0,a));strokeWeight(2.5);noFill();ellipse(0,0,r);}
    let pulse=b.size+sin(b.phase)*10;
    b.hitFlash>0?(fill(255,80,80,200),stroke(255,50,50,255)):(fill(255,180,0,180),stroke(255,215,0,255));
    strokeWeight(4);ellipse(0,0,pulse);
    let barW=b.size*.9,hpF=b.armour/3;
    noStroke();fill(60,0,0,180);rect(-barW/2,-b.size/2-14,barW,8,4);
    fill(hpF>.6?color(0,255,80):hpF>.3?color(255,180,0):color(255,40,40));rect(-barW/2,-b.size/2-14,barW*hpF,8,4);
    fill(0);textAlign(CENTER,CENTER);textSize(26);text("👑",0,-6);
    textSize(12);fill(255,215,0);textStyle(BOLD);text(`${b.points*b.armour}pts`,0,18);
    stroke(255,215,0,180);strokeWeight(3);noFill();arc(0,0,pulse+18,pulse+18,-HALF_PI,-HALF_PI+TWO_PI*(1-(b.activeTime/b.maxActiveTime)));
    pop();
}
function hitBoss(tx,ty){
    if(!bossTarget)return false;
    let b=bossTarget;
    if(dist(tx,ty,b.x,b.y)>=b.size/2)return false;
    b.armour--;b.hitFlash=12;triggerVibration('boss');
    createParticles(b.x,b.y,{r:255,g:215,b:0},20);
    if(b.armour<=0){
        let pts=b.points*(multiTime>0?2:1)*combo;score+=pts;successfulHits++;
        onSuccessfulHit();showStreakToast(`👑 BOSS SLAIN! +${pts}pts`);
        createParticles(b.x,b.y,{r:255,g:215,b:0},40);bossTarget=null;
    }
    updateDisplay();return true;
}

// ══════════════════════════════════════════
//  SPEED & PANIC
// ══════════════════════════════════════════
function getSpeedMultiplier(){
    const total=levelData.time;
    return 1+Math.min((total-timeLeft)/total,1)*levelData.speedRamp;
}
function updateSpeedIndicator(){} // speed now felt, not shown
function updatePanicMode(){
    const should=timeLeft<=levelData.panicAt&&timeLeft>0;
    if(should&&!isPanic){
        isPanic=true;
        document.getElementById('gameContainer').classList.add('panic');
        document.getElementById('gameHUD').classList.add('panic');
        document.getElementById('timeLeft').classList.add('panic');
        const pbw=document.getElementById('progressBarWrap');
        if(pbw)pbw.classList.add('panic');
        switchMusicTo('panic');
    }else if(!should&&isPanic){
        isPanic=false;
        document.getElementById('gameContainer').classList.remove('panic');
        document.getElementById('gameHUD').classList.remove('panic');
        document.getElementById('timeLeft').classList.remove('panic');
        const pbw=document.getElementById('progressBarWrap');
        if(pbw)pbw.classList.remove('panic');
    }
}

// ══════════════════════════════════════════
//  P5 SETUP & DRAW
// ══════════════════════════════════════════
function getCanvasSize(){
    const vp=window.visualViewport;
    const W=vp?vp.width:window.innerWidth;
    const H=vp?vp.height:window.innerHeight;
    return{w:Math.min(Math.floor(W)-10,600),h:Math.min(Math.floor(H*0.88),760)};
}

function applyCanvasStyle(){
    if(!p5Canvas)return;
    p5Canvas.style.touchAction='none';
    p5Canvas.style.pointerEvents='none';
    p5Canvas.style.borderRadius='13px';
    p5Canvas.style.display='block';
}

function setup(){
    loadProgress();
    const{w,h}=getCanvasSize();
    let canvas=createCanvas(w,h);
    canvas.parent('gameContainer');
    p5Canvas=canvas.elt;
    applyCanvasStyle();
    // Dreamy subtle stars — always moving, never fade
    for(let i=0;i<130;i++)stars.push({
        x:random(width),y:random(height),
        size:random(.12,1.1),speed:random(.012,.08),
        opacity:random(.1,.38),gold:random()<.28,
        drift:random(-.025,.025)
    });
    fixScrolling();
    // Visual viewport resize (handles browser chrome show/hide on mobile)
    if(window.visualViewport){
        window.visualViewport.addEventListener('resize',()=>{
            const{w:nw,h:nh}=getCanvasSize();
            resizeCanvas(nw,nh);
            applyCanvasStyle();
        });
    }

    // --- ADDED FOR PROGRESS & NAME PROMPT ---
    loadProgress();
    updatePersonalBestDisplay();
    setTimeout(() => promptPlayerName(), 1000); 
}


function windowResized(){
    const{w,h}=getCanvasSize();
    resizeCanvas(w,h);
    applyCanvasStyle();
}

function draw(){
    background(4,2,12);

    if(gameState!=='playing'){
        // Dreamy idle stars
        noStroke();
        for(let s of stars){
            s.y+=s.speed*.35; s.x+=s.drift*.4;
            if(s.y>height){s.y=0;s.x=random(width);}
            if(s.x<0||s.x>width)s.drift*=-1;
            fill(s.gold?color(255,200,80,s.opacity*130):color(190,215,255,s.opacity*130));
            ellipse(s.x,s.y,s.size);
        }
        // Subtle diagonal holographic grid
        let ga=9+sin(demoFrame*.015)*3;
        let sh=(demoFrame*.18)%44;
        stroke(160,110,0,ga); strokeWeight(.5);
        for(let i=-height;i<width+height;i+=44)line(i+sh,0,i+sh-height,height);
        for(let y=0;y<height;y+=32){stroke(140,90,0,ga*.65);line(0,y,width,y);}
        demoFrame++;
        // Demo targets
        if(demoTargets.length<7)demoTargets.push({x:random(60,width-60),y:random(60,height-60),vx:random(-1.5,1.5)||1,vy:random(-1.5,1.5)||1,size:random(40,70),phase:random(TWO_PI),active:random()<.6,type:random()<.15?'bonus':'normal',pts:Math.floor(random(2,6))});
        for(let t of demoTargets){
            t.x+=t.vx;t.y+=t.vy;t.phase+=.06;
            if(t.x<30||t.x>width-30)t.vx*=-1;
            if(t.y<30||t.y>height-30)t.vy*=-1;
            t.x=constrain(t.x,30,width-30);t.y=constrain(t.y,30,height-30);
            push();translate(t.x,t.y);
            if(t.active){
                for(let r=t.size*1.4;r>0;r-=10){let a=map(r,0,t.size*1.4,180,0);stroke(t.type==='bonus'?color(255,215,0,a*.4):color(0,255,255,a*.4));strokeWeight(2);noFill();ellipse(0,0,r);}
                t.type==='bonus'?(fill(255,215,0,140),stroke(255,255,0,200)):(fill(0,255,255,120),stroke(0,255,255,200));
                strokeWeight(3);ellipse(0,0,t.size+sin(t.phase)*6);
                fill(255,255,255,180);textAlign(CENTER,CENTER);textSize(13);textStyle(BOLD);text(t.pts,0,0);
            }else{
                stroke(80,80,120,60);strokeWeight(2);fill(40,40,60,35);ellipse(0,0,t.size+sin(t.phase)*3);
            }
            pop();
        }
        return;
    }

    // ── DREAMY STARS — always moving, never fade
    noStroke();
    for(let s of stars){
        s.y+=s.speed; s.x+=s.drift;
        if(s.y>height){s.y=0;s.x=random(width);}
        if(s.x<0||s.x>width)s.drift*=-1;
        fill(s.gold?
            color(255,200,80,isPanic?s.opacity*80:s.opacity*190):
            color(190,215,255,s.opacity*190));
        ellipse(s.x,s.y,s.size);
    }

    // ── DIAGONAL HOLOGRAPHIC GRID — subtle amber gold
    let shift=(frameCount*.2)%44;
    let ga=10+sin(frameCount*.014)*4;
    stroke(isPanic?color(120,20,20,ga):color(165,105,0,ga));
    strokeWeight(.5);
    for(let i=-height;i<width+height;i+=44)line(i+shift,0,i+shift-height,height);
    for(let y=0;y<height;y+=32){
        stroke(isPanic?color(100,10,10,ga*.6):color(145,85,0,ga*.6));
        line(0,y,width,y);
    }

    // Moving scanline
    stroke(isPanic?color(255,30,30,12):color(255,165,0,8));
    strokeWeight(1.5);
    line(0,(frameCount*1.3)%height,width,(frameCount*1.3)%height);

    // ── COMBO VIGNETTE
    if(combo>=3){
        let va=map(combo,3,8,10,42);
        let vc=combo>=6?[255,100,0]:combo>=4?[255,20,147]:[255,160,0];
        let g=drawingContext.createRadialGradient(width/2,height/2,height*.25,width/2,height/2,height*.82);
        g.addColorStop(0,'rgba(0,0,0,0)');
        g.addColorStop(1,`rgba(${vc[0]},${vc[1]},${vc[2]},${va/255})`);
        drawingContext.fillStyle=g; noStroke(); drawingContext.fillRect(0,0,width,height);
    }

    // ── SCREEN SHAKE
    if(shakeDuration>0){shakeX=random(-shakeDuration,shakeDuration);shakeY=random(-shakeDuration,shakeDuration);shakeDuration*=.75;if(shakeDuration<.3)shakeDuration=0;}
    else{shakeX=0;shakeY=0;}
    translate(shakeX,shakeY);

    // ── PANIC CORNERS
    if(isPanic){
        let va=16+sin(frameCount*.15)*6; noStroke();
        [[0,0],[width,0],[0,height],[width,height]].forEach(([cx,cy])=>{
            let g=drawingContext.createRadialGradient(cx,cy,0,cx,cy,200);
            g.addColorStop(0,`rgba(255,30,30,${va/255})`); g.addColorStop(1,'rgba(0,0,0,0)');
            drawingContext.fillStyle=g; drawingContext.fillRect(0,0,width,height);
        });
    }

    // ── GAME ELEMENTS
    if(gameState==='playing'){
        updatePowerUps();
        updateAndDisplayTargets(); updateAndDisplayObstacles();
        updateAndDisplayPowerups(); updateAndDisplayBoss();
        updateAndDisplayParticles();
        //const spawnRate = currentLevel<=3 ? 55 : currentLevel<=6 ? 65 : 75;
        //if(frameCount%spawnRate===0)createTarget();
        const maxTargets=Math.min(3+Math.floor(currentLevel/2),8);
        if(targets.filter(t=>t.active).length<maxTargets&&frameCount%Math.max(28,70-currentLevel*3)===0){
            createTarget();
        }
        if(frameCount%200===0&&obstacles.length<levelData.obstacles)createObstacle();
        if(levelData.powerups&&frameCount%240===0&&Math.random()<.7)createPowerup();
        trySpawnBoss();
        if(shieldTime>0){stroke(0,255,100,80);strokeWeight(6);noFill();rect(10,10,width-20,height-20,13);}
        if(slowTime>0){fill(0,80,200,20);noStroke();rect(0,0,width,height);}
        if(hitFlashAlpha>0){noStroke();fill(255,195,0,hitFlashAlpha*.55);rect(-10,-10,width+20,height+20);hitFlashAlpha=max(0,hitFlashAlpha-18);}
    }
}

// ══════════════════════════════════════════
//  TARGETS
// ══════════════════════════════════════════
function createTarget(){
    let x,y,valid,attempts=0;
    do{
        x=random(60,width-60);y=random(60,height-60);valid=true;
        for(let ob of obstacles){if(dist(x,y,ob.x,ob.y)<ob.size+50){valid=false;break;}}
        for(let t of targets){if(dist(x,y,t.x,t.y)<70){valid=false;break;}}
        attempts++;
    }while(!valid&&attempts<30);
    // Level 8+ targets are smaller — forces precision
    const sizeMin=currentLevel>=8?32:45;
    const sizeMax=currentLevel>=8?55:75;
    // Gold targets more common from level 2+
    const bonusChance=currentLevel>=2?0.14:0.0;
    targets.push({x,y,vx:random(-3,3),vy:random(-3,3),size:random(sizeMin,sizeMax),phase:0,active:false,activeTime:0,maxActiveTime:random(60,120),points:Math.floor(random(2,6)),type:Math.random()<bonusChance?'bonus':'normal'});
}
function updateAndDisplayTargets(){
    const sp=slowTime>0?.3:getSpeedMultiplier();
    for(let i=targets.length-1;i>=0;i--){
        let t=targets[i];
        t.x+=t.vx*sp;t.y+=t.vy*sp;
        if(t.x<30||t.x>width-30)t.vx*=-1;if(t.y<30||t.y>height-30)t.vy*=-1;
        t.x=constrain(t.x,30,width-30);t.y=constrain(t.y,30,height-30);
        t.phase+=.08;
        const maxActive=Math.min(2+Math.floor(currentLevel/3),5);
        const currentActive=targets.filter(t=>t.active).length;
        if(!t.active&&currentActive<maxActive&&frameCount%8===0&&Math.random()<(currentLevel>=9?.18:.12)){
            t.active=true;t.activeTime=0;
        }
        if(t.active){t.activeTime++;if(t.activeTime>t.maxActiveTime)t.active=false;}
        push();translate(t.x,t.y);
        if(t.active){
            for(let r=t.size*1.5;r>0;r-=10){let a=map(r,0,t.size*1.5,255,0);stroke(t.type==='bonus'?color(255,215,0,a*.5):color(0,255,255,a*.5));strokeWeight(2);noFill();ellipse(0,0,r);}
            t.type==='bonus'?(fill(255,215,0,180),stroke(255,255,0,255)):(fill(0,255,255,150),stroke(0,255,255,255));
            strokeWeight(3);ellipse(0,0,t.size+sin(t.phase)*8);
            fill(255);textAlign(CENTER,CENTER);textSize(14);textStyle(BOLD);text(t.points,0,0);
            if(t.activeTime>t.maxActiveTime*.75){stroke(255,20,147,200);strokeWeight(4);noFill();ellipse(0,0,t.size*1.3);}
        }else{stroke(80,80,120,100);strokeWeight(2);fill(40,40,60,60);ellipse(0,0,t.size+sin(t.phase)*3);}
        pop();
    }
}

// ══════════════════════════════════════════
//  OBSTACLES
// ══════════════════════════════════════════
function createObstacle(){
    obstacles.push({x:random(40,width-40),y:random(40,height-40),vx:random(-2.5,2.5),vy:random(-2.5,2.5),size:random(35,60),phase:0,rotationSpeed:random(-.1,.1),rotation:0,pulsePhase:random(TWO_PI)});
}
function updateAndDisplayObstacles(){
    const sp=slowTime>0?.3:getSpeedMultiplier();
    for(let ob of obstacles){
        ob.x+=ob.vx*sp;ob.y+=ob.vy*sp;
        if(ob.x<25||ob.x>width-25)ob.vx*=-1;if(ob.y<25||ob.y>height-25)ob.vy*=-1;
        ob.x=constrain(ob.x,25,width-25);ob.y=constrain(ob.y,25,height-25);
        ob.phase+=.05;ob.rotation+=ob.rotationSpeed;ob.pulsePhase+=.1;
        // Proximity warning — pulses brighter when near screen center
        const distFromCenter=dist(ob.x,ob.y,width/2,height/2);
        const proximityAlpha=map(distFromCenter,0,width/2,1.8,0.6);
        push();translate(ob.x,ob.y);rotate(ob.rotation);
        for(let r=ob.size*1.2;r>0;r-=8){stroke(255,0,100,map(r,0,ob.size*1.2,200,0)*proximityAlpha);strokeWeight(2);noFill();ellipse(0,0,r);}
        fill(255,20,60,160);stroke(255,0,100,255);strokeWeight(3);
        let ps=ob.size+sin(ob.pulsePhase)*6;
        beginShape();for(let i=0;i<8;i++){let a=(i*TWO_PI)/8,r=(i%2===0)?ps/2:ps/4;vertex(cos(a)*r,sin(a)*r);}endShape(CLOSE);
        fill(255);textAlign(CENTER,CENTER);textSize(16);text("⚠",0,0);
        pop();
    }
}

// ══════════════════════════════════════════
//  POWERUPS
// ══════════════════════════════════════════
function createPowerup(){
    const types=['shield','slow','multi','points'];
    powerups.push({x:random(50,width-50),y:random(50,height-50),vx:random(-1.5,1.5),vy:random(-1.5,1.5),size:40,phase:0,type:types[Math.floor(Math.random()*types.length)],collected:false});
}
function updateAndDisplayPowerups(){
    for(let i=powerups.length-1;i>=0;i--){
        let pw=powerups[i];if(pw.collected){powerups.splice(i,1);continue;}
        pw.x+=pw.vx;pw.y+=pw.vy;
        if(pw.x<25||pw.x>width-25)pw.vx*=-1;if(pw.y<25||pw.y>height-25)pw.vy*=-1;
        pw.x=constrain(pw.x,25,width-25);pw.y=constrain(pw.y,25,height-25);
        pw.phase+=.12;
        push();translate(pw.x,pw.y);
        for(let r=pw.size*1.3;r>0;r-=6){stroke(0,255,0,map(r,0,pw.size*1.3,150,0)*.7);strokeWeight(2);noFill();ellipse(0,0,r);}
        fill(0,255,100,180);stroke(0,255,0,255);strokeWeight(3);ellipse(0,0,pw.size+sin(pw.phase)*5);
        fill(0);textAlign(CENTER,CENTER);textSize(14);textStyle(BOLD);
        text({shield:"🛡",slow:"⏰",multi:"✖",points:"💎"}[pw.type]||"?",0,0);
        pop();
    }
}

// ══════════════════════════════════════════
//  PARTICLES
// ══════════════════════════════════════════
function updateAndDisplayParticles(){
    if(particles.length>180)particles.splice(0,particles.length-180);
    for(let i=particles.length-1;i>=0;i--){
        let p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life--;p.size*=.98;
        if(p.life<=0||p.size<1){particles.splice(i,1);continue;}
        push();fill(p.r,p.g,p.b,map(p.life,0,p.maxLife,0,255));noStroke();ellipse(p.x,p.y,p.size);pop();
    }
}
function createParticles(x,y,c,count=10){
    for(let i=0;i<count;i++)particles.push({x,y,vx:random(-5,5),vy:random(-5,5),size:random(3,8),life:30,maxLife:30,r:c.r,g:c.g,b:c.b});
}

// ══════════════════════════════════════════
//  POWER-UP TIMERS
// ══════════════════════════════════════════
function updatePowerUps(){
    if(shieldTime>0)shieldTime--;
    if(slowTime>0)slowTime--;
    if(multiTime>0)multiTime--;
    const badges=document.getElementById('hudPowerBadges');
    if(!badges)return;
    let html='';
    if(shieldTime>0)html+=`<span class="power-badge">🛡${Math.ceil(shieldTime/60)}s</span>`;
    if(slowTime>0)html+=`<span class="power-badge">⏰${Math.ceil(slowTime/60)}s</span>`;
    if(multiTime>0)html+=`<span class="power-badge">✖${Math.ceil(multiTime/60)}s</span>`;
    badges.innerHTML=html;
}

// ══════════════════════════════════════════
//  INPUT
// ══════════════════════════════════════════
function mousePressed(){
    if(gameState==='preplay')return false;
    if(isPaused)return false;
    if(gameState!=='playing')return false;
    if(performance.now()-lastInputTS<150)return false;
    lastInputTS=performance.now();
    handleInput(mouseX,mouseY);return false;
}

function touchStarted(){
    if(gameState==='preplay')return false;
    if(isPaused)return false;
    if(gameState!=='playing')return;
    if(!p5Canvas)return;
    lastInputTS=performance.now();
    handleInput(mouseX,mouseY);
    return false;
}

function beginFromPrePlay(){
    if(gameState!=='preplay')return;
    hidePrePlay();
    gameState='playing';
    switchMusicTo('gameplay');
    // Start the actual timer now
    gameStartTime=Date.now();
    gameDuration=levelData.time*1000;
    let lastBeepSecond=-1;
    clearInterval(gameTimer);
    gameTimer=setInterval(()=>{
        if(gameState!=='playing')return;
        const elapsed=Date.now()-gameStartTime;
        timeLeft=Math.max(0,Math.ceil((gameDuration-elapsed)/1000));
        document.getElementById('timeLeft').textContent=timeLeft;
        updatePanicMode();
        if(timeLeft<=5&&timeLeft>0&&timeLeft!==lastBeepSecond){
            lastBeepSecond=timeLeft;
            playSound('countdown');
        }
        if(elapsed>=gameDuration)endGame();
    },250);
}

function handleInput(tx,ty){
    if(inputLock)return;
    inputLock=true;setTimeout(()=>{inputLock=false;},150);
    totalClicks++;let hit=false;
    if(hitBoss(tx,ty)){hit=true;}
    if(!hit){
        for(let i=targets.length-1;i>=0;i--){
            let t=targets[i];
            if(dist(tx,ty,t.x,t.y)<t.size/2&&t.active){
                let pts=t.points;
                if(t.activeTime>t.maxActiveTime*.75){pts*=2;triggerVibration('perfect');}
                else if(t.type==='bonus'){pts*=3;triggerVibration('bonus');}
                else triggerVibration('hit');
                if(multiTime>0)pts*=2;
                score+=pts*combo;successfulHits++;onSuccessfulHit();
                combo=(millis()-lastHitTime<1800)?Math.min(combo+1,8):1;
                lastHitTime=millis();
                createParticles(t.x,t.y,{r:0,g:255,b:255},15);
                shakeDuration=2; hitFlashAlpha=40;
                playSound(t.type==='bonus'?'bonus':t.activeTime>t.maxActiveTime*.75?'perfect':'hit');
                updateDisplay();targets.splice(i,1);createTarget();hit=true;break;
            }
        }
    }
    if(!hit){
        for(let i=powerups.length-1;i>=0;i--){
            let pw=powerups[i];
            if(dist(tx,ty,pw.x,pw.y)<pw.size/2){
                activatePowerup(pw.type);triggerVibration('powerup');playSound('powerup');
                createParticles(pw.x,pw.y,{r:0,g:255,b:0},12);
                powerups.splice(i,1);hit=true;break;
            }
        }
    }
    if(!hit&&shieldTime<=0){
        for(let ob of obstacles){
            if(dist(tx,ty,ob.x,ob.y)<ob.size/3.2){
                lives--;
                combo=Math.max(1,Math.floor(combo/2));
                if(currentStreak>5)currentStreak=Math.floor(currentStreak/2);
                else breakStreak();
                triggerVibration('obstacle');
                createParticles(ob.x,ob.y,{r:255,g:0,b:100},20);
                shakeDuration=7;
                playSound('obstacle');
                updateDisplay();if(lives<=0)endGame();hit=true;break;
            }
        }
    }
    if(!hit){combo=1;breakStreak();playSound('miss');updateDisplay();}
}
function activatePowerup(type){
    ({shield:()=>shieldTime=360,slow:()=>slowTime=300,multi:()=>multiTime=240,points:()=>score+=10}[type]||(() =>{}))();
    updateDisplay();
}
function updateDisplay(){
    document.getElementById('scoreCount').textContent=score.toLocaleString();
    document.getElementById('comboCount').textContent=combo;
    const lEl=document.getElementById('livesCount');
    if(lEl)lEl.textContent='❤️'.repeat(Math.max(0,lives))+'🖤'.repeat(Math.max(0,3-lives));
    document.getElementById('streakCount').textContent=currentStreak;

    // Progress bar — shows % toward level target
    const pct=Math.min((score/levelData.target)*100,100);
    const bar=document.getElementById('progressBar');
    if(bar)bar.style.width=pct+'%';

    // Turn bar red in panic
    const pbw=document.getElementById('progressBarWrap');
    if(pbw){
        if(isPanic)pbw.classList.add('panic');
        else pbw.classList.remove('panic');
    }

    // Level badge
    const lvBadge=document.getElementById('hudLevel');
    if(lvBadge)lvBadge.textContent=`LV ${currentLevel}`;
}

// ══════════════════════════════════════════
//  GAME FLOW
// ══════════════════════════════════════════
function showPrePlay(){
    const el=document.getElementById('prePlayOverlay');if(!el)return;
    const badge=document.getElementById('ppDiffBadge');
    if(badge)badge.textContent=`LEVEL ${currentLevel} — ${levelData.note}`;

    // Only show rows relevant to this level — prevents overflow/overlap
    const rows=document.querySelectorAll('.pp-row');
    // index: 0=targets, 1=gold, 2=hazards, 3=streak, 4=boss, 5=powerups
    const show=[
        true,                        // targets — always
        currentLevel>=2,             // gold
        currentLevel>=3,             // hazards
        currentLevel>=3,             // streak (show once obstacles are in play)
        currentLevel>=5,             // boss
        currentLevel>=4,             // power-ups
    ];
    rows.forEach((r,i)=>{r.style.display=show[i]?'flex':'none';});

    el.classList.add('show');    if(!el._patched){
        el._patched=true;
        el.addEventListener('touchstart',function(e){
            if(gameState==='preplay'){e.stopPropagation();beginFromPrePlay();}
        },{passive:true,capture:true});
        el.addEventListener('click',function(e){
            if(gameState==='preplay'){e.stopPropagation();beginFromPrePlay();}
        },{capture:true});
    }
}

function hidePrePlay(){
    const el=document.getElementById('prePlayOverlay');
    if(!el)return;
    el.classList.remove('show');
}

// Wire music button
document.addEventListener('DOMContentLoaded',()=>{
    musicBtn=document.getElementById('musicToggleBtn');
    loadProgress();
    updatePersonalBestDisplay();
    renderLevelPills();
    updateStartButton();
    runIntroLoader();
    setTimeout(()=>switchMusicTo('landing'),2800);
});

function replayLevel(lv){
    if(startLock||gameState==='playing')return;
    startLock=true;setTimeout(()=>{startLock=false;},600);
    currentLevel=lv;
    totalLevelScore=0;
    bestStreak=0;
    loadLevel(currentLevel);
}

function updateStartButton(){
    const highest=Math.min(Math.max(...[...clearedLevels,0])+1,LEVELS.length);
    const btn=document.querySelector('.breach-btn');
    if(!btn)return;
    if(highest>1){
        btn.innerHTML=`⚡ CONTINUE — LEVEL ${highest}`;
    } else {
        btn.innerHTML=`⚡ BREACH THE SYSTEM`;
    }
}

function renderLevelPills(){
    const grid=document.getElementById('levelPillGrid');
    if(!grid)return;
    grid.innerHTML='';
    LEVELS.forEach((lv,i)=>{
        const pill=document.createElement('div');
        pill.className='level-pill'+(clearedLevels.has(lv.lv)?' cleared':'');
        pill.innerHTML=`<div class="level-pill-num">${lv.lv}</div>
            <div class="level-pill-check">✓</div>`;
        pill.addEventListener('click',()=>previewLevel(lv.lv));
        pill.addEventListener('touchstart',()=>previewLevel(lv.lv),{passive:true});
        grid.appendChild(pill);
    });
}

function previewLevel(lv){
    playSound('select');
    const data=LEVELS[lv-1];
    const isCleared=clearedLevels.has(lv);
    const isNext=lv===Math.min(Math.max(...[...clearedLevels,0])+1,LEVELS.length);

    let replayBtn='';
    if(isCleared){
        replayBtn=`<button onclick="replayLevel(${lv})"
            style="margin-top:8px;width:100%;padding:8px;
            background:rgba(0,255,136,0.08);
            border:1px solid rgba(0,255,136,0.35);
            color:rgba(0,255,180,0.85);
            font-size:9px;font-weight:900;letter-spacing:2px;
            font-family:'Orbitron',monospace;
            cursor:pointer;border-radius:10px;
            touch-action:manipulation;-webkit-tap-highlight-color:transparent;">
            ↩ REPLAY LEVEL ${lv}
        </button>`;
    } else if(isNext){
        replayBtn=`<button onclick="startGame()"
            style="margin-top:8px;width:100%;padding:8px;
            background:rgba(255,215,0,0.08);
            border:1px solid rgba(255,215,0,0.35);
            color:rgba(255,215,0,0.85);
            font-size:9px;font-weight:900;letter-spacing:2px;
            font-family:'Orbitron',monospace;
            cursor:pointer;border-radius:10px;
            touch-action:manipulation;-webkit-tap-highlight-color:transparent;">
            ⚡ START FROM HERE
        </button>`;
    }

    document.getElementById('difficultyDesc').innerHTML=
        `<strong style="color:rgba(255,215,0,0.8);">LEVEL ${lv}:</strong> ${data.note}<br>
        <span style="font-size:9px;opacity:0.55;">
            ${data.time}s · Target: ${data.target.toLocaleString()} pts ·
            ${data.obstacles} obstacle${data.obstacles!==1?'s':''}
            ${data.boss?' · Boss':''}${data.powerups?' · Power-ups':''}
        </span>
        ${replayBtn}`;

    document.querySelectorAll('.level-pill').forEach((p,i)=>{
        p.classList.toggle('selected-preview', i===lv-1);
    });
}

let startLock=false;

// Call this when starting fresh from level 1 (from start screen)
function startGame(){
    if(startLock||gameState==='playing')return;
    startLock=true;setTimeout(()=>{startLock=false;},600);
    // Resume from highest unlocked level
    const highest=Math.min(Math.max(...[...clearedLevels,0])+1,LEVELS.length);
    currentLevel=highest;
    totalLevelScore=0;
    bestStreak=0;
    totalClicksAllLevels=0;
    totalHitsAllLevels=0;
    totalStreakAllLevels=0;
    levelsCompleted=0;
    loadLevel(currentLevel);
}

// Call this to initialise any level (fresh or after level complete)
function loadLevel(lv){
    levelData=LEVELS[lv-1];

    gameState='playing';
    score=0;
        // If we are starting from a saved progress, make sure totalLevelScore is restored
    if (totalLevelScore === 0) {
        const raw = localStorage.getItem('digitalBreakV21_progress');
        if (raw) {
            const data = JSON.parse(raw);
            if (data.totalLevelScore) {
                totalLevelScore = data.totalLevelScore;
            }
        }
    }

    timeLeft=levelData.time;
    combo=1;lives=3;totalClicks=0;successfulHits=0;
    shieldTime=0;slowTime=0;multiTime=0;
    currentStreak=0;
    bossTarget=null;isPanic=false;
    targets=[];obstacles=[];powerups=[];particles=[];

    // Spawn initial targets
    for(let i=0;i<5;i++)createTarget();
    // Spawn obstacles according to level config
    for(let i=0;i<levelData.obstacles;i++)createObstacle();

    // Hide all popups
    document.getElementById('startPopup').style.display='none';
    document.getElementById('startBorderWrap').style.display='none';
    document.getElementById('losePopup').style.display='none';
    const wo=document.getElementById('winOverlay');wo.style.display='none';wo.scrollTop=0;
    // Hide level complete screen if visible
    const lc=document.getElementById('levelCompleteOverlay');
    if(lc)lc.style.display='none';

    if(p5Canvas)p5Canvas.style.pointerEvents='auto';

    document.getElementById('gameHUD').classList.add('active');
    document.getElementById('gameSubHUD').classList.add('active');
    const pb=document.getElementById('progressBarWrap');
    if(pb){pb.style.display='block';pb.classList.remove('panic');}
    document.getElementById('progressBar').style.width='0%';
    document.getElementById('gameContainer').classList.remove('panic');
    document.getElementById('gameHUD').classList.remove('panic');
    document.getElementById('timeLeft').classList.remove('panic');

    // Show level badge in sub-HUD (we'll add the element in Part 5)
    const lvBadge=document.getElementById('hudLevel');
    if(lvBadge)lvBadge.textContent=`LV ${lv}`;
    
    gameState='preplay';
    showPrePlay();

    switchMusicTo('preplay');

    updateDisplay();
    document.getElementById('timeLeft').textContent=timeLeft;
    clearInterval(gameTimer);
}

function endGame(){
    gameState='end';
    clearInterval(gameTimer);
    shakeDuration=8;
    hitFlashAlpha=120;
    if(countdownInterval)clearInterval(countdownInterval);
    if(bossAlertTimer)clearTimeout(bossAlertTimer);

    isPanic=false;
    document.getElementById('gameContainer').classList.remove('panic');
    document.getElementById('timeLeft').classList.remove('panic');
    document.getElementById('gameHUD').classList.remove('active');
    document.getElementById('gameSubHUD').classList.remove('active');
    const pbw=document.getElementById('progressBarWrap');
    if(pbw)pbw.style.display='none';
    if(p5Canvas)p5Canvas.style.pointerEvents='none';

    const acc=totalClicks>0?Math.round((successfulHits/totalClicks)*100):0;
    const passed=score>=levelData.target;

    gtag('event','level_end',{
        level:currentLevel,
        score,
        result:passed?'pass':'fail',
        best_streak:bestStreak
    });

        if(passed){
            totalLevelScore += score;
            clearedLevels.add(currentLevel);
            saveProgress(); // Saves total score and cleared levels

            updatePersonalBestDisplay();
            
            // 1. Save Level-Specific High Score
            const levelPB = getPersonalBest(currentLevel);
            if(score > levelPB) {
                savePersonalBest(score, currentLevel);
            }

            // 2. Real-time Online Leaderboard Update
            const playerName = localStorage.getItem('digitalBreak_playerName') || "PLAYER";
            submitOnlineScore(playerName, totalLevelScore, currentLevel, bestStreak, acc);

            if(currentLevel >= LEVELS.length){
                runHackLoader(()=>showEpicGameComplete(totalLevelScore, totalClicks, successfulHits));
            } else {
                showLevelComplete(currentLevel, score, acc);
            }
        }
    
    else {
        // ── FAILED — retry same level
        const shortfall=levelData.target-score;
        const msgs=[
            `${shortfall} more points needed. So close.`,
            `The system held. ${shortfall} points short.`,
            `LOL. ${shortfall} pts away. Try again.`,
            `Level ${currentLevel} says no. Need ${shortfall} more.`,
        ];
        document.getElementById('loseMessage').textContent=
            roasts[Math.floor(Math.random()*roasts.length)];
        document.getElementById('loseScore').textContent=
            `${score.toLocaleString()} / ${levelData.target.toLocaleString()} pts needed`;
        document.getElementById('loseAccuracy').textContent=
            `Accuracy: ${acc}% · ${successfulHits} hits / ${totalClicks} taps`;
        const llEl=document.getElementById('loseLevelNum');
        if(llEl)llEl.textContent=currentLevel;

        // Level tip
        const tips=[
            `Tap targets just before they fade for a 2x bonus.`,
            `Gold targets are worth 3x — always prioritise them.`,
            `Your combo resets when you miss. Stay accurate.`,
            `Power-ups can save you — grab the green circles first.`,
            `Every 10 hits in a row earns a streak bonus.`,
            `Speed increases as time runs out — stay calm.`,
            `Hit the boss 3 times to slay it and earn massive points.`,
            `Shield power-up blocks obstacle damage completely.`,
            `Slow-Mo power-up makes everything easier for a few seconds.`,
            `Score multiplier doubles all points — grab it when low on time.`,
        ];
        const tipEl=document.getElementById('loseTip');
        if(tipEl)tipEl.textContent=`💡 TIP: ${tips[Math.floor(Math.random()*tips.length)]}`;

        document.getElementById('losePopup').style.display='block';
        document.getElementById('losePopup').scrollTop=0;
        playSound('fail');
        switchMusicTo('lose');
    }
}

function retryLevel(){
    if(restartLock)return;
    restartLock=true;setTimeout(()=>{restartLock=false;},600);
    document.getElementById('losePopup').style.display='none';
    loadLevel(currentLevel);
}
let restartLock=false;
function restartGame(){
    if(restartLock)return;
    restartLock=true;setTimeout(()=>{restartLock=false;},600);

    // Full reset back to level 1 and start screen
    currentLevel=1;
    levelData=LEVELS[0];
    totalLevelScore=0;
    gameState='start';
    hidePrePlay();
    switchMusicTo('landing');
    targets=[];obstacles=[];powerups=[];particles=[];
    bossTarget=null;isPanic=false;currentStreak=0;bestStreak=0;
    if(countdownInterval)clearInterval(countdownInterval);
    if(bossAlertTimer)clearTimeout(bossAlertTimer);

    const wo=document.getElementById('winOverlay');wo.style.display='none';wo.scrollTop=0;
    const lc=document.getElementById('levelCompleteOverlay');if(lc)lc.style.display='none';
    document.getElementById('losePopup').style.display='none';
    document.getElementById('startPopup').style.display='block';
    document.getElementById('startBorderWrap').style.display='block';
    updateStartButton();
    renderLevelPills();
    try{localStorage.removeItem(LEADERBOARD_KEY);}catch{}
    document.getElementById('confettiCanvas').style.display='none';
    document.getElementById('gameContainer').classList.remove('panic');
    document.getElementById('streakToast').classList.remove('show');
    document.getElementById('bossAlert').classList.remove('show');
    if(confettiAnimId){cancelAnimationFrame(confettiAnimId);confettiAnimId=null;}
}

