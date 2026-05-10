"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      gold: boolean;
    }> = [];

    let W: number, H: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const createParticle = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.4 + 0.05,
      gold: Math.random() > 0.7,
    });

    for (let i = 0; i < 70; i++) particles.push(createParticle());

    const drawParticles = () => {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(200,169,110,${p.opacity})`
          : `rgba(255,255,255,${p.opacity * 0.4})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      });

      // Draw connections between nearby gold particles
      particles
        .filter((p) => p.gold)
        .forEach((p, i, arr) => {
          arr.slice(i + 1).forEach((q) => {
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(200,169,110,${(1 - d / 120) * 0.06})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });

      requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      id="particle-canvas"
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.4,
      }}
    />
  );
}
