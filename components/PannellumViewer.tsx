'use client';
import { useEffect, useState, useRef } from 'react';

declare global { interface Window { pannellum: any; } }

export default function PannellumViewer() {
  const [views, setViews] = useState<number | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // 1. ดึงยอดวิวจาก API
    fetch('/api/views')
      .then(res => res.json())
      .then(data => setViews(data.views))
      .catch(err => console.error("Error fetching views:", err));

    // 2. โหลด Pannellum Scripts & CSS
    if (!document.getElementById('pannellum-script')) {
      const script = document.createElement('script');
      script.id = 'pannellum-script';
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
      script.async = true;
      
      const link = document.createElement('link');
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      
      document.head.appendChild(script);
      document.head.appendChild(link);

      script.onload = initViewer;
    } else if (window.pannellum) {
      initViewer();
    }

    function initViewer() {
      // ล้าง Viewer เก่าทิ้งเพื่อคืน RAM (ป้องกันจอดำ)
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      // --- ส่วนที่รวม Logic เลือกรูปภาพ ---
      const isMobile = window.innerWidth <= 768;
      
      const selectedPanorama = isMobile 
        ? '/image/Executive Double Final-4096x2048.jpg'    // รูปที่ Resize (4096px) สำหรับมือถือ
        : '/image/Executive Double Final.jpg'; // รูปต้นฉบับ (16K) สำหรับคอม

      viewerRef.current = window.pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: selectedPanorama,
        autoLoad: true,
        autoRotate: -2,
        orientationOnDeviceMotion: true, // เอียงมือถือเพื่อดูภาพได้
        backgroundColor: [0.1, 0.1, 0.1],
      });
    }

    // Cleanup เมื่อปิดหน้าเว็บ
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div id="panorama-container" className="w-full h-full bg-slate-900" />
      
      {/* UI Analytics */}
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

      {/* Logo & Branding */}
      <div className="absolute bottom-8 right-8 z-10">
        <img 
          src="/image/cenivp.png" 
          alt="Cenivp" 
          className="h-12 opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="absolute bottom-8 left-8 z-10 text-white">
        <h1 className="text-2xl font-bold tracking-wider">
          <span className="text-cyan-400">Cen</span>
          <span className="text-white">IVP</span>
        </h1>
      </div>
    </div>
  );
}