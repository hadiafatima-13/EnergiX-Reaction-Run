'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, ChevronRight, CircleHelp, Gauge, Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX, X, Zap } from 'lucide-react';
import World, {type Position} from './World';
import Diagram from './Diagram';
import {NODES, STAGES, STAGE_END, type Stage} from '@/lib/game';

type Mode='title'|'intro'|'play'|'pause'|'transition'|'complete';
const messages:Record<string,string>={
 exo:'The reaction system releases heat. The surroundings glow warmer. Products have lower energy: ΔH < 0. Combustion is an exothermic example.',
 endo:'Heat flows from the surroundings into the system. The outside cools. Products have higher energy: ΔH > 0. Thermal decomposition is an endothermic example.',
 break1:'You supplied 436 kJ mol⁻¹ to break an H–H bond. Bond breaking absorbs energy.',
 break2:'You supplied 243 kJ mol⁻¹ to break a Cl–Cl bond. Total absorbed: 679 kJ mol⁻¹.',
 make1:'A new H–Cl bond forms and releases 431 kJ mol⁻¹. Bond making releases energy.',
 make2:'Two H–Cl bonds released 862 kJ mol⁻¹. ΔH = (436 + 243) − (2 × 431) = −183 kJ mol⁻¹. The reaction is exothermic.',
 catalyst:'The catalyst opens a different pathway. Its activation barrier costs only 2 energy instead of 6. Starting and ending energies stay the same.',
 high:'You crossed the original high activation barrier. The reaction releases energy afterward.',
 low:'You crossed the catalyst pathway at a lower activation energy. The same products form; ΔH stays unchanged.',
 aerobic:'With oxygen, aerobic respiration of glucose releases energy for cellular work. Glucose + oxygen → carbon dioxide + water.',
 anaerobic:'Without oxygen, anaerobic respiration also releases energy, but less per glucose molecule. In human muscles it can produce lactate.',
 lipid:'You stored surplus energy as a lipid reserve. Cells can draw on stored lipids later.'
};
const guidance:Record<string,string>={
 exo:'Gather all three heat sparks first.',endo:'Release heat at the first chamber before this one.',
 break1:'Collect energy at the glowing orbs first.',break2:'Break the H–H bond first, then supply energy here.',
 make1:'Break both reactant bonds before making product bonds.',make2:'Form the first H–Cl bond before the second.',
 high:'The original route needs 6 energy. Gather the purple sparks.',low:'Activate the catalyst station first to unlock this route.',
 aerobic:'Collect glucose and oxygen before aerobic respiration.',anaerobic:'Run the aerobic station first. You also need a second glucose.',lipid:'Run both respiration processes before storing the surplus.'
};
export default function Game(){
 const [mode,setMode]=useState<Mode>('title'),[stage,setStage]=useState<Stage>(0),[pos,setPos]=useState<Position>({x:0,y:0,z:0});
 const [done,setDone]=useState<Set<string>>(new Set()),[energy,setEnergy]=useState(0),[glucose,setGlucose]=useState(0),[oxygen,setOxygen]=useState(0),[lipids,setLipids]=useState(0),[score,setScore]=useState(0);
 const [toast,setToast]=useState(''),[near,setNear]=useState<string|null>(null),[diagram,setDiagram]=useState(false),[help,setHelp]=useState(false),[muted,setMuted]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState(false);
 const keys=useRef<Set<string>>(new Set()), touch=useRef<Set<string>>(new Set()), jump=useRef(false), last=useRef(0), cooldown=useRef(0), audio=useRef<AudioContext|null>(null);
 const live=useRef({mode,stage,pos,done,energy,glucose,oxygen});
 live.current={mode,stage,pos,done,energy,glucose,oxygen};
 const notice=useCallback((value:string)=>{setToast(value);},[]);
 const beep=useCallback((freq=520)=>{if(muted)return;try{audio.current??=new AudioContext();const ctx=audio.current,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(freq*1.5,ctx.currentTime+0.15);gain.gain.setValueAtTime(0.055,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.22);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+0.23);}catch{}},[muted]);
 const mark=useCallback((id:string)=>setDone(prev=>new Set(prev).add(id)),[]);
 const act=useCallback((id:string)=>{
  const s=live.current; if(s.done.has(id)||s.mode!=='play')return;
  let okay=false;
  if(id==='exo'&&s.energy>=3){setEnergy(v=>v-1);okay=true;}
  if(id==='endo'&&s.done.has('exo')&&s.energy>=2){setEnergy(v=>v-2);okay=true;}
  if(id==='break1'&&s.energy>=2){setEnergy(v=>v-2);okay=true;}
  if(id==='break2'&&s.done.has('break1')&&s.energy>=2){setEnergy(v=>v-2);okay=true;}
  if(id==='make1'&&s.done.has('break2')){setEnergy(v=>v+1);okay=true;}
  if(id==='make2'&&s.done.has('make1')){setEnergy(v=>v+1);okay=true;}
  if(id==='catalyst'){okay=true;}
  if(id==='high'&&s.energy>=6){setEnergy(v=>v-6);okay=true;}
  if(id==='low'&&s.done.has('catalyst')&&s.energy>=2){setEnergy(v=>v-2);okay=true;}
  if(id==='aerobic'&&s.glucose>=1&&s.oxygen>=1){setGlucose(v=>v-1);setOxygen(v=>v-1);setEnergy(v=>v+5);okay=true;}
  if(id==='anaerobic'&&s.done.has('aerobic')&&s.glucose>=1){setGlucose(v=>v-1);setEnergy(v=>v+2);okay=true;}
  if(id==='lipid'&&s.done.has('anaerobic')&&s.energy>=3){setEnergy(v=>v-3);setLipids(v=>v+1);okay=true;}
  if(okay){mark(id);setScore(v=>v+100);notice(messages[id]);beep(id.startsWith('break')?240:620);if(id==='high'||id==='low'||id==='make2')setDiagram(true);}
  else{notice(guidance[id]??'Gather more energy first.');beep(180);}
 },[beep,mark,notice]);
 const collect=useCallback((id:string,amount:number)=>{
  const s=live.current;if(s.done.has(id))return;
  mark(id);setScore(v=>v+25);beep(790);
  if(id==='oxygen'){setOxygen(v=>v+1);notice('Oxygen collected. Bring it to the aerobic station with glucose.');}
  else if(id==='d1'||id==='d2'){setGlucose(v=>v+1);notice('Glucose collected. This fuel can be released in respiration.');}
  else{setEnergy(v=>v+amount);notice(s.stage===0?'Heat spark collected. Route energy between the system and surroundings.':'Energy collected. Carry it to a station.');}
 },[beep,mark,notice]);
 const stageComplete=(s:Stage,d:Set<string>)=>s===0?d.has('exo')&&d.has('endo'):s===1?d.has('make2'):s===2?d.has('high')||d.has('low'):d.has('lipid');
 const advance=useCallback(()=>{const s=live.current;if(!stageComplete(s.stage,s.done)){notice('Finish the chamber interactions before crossing the checkpoint.');return;}beep(900);if(s.stage===3){setMode('complete');return;}setStage((s.stage+1) as Stage);setPos({x:0,y:0,z:0});setDone(new Set());setEnergy(0);setGlucose(0);setOxygen(0);setDiagram(false);setMode('transition');},[beep,notice]);
 const interact=useCallback(()=>{const s=live.current;if(s.mode!=='play')return;const n=NODES[s.stage].filter(n=>n.kind==='station'&&!s.done.has(n.id)).find(n=>Math.hypot(n.x-s.pos.x,n.z-s.pos.z)<3);if(n){act(n.id);return;}if(s.pos.z>STAGE_END[s.stage]-3)advance();else notice('Move close to a glowing station and press E.');},[act,advance,notice]);
 const actionRef=useRef(interact);actionRef.current=interact;
 useEffect(()=>{const down=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Shift'].includes(e.key))e.preventDefault();keys.current.add(e.key.toLowerCase());if(e.repeat)return;if(['e','shift'].includes(e.key.toLowerCase()))actionRef.current();if(e.key===' '){jump.current=true;}if(e.key.toLowerCase()==='p'||e.key==='Escape')setMode(v=>v==='play'?'pause':v==='pause'?'play':v);};
 const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);};},[]);
 useEffect(()=>{let frame=0;const tick=(time:number)=>{frame=requestAnimationFrame(tick);const dt=Math.min((time-last.current)/1000||0,0.05);last.current=time;const s=live.current;if(s.mode!=='play')return;const k=keys.current,t=touch.current;const left=k.has('a')||k.has('arrowleft')||t.has('left'),right=k.has('d')||k.has('arrowright')||t.has('right'),forward=k.has('w')||k.has('arrowup')||t.has('up'),back=k.has('s')||k.has('arrowdown')||t.has('down');const dx=(Number(right)-Number(left))*dt*7;const dz=(Number(forward)-Number(back))*dt*8;
  setPos(p=>{const next={x:Math.max(-3,Math.min(3,p.x+dx)),z:Math.max(0,Math.min(STAGE_END[s.stage]+2,p.z+dz)),y:0};if(jump.current){cooldown.current=0.7;jump.current=false;}cooldown.current=Math.max(0,cooldown.current-dt);next.y=cooldown.current>0?Math.sin((0.7-cooldown.current)/0.7*Math.PI)*1.9:0;return next;});
 };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[]);
 useEffect(()=>{if(mode!=='play')return;const n=NODES[stage].find(n=>n.kind==='collect'&&!done.has(n.id)&&Math.hypot(n.x-pos.x,n.z-pos.z)<1.25);if(n)collect(n.id,n.amount??1);const station=NODES[stage].filter(n=>n.kind==='station'&&!done.has(n.id)).find(n=>Math.hypot(n.x-pos.x,n.z-pos.z)<3);setNear(station?.id??(pos.z>STAGE_END[stage]-3?'checkpoint':null));},[mode,stage,pos,done,collect]);
 const restart=()=>{setStage(0);setPos({x:0,y:0,z:0});setDone(new Set());setEnergy(0);setGlucose(0);setOxygen(0);setLipids(0);setScore(0);setToast('');setMode('intro');};
 const touchButton=(key:string,label:React.ReactNode)=> <button aria-label={key} onPointerDown={e=>{e.preventDefault();touch.current.add(key);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={()=>touch.current.delete(key)} onPointerCancel={()=>touch.current.delete(key)}>{label}</button>;
 const info=STAGES[stage], progress=Math.min(100,(pos.z/STAGE_END[stage])*100);
 return <main className="game">
  <World stage={stage} position={pos} done={done} active={mode==='play'} onReady={()=>setReady(true)} onError={()=>setError(true)}/>
  <div className="vignette"/>
  {!ready&&!error&&<div className="loading-overlay">Assembling molecules…</div>}
  {error&&<div className="loading-overlay">3D rendering could not start. Try a browser with WebGL enabled, then reload.</div>}
  {mode==='play'&&<><header className="hud">
   <div className="brand"><span className="brand-mark"><Zap size={19} fill="currentColor"/></span><span>ENERGI<span className="brand-x">X</span><small>REACTION RUN</small></span></div>
   <div className="stage-pill"><span className="pulse"/> <span>{info.tag}</span></div>
   <div className="hud-actions"><button onClick={()=>setMuted(!muted)} aria-label={muted?'Unmute':'Mute'}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button><button onClick={()=>setHelp(true)} aria-label="Controls help"><CircleHelp size={19}/></button><button onClick={()=>setMode('pause')} aria-label="Pause"><Pause size={19}/></button></div>
  </header>
  <aside className="side-panel"><span className="eyebrow">CURRENT MISSION</span><h2>{info.name}</h2><p>{info.goal}</p><div className="mission-line"><span>CHECKPOINT</span><strong>{Math.floor(progress)}%</strong></div><div className="progress"><i style={{width:progress+'%',background:info.color}}/></div></aside>
  <div className="resources"><div><Zap size={17} color="#ffd281"/> <strong>{energy}</strong><span>ENERGY</span></div>{stage===3&&<><div><strong>{glucose}</strong><span>GLUCOSE</span></div><div><strong>{oxygen}</strong><span>O₂</span></div></>}<div><strong>{score}</strong><span>POINTS</span></div></div>
  <div className="bottom-ui"><div className="hint"><span className="key">W A S D</span> move <span className="key">SPACE</span> jump <span className="key">E / SHIFT</span> interact</div><button className="diagram-button" onClick={()=>setDiagram(true)}><Gauge size={18}/> ENERGY PROFILE <Maximize2 size={14}/></button></div>
  {near&&<button className="interaction" onClick={()=>near==='checkpoint'?advance():act(near)}><span className="key">E</span> {near==='checkpoint'?(stageComplete(stage,done)?'ENTER NEXT CHAMBER':'FINISH MISSION FIRST'):'INTERACT • '+NODES[stage].find(n=>n.id===near)?.label}<ChevronRight size={18}/></button>}
  {toast&&<div className="toast" key={toast}><span className="toast-icon"><Zap size={16}/></span><p>{toast}</p><button onClick={()=>setToast('')} aria-label="Dismiss"><X size={16}/></button></div>}
  <div className="touch-controls"><div>{touchButton('left',<ArrowLeft/>)}{touchButton('up',<ArrowUp/>)}{touchButton('down',<ArrowDown/>)}{touchButton('right',<ArrowRight/>)}</div><button onClick={()=>{jump.current=true;}}>JUMP</button><button onClick={interact}>ACT</button></div>
  </>}
  {(mode==='title'||mode==='intro'||mode==='transition'||mode==='pause'||mode==='complete')&&<div className="modal-backdrop"><div className="hero-card">
   {mode==='title'&&<><span className="eyebrow bright">A 3D CHEMISTRY ADVENTURE</span><div className="hero-symbol"><Zap size={46} fill="currentColor"/></div><h1>ENERGI<span>X</span><small>REACTION RUN</small></h1><p>Dash through a molecular world. Catch energy, forge bonds and change the course of a reaction.</p><button className="primary" onClick={()=>setMode('intro')}>ENTER THE MOLECULAR WORLD <ChevronRight size={19}/></button><div className="hero-foot">4 CHAMBERS <span>✦</span> ONE CONTINUOUS ADVENTURE</div></>}
   {mode==='intro'&&<><span className="eyebrow bright">FIELD GUIDE / 01</span><h2>Move. Experiment.<br/><em>See what changes.</em></h2><div className="guide-grid"><div><span className="key">WASD / ↑↓←→</span><p>Move and explore the track</p></div><div><span className="key">SPACE</span><p>Leap over the energy stream</p></div><div><span className="key">E / SHIFT</span><p>Activate nearby stations</p></div><div><span className="key">P</span><p>Pause the experiment</p></div></div><p className="subtle">On touchscreens, use the controls at the bottom. Collect glowing orbs by touching them. Explore both sides of the track.</p><button className="primary" onClick={()=>{setMode('play');notice(STAGES[0].intro);}}>BEGIN EXPERIMENT <ChevronRight size={19}/></button></>}
   {mode==='transition'&&<><span className="eyebrow bright">CHECKPOINT REACHED / {String(stage+1).padStart(2,'0')}</span><h2>{info.name}</h2><p>{info.intro}</p><div className="chapter-bar"><span>CHAMBER {stage+1} OF 4</span><span>{info.goal}</span></div><button className="primary" onClick={()=>{setToast('');setMode('play');notice(info.intro);}}>ENTER CHAMBER <ChevronRight size={19}/></button></>}
   {mode==='pause'&&<><span className="eyebrow bright">EXPERIMENT PAUSED</span><h2>Take a breath,<br/><em>explorer.</em></h2><p>Your checkpoint and discoveries are safe.</p><div className="stack"><button className="primary" onClick={()=>setMode('play')}><Play size={18}/> RESUME RUN</button><button className="secondary" onClick={()=>setDiagram(true)}><BookOpen size={17}/> REACTION PROFILE</button><button className="secondary" onClick={restart}><RotateCcw size={17}/> START OVER</button></div></>}
   {mode==='complete'&&<><span className="eyebrow bright">ALL CHAMBERS COMPLETE</span><div className="hero-symbol"><Zap size={43} fill="currentColor"/></div><h2>Reaction<br/><em>complete.</em></h2><p>You guided energy through reactions, formed new bonds, crossed an activation barrier, and fueled a living cell.</p><div className="final-stats"><div><strong>{score}</strong><span>EXPLORATION POINTS</span></div><div><strong>{lipids}</strong><span>LIPID RESERVES</span></div></div><button className="primary" onClick={restart}>RUN AGAIN <RotateCcw size={18}/></button></>}
  </div></div>}
  {help&&<div className="overlay" onClick={()=>setHelp(false)}><div className="panel help-panel" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setHelp(false)}><X/></button><span className="eyebrow">FIELD GUIDE</span><h2>How to play</h2><p>WASD or arrow keys move. Space jumps. E or Shift activates a nearby station. On touchscreens, use the bottom controls. Touch glowing orbs to collect them. Reach the checkpoint after completing each mission.</p><p>There is no timer or failure penalty. If a station needs more energy or a previous step, its hint tells you what to try.</p></div></div>}
  {diagram&&<div className="overlay" onClick={()=>setDiagram(false)}><div className="panel diagram-panel" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDiagram(false)} aria-label="Close"><X/></button><Diagram/><div className="formula"><span className="eyebrow">BOND FORGE / H₂ + Cl₂ → 2HCl</span><strong>ΔH = energy absorbed to break bonds − energy released when new bonds form</strong><p>H–H: 436 + Cl–Cl: 243 − 2(H–Cl: 431) = <b>−183 kJ mol⁻¹</b>. Negative means the reaction releases energy overall.</p></div></div></div>}
 </main>;
}
