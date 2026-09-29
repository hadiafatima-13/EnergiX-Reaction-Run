'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, Text } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { NODES, STAGE_END, type Stage } from '@/lib/game';

export type Position = { x:number; z:number; y:number };
type Props = { stage:Stage; position:Position; done:Set<string>; active:boolean; onReady:()=>void; onError:()=>void };

function CameraRig({position}:{position:Position}) {
 const {camera}=useThree();
 useFrame((_,dt)=>{const target=new THREE.Vector3(position.x*0.35,8,position.z-12); camera.position.lerp(target,Math.min(1,dt*3)); camera.lookAt(position.x*0.2,0.7,position.z+10);});
 return null;
}
function Avatar({position,stage}:{position:Position;stage:Stage}) {
 const body=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(body.current)body.current.rotation.y=Math.sin(clock.elapsedTime*2)*0.12;});
 const color=['#53ece0','#ffca78','#bba4ff','#a0f5a9'][stage];
 return <group ref={body} position={[position.x,position.y,position.z]}>
  <mesh castShadow position={[0,0.8,0]}><capsuleGeometry args={[0.42,0.65,8,16]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.4} roughness={0.25}/></mesh>
  <mesh position={[0,1.44,0.18]}><sphereGeometry args={[0.35,16,16]}/><meshStandardMaterial color="#e8fbff" emissive="#7594a4" emissiveIntensity={0.2}/></mesh>
  <mesh position={[-0.12,1.5,0.47]}><sphereGeometry args={[0.045,8,8]}/><meshBasicMaterial color="#102133"/></mesh>
  <mesh position={[0.12,1.5,0.47]}><sphereGeometry args={[0.045,8,8]}/><meshBasicMaterial color="#102133"/></mesh>
  <pointLight position={[0,1,0]} color={color} intensity={3} distance={5}/>
 </group>;
}
function Orb({x,z,color,label}:{x:number;z:number;color:string;label:string}) {
 return <Float speed={3} floatIntensity={0.5} rotationIntensity={0.5}><group position={[x,1.35,z]}>
  <mesh><icosahedronGeometry args={[0.5,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} metalness={0.2}/></mesh>
  <mesh rotation={[Math.PI/3,0,0]}><torusGeometry args={[0.75,0.025,6,32]}/><meshBasicMaterial color={color}/></mesh>
  <Text position={[0,1.05,0]} fontSize={0.28} color="#ffffff" anchorX="center" outlineWidth={0.025} outlineColor="#071522">{label.toUpperCase()}</Text>
  <pointLight color={color} intensity={2} distance={4}/>
 </group></Float>;
}
function Station({x,z,color,label,done}:{x:number;z:number;color:string;label:string;done:boolean}) {
 return <group position={[x,0,z]}>
  <mesh position={[0,0.16,0]}><cylinderGeometry args={[1.25,1.35,0.32,32]}/><meshStandardMaterial color={done?'#34505a':color} emissive={color} emissiveIntensity={done?0.1:0.7} metalness={0.6} roughness={0.3}/></mesh>
  <mesh position={[0,1.2,0]}><icosahedronGeometry args={[0.65,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={done?0.1:0.8} transparent opacity={done?0.38:0.85} wireframe/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.04,0]}><ringGeometry args={[1.5,1.58,48]}/><meshBasicMaterial color={color}/></mesh>
  <Text position={[0,2.5,0]} fontSize={0.36} maxWidth={4.5} color="#ffffff" anchorX="center" outlineWidth={0.035} outlineColor="#081324">{done?'✓ ':''}{label}</Text>
  {!done&&<pointLight color={color} intensity={2} distance={5}/>}
 </group>;
}
function EnergyTransfer({stage,done}:{stage:Stage;done:Set<string>}) {
 if(stage!==0)return null;
 return <group>{(['exo','endo'] as const).map((id)=>{const node=NODES[0].find(n=>n.id===id)!;const complete=done.has(id);return <group key={id} position={[node.x,0,node.z]}>
  <mesh position={[0,1,0]}><sphereGeometry args={[1.6,24,16]}/><meshPhysicalMaterial color={id==='exo'?'#fcad6e':'#6ac9e9'} transparent opacity={0.12} metalness={0.15} roughness={0.15} side={THREE.DoubleSide}/></mesh>
  <Text position={[0,3.2,0]} fontSize={0.26} color="#e3f8fb">CHEMICAL SYSTEM</Text>
  <Text position={[0,0.35,3]} fontSize={0.23} color="#c2d8df">SURROUNDINGS</Text>
  {complete&&Array.from({length:8},(_,i)=>{const angle=i*Math.PI/4;const radius=id==='exo'?2.35:1.1;return <mesh key={i} position={[Math.cos(angle)*radius,1+Math.sin(i*3)*0.45,Math.sin(angle)*radius]}><sphereGeometry args={[0.1,8,8]}/><meshBasicMaterial color={id==='exo'?'#ffb66e':'#76d9fa'}/></mesh>;})}
 </group>;})}</group>;
}
function Chamber({stage}:{stage:Stage}) {
 const palette=['#1a5a62','#704630','#514579','#315f59'][stage];
 const accent=['#47ded7','#ffbd76','#bb9dff','#92e5ad'][stage];
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.12,STAGE_END[stage]/2]} receiveShadow><planeGeometry args={[12,STAGE_END[stage]+30]}/><meshStandardMaterial color="#091b29" roughness={0.8}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.08,STAGE_END[stage]/2]}><planeGeometry args={[7,STAGE_END[stage]+30]}/><meshStandardMaterial color={palette} emissive={palette} emissiveIntensity={0.28} metalness={0.4}/></mesh>
  {Array.from({length:Math.ceil(STAGE_END[stage]/5)+2},(_,i)=><group key={i} position={[0,0,i*5]}>
   <mesh position={[0,0.02,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[6.8,0.05]}/><meshBasicMaterial color={accent} transparent opacity={0.55}/></mesh>
   {[-5,5].map(x=><group key={x} position={[x,0,0]}><mesh position={[0,2.3,0]}><cylinderGeometry args={[0.12,0.2,4.6,8]}/><meshStandardMaterial color={palette} emissive={accent} emissiveIntensity={0.28}/></mesh><mesh position={[0,4.6,0]}><sphereGeometry args={[0.23,8,8]}/><meshBasicMaterial color={accent}/></mesh></group>)}
  </group>)}
  {[-3.5,3.5].map(x=><mesh key={x} position={[x,0.05,STAGE_END[stage]/2]}><boxGeometry args={[0.08,0.09,STAGE_END[stage]+30]}/><meshBasicMaterial color={accent}/></mesh>)}
  {stage===3 && Array.from({length:18},(_,i)=><mesh key={i} position={[(i%2?1:-1)*(5.3+i%3),2+(i%4),i*4]}><sphereGeometry args={[0.45+(i%3)*0.2,12,12]}/><meshStandardMaterial color={i%2?'#a7e3d4':'#9d8de5'} transparent opacity={0.35} emissive={accent} emissiveIntensity={0.2}/></mesh>)}
  <Sparkles count={55} scale={[13,7,STAGE_END[stage]+15]} position={[0,3,STAGE_END[stage]/2]} size={2} speed={0.35} color={accent}/>
  <mesh position={[0,1.6,STAGE_END[stage]]}><torusGeometry args={[2.2,0.18,12,48]}/><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4}/></mesh>
  <Text position={[0,4.3,STAGE_END[stage]]} fontSize={0.42} color="white" outlineWidth={0.035} outlineColor="#061624">CHECKPOINT</Text>
 </group>;
}
function Ready({onReady}:{onReady:()=>void}) { const {gl}=useThree(); useFrame(()=>{if(gl.info.render.frame===2)onReady();}); return null; }
export default function World({stage,position,done,active,onReady,onError}:Props) {
 return <div className="canvas-wrap"><Canvas shadows dpr={[1,1.65]} camera={{position:[0,8,-12],fov:58}} onCreated={()=>onReady()} onError={onError} gl={{antialias:true,powerPreference:'high-performance'}}>
  <color attach="background" args={['#071626']}/><fog attach="fog" args={['#071626',20,72]}/>
  <ambientLight intensity={1.1}/><directionalLight position={[-6,12,4]} intensity={2} color="#d8f7ff" castShadow shadow-mapSize={[1024,1024]}/>
  <Suspense fallback={null}><Chamber stage={stage}/><EnergyTransfer stage={stage} done={done}/>{NODES[stage].filter(n=>!done.has(n.id)||n.kind==='station').map(n=>n.kind==='collect'?<Orb key={n.id} {...n}/>:<Station key={n.id} {...n} done={done.has(n.id)}/>)}<Avatar position={position} stage={stage}/><CameraRig position={position}/><Ready onReady={onReady}/></Suspense>
  {active&&<pointLight position={[0,7,position.z+10]} color="#8ad8ff" intensity={8} distance={25}/>}
 </Canvas></div>;
}
