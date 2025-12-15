"use client";

import { useEffect, useState } from "react";

export default function ScrollFadeOverlay() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Fade out over de eerste 2 viewport heights
      const fadeDistance = windowHeight * 2;
      const newOpacity = Math.max(0, 1 - scrollPosition / fadeDistance);
      
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{
        opacity: opacity,
        background: `linear-gradient(
          180deg,
          transparent 0%,
          hsl(221.2 83.2% 53.3% / 0.15) 40%,
          hsl(221.2 83.2% 53.3% / 0.25) 70%,
          hsl(221.2 83.2% 53.3% / 0.20) 100%
        )`,
      }}
    />
  );
}

