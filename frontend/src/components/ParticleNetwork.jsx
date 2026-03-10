import { useEffect, useRef } from "react";
import p5 from "p5";

export default function ParticleNetwork({ fadeOut }) {
  const containerRef = useRef(null);
  const sketchRef = useRef(null);
  const fadeOutRef = useRef(fadeOut);

  useEffect(() => {
    fadeOutRef.current = fadeOut;
  }, [fadeOut]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p) => {
      const particles = [];
      const PARTICLE_COUNT = 60;
      const CONNECTION_DIST = 120;
      let currentAlpha = 1;

      p.setup = () => {
        const canvas = p.createCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
        canvas.style("display", "block");

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.3, 0.3),
            vy: p.random(-0.3, 0.3),
            size: p.random(1.5, 3),
          });
        }
      };

      p.draw = () => {
        p.clear();

        const targetAlpha = fadeOutRef.current ? 0 : 1;
        currentAlpha = p.lerp(currentAlpha, targetAlpha, 0.02);

        if (currentAlpha < 0.01) return;

        for (const pt of particles) {
          pt.x += pt.vx;
          pt.y += pt.vy;

          if (pt.x < 0 || pt.x > p.width) pt.vx *= -1;
          if (pt.y < 0 || pt.y > p.height) pt.vy *= -1;

          p.noStroke();
          p.fill(59, 130, 246, 80 * currentAlpha);
          p.ellipse(pt.x, pt.y, pt.size);
        }

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const d = p.dist(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            if (d < CONNECTION_DIST) {
              const alpha = p.map(d, 0, CONNECTION_DIST, 40, 0) * currentAlpha;
              p.stroke(59, 130, 246, alpha);
              p.strokeWeight(0.5);
              p.line(
                particles[i].x, particles[i].y,
                particles[j].x, particles[j].y
              );
            }
          }
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight
          );
        }
      };
    };

    sketchRef.current = new p5(sketch, containerRef.current);

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
