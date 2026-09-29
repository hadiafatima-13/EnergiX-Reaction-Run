'use client';
import dynamic from 'next/dynamic';
const Game = dynamic(() => import('@/components/Game'), { ssr: false, loading: () => <main className="loading">Warming up the molecular world…</main> });
export default function Home() { return <Game />; }
