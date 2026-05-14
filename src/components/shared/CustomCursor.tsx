"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef<number>(0);

  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      if (dotRef.current) dotRef.current.style.display = "none";
      if (ringRef.current) ringRef.current.style.display = "none";
      return;
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Immediate update for the dot to feel responsive
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const tick = () => {
      // Smooth interpolation for the ring
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    // Initial position to avoid jumping from (0,0)
    const handleInitial = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      ring.current = { x: e.clientX, y: e.clientY };
      window.removeEventListener("mousemove", handleInitial);
    };
    window.addEventListener("mousemove", handleInitial);

    // Handle interactive elements
    const updateInteractives = () => {
      const interactives = document.querySelectorAll('a, button, [role="button"], input, select, textarea, [data-cursor="interactive"]');
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
      });
    };

    updateInteractives();
    
    // Optional: Mutation observer to handle dynamic content
    const observer = new MutationObserver(updateInteractives);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", handleInitial);
      cancelAnimationFrame(raf.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef}  
        className="cursor-dot fixed left-0 top-0 z-[9999] pointer-events-none mix-blend-difference" 
        style={{ width: '6px', height: '6px', backgroundColor: 'var(--signal-blue)', borderRadius: '50%', willChange: 'transform' }}
        aria-hidden="true" 
      />
      <div 
        ref={ringRef} 
        className="cursor-ring fixed left-0 top-0 z-[9998] pointer-events-none mix-blend-difference" 
        style={{ width: '40px', height: '40px', border: '1px solid var(--signal-blue)', opacity: 0.5, borderRadius: '50%', willChange: 'transform', transition: 'width 0.3s ease, height 0.3s ease' }}
        aria-hidden="true" 
      />
      <style jsx global>{`
        body.cursor-hover .cursor-ring {
          width: 60px !important;
          height: 60px !important;
          border-color: var(--gold) !important;
          background: rgba(201, 178, 124, 0.1);
        }
        @media (pointer: coarse) {
          .cursor-dot, .cursor-ring { display: none !important; }
        }
      `}</style>
    </>
  );
}
