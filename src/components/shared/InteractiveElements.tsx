'use client';

import React, { useEffect, useState } from 'react';

const BEAN_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10C20 5.58 16.42 2 12 2ZM12 16C8.69 16 6 13.31 6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10C18 13.31 15.31 16 12 16Z" opacity="0.4"/>
    <path d="M14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6C13.1 6 14 6.9 14 8Z" />
  </svg>
);

export default function InteractiveElements() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  if (isMobile) return null;

  // Simple elegant setup: 6 beans
  const beans = [
    { id: 1, top: '15%', left: '10%', scale: 0.8, rotate: 15, depth: 0.05 },
    { id: 2, top: '45%', left: '85%', scale: 1.2, rotate: -25, depth: 0.08 },
    { id: 3, top: '75%', left: '15%', scale: 0.6, rotate: 45, depth: 0.03 },
    { id: 4, top: '25%', left: '70%', scale: 1.0, rotate: 110, depth: 0.06 },
    { id: 5, top: '60%', left: '40%', scale: 0.7, rotate: -15, depth: 0.04 },
    { id: 6, top: '85%', left: '80%', scale: 0.9, rotate: 30, depth: 0.07 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* ── CURSOR GLOW ── */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.08] transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, #735a3e 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          transform: `scale(${1 + Math.sin(Date.now() / 1000) * 0.05})`,
        }}
      />

      {/* ── FLOATING BEANS (PARALLAX) ── */}
      {beans.map((bean) => (
        <div
          key={bean.id}
          className="absolute text-primary transition-transform duration-500 ease-out animate-float"
          style={{
            top: bean.top,
            left: bean.left,
            transform: `
              translate(${mousePos.x * bean.depth}px, ${mousePos.y * bean.depth}px) 
              scale(${bean.scale}) 
              rotate(${bean.rotate}deg)
            `,
            animationDelay: `${bean.id * 1.5}s`,
          }}
        >
          {BEAN_SVG}
        </div>
      ))}
    </div>
  );
}
