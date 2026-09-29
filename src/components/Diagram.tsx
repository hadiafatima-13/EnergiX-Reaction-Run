'use client';
import { useState } from 'react';
export default function Diagram({initial='exo'}:{initial?:'exo'|'endo'}) {
 const [mode,setMode]=useState<'exo'|'endo'>(initial);
 const exo=mode==='exo', react=exo?118:174, product=exo?174:118, peak=exo?42:34, low=exo?76:62;
 return <section className="diagram">
  <div className="diagram-head"><div><span className="eyebrow">LAB INSTRUMENT / 03</span><h3>Reaction energy profile</h3></div><div className="segmented"><button className={exo?'selected':''} onClick={()=>setMode('exo')}>Exothermic</button><button className={!exo?'selected':''} onClick={()=>setMode('endo')}>Endothermic</button></div></div>
  <svg viewBox="0 0 360 230" role="img" aria-label={`${mode} reaction diagram. Catalyst lowers activation energy but does not change reactant or product levels.`}>
   <defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5" fill="none" stroke="#f5d28e"/></marker></defs>
   <path d="M40 14 V202 H346" stroke="#829bab" strokeWidth="1.5" fill="none"/>
   <text x="15" y="130" transform="rotate(-90 15 130)" className="axis">Energy</text><text x="182" y="222" className="axis">Reaction progress →</text>
   <path d={`M45 ${react} H82 C112 ${react},118 ${peak},160 ${peak} S230 ${product},285 ${product} H325`} fill="none" stroke="#faaf79" strokeWidth="3"/>
   <path d={`M45 ${react} H82 C118 ${react},120 ${low},162 ${low} S230 ${product},285 ${product} H325`} fill="none" stroke="#6de5d2" strokeWidth="3" strokeDasharray="6 4"/>
   <path d={`M43 ${react} H83 M285 ${product} H335`} stroke="#abc0cd" strokeDasharray="3 4"/>
   <path d={`M92 ${react-3} V${peak+5}`} stroke="#f5d28e" strokeWidth="1.5" markerEnd="url(#arrow)"/>
   <text x="46" y={react+16} className="graph-label">Reactants</text><text x="277" y={product+17} className="graph-label">Products</text>
   <text x="96" y={Math.max(peak-4,22)} className="graph-label">Eₐ</text>
   <path d={`M330 ${react} V${product}`} stroke="#f5d28e" strokeWidth="1.5" markerEnd="url(#arrow)"/>
   <text x="298" y={(react+product)/2-4} className="graph-label">ΔH {exo?'−':'+'}</text>
  </svg>
  <div className="diagram-legend"><span><i style={{background:'#faaf79'}}/>No catalyst: higher barrier</span><span><i style={{background:'#6de5d2'}}/>Catalyst: lower barrier</span></div>
  <p>{exo?'Products have less energy than reactants. Energy leaves the system for the surroundings; ΔH is negative.':'Products have more energy than reactants. The system absorbs energy from its surroundings; ΔH is positive.'} The catalyst changes the route and Eₐ, never ΔH.</p>
 </section>;
}
