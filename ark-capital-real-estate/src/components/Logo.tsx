"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  width?: number;
  height?: number;
};

const LOG_SERVER = "http://127.0.0.1:7242/ingest/e5e5bc3d-5cbe-4abc-a632-6d34ef797c4a";

function log(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  fetch(LOG_SERVER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, message, data, timestamp: Date.now(), hypothesisId }),
  }).catch(() => {});
}

export default function Logo({ variant = "light", className = "", width = 180, height = 48 }: LogoProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  // #region agent log
  useEffect(() => {
    log("Logo.tsx:mount", "Logo mounted", { variant, width, height }, "H1");
  }, [variant, width, height]);
  // #endregion

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      log("Logo.tsx:observer", "No ref element", {}, "H3");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // #region agent log
          log("Logo.tsx:intersect", "Intersection", { isIntersecting: entry.isIntersecting, visible: entry.intersectionRatio }, "H3");
          // #endregion
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // #region agent log
  useEffect(() => {
    log("Logo.tsx:visible", "Visible state", { visible, runId: "post-fix" }, "H3");
  }, [visible]);
  // #endregion

  return (
    <span
      ref={ref}
      className={`inline-block logo-pop ${visible ? "logo-pop-visible" : ""}`}
    >
      <Image
        src="/images/logo.png"
        alt="Ark Capital Real Estate"
        width={width}
        height={height}
        unoptimized
        className={
          variant === "dark"
            ? `h-9 w-auto object-contain brightness-0 invert opacity-95 ${className}`.trim()
            : `h-10 w-auto object-contain ${className}`.trim()
        }
        onLoad={() => log("Logo.tsx:img", "Image onLoad", { variant, runId: "post-fix" }, "H2")}
        onError={() => log("Logo.tsx:img", "Image onError", { variant, runId: "post-fix" }, "H2")}
      />
    </span>
  );
}
