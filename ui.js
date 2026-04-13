
// ══════════════════════════════════════════
//  LEADERBOARD
// ══════════════════════════════════════════

function clearProgress(){
    try{localStorage.removeItem(PROGRESS_KEY);}catch{}
    clearedLevels=new Set();
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
function updatePersonalBestDisplay(){
    const pb = getPersonalBest();
    // Use the global totalLevelScore from game.js
    const total = (typeof totalLevelScore !== 'undefined') ? totalLevelScore : 0; 
    
    const pbEl = document.getElementById('pbDisplay');
    const totalEl = document.getElementById('totalScoreDisplay'); 
    const hud = document.getElementById('personalBestHUD');
    
    if(pbEl) pbEl.textContent = pb.toLocaleString();
    if(totalEl) totalEl.textContent = total.toLocaleString();
    if(hud) hud.textContent = pb.toLocaleString();
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

function renderLeaderboard(rows, playerScore) {
    const container = document.getElementById('leaderboardRows');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!rows || rows.length === 0) {
        container.innerHTML = `<div style="font-size:10px;color:rgba(255,255,255,0.2);text-align:center;padding:20px;">NO DATA BREACHED YET...</div>`;
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const myName = localStorage.getItem('digitalBreak_playerName');

    rows.forEach((e, i) => {
        const isMe = e.player_name === myName;
        const row = document.createElement('div');
        row.className = 'lb-row' + (isMe ? ' new-entry' : '');
        row.style.animationDelay = `${i * 0.07}s`;
        
        const levelText = e.level_reached === "SURVIVAL" ? "SURVIVAL" : `LV ${e.level_reached}`;

        row.innerHTML = `
            <span class="lb-rank">${i < 3 ? medals[i] : '#' + (i + 1)}</span>
            <span class="lb-name" style="color: ${isMe ? '#ffd700' : '#00ffff'}">${isMe ? '⚡ YOU' : e.player_name}</span>
            <span class="lb-score">${e.score.toLocaleString()}</span>
            <span class="lb-diff" style="font-size: 8px; opacity: 0.6;">${levelText}</span>
        `;
        container.appendChild(row);
    });
}

// ══════════════════════════════════════════
//  ROASTS
// ══════════════════════════════════════════

function getSavageRoast(sc,target){
    if(sc>=target*1.5)return"Okay fine. That was actually kinda impressive.";
    if(sc>=target*1.25)return"Not bad. Not good either. But... not bad.";
    return roasts[Math.floor(Math.random()*roasts.length)];
}



function renderLevelPills() {
    const container = document.getElementById('levelGrid');
    if (!container) return;
    
    container.innerHTML = '';

    // Use the LEVELS array defined at the top of your game.js
    LEVELS.forEach(l => {
        // Calculate if unlocked based on clearedLevels
        const isUnlocked = l.lv <= (Math.max(...[...clearedLevels, 0]) + 1);
        const isCleared = clearedLevels.has(l.lv);
        
        const pill = document.createElement('div');
        pill.className = `level-pill ${isUnlocked ? 'unlocked' : 'locked'} ${isCleared ? 'cleared' : ''}`;
        
        // Add the level number
        pill.innerHTML = `<span>${l.lv}</span>`;
        
        // Only allow clicking if unlocked
        if (isUnlocked) {
            pill.onclick = () => {
                if(typeof playSound === 'function') playSound('click');
                loadLevel(l.lv);
            };
        }
        
        container.appendChild(pill);
    });
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
    //promptPlayerName(name=>{
        //submitOnlineScore(name, finalScore, lvReached, avgStreak, avgAcc);
       // renderOnlineLeaderboard('epicLbRows', finalScore);
   // });
    startConfetti();
    switchMusicTo('win');
    playSound('newbest');

    // Fix the shareConfirm reference — point to the one inside epic overlay
    setTimeout(()=>{
        const eb=el.querySelector('#shareConfirm');
        if(eb)eb.id='shareConfirmEpic';
    },100);
}

// Ensure levels render as soon as the window finishes loading
window.addEventListener('load', () => {
    if (typeof renderLevelPills === 'function') {
        renderLevelPills();
        updatePersonalBestDisplay();
    }
});


