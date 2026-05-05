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
      // ล้างหน่วยความจำเก่าทิ้งก่อน (สำคัญมากสำหรับ iPad/มือถือ)
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }

      // เช็คว่าเป็นมือถือหรือแท็บเล็ต (iPad) หรือไม่ 
      // ปรับเป็น 1180 เพื่อให้ iPad โหลดรูปเล็กด้วย จะได้ไม่จอดำ
      const isMobileOrTablet = window.innerWidth <= 1180;
      
      // เลือกใช้รูปตามขนาดหน้าจอ (สะกดชื่อไฟล์ให้ตรงกับใน GitHub เป๊ะๆ)
      const selectedPanorama = isMobileOrTablet 
        ? '/image/Executive-Double-Final-4096x2048.jpg' // รูป 4K (สำหรับมือถือ/iPad)
        : '/image/Executive-Double-Final.jpg';          // รูป 16K (สำหรับคอมพิวเตอร์)

      viewerRef.current = window.pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: selectedPanorama,
        autoLoad: true,
        autoRotate: -2,
        orientationOnDeviceMotion: true, // เอียงเครื่องหมุนตาม (สำหรับมือถือ/iPad)
        backgroundColor: [0.1, 0.1, 0.1],
        showControls: false, // ปิดปุ่มควบคุมเดิมของ Pannellum (ถ้าต้องการเปิดให้แก้เป็น true)
      });
    }

    // ทำลาย viewer เมื่อออกจากหน้าเว็บเพื่อคืนค่า RAM
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div id="panorama-container" className="w-full h-full bg-slate-900" />
      
      {/* ส่วนแสดงยอดวิว (โค้ดเดิม) */}
      <div className="absolute top-8 right-8 z-10 bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 text-white shadow-2xl pointer-events-none">
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

      {/* โลโก้ขวาล่าง (โค้ดเดิม) */}
      <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
        <img 
          src="/image/cenivp.png" 
          alt="Cenivp" 
          className="h-12 opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* ========================================================= */}
      {/* แก้ไขใหม่: โลโก้ CenIVP ซ้ายล่าง (มีอนิเมชั่น 360 และคลิกเพื่อแพนกล้อง) */}
      {/* ========================================================= */}
      <div 
        className="absolute bottom-8 left-8 z-10 text-white flex items-center gap-3 cursor-pointer group bg-black/30 p-3 rounded-2xl backdrop-blur-sm transition-colors hover:bg-black/50"
        onClick={() => {
          // ฟังก์ชันสั่งให้กล้อง 360 หมุนไปทางขวา 30 องศาแบบนุ่มนวล
          if (viewerRef.current) {
            viewerRef.current.setYaw(viewerRef.current.getYaw() + 30, true);
          }
        }}
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* วงแหวนหมุน */}
          <div className="absolute w-full h-full border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] font-bold text-cyan-400">360°</span>
        </div>
        <h1 className="text-2xl font-bold tracking-wider group-hover:scale-105 transition-transform duration-300">
          <span className="text-cyan-400">Cen</span>
          <span className="text-white">IVP</span>
        </h1>
      </div>

      {/* ========================================================= */}
      {/* เพิ่มใหม่: ปุ่ม BOOK NOW ตรงกลางด้านล่าง */}
      {/* ========================================================= */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <a 
          href="https://reservation.gbibangkok.com/ibe/b/Grand-Business-Inn#/room/05%20May%2026/06%20May%2026" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:scale-110 hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all duration-300 flex items-center gap-2"
        >
          <span className="animate-pulse">🛎️</span> BOOK NOW
        </a>
      </div>

    </div>
  );
}