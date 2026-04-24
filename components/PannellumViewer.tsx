'use client';
import { useEffect, useState } from 'react';

declare global { interface Window { pannellum: any; } }

export default function PannellumViewer() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // ดึงยอดวิวจาก API
    fetch('/api/views')
      .then(res => res.json())
      .then(data => setViews(data.views));

    // โหลด Pannellum Scripts
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    script.async = true;
    const link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";

    document.head.appendChild(script);
    document.head.appendChild(link);

    script.onload = () => {
      window.pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: '/image/Executive%20Double%20Final.jpg',
        autoLoad: true,
        autoRotate: -2,
      });
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div id="panorama-container" className="w-full h-full bg-slate-900" />
      
      {/* UI แสดงตัวเลขยอดวิวสไตล์ล้ำๆ */}
      <div className="absolute top-8 right-8 z-10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 text-white shadow-2xl">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">Live Analytics</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono tracking-tighter">
              {views !== null ? views.toLocaleString() : '---'}
            </span>
            <span className="text-sm opacity-60">VIEWS</span>
          </div>
        </div>
      </div>

      {/* Logo ที่ด้านขวาล่าง */}
      <div className="absolute bottom-8 right-8 z-10">
        <img 
          src="/image/cenivp.png" 
          alt="Cenivp" 
          className="h-12 opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Branding Name */}
      <div className="absolute bottom-8 left-8 z-10 text-white">
        <h1 className="text-2xl font-bold tracking-wider">
          <span className="text-cyan-400">Cen</span>
          <span className="text-white">IVP</span>
        </h1>
      </div>
    </div>
  );
}
