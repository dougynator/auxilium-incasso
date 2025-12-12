"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
  height?: number;
}

export default function Logo({ 
  className = "", 
  href = "/", 
  showText = false,
  height = 40 
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imageError ? (
        <Image
          src="/images/logo.png"
          alt="Auxilium Incasso"
          width={height * 3}
          height={height}
          className="h-auto w-auto object-contain"
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-2xl font-bold text-primary">Auxilium Incasso</span>
      )}
      {showText && !imageError && (
        <span className="text-2xl font-bold text-primary ml-2">Auxilium Incasso</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}

