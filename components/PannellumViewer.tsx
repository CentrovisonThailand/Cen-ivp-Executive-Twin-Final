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
      
      // เลือกใช้รูปตามขนาดหน้าจอ
      const selectedPanorama = isMobileOrTablet 
        ? '/image/Executive-Double-Final-4096x2048.jpg' 
        : '/image/Executive-Double-Final.jpg';          

      viewerRef.current = window.pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: selectedPanorama,
        autoLoad: true,
        autoRotate: -2,
        orientationOnDeviceMotion: true, 
        backgroundColor: [0.1, 0.1, 0.1],
        showControls: false, 
      });
    }

    // ทำลาย viewer เมื่อออกจากหน้าเว็บ
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div id="panorama-container" className="w-full h-full bg-slate-900" />
      
      {/* ส่วนแสดงยอดวิว (ขวาบน) */}
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

      {/* ========================================================= */}
      {/* 1. รูป 360 องศา (ซ้ายล่าง) - คลิกเพื่อแพนกล้องได้ */}
      {/* ========================================================= */}
      <div 
        className="absolute bottom-8 left-8 z-10 cursor-pointer group"
        onClick={() => {
          // สั่งให้กล้องหมุนขวา 30 องศาเมื่อคลิกที่ไอคอน 360
          if (viewerRef.current) {
            viewerRef.current.setYaw(viewerRef.current.getYaw() + 30, true);
          }
        }}
      >
        <img 
          src="/image/360-icon.png" 
          alt="360 View" 
          /* เพิ่ม invert เพื่อเปลี่ยนรูปสีดำให้เป็นสีขาว จะได้ตัดกับพื้นหลัง */
          className="h-16 md:h-20 w-auto object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-xl invert"
        />
      </div>

      {/* ========================================================= */}
      {/* 2. โลโก้ CenIVP (ขวาล่าง) - ปรับขนาดให้ใหญ่ขึ้นนิดนึง (h-16 ถึง h-20) */}
      {/* ========================================================= */}
      <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
        <img 
          src="/image/cenivp.png" 
          alt="Cenivp" 
          className="h-16 md:h-20 w-auto object-contain opacity-90 drop-shadow-lg"
        />
      </div>

      {/* ========================================================= */}
      {/* 3. ปุ่ม BOOK NOW (ตรงกลางด้านล่าง) */}
      {/* ========================================================= */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <a 
          href="https://reservation.gbibangkok.com/ibe/b/Grand-Business-Inn#/room/05%20May%2026/06%20May%2026" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:scale-110 hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all duration-300 block text-center tracking-wider"
        >
          BOOK NOW
        </a>
      </div>

    </div>
  );
}
