
"use client";

import Image from 'next/image';

export function SidebarMascot() {
  return (
    <div className="relative mt-auto mb-4 flex justify-center p-4">
       <Image 
        src="https://i.imgur.com/gQOFa0I.png" 
        alt="Gas Cylinder Mascot"
        width={150}
        height={150}
        className="w-36 h-auto"
        data-ai-hint="friendly mascot"
      />
    </div>
  );
}
