"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const LoadingOverlay = () => {
  const [showWaitMessage, setShowWaitMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWaitMessage(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/bw-logo.png"
          alt="agent-prod"
          width="40"
          height="40"
          className="rounded-full mx-auto mb-4"
        />
        <p className="text-lg font-semibold">Generating Drafts</p>
        <p
          className={`mt-2 transition-opacity duration-1000 ${showWaitMessage ? "opacity-100" : "opacity-0"
            }`}
        >
          Please wait
        </p>
      </div>
    </div>
  );
};
