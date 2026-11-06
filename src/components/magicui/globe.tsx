"use client";

import React, { useEffect, useRef, memo } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { cn } from "@/lib/utils";

export const GLOBE_CONFIG: COBEOptions = {
  width: 1200,
  height: 1200,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.25,
  dark: 1,
  diffuse: 1.35,
  mapSamples: 16000,
  mapBrightness: 5.2,
  baseColor: [0.32, 0.35, 0.42],
  markerColor: [0.2, 0.2, 0.2],
  glowColor: [0.18, 0.22, 0.28],
  markers: [],
  arcs: [],
};

export interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
  key?: React.Key;
}

export const Globe = memo(function Globe({
  className,
  config = GLOBE_CONFIG,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(800);
  const globeRef = useRef<any>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const baseColorStr = config?.baseColor ? config.baseColor.join(",") : "";
  const glowColorStr = config?.glowColor ? config.glowColor.join(",") : "";

  // Smoothly update dynamic color properties without recreating map samples or causing WebGL lag
  useEffect(() => {
    if (globeRef.current && config) {
      globeRef.current.update({
        baseColor: config.baseColor,
        glowColor: config.glowColor,
        markerColor: config.markerColor,
      });
    }
  }, [baseColorStr, glowColorStr]);

  // Initialize WebGL globe ONCE on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const measureWidth = () => {
      const w =
        containerRef.current?.offsetWidth ||
        canvasRef.current?.offsetWidth ||
        800;
      return Math.max(w, 320);
    };

    widthRef.current = measureWidth();

    const canvas = canvasRef.current;
    let animId: number;
    let isTabVisible = true;
    let isDestroyed = false;

    const initGlobe = () => {
      if (!canvas || isDestroyed) return;
      if (globeRef.current?.destroy) {
        try {
          globeRef.current.destroy();
        } catch (_) {}
      }

      widthRef.current = measureWidth();
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

      const mergedConfig: COBEOptions = {
        ...GLOBE_CONFIG,
        devicePixelRatio: dpr,
        ...configRef.current,
        mapSamples: 12000,
        markers: [],
        arcs: [],
        width: widthRef.current,
        height: widthRef.current,
      };

      try {
        globeRef.current = createGlobe(canvas, mergedConfig);
      } catch (err) {
        console.error("Magic UI Globe initialization error:", err);
      }
    };

    initGlobe();

    const render = () => {
      if (isTabVisible && !isDestroyed) {
        phiRef.current += 0.003;

        if (globeRef.current?.update) {
          // CRITICAL: Only update rotation angle (phi) each frame.
          // Passing width/height every frame forces canvas reallocation and GPU memory leak!
          globeRef.current.update({
            phi: phiRef.current,
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      isTabVisible = document.visibilityState !== "hidden";
      if (isTabVisible && (!globeRef.current || !canvasRef.current)) {
        initGlobe();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (globeRef.current?.destroy) {
        try {
          globeRef.current.destroy();
        } catch (_) {}
        globeRef.current = null;
      }
    };

    const handleContextRestored = () => {
      initGlobe();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const measured = entry.contentRect.width;
        if (measured > 50 && Math.abs(measured - widthRef.current) > 20) {
          widthRef.current = measured;
          if (globeRef.current?.update) {
            globeRef.current.update({
              width: measured,
              height: measured,
            });
          }
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      resizeObserver.disconnect();
      if (globeRef.current?.destroy) {
        try {
          globeRef.current.destroy();
        } catch (_) {}
        globeRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto aspect-square w-full flex items-center justify-center pointer-events-none select-none",
        className
      )}
    >
      <canvas
        className="w-full h-full aspect-square pointer-events-none select-none"
        ref={canvasRef}
      />
    </div>
  );
});
