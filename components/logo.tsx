"use client";

import Image from "next/image";
import { Link } from '@/i18n/routing';
import { useState } from "react";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
  height?: number;
  white?: boolean; // Use white version of logo
}

export default function Logo({ 
  className = "", 
  href = "/", 
  showText = false,
  height = 40,
  white = false
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imageError ? (
        <Image
          src={white ? "/images/logo-white.png" : "/images/logo.png"}
          alt="Auxilium Incasso"
          width={height * 3}
          height={height}
          className="h-auto w-auto object-contain"
          priority
          onError={() => {
            console.error('Logo image failed to load');
            setImageError(true);
          }}
        />
      ) : (
        <div 
          style={{ width: height * 3, height: height }}
          className="flex items-center justify-center bg-white/10 rounded px-2"
        >
          <span className="text-xs font-bold" style={{ fontSize: `${height * 0.4}px` }}>Auxilium</span>
        </div>
      )}
      {showText && (
        <span className="text-2xl font-bold text-primary ml-2">Auxilium Incasso</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}

