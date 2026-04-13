// ══════════════════════════════════════════
//  SOUND EFFECTS
// ══════════════════════════════════════════
let sfxCtx=null;
function getSfxCtx(){
    if(!sfxCtx)sfxCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(sfxCtx.state==='suspended')sfxCtx.resume();
    return sfxCtx;
}
function playSound(type){
    try{
        const ctx=getSfxCtx();
        if(ctx.state==='suspended')ctx.resume();
        const t=ctx.currentTime;
        const sounds={
            hit:()=>{
                // Satisfying cyan blip
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='sine';
                o.frequency.setValueAtTime(520,t);
                o.frequency.exponentialRampToValueAtTime(820,t+0.06);
                g.gain.setValueAtTime(0.18,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.15);
            },
            bonus:()=>{
                // Double blip — gold target
                [0,0.08].forEach((delay,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='sine';
                    o.frequency.setValueAtTime(660+i*220,t+delay);
                    g.gain.setValueAtTime(0.2,t+delay);
                    g.gain.exponentialRampToValueAtTime(0.001,t+delay+0.1);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+delay);o.stop(t+delay+0.12);
                });
            },
            perfect:()=>{
                // Rising chime — late hit bonus
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='triangle';
                o.frequency.setValueAtTime(440,t);
                o.frequency.exponentialRampToValueAtTime(1200,t+0.15);
                g.gain.setValueAtTime(0.22,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.2);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.22);
            },
            miss:()=>{
                // Short low thud
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='sine';
                o.frequency.setValueAtTime(180,t);
                o.frequency.exponentialRampToValueAtTime(60,t+0.08);
                g.gain.setValueAtTime(0.15,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.12);
            },
            obstacle:()=>{
                // Harsh buzz
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='sawtooth';
                o.frequency.setValueAtTime(120,t);
                o.frequency.exponentialRampToValueAtTime(40,t+0.18);
                g.gain.setValueAtTime(0.25,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.25);
            },
            powerup:()=>{
                // Ascending sweep
                [0,0.07,0.14,0.21].forEach((delay,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='sine';
                    o.frequency.setValueAtTime(400+i*150,t+delay);
                    g.gain.setValueAtTime(0.14,t+delay);
                    g.gain.exponentialRampToValueAtTime(0.001,t+delay+0.08);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+delay);o.stop(t+delay+0.1);
                });
            },
            streak:()=>{
                // Fanfare chord
                [523,659,784].forEach((freq,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='triangle';
                    o.frequency.setValueAtTime(freq,t+i*0.04);
                    g.gain.setValueAtTime(0.18,t+i*0.04);
                    g.gain.exponentialRampToValueAtTime(0.001,t+i*0.04+0.25);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+i*0.04);o.stop(t+i*0.04+0.28);
                });
            },
            boss:()=>{
                // Deep dramatic hit
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='sawtooth';
                o.frequency.setValueAtTime(220,t);
                o.frequency.exponentialRampToValueAtTime(55,t+0.3);
                g.gain.setValueAtTime(0.3,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.38);
            },
            countdown:()=>{
                // Single tick beep for last 5 seconds
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='square';
                o.frequency.setValueAtTime(880,t);
                g.gain.setValueAtTime(0.12,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.08);
            },
            newbest:()=>{
                // Victory fanfare
                [523,659,784,1047].forEach((freq,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='triangle';
                    o.frequency.setValueAtTime(freq,t+i*0.08);
                    g.gain.setValueAtTime(0.2,t+i*0.08);
                    g.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.3);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+i*0.08);o.stop(t+i*0.08+0.32);
                });
            },
            levelcomplete:()=>{
                // Ascending celebration — 6 note flourish
                [523,659,784,880,1047,1319].forEach((freq,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='triangle';
                    o.frequency.setValueAtTime(freq,t+i*0.1);
                    o.frequency.exponentialRampToValueAtTime(freq*1.02,t+i*0.1+0.18);
                    g.gain.setValueAtTime(0,t+i*0.1);
                    g.gain.linearRampToValueAtTime(0.22,t+i*0.1+0.02);
                    g.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.35);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+i*0.1);o.stop(t+i*0.1+0.38);
                });
                // Warm chord underneath
                [261.6,329.6,392,523].forEach((freq,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='sine';
                    o.frequency.value=freq;
                    g.gain.setValueAtTime(0,t);
                    g.gain.linearRampToValueAtTime(0.1,t+0.05);
                    g.gain.exponentialRampToValueAtTime(0.001,t+1.2);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t);o.stop(t+1.3);
                });
            },
            select:()=>{
                // Soft click — level pill tap
                const o=ctx.createOscillator();
                const g=ctx.createGain();
                o.type='sine';
                o.frequency.setValueAtTime(440,t);
                o.frequency.exponentialRampToValueAtTime(560,t+0.06);
                g.gain.setValueAtTime(0.12,t);
                g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.12);
            },
            breach:()=>{
                // Sharp crack — white noise burst
                const crack=ctx.createBufferSource();
                const crackBuf=ctx.createBuffer(1,ctx.sampleRate*0.12,ctx.sampleRate);
                const cd=crackBuf.getChannelData(0);
                for(let i=0;i<cd.length;i++)cd[i]=(Math.random()*2-1);
                crack.buffer=crackBuf;
                const crackF=ctx.createBiquadFilter();
                crackF.type='highpass';crackF.frequency.value=1800;
                const crackG=ctx.createGain();
                crackG.gain.setValueAtTime(1.2,t);
                crackG.gain.exponentialRampToValueAtTime(0.0001,t+0.1);
                crack.connect(crackF);crackF.connect(crackG);crackG.connect(ctx.destination);
                crack.start(t);

                // Thunder rumble — low noise decay
                const rumble=ctx.createBufferSource();
                const rumbleBuf=ctx.createBuffer(1,ctx.sampleRate*1.8,ctx.sampleRate);
                const rd=rumbleBuf.getChannelData(0);
                for(let i=0;i<rd.length;i++)rd[i]=(Math.random()*2-1);
                rumble.buffer=rumbleBuf;
                const rumbleF=ctx.createBiquadFilter();
                rumbleF.type='lowpass';rumbleF.frequency.value=180;
                rumbleF.Q.value=2;
                const rumbleG=ctx.createGain();
                rumbleG.gain.setValueAtTime(0.7,t+0.04);
                rumbleG.gain.exponentialRampToValueAtTime(0.0001,t+1.8);
                rumble.connect(rumbleF);rumbleF.connect(rumbleG);rumbleG.connect(ctx.destination);
                rumble.start(t+0.04);

                // Electric zap — pitched sine drop
                const zap=ctx.createOscillator();
                const zapG=ctx.createGain();
                zap.type='sawtooth';
                zap.frequency.setValueAtTime(280,t);
                zap.frequency.exponentialRampToValueAtTime(28,t+0.35);
                zapG.gain.setValueAtTime(0.55,t);
                zapG.gain.exponentialRampToValueAtTime(0.0001,t+0.38);
                zap.connect(zapG);zapG.connect(ctx.destination);
                zap.start(t);zap.stop(t+0.4);
            },
            fail:()=>{
                [300,200,120,60].forEach((freq,i)=>{
                    const o=ctx.createOscillator();
                    const g=ctx.createGain();
                    o.type='sawtooth';
                    o.frequency.setValueAtTime(freq,t+i*0.12);
                    o.frequency.exponentialRampToValueAtTime(freq*0.5,t+i*0.12+0.18);
                    g.gain.setValueAtTime(0.2,t+i*0.12);
                    g.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.22);
                    o.connect(g);g.connect(ctx.destination);
                    o.start(t+i*0.12);o.stop(t+i*0.12+0.25);
                });
            },
            lightning:()=>{
                const noise=ctx.createBufferSource();
                const nf=ac.createBiquadFilter();
                nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=0.4;
                const ng=ac.createGain();
                noise.buffer=getCachedNoise(ctx,0.18);
                ng.gain.setValueAtTime(0,t);
                ng.gain.linearRampToValueAtTime(0.6,t+0.004);
                ng.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
                noise.connect(nf);nf.connect(ng);ng.connect(ctx.destination);
                noise.start(t);
                const o=ac.createOscillator();
                const g=ac.createGain();
                o.type='sine';
                o.frequency.setValueAtTime(120,t);
                o.frequency.exponentialRampToValueAtTime(28,t+0.14);
                g.gain.setValueAtTime(0.5,t);
                g.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
                o.connect(g);g.connect(ctx.destination);
                o.start(t);o.stop(t+0.2);
                const c=ctx.createBufferSource();
                const cf=ac.createBiquadFilter();
                cf.type='highpass';cf.frequency.value=8000;
                const cg=ac.createGain();
                c.buffer=getCachedNoise(ctx,0.08);
                cg.gain.setValueAtTime(0.35,t+0.01);
                cg.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
                c.connect(cf);cf.connect(cg);cg.connect(ctx.destination);
                c.start(t+0.01);
            },
            thunder:()=>{
                const noise=ctx.createBufferSource();
                const nf1=ac.createBiquadFilter();
                nf1.type='lowpass';nf1.frequency.value=180;
                const nf2=ac.createBiquadFilter();
                nf2.type='peaking';nf2.frequency.value=80;nf2.gain.value=12;
                const ng=ac.createGain();
                noise.buffer=getCachedNoise(ctx,2.2);
                ng.gain.setValueAtTime(0,t);
                ng.gain.linearRampToValueAtTime(0.7,t+0.08);
                ng.gain.setValueAtTime(0.7,t+0.3);
                ng.gain.exponentialRampToValueAtTime(0.0001,t+2.0);
                noise.connect(nf1);nf1.connect(nf2);nf2.connect(ng);ng.connect(ctx.destination);
                noise.start(t);
                const o=ac.createOscillator();
                const og=ac.createGain();
                o.type='sine';
                o.frequency.setValueAtTime(55,t);
                o.frequency.exponentialRampToValueAtTime(28,t+1.8);
                og.gain.setValueAtTime(0,t);
                og.gain.linearRampToValueAtTime(0.4,t+0.1);
                og.gain.exponentialRampToValueAtTime(0.0001,t+1.8);
                o.connect(og);og.connect(ctx.destination);
                o.start(t);o.stop(t+2.0);
                const o2=ac.createOscillator();
                const og2=ac.createGain();
                o2.type='sawtooth';
                o2.frequency.setValueAtTime(38,t);
                o2.frequency.exponentialRampToValueAtTime(22,t+1.2);
                og2.gain.setValueAtTime(0,t);
                og2.gain.linearRampToValueAtTime(0.18,t+0.06);
                og2.gain.exponentialRampToValueAtTime(0.0001,t+1.4);
                o2.connect(og2);og2.connect(ctx.destination);
                o2.start(t);o2.stop(t+1.5);
            },
        };
        (sounds[type]||sounds.hit)();
    }catch{}
}


// ══════════════════════════════════════════
//  MULTI-SCENE MUSIC ENGINE
// ══════════════════════════════════════════
let musicAC=null;
let activeScene=null;
let activeSceneStop=null;
let activeMaster=null;
let activeNodes=[];
let musicEnabled=false;
let musicBtn=null;
let musicToggleLock=false;
const XFADE=0.7; // crossfade duration seconds

function getMusicAC(){
    if(!musicAC||musicAC.state==='closed')
        musicAC=new(window.AudioContext||window.webkitAudioContext)();
    if(musicAC.state==='suspended')musicAC.resume();
    return musicAC;
}

function makeReverb(ac,dur=2.0,decay=2.2){
    const rev=ac.createConvolver();
    const len=ac.sampleRate*dur;
    const buf=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){
        const d=buf.getChannelData(c);
        for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);
    }
    rev.buffer=buf; return rev;
}

function makeDelay(ac,time,fb){
    const d=ac.createDelay(1.0);
    const f=ac.createGain();
    d.delayTime.value=time; f.gain.value=fb;
    d.connect(f); f.connect(d); return d;
}

const _noiseCache={};
function getCachedNoise(ac,dur){
    const key=Math.round(dur*1000);
    if(_noiseCache[key])return _noiseCache[key];
    const buf=ac.createBuffer(1,Math.ceil(ac.sampleRate*dur),ac.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    _noiseCache[key]=buf;return buf;
}

// ── SCENE REGISTRY
const SCENES={

    landing(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        master.connect(dest);
        const rev=makeReverb(ac,3.5,1.6);
        const revG=ac.createGain();revG.gain.value=0.5;
        rev.connect(revG);revG.connect(master);
        nodes.push(master,rev,revG);

        const mel=[220,261.6,293.7,329.6,392,440,392,329.6,261.6,220,246.9,293.7];
        const pads=[[55,110,164.8],[65.4,130.8,196],[49,98,146.8],[61.7,123.5,185]];
        const S=60/50;
        let step=0;

        function tick(t){
            const note=mel[step%mel.length];
            const o=ac.createOscillator();
            const g=ac.createGain();
            const f=ac.createBiquadFilter();
            f.type='lowpass';f.frequency.value=900;
            o.type='sine';o.frequency.setValueAtTime(note,t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.11,t+0.1);
            g.gain.exponentialRampToValueAtTime(0.0001,t+S*2.4);
            o.connect(f);f.connect(g);g.connect(master);
            const rg=ac.createGain();rg.gain.value=0.55;
            g.connect(rg);rg.connect(rev);
            o.start(t);o.stop(t+S*2.8);
            nodes.push(o,g,f,rg);

            if(step%4===0){
                const pi=Math.floor(step/4)%pads.length;
                pads[pi].forEach(freq=>{
                    const po=ac.createOscillator();
                    const pg=ac.createGain();
                    po.type='sine';po.frequency.value=freq;
                    pg.gain.setValueAtTime(0,t);
                    pg.gain.linearRampToValueAtTime(0.035,t+0.3);
                    pg.gain.exponentialRampToValueAtTime(0.0001,t+S*5.5);
                    po.connect(pg);pg.connect(master);
                    const prg=ac.createGain();prg.gain.value=0.38;
                    pg.connect(prg);prg.connect(rev);
                    po.start(t);po.stop(t+S*6);
                    nodes.push(po,pg,prg);
                });
            }
            step++;
            if(nodes.length>120)nodes.splice(3,nodes.length-60);
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },

    preplay(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        master.connect(dest);
        const rev=makeReverb(ac,1.2,2.0);
        const revG=ac.createGain();revG.gain.value=0.15;
        rev.connect(revG);revG.connect(master);
        nodes.push(master,rev,revG);

        const rising=[220,246.9,261.6,293.7,329.6,349.2,392,440,493.9,523.3];
        const S=60/84/2;
        let step=0;

        function tick(t){
            const prog=Math.min(step/40,1);
            const sib=step%16;
            const ni=Math.min(Math.floor(step/4),rising.length-1);
            const o=ac.createOscillator();
            const g=ac.createGain();
            const f=ac.createBiquadFilter();
            f.type='lowpass';f.frequency.value=1600+prog*1200;
            o.type='triangle';o.frequency.setValueAtTime(rising[ni],t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.09+prog*0.07,t+0.015);
            g.gain.exponentialRampToValueAtTime(0.0001,t+S*0.75);
            o.connect(f);f.connect(g);g.connect(master);
            const rg=ac.createGain();rg.gain.value=0.22;
            g.connect(rg);rg.connect(rev);
            o.start(t);o.stop(t+S*0.95);
            nodes.push(o,g,f,rg);

            if(prog>0.3&&(sib===0||sib===8)){
                const ko=ac.createOscillator();
                const kg=ac.createGain();
                ko.type='sine';
                ko.frequency.setValueAtTime(150,t);
                ko.frequency.exponentialRampToValueAtTime(40,t+0.065);
                kg.gain.setValueAtTime(0.32*prog,t);
                kg.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
                ko.connect(kg);kg.connect(master);
                ko.start(t);ko.stop(t+0.15);
                nodes.push(ko,kg);
            }

            if(prog>0.55&&step%2===0){
                const hn=ac.createBufferSource();
                const hf=ac.createBiquadFilter();hf.type='highpass';hf.frequency.value=9500;
                const hg=ac.createGain();
                hn.buffer=getCachedNoise(ac,0.022);
                hg.gain.setValueAtTime(0.028*prog,t);
                hg.gain.exponentialRampToValueAtTime(0.0001,t+0.02);
                hn.connect(hf);hf.connect(hg);hg.connect(master);
                hn.start(t);
                nodes.push(hn,hf,hg);
            }
            step++;
            if(nodes.length>120)nodes.splice(3,nodes.length-60);
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },

    gameplay(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        const comp=ac.createDynamicsCompressor();
        comp.threshold.value=-14;comp.knee.value=22;
        comp.ratio.value=3.5;comp.attack.value=0.004;comp.release.value=0.18;
        master.connect(comp);comp.connect(dest);
        const rev=makeReverb(ac,1.6,2.0);
        const revG=ac.createGain();revG.gain.value=0.10;
        rev.connect(revG);revG.connect(comp);
        const delay=makeDelay(ac,0.375,0.28);
        const delG=ac.createGain();delG.gain.value=0.32;
        delay.connect(delG);delG.connect(comp);
        nodes.push(master,comp,rev,revG,delay,delG);

        // 128bpm — 4-on-the-floor energy
        const BPM=128;
        const S=60/BPM/4; // sixteenth note

        // Melodic hook — punchy and memorable
        const HOOK=[
            880,0,880,0,1047,880,0,784,
            880,0,1047,0,1319,0,1047,880,
            784,0,784,0,880,784,0,659,
            784,0,880,1047,880,0,784,0,
        ];

        // Bassline — deep and driving
        const BASS=[
            110,0,110,110,0,110,0,138.6,
            110,0,110,0,130.8,0,110,0,
            98,0,98,98,0,98,0,110,
            98,0,110,0,130.8,110,0,98,
        ];

        // Chord stabs — every 8 steps
        const STABS=[
            [220,277.2,329.6],[196,246.9,293.7],
            [174.6,220,261.6],[196,246.9,329.6],
        ];

        // Arp — fills the upper register
        const ARP=[
            1319,1047,880,1047,1319,1047,1319,1568,
            1319,1047,880,784,880,1047,880,784,
        ];

        let step=0;

        function tick(t){
            const sib=step%32;
            const s16=step%16;

            // ── HOOK MELODY
            const note=HOOK[sib];
            if(note){
                const o1=ac.createOscillator();
                const o2=ac.createOscillator();
                const g=ac.createGain();
                const f=ac.createBiquadFilter();
                f.type='lowpass';
                f.frequency.setValueAtTime(4200,t);
                f.frequency.exponentialRampToValueAtTime(1800,t+S*0.6);
                o1.type='sine';o1.frequency.value=note;
                o2.type='triangle';o2.frequency.value=note*2.002;
                const g1=ac.createGain();g1.gain.value=0.72;
                const g2=ac.createGain();g2.gain.value=0.18;
                o1.connect(g1);o2.connect(g2);
                g1.connect(f);g2.connect(f);f.connect(g);
                g.gain.setValueAtTime(0,t);
                g.gain.linearRampToValueAtTime(0.22,t+0.008);
                g.gain.setValueAtTime(0.22,t+S*0.42);
                g.gain.exponentialRampToValueAtTime(0.0001,t+S*0.82);
                g.connect(master);
                const dg=ac.createGain();dg.gain.value=0.18;g.connect(dg);dg.connect(delay);
                const rg=ac.createGain();rg.gain.value=0.12;g.connect(rg);rg.connect(rev);
                o1.start(t);o1.stop(t+S+0.02);
                o2.start(t);o2.stop(t+S+0.02);
                nodes.push(o1,o2,g,f,g1,g2,dg,rg);
            }

            // ── ARP — upper shimmer every other step
            if(step%2===0){
                const an=ARP[s16];
                if(an){
                    const ao=ac.createOscillator();
                    const ag=ac.createGain();
                    const af=ac.createBiquadFilter();
                    af.type='bandpass';af.frequency.value=an*1.1;af.Q.value=1.2;
                    ao.type='sine';ao.frequency.value=an;
                    ag.gain.setValueAtTime(0,t);
                    ag.gain.linearRampToValueAtTime(0.055,t+0.006);
                    ag.gain.exponentialRampToValueAtTime(0.0001,t+S*0.55);
                    ao.connect(af);af.connect(ag);ag.connect(master);
                    const arg=ac.createGain();arg.gain.value=0.22;
                    ag.connect(arg);arg.connect(delay);
                    ao.start(t);ao.stop(t+S*0.7);
                    nodes.push(ao,ag,af,arg);
                }
            }

            // ── BASSLINE
            const bn=BASS[sib];
            if(bn){
                const bo=ac.createOscillator();
                const bg=ac.createGain();
                const bf=ac.createBiquadFilter();
                bf.type='lowpass';bf.frequency.value=320;
                bo.type='sine';bo.frequency.setValueAtTime(bn,t);
                bg.gain.setValueAtTime(0,t);
                bg.gain.linearRampToValueAtTime(0.38,t+0.01);
                bg.gain.setValueAtTime(0.38,t+S*0.55);
                bg.gain.exponentialRampToValueAtTime(0.0001,t+S*0.88);
                bo.connect(bf);bf.connect(bg);bg.connect(master);
                bo.start(t);bo.stop(t+S*1.0);
                nodes.push(bo,bg,bf);

                // Sub layer
                const so=ac.createOscillator();
                const sg=ac.createGain();
                so.type='sine';so.frequency.value=bn*0.5;
                sg.gain.setValueAtTime(0,t);
                sg.gain.linearRampToValueAtTime(0.22,t+0.012);
                sg.gain.exponentialRampToValueAtTime(0.0001,t+S*0.72);
                so.connect(sg);sg.connect(master);
                so.start(t);so.stop(t+S*0.85);
                nodes.push(so,sg);
            }

            // ── CHORD STABS every 8 steps
            if(sib%8===0){
                const ci=Math.floor(sib/8)%STABS.length;
                STABS[ci].forEach(freq=>{
                    const o=ac.createOscillator();
                    const g=ac.createGain();
                    const f=ac.createBiquadFilter();
                    f.type='lowpass';f.frequency.value=1800;
                    o.type='sawtooth';o.frequency.value=freq;
                    g.gain.setValueAtTime(0,t);
                    g.gain.linearRampToValueAtTime(0.055,t+0.006);
                    g.gain.setValueAtTime(0.055,t+S*1.8);
                    g.gain.exponentialRampToValueAtTime(0.0001,t+S*3.2);
                    o.connect(f);f.connect(g);g.connect(master);
                    const rg=ac.createGain();rg.gain.value=0.18;g.connect(rg);rg.connect(rev);
                    o.start(t);o.stop(t+S*3.5);
                    nodes.push(o,g,f,rg);
                });
            }

            // ── KICK — 4 on the floor
            if(sib%8===0){
                const ko=ac.createOscillator();
                const kg=ac.createGain();
                ko.type='sine';
                ko.frequency.setValueAtTime(180,t);
                ko.frequency.exponentialRampToValueAtTime(36,t+0.055);
                kg.gain.setValueAtTime(0.9,t);
                kg.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
                ko.connect(kg);kg.connect(master);
                ko.start(t);ko.stop(t+0.15);
                nodes.push(ko,kg);
            }

            // ── SNARE on 2 and 4
            if(sib===8||sib===24){
                const sn=ac.createBufferSource();
                const sf=ac.createBiquadFilter();
                sf.type='bandpass';sf.frequency.value=2200;sf.Q.value=0.7;
                const sg2=ac.createGain();
                sn.buffer=getCachedNoise(ac,0.12);
                sg2.gain.setValueAtTime(0.28,t);
                sg2.gain.exponentialRampToValueAtTime(0.0001,t+0.10);
                sn.connect(sf);sf.connect(sg2);sg2.connect(master);
                sn.start(t);
                // Snare body
                const sb=ac.createOscillator();
                const sbg=ac.createGain();
                sb.type='sine';sb.frequency.value=180;
                sbg.gain.setValueAtTime(0.18,t);
                sbg.gain.exponentialRampToValueAtTime(0.0001,t+0.06);
                sb.connect(sbg);sbg.connect(master);
                sb.start(t);sb.stop(t+0.08);
                nodes.push(sn,sf,sg2,sb,sbg);
            }

            // ── OPEN/CLOSED HI-HAT
            const isOpen=sib%16===6||sib%16===14;
            const hh=ac.createBufferSource();
            const hf=ac.createBiquadFilter();hf.type='highpass';hf.frequency.value=9800;
            const hg=ac.createGain();
            hh.buffer=getCachedNoise(ac,isOpen?0.09:0.022);
            hg.gain.setValueAtTime(isOpen?0.055:0.038,t);
            hg.gain.exponentialRampToValueAtTime(0.0001,t+(isOpen?0.082:0.018));
            hh.connect(hf);hf.connect(hg);hg.connect(master);
            hh.start(t);
            nodes.push(hh,hf,hg);

            // ── CLAP on offbeats
            if(sib===4||sib===12||sib===20||sib===28){
                const cn=ac.createBufferSource();
                const cf=ac.createBiquadFilter();
                cf.type='bandpass';cf.frequency.value=1400;cf.Q.value=1.4;
                const cg=ac.createGain();
                cn.buffer=getCachedNoise(ac,0.055);
                cg.gain.setValueAtTime(0.14,t);
                cg.gain.exponentialRampToValueAtTime(0.0001,t+0.048);
                cn.connect(cf);cf.connect(cg);cg.connect(master);
                cn.start(t);
                nodes.push(cn,cf,cg);
            }

            step++;
            if(nodes.length>200)nodes.splice(6,nodes.length-100);
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },

    panic(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        const comp=ac.createDynamicsCompressor();
        comp.threshold.value=-14;comp.ratio.value=3.5;
        comp.attack.value=0.003;comp.release.value=0.14;
        master.connect(comp);comp.connect(dest);
        nodes.push(master,comp);

        const panicMel=[659.3,587.3,523.3,493.9,523.3,587.3,523.3,493.9,
            440,493.9,523.3,587.3,659.3,784,659.3,587.3];
        const panicBass=[110,110,130.8,164.8,174.6,174.6,110,130.8];
        const S=60/118/2;
        let step=0;

        function tick(t){
            const sib=step%16;
            const note=panicMel[step%panicMel.length];
            const o=ac.createOscillator();
            const g=ac.createGain();
            const f=ac.createBiquadFilter();
            f.type='lowpass';f.frequency.value=3600;
            o.type='sawtooth';o.frequency.setValueAtTime(note,t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.14,t+0.01);
            g.gain.exponentialRampToValueAtTime(0.0001,t+S*0.68);
            o.connect(f);f.connect(g);g.connect(master);
            o.start(t);o.stop(t+S*0.82);
            nodes.push(o,g,f);

            if(step%2===0){
                const bi=Math.floor(step/2)%panicBass.length;
                const bo=ac.createOscillator();
                const bg=ac.createGain();
                const bf=ac.createBiquadFilter();
                bf.type='lowpass';bf.frequency.value=360;
                bo.type='sine';bo.frequency.value=panicBass[bi];
                bg.gain.setValueAtTime(0,t);
                bg.gain.linearRampToValueAtTime(0.18,t+0.014);
                bg.gain.exponentialRampToValueAtTime(0.0001,t+S*1.0);
                bo.connect(bf);bf.connect(bg);bg.connect(master);
                bo.start(t);bo.stop(t+S*1.1);
                nodes.push(bo,bg,bf);
            }

            if(sib===0||sib===4||sib===8||sib===12){
                const ko=ac.createOscillator();
                const kg=ac.createGain();
                ko.type='sine';
                ko.frequency.setValueAtTime(158,t);
                ko.frequency.exponentialRampToValueAtTime(38,t+0.058);
                kg.gain.setValueAtTime(0.58,t);
                kg.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
                ko.connect(kg);kg.connect(master);
                ko.start(t);ko.stop(t+0.15);
                nodes.push(ko,kg);
            }

            if(sib===4||sib===12){
                const sn=ac.createBufferSource();
                const sf=ac.createBiquadFilter();
                sf.type='bandpass';sf.frequency.value=2400;sf.Q.value=0.65;
                const sg=ac.createGain();
                sn.buffer=getCachedNoise(ac,0.075);
                sg.gain.setValueAtTime(0.16,t);
                sg.gain.exponentialRampToValueAtTime(0.0001,t+0.068);
                sn.connect(sf);sf.connect(sg);sg.connect(master);
                sn.start(t);
                nodes.push(sn,sf,sg);
            }

            const hh=ac.createBufferSource();
            const hf=ac.createBiquadFilter();hf.type='highpass';hf.frequency.value=10000;
            const hg=ac.createGain();
            hh.buffer=getCachedNoise(ac,0.016);
            hg.gain.setValueAtTime(0.04,t);
            hg.gain.exponentialRampToValueAtTime(0.0001,t+0.013);
            hh.connect(hf);hf.connect(hg);hg.connect(master);
            hh.start(t);
            nodes.push(hh,hf,hg);

            step++;
            if(nodes.length>180)nodes.splice(3,nodes.length-90);
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },

    win(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        master.connect(dest);
        const rev=makeReverb(ac,2.2,2.0);
        const revG=ac.createGain();revG.gain.value=0.32;
        rev.connect(revG);revG.connect(master);
        nodes.push(master,rev,revG);

        const fanfare=[
            440,554.4,659.3,880,880,659.3,880,0,
            784,659.3,587.3,523.3,659.3,0,659.3,880,
            784,659.3,554.4,440,440,523.3,554.4,587.3,
            659.3,784,880,0,880,784,659.3,0,
        ];
        const chords=[[110,220,277.2,329.6],[138.6,196,246.9],[146.8,220,293.7],[110,220,277.2]];
        const S=60/108/2;
        let step=0;

        function tick(t){
            const note=fanfare[step%fanfare.length];
            if(note){
                const o=ac.createOscillator();
                const g=ac.createGain();
                const f=ac.createBiquadFilter();
                f.type='lowpass';f.frequency.value=2800;
                o.type='triangle';o.frequency.setValueAtTime(note,t);
                g.gain.setValueAtTime(0,t);
                g.gain.linearRampToValueAtTime(0.18,t+0.018);
                g.gain.exponentialRampToValueAtTime(0.0001,t+S*0.88);
                o.connect(f);f.connect(g);g.connect(master);
                const rg=ac.createGain();rg.gain.value=0.38;
                g.connect(rg);rg.connect(rev);
                o.start(t);o.stop(t+S+0.02);
                nodes.push(o,g,f,rg);
            }

            if(step%8===0){
                const ci=Math.floor(step/8)%chords.length;
                chords[ci].forEach(freq=>{
                    const o=ac.createOscillator();
                    const g=ac.createGain();
                    o.type='sine';o.frequency.value=freq;
                    g.gain.setValueAtTime(0,t);
                    g.gain.linearRampToValueAtTime(0.058,t+0.12);
                    g.gain.setValueAtTime(0.058,t+S*6.8);
                    g.gain.exponentialRampToValueAtTime(0.0001,t+S*7.8);
                    o.connect(g);g.connect(master);
                    const rg=ac.createGain();rg.gain.value=0.28;g.connect(rg);rg.connect(rev);
                    o.start(t);o.stop(t+S*8.2);
                    nodes.push(o,g,rg);
                });
            }

            if(step%8===0||step%8===4){
                const ko=ac.createOscillator();
                const kg=ac.createGain();
                ko.type='sine';
                ko.frequency.setValueAtTime(138,t);
                ko.frequency.exponentialRampToValueAtTime(44,t+0.062);
                kg.gain.setValueAtTime(0.36,t);
                kg.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
                ko.connect(kg);kg.connect(master);
                ko.start(t);ko.stop(t+0.15);
                nodes.push(ko,kg);
            }

            const sh=ac.createBufferSource();
            const shf=ac.createBiquadFilter();shf.type='highpass';shf.frequency.value=7000;
            const shg=ac.createGain();
            sh.buffer=getCachedNoise(ac,0.018);
            shg.gain.setValueAtTime(0.022,t);
            shg.gain.exponentialRampToValueAtTime(0.0001,t+0.016);
            sh.connect(shf);shf.connect(shg);shg.connect(master);
            sh.start(t);
            nodes.push(sh,shf,shg);

            step++;
            if(nodes.length>160)nodes.splice(3,nodes.length-80);
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },

    lose(ac,dest,nodes){
        const master=ac.createGain();
        master.gain.setValueAtTime(0,ac.currentTime);
        master.connect(dest);
        const rev=makeReverb(ac,2.6,1.8);
        const revG=ac.createGain();revG.gain.value=0.42;
        rev.connect(revG);revG.connect(master);
        nodes.push(master,rev,revG);

        const descent=[440,392,349.2,329.6,293.7,261.6,246.9,220,0,0,0,0];
        const S=60/56;
        let step=0;

        function tick(t){
            if(step>=descent.length)return;
            const note=descent[step];
            if(note){
                const o=ac.createOscillator();
                const g=ac.createGain();
                const f=ac.createBiquadFilter();
                f.type='lowpass';f.frequency.value=680;
                o.type='sine';o.frequency.setValueAtTime(note,t);
                o.detune.setValueAtTime(-22,t);
                g.gain.setValueAtTime(0,t);
                g.gain.linearRampToValueAtTime(0.16,t+0.06);
                g.gain.exponentialRampToValueAtTime(0.0001,t+S*1.5);
                o.connect(f);f.connect(g);g.connect(master);
                const rg=ac.createGain();rg.gain.value=0.5;
                g.connect(rg);rg.connect(rev);
                o.start(t);o.stop(t+S*1.8);
                const td=ac.createOscillator();
                const tg=ac.createGain();
                td.type='sine';
                td.frequency.setValueAtTime(note*0.25,t);
                td.frequency.exponentialRampToValueAtTime(note*0.22,t+0.28);
                tg.gain.setValueAtTime(0.08,t);
                tg.gain.exponentialRampToValueAtTime(0.0001,t+0.48);
                td.connect(tg);tg.connect(master);
                td.start(t);td.stop(t+0.58);
                nodes.push(o,g,f,rg,td,tg);
            }
            step++;
        }
        tick.stepSize=S;
        const sched=makeScheduler(ac,tick);
        return{master,stop:()=>sched.stop()};
    },
};

// ─────────────────────────────────────────
// LOOKAHEAD SCHEDULER — fixes crackling
// ─────────────────────────────────────────
const LOOKAHEAD=0.5;
const SCHEDULE_INTERVAL=40;

function makeScheduler(ac,tickFn){
    let nextNoteTime=ac.currentTime+0.05;
    let timerId=null;
    let running=true;
    function loop(){
        if(!running)return;
        while(nextNoteTime<ac.currentTime+LOOKAHEAD){
            tickFn(nextNoteTime);
            nextNoteTime+=tickFn.stepSize;
        }
        timerId=setTimeout(loop,SCHEDULE_INTERVAL);
    }
    loop();
    return{stop(){running=false;if(timerId)clearTimeout(timerId);}};
}

// ─────────────────────────────────────────
// CROSSFADE ENGINE
// ─────────────────────────────────────────
function switchMusicTo(scene){
    if(!musicEnabled)return;
    if(activeScene===scene)return;
    activeScene=scene;

    const ac=getMusicAC();
    const dest=ac.destination;

    // Fade out + kill current scene
    if(activeMaster&&activeSceneStop){
        const oldMaster=activeMaster;
        const oldStop=activeSceneStop;
        const oldNodes=[...activeNodes];
        const now=ac.currentTime;
        try{
            oldMaster.gain.cancelScheduledValues(now);
            oldMaster.gain.setValueAtTime(oldMaster.gain.value,now);
            oldMaster.gain.linearRampToValueAtTime(0,now+XFADE);
        }catch{}
        setTimeout(()=>{
            oldStop();
            oldNodes.forEach(n=>{try{n.stop&&n.stop();n.disconnect&&n.disconnect();}catch{}});
        },XFADE*1000+100);
    }

    // Start new scene
    const newNodes=[];
    const result=SCENES[scene](ac,dest,newNodes);
    activeMaster=result.master;
    activeSceneStop=result.stop;
    activeNodes=newNodes;

    // Fade in new scene
    const now=ac.currentTime;
    try{
        activeMaster.gain.cancelScheduledValues(now);
        activeMaster.gain.setValueAtTime(0,now);
        activeMaster.gain.linearRampToValueAtTime(0.88,now+XFADE);
    }catch{}
}

function startMusic(){
    if(musicEnabled)return;
    musicEnabled=true;
    // Start on whichever screen we're on
    if(gameState==='start')switchMusicTo('landing');
    else if(gameState==='preplay')switchMusicTo('preplay');
    else if(gameState==='playing')switchMusicTo(isPanic?'panic':'gameplay');
    if(musicBtn)musicBtn.textContent='🔊 MUSIC: ON';
}

function stopMusic(){
    musicEnabled=false;
    if(activeMaster&&musicAC){
        const now=musicAC.currentTime;
        try{
            activeMaster.gain.cancelScheduledValues(now);
            activeMaster.gain.setValueAtTime(activeMaster.gain.value,now);
            activeMaster.gain.linearRampToValueAtTime(0,now+XFADE);
        }catch{}
    }
    setTimeout(()=>{
        if(activeSceneStop)activeSceneStop();
        activeNodes.forEach(n=>{try{n.stop&&n.stop();n.disconnect&&n.disconnect();}catch{}});
        activeNodes=[];
        activeMaster=null; activeSceneStop=null; activeScene=null;
        try{if(musicAC){musicAC.close();musicAC=null;}}catch{}
    },XFADE*1000+100);
    if(musicBtn)musicBtn.textContent='🎵 MUSIC: OFF';
}

function toggleMusic(){
    if(musicToggleLock)return;
    musicToggleLock=true;
    setTimeout(()=>{musicToggleLock=false;},500);
    musicEnabled?stopMusic():startMusic();
}

// ══════════════════════════════════════════
//  SCROLL FIX — overrides p5.js touch blocking
// ══════════════════════════════════════════
function fixScrolling(){
    const scrollables=[
    document.getElementById('winOverlay'),
    document.getElementById('startPopup'),
    document.getElementById('losePopup'),
    document.getElementById('levelCompleteOverlay'),
    document.getElementById('winOverlay'),
];

    scrollables.forEach(el=>{
        if(!el)return;
        let startY=0,startScroll=0,isScrolling=false,velY=0,lastY=0,rafId=null;

        el.addEventListener('touchstart',(e)=>{
            startY=e.touches[0].clientY;
            startScroll=el.scrollTop;
            lastY=startY; velY=0; isScrolling=false;
            if(rafId){cancelAnimationFrame(rafId);rafId=null;}
        },{passive:true});

        el.addEventListener('touchmove',(e)=>{
            const curY=e.touches[0].clientY;
            const deltaY=startY-curY;
            velY=lastY-curY; lastY=curY;
            if(!isScrolling&&Math.abs(deltaY)>4)isScrolling=true;
            if(!isScrolling)return;
            e.stopPropagation();
            const canDown=el.scrollTop<(el.scrollHeight-el.clientHeight);
            const canUp=el.scrollTop>0;
            if((deltaY>0&&canDown)||(deltaY<0&&canUp)){
                e.preventDefault();
                el.scrollTop=startScroll+deltaY;
            }
        },{passive:false});

        el.addEventListener('touchend',()=>{
            if(!isScrolling)return;
            isScrolling=false;
            // Momentum
            function momentum(){
                if(Math.abs(velY)<0.5)return;
                el.scrollTop+=velY;
                velY*=0.88;
                rafId=requestAnimationFrame(momentum);
            }
            momentum();
        },{passive:true});
    });
}

// ══════════════════════════════════════════
//  INSTAGRAM SCORE CARD GENERATOR
// ══════════════════════════════════════════
function generateScoreCard(finalScore, streakVal, acc, diff, secretMsg){
    const W=1080, H=1920;
    const cv=document.createElement('canvas');
    cv.width=W; cv.height=H;
    const ctx=cv.getContext('2d');

    // Background
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#0a0014');
    bg.addColorStop(.5,'#0d1b2a');
    bg.addColorStop(1,'#1a0a2e');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Grid
    ctx.strokeStyle='rgba(0,255,255,0.07)'; ctx.lineWidth=1.5;
    for(let x=0;x<W;x+=88){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=88){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Corner glows
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy])=>{
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,480);
        g.addColorStop(0,'rgba(255,20,147,0.22)');
        g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    });

    // Border
    ctx.strokeStyle='rgba(255,20,147,0.75)';
    ctx.lineWidth=8;
    ctx.strokeRect(24,24,W-48,H-48);

    // Bolt
    ctx.font='bold 160px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('⚡',W/2,260);

    // Game title
    ctx.font='bold 52px monospace';
    ctx.fillStyle='rgba(0,255,255,0.95)';
    ctx.fillText('DIGITAL BREAK',W/2,340);
    ctx.font='32px monospace';
    ctx.fillStyle='rgba(0,255,255,0.4)';
    ctx.fillText('V2.1 — ULTIMATE EDITION',W/2,396);

    // Divider
    ctx.strokeStyle='rgba(255,20,147,0.35)';
    ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(120,430);ctx.lineTo(W-120,430);ctx.stroke();

    // SYSTEM BREACHED
    ctx.font='bold 56px monospace';
    const tg=ctx.createLinearGradient(200,0,W-200,0);
    tg.addColorStop(0,'#ff1493');tg.addColorStop(.5,'#ff6b00');tg.addColorStop(1,'#ffdd00');
    ctx.fillStyle=tg;
    ctx.fillText('🔥 SYSTEM BREACHED 🔥',W/2,526);

    // Score badge
    const sg=ctx.createLinearGradient(240,560,W-240,700);
    sg.addColorStop(0,'#ff1493');sg.addColorStop(1,'#ff6b00');
    ctx.fillStyle=sg;
    ctx.beginPath();ctx.roundRect(240,560,W-480,170,48);ctx.fill();
    ctx.font='bold 108px monospace';
    ctx.fillStyle='#fff';
    ctx.fillText(`${Number(finalScore).toLocaleString()} PTS`,W/2,672);

    // Stats row
    const lvReached = Math.max(...[...clearedLevels, currentLevel], 1);
    const stats=[['STREAK',`${streakVal} hits`],['ACCURACY',`${acc}%`],['LEVEL',`${lvReached} / 12`]];
    stats.forEach(([k,v],i)=>{
        const sx=80+i*310, sy=760;
        ctx.fillStyle='rgba(0,0,0,0.4)';
        ctx.beginPath();ctx.roundRect(sx,sy,280,160,32);ctx.fill();
        ctx.strokeStyle='rgba(0,255,255,0.22)';ctx.lineWidth=2;
        ctx.beginPath();ctx.roundRect(sx,sy,280,160,32);ctx.stroke();
        ctx.font='26px monospace';ctx.fillStyle='rgba(0,255,255,0.55)';
        ctx.fillText(k,sx+140,sy+56);
        ctx.font='bold 44px monospace';ctx.fillStyle='#ffffff';
        ctx.fillText(v,sx+140,sy+116);
    });

    // Secret message box
    ctx.fillStyle='rgba(0,255,100,0.08)';
    ctx.beginPath();ctx.roundRect(80,960,W-160,200,40);ctx.fill();
    ctx.strokeStyle='rgba(0,255,100,0.35)';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(80,960,W-160,200,40);ctx.stroke();
    ctx.font='28px monospace';ctx.fillStyle='rgba(0,255,100,0.7)';
    ctx.fillText('🔓 CLASSIFIED MESSAGE',W/2,1010);
    ctx.font='bold 32px monospace';ctx.fillStyle='#00ff00';
    // Word wrap the secret message
    const words=secretMsg.split(' ');
    let line='', lines=[], maxW=W-200;
    ctx.font='bold 32px monospace';
    words.forEach(w=>{
        const test=line+w+' ';
        if(ctx.measureText(test).width>maxW&&line!==''){lines.push(line);line=w+' ';}
        else line=test;
    });
    lines.push(line);
    lines.slice(0,2).forEach((l,i)=>ctx.fillText(l.trim(),W/2,1068+i*44));

    // Challenge text
    ctx.font='bold 48px monospace';
    const cg=ctx.createLinearGradient(160,0,W-160,0);
    cg.addColorStop(0,'#00ffff');cg.addColorStop(1,'#ff1493');
    ctx.fillStyle=cg;
    ctx.fillText('CAN YOU BEAT ME? ⚡',W/2,1240);

    // Game link pill
    ctx.fillStyle='rgba(0,255,255,0.1)';
    ctx.beginPath();ctx.roundRect(160,1270,W-320,110,55);ctx.fill();
    ctx.strokeStyle='rgba(0,255,255,0.4)';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(160,1270,W-320,110,55);ctx.stroke();
    ctx.font='bold 36px monospace';ctx.fillStyle='rgba(0,255,255,0.9)';
    ctx.fillText('🔗 digitalbreak.netlify.app',W/2,1338);

    // Credits
    ctx.font='32px monospace';ctx.fillStyle='rgba(255,100,180,0.55)';
    ctx.fillText('Geniusly created by Ayabukwa🌟',W/2,1440);

    // Bottom accent line
    const lb=ctx.createLinearGradient(0,0,W,0);
    lb.addColorStop(0,'transparent');
    lb.addColorStop(.5,'rgba(0,255,255,0.7)');
    lb.addColorStop(1,'transparent');
    ctx.strokeStyle=lb;ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(120,1500);ctx.lineTo(W-120,1500);ctx.stroke();

    return cv;
}

function saveScoreCard(){
    const secretEl = document.getElementById('secretText');
    const secretMsg = (secretEl&&secretEl.textContent)||SECRET_MESSAGES[Math.floor(Math.random()*SECRET_MESSAGES.length)];
    const acc = totalClicks>0?Math.round((successfulHits/totalClicks)*100):0;
    const cardScore = totalLevelScore||score;
    const cv=generateScoreCard(cardScore,bestStreak,acc,'insane',secretMsg);
    const link=document.createElement('a');
    link.download='digitalbreak-score.png';
    link.href=cv.toDataURL('image/png');
    link.click();
    document.getElementById('igConfirm').innerHTML=
        '✅ Saved! Open Instagram → Stories → add photo 📸';
    setTimeout(()=>document.getElementById('igConfirm').textContent='',5000);
}

// ══ STRIKE & ZOOM INTRO ══
(function(){
    const loader   = document.getElementById('introLoader');
    const flash    = document.getElementById('introFlash');
    const bolt     = document.getElementById('introBolt');
    const title    = document.getElementById('introTitle');
    const sub      = document.getElementById('introSub');
    const bar      = document.getElementById('introBar');
    const strike   = document.getElementById('introStrike1');

    function ease(el,props,dur,delay){
        return new Promise(res=>{
            setTimeout(()=>{
                Object.assign(el.style, {transition:`all ${dur}ms cubic-bezier(0.34,1.56,0.64,1)`,...props});
                setTimeout(res, dur);
            }, delay||0);
        });
    }
    function set(el,props){ Object.assign(el.style,props); }

    async function runIntro(){
        // Force a paint before animating
        loader.style.opacity='1';
        bolt.style.opacity='0';
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        await new Promise(r=>setTimeout(r,200));
        set(strike,{transition:'height 0.18s ease-in, opacity 0s',opacity:'1',height:'45%'});
        await new Promise(r=>setTimeout(r,180));

        // Phase 2 — flash + lightning sound
        set(flash,{transition:'opacity 0.06s ease',opacity:'0.85'});

        // Lightning strike sound
        try{
            const ac=new(window.AudioContext||window.webkitAudioContext)();
            const t=ac.currentTime;

            // Crack
            const crack=ac.createBufferSource();
            const cb=ac.createBuffer(1,ac.sampleRate*0.12,ac.sampleRate);
            const cd=cb.getChannelData(0);
            for(let i=0;i<cd.length;i++)cd[i]=(Math.random()*2-1);
            crack.buffer=cb;
            const cf=ac.createBiquadFilter();
            cf.type='highpass';cf.frequency.value=1800;
            const cg=ac.createGain();
            cg.gain.setValueAtTime(1.1,t);
            cg.gain.exponentialRampToValueAtTime(0.0001,t+0.1);
            crack.connect(cf);cf.connect(cg);cg.connect(ac.destination);
            crack.start(t);

            // Zap drop
            const zap=ac.createOscillator();
            const zg=ac.createGain();
            zap.type='sawtooth';
            zap.frequency.setValueAtTime(260,t);
            zap.frequency.exponentialRampToValueAtTime(26,t+0.32);
            zg.gain.setValueAtTime(0.5,t);
            zg.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
            zap.connect(zg);zg.connect(ac.destination);
            zap.start(t);zap.stop(t+0.38);

            // Thunder rumble
            const rumble=ac.createBufferSource();
            const rb=ac.createBuffer(1,ac.sampleRate*1.6,ac.sampleRate);
            const rd=rb.getChannelData(0);
            for(let i=0;i<rd.length;i++)rd[i]=(Math.random()*2-1);
            rumble.buffer=rb;
            const rf=ac.createBiquadFilter();
            rf.type='lowpass';rf.frequency.value=160;rf.Q.value=2;
            const rg=ac.createGain();
            rg.gain.setValueAtTime(0.6,t+0.05);
            rg.gain.exponentialRampToValueAtTime(0.0001,t+1.6);
            rumble.connect(rf);rf.connect(rg);rg.connect(ac.destination);
            rumble.start(t+0.05);
        }catch{}

        await new Promise(r=>setTimeout(r,60));
        set(flash,{transition:'opacity 0.22s ease',opacity:'0'});
        set(strike,{opacity:'0',height:'0'});

        // Phase 3 — bolt slams down
        bolt.style.transition='none';
        bolt.style.transform='translateY(-120px) scale(0.4)';
        bolt.style.opacity='0';
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        await new Promise(r=>setTimeout(r,10));
        bolt.style.transition='opacity 0.12s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)';
        bolt.style.opacity='1';
        bolt.style.transform='translateY(0) scale(1.2)';
        await new Promise(r=>setTimeout(r,200));
        set(bolt,{
            transition:'transform 0.18s ease',
            transform:'translateY(0) scale(1)'
        });
        await new Promise(r=>setTimeout(r,180));

        // Phase 4 — title zooms in
        set(title,{transition:'opacity 0.28s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)'});
        await new Promise(r=>setTimeout(r,10));
        set(title,{opacity:'1',transform:'scale(1)'});

        // Phase 5 — subtitle fades in
        await new Promise(r=>setTimeout(r,180));
        set(sub,{transition:'opacity 0.4s ease, transform 0.4s ease',opacity:'1',transform:'translateY(0)'});

        // Phase 6 — progress bar sweeps
        await new Promise(r=>setTimeout(r,80));
        bar.style.width='100%';

        // Phase 7 — hold briefly then fade out
        await new Promise(r=>setTimeout(r,900));
        set(loader,{transition:'opacity 0.45s ease',opacity:'0'});
        await new Promise(r=>setTimeout(r,460));
        loader.style.display='none';
    }

    // Run after fonts load
    if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(runIntro);
    } else {
        window.addEventListener('load', runIntro);
    }
})();

function showStandaloneLeaderboard(){
    const el=document.createElement('div');
    el.id='standaloneLb';
    el.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.94);z-index:1200;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:30px 15px 60px;font-family:Orbitron,monospace;text-align:center;color:#fff;box-sizing:border-box;';
    el.innerHTML=`
        <div style="max-width:480px;margin:0 auto;">
            <div style="font-size:9px;letter-spacing:5px;color:rgba(0,255,255,0.4);margin-bottom:8px;">DIGITAL BREAK V2.1</div>
            <div style="font-size:22px;font-weight:900;letter-spacing:4px;
                background:linear-gradient(135deg,#00ffff,#ff1493);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                background-clip:text;margin-bottom:6px;">HALL OF FAME</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2px;margin-bottom:24px;">
                TOP PLAYERS GLOBALLY
            </div>

            <div style="
                background:linear-gradient(160deg,#05050f,#0a1520,#050f1a);
                border:1px solid rgba(0,255,255,0.2);
                border-radius:18px;padding:20px 16px;
                margin-bottom:18px;
                box-shadow:0 0 40px rgba(0,255,255,0.08);
            ">
                <div id="standaloneLbRows">
                    <div style="font-size:9px;color:rgba(0,255,255,0.3);letter-spacing:2px;padding:20px 0;">
                        LOADING GLOBAL SCORES...
                    </div>
                </div>
            </div>

            <div style="font-size:8px;color:rgba(255,255,255,0.2);letter-spacing:1px;
                margin-bottom:20px;line-height:1.8;">
                Play and complete levels to appear here.<br>
                <span style="color:rgba(255,215,0,0.4);">Top score across all levels wins.</span>
            </div>

            <button onclick="document.getElementById('standaloneLb').remove();"
                style="width:100%;padding:14px;
                background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.12);
                color:rgba(255,255,255,0.4);
                font-size:11px;font-weight:900;letter-spacing:3px;
                font-family:Orbitron,monospace;
                cursor:pointer;border-radius:12px;
                touch-action:manipulation;-webkit-tap-highlight-color:transparent;">
                ↩ BACK</button>
        </div>`;
    document.body.appendChild(el);

    // Load scores
    fetchOnlineLeaderboard().then(rows=>{
        const container=document.getElementById('standaloneLbRows');
        if(!container)return;
        if(!rows||!rows.length){
            container.innerHTML=`<div style="font-size:10px;color:rgba(255,255,255,0.25);padding:20px 0;letter-spacing:1px;">No scores yet — be the first to breach!</div>`;
            return;
        }
        const medals=['🥇','🥈','🥉'];
        container.innerHTML=rows.map((e,i)=>`
            <div style="display:flex;align-items:center;gap:8px;
                padding:10px 12px;border-radius:10px;margin-bottom:6px;
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(0,255,255,${i===0?'0.2':'0.07'});
                ${i===0?'box-shadow:0 0 14px rgba(0,255,255,0.08);':''}
                font-family:Orbitron,monospace;">
                <span style="width:28px;font-size:${i<3?'16':'12'}px;">${i<3?medals[i]:'#'+(i+1)}</span>
                <span style="flex:1;text-align:left;font-size:11px;
                    color:${i===0?'rgba(255,215,0,0.9)':'rgba(0,255,255,0.8)'};
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${e.player_name}</span>
                <span style="font-size:9px;color:rgba(255,255,255,0.3);margin-right:6px;">
                    LV${e.level_reached}</span>
                <span style="font-size:9px;color:rgba(255,255,255,0.25);margin-right:6px;">
                    ${e.accuracy}% acc</span>
                <span style="font-weight:900;font-size:12px;
                    color:${i===0?'#ffd700':'#ff1493'};">
                    ${e.score.toLocaleString()}</span>
            </div>`).join('');
    });
}

// ══════════════════════════════════════════
//  INTRO LOADER ANIMATION
// ══════════════════════════════════════════
function runIntroLoader(){
    const loader=document.getElementById('introLoader');
    const flash=document.getElementById('introFlash');
    const bolt=document.getElementById('introBolt');
    const title=document.getElementById('introTitle');
    const titleText=document.getElementById('introTitleText');
    const sub=document.getElementById('introSub');
    const bar=document.getElementById('introBar');
    const strike=document.getElementById('introStrike1');

    // Add particle canvas to loader
    const pc=document.createElement('canvas');
    pc.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    loader.appendChild(pc);
    pc.width=window.screen.width;pc.height=window.screen.height;
    const ctx=pc.getContext('2d');

    // Floating particle field
    const pts=[];
    for(let i=0;i<60;i++)pts.push({
        x:Math.random()*pc.width,y:Math.random()*pc.height,
        vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
        size:Math.random()*1.8+.4,
        opacity:Math.random()*.4+.1,
        gold:Math.random()<.35
    });
    let particleAlpha=0,particleFading=false;
    let rafId=requestAnimationFrame(function animPts(){
        ctx.clearRect(0,0,pc.width,pc.height);
        if(particleFading)particleAlpha=Math.max(0,particleAlpha-.018);
        else particleAlpha=Math.min(1,particleAlpha+.012);
        pts.forEach(p=>{
            p.x+=p.vx;p.y+=p.vy;
            if(p.x<0||p.x>pc.width)p.vx*=-1;
            if(p.y<0||p.y>pc.height)p.vy*=-1;
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle=p.gold?
                `rgba(255,215,0,${p.opacity*particleAlpha})`:
                `rgba(200,220,255,${p.opacity*particleAlpha})`;
            ctx.fill();
        });
        if(particleAlpha>0||!particleFading)rafId=requestAnimationFrame(animPts);
        else{ctx.clearRect(0,0,pc.width,pc.height);}
    });

    // Ghost title — always visible faintly behind
    titleText.style.transition='opacity 0.6s ease';
    titleText.style.opacity='0.08';

    // Phase 1 — particles fade in + strike charges
    setTimeout(()=>{
        strike.style.transition='height 0.22s cubic-bezier(0.4,0,1,1), opacity 0.08s';
        strike.style.height='100%';
        strike.style.opacity='1';
    },300);

    // Phase 2 — IMPACT
    setTimeout(()=>{
        // White flash
        flash.style.transition='opacity 0.05s ease-in';
        flash.style.opacity='1';
        strike.style.opacity='0';
        if(sfxCtx&&sfxCtx.state==='running'){playSound('lightning');playSound('thunder');}

        // Bolt slams in with bounce
        bolt.style.transition='transform 0.28s cubic-bezier(0.34,1.8,0.64,1), opacity 0.1s ease';
        bolt.style.opacity='1';
        bolt.style.transform='translateY(0px) scale(1.4)';
        bolt.style.filter='drop-shadow(0 0 30px #ffd700) drop-shadow(0 0 60px #ff8800)';

        // Screen shake via loader transform
        loader.style.transition='transform 0.06s ease';
        loader.style.transform='translate(6px,-4px)';
    },500);

    // Phase 3 — settle
    setTimeout(()=>{
        flash.style.transition='opacity 0.25s ease-out';
        flash.style.opacity='0';
        bolt.style.transition='transform 0.4s cubic-bezier(0.34,1.2,0.64,1), filter 0.6s ease';
        bolt.style.transform='translateY(0px) scale(1)';
        bolt.style.filter='drop-shadow(0 0 16px #ffd700)';
        loader.style.transform='translate(-4px,3px)';
    },560);

    setTimeout(()=>{
        loader.style.transform='translate(2px,-2px)';
    },610);

    setTimeout(()=>{
        loader.style.transform='translate(0,0)';
        loader.style.transition='transform 0.2s ease';
    },660);

    // Phase 4 — ghost title brightens
    setTimeout(()=>{
        titleText.style.opacity='0.18';
        titleText.style.transition='opacity 0.5s ease, letter-spacing 0.8s ease';
        titleText.style.letterSpacing='14px';
    },700);

    // Phase 5 — main title crashes in
    setTimeout(()=>{
        title.style.transition='opacity 0.3s ease, transform 0.5s cubic-bezier(0.34,1.3,0.64,1), text-shadow 0.4s ease';
        title.style.opacity='1';
        title.style.transform='scale(1)';
        title.style.textShadow='0 0 60px rgba(255,215,0,1), 0 0 120px rgba(255,140,0,0.6), 0 0 200px rgba(255,20,147,0.3)';
    },820);

    // Phase 6 — title glow settles
    setTimeout(()=>{
        title.style.transition='text-shadow 0.8s ease';
        title.style.textShadow='0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,140,0,0.3)';
    },1100);

    // Phase 7 — subtitle slides up
    setTimeout(()=>{
        sub.style.transition='opacity 0.5s ease, transform 0.5s ease, letter-spacing 0.6s ease';
        sub.style.opacity='1';
        sub.style.transform='translateY(0px)';
        sub.style.letterSpacing='8px';
    },1100);

    // Phase 8 — progress bar fills with glow pulse
    setTimeout(()=>{
        bar.style.width='100%';
        bar.style.boxShadow='0 0 20px rgba(255,215,0,0.9), 0 0 40px rgba(255,140,0,0.5)';
    },1200);

    // Phase 9 — second lightning strike for drama
    setTimeout(()=>{
        flash.style.transition='opacity 0.04s ease-in';
        flash.style.opacity='0.35';
        if(sfxCtx&&sfxCtx.state==='running'){playSound('lightning');playSound('thunder');}
    },1900);
    setTimeout(()=>{
        flash.style.transition='opacity 0.2s ease-out';
        flash.style.opacity='0';
    },1950);

    // Phase 10 — particles start fading
    setTimeout(()=>{
        particleFading=true;
    },2200);

    // Phase 11 — everything fades out
    setTimeout(()=>{
        loader.style.transition='opacity 0.6s ease';
        loader.style.opacity='0';
    },2800);

    // Phase 12 — remove
    setTimeout(()=>{
        loader.style.pointerEvents='none';
    },2800);
    setTimeout(()=>{
        loader.style.display='none';
        cancelAnimationFrame(rafId);
        pc.remove();
    },3400);
}

// ══════════════════════════════════════════
//  BORDER GLOW TRAVELLER
// ══════════════════════════════════════════
(function(){
    function initBorderGlow(){
        const canvas=document.getElementById('borderGlowCanvas');
        if(!canvas)return;
        const wrap=document.getElementById('startBorderWrap');
        const ctx=canvas.getContext('2d');
        let W,H,perim,pos=0;
        const SPEED=0.6; // px per frame — tweak to taste
        const TAIL=120;  // glow trail length in px

        function resize(){
            const r=wrap.getBoundingClientRect();
            W=r.width; H=r.height;
            canvas.width=W; canvas.height=H;
            perim=2*(W+H);
        }

        // Convert perimeter distance to x,y on the rectangle edge
        function perimToXY(d){
            d=((d%perim)+perim)%perim;
            if(d<W)          return[d,0];
            else if(d<W+H)   return[W,d-W];
            else if(d<2*W+H) return[W-(d-W-H),H];
            else              return[0,H-(d-2*W-H)];
        }

        function drawFrame(){
            ctx.clearRect(0,0,W,H);
            pos=(pos+SPEED)%perim;

            // Draw tail as a series of small glowing dots fading out
            const steps=80;
            for(let i=0;i<steps;i++){
                const t=i/steps; // 0=tail end, 1=head
                const d=((pos-TAIL*(1-t))+perim)%perim;
                const [x,y]=perimToXY(d);
                const alpha=t*t; // quadratic — bright at head
                const size=t*10+2;

                // Outer glow
                ctx.beginPath();
                ctx.arc(x,y,size*2,0,Math.PI*2);
                ctx.fillStyle=`rgba(255,215,0,${alpha*0.08})`;
                ctx.fill();

                // Inner core
                ctx.beginPath();
                ctx.arc(x,y,size*0.6,0,Math.PI*2);
                ctx.fillStyle=`rgba(255,235,120,${alpha*0.9})`;
                ctx.fill();
            }

            // Bright head spark
            const [hx,hy]=perimToXY(pos);
            const spark=ctx.createRadialGradient(hx,hy,0,hx,hy,22);
            spark.addColorStop(0,'rgba(255,255,200,0.95)');
            spark.addColorStop(0.3,'rgba(255,215,0,0.7)');
            spark.addColorStop(1,'rgba(255,160,0,0)');
            ctx.beginPath();
            ctx.arc(hx,hy,22,0,Math.PI*2);
            ctx.fillStyle=spark;
            ctx.fill();

            requestAnimationFrame(drawFrame);
        }

        resize();
        window.addEventListener('resize',resize);
        drawFrame();
    }

    // Run after DOM is ready
    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',initBorderGlow);
    } else {
        initBorderGlow();
    }
})();

