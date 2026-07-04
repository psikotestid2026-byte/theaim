"use client";

import { useEffect, useRef } from "react";

interface Props {
  url: string;
}

export default function QRCodeDisplay({ url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(QRCode => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 160,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    });
    return () => { cancelled = true; };
  }, [url]);

  return <canvas ref={canvasRef} className="rounded-xl border border-slate-200 shadow-sm" />;
}
