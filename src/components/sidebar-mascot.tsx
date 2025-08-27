
"use client";

import Image from 'next/image';

const WavingCylinder = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 150 200" 
        width="150" 
        height="200"
        {...props}
    >
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Body */}
        <path d="M30,50 a1,1 0 0,1 90,0 v130 a1,1 0 0,1 -90,0 z" fill="#D32F2F" stroke="#B71C1C" strokeWidth="2" />
        <path d="M30,50 a1,1 0 0,0 90,0" fill="none" stroke="#B71C1C" strokeWidth="2" />

        {/* Top Rim */}
        <ellipse cx="75" cy="50" rx="45" ry="10" fill="#E57373" stroke="#C62828" strokeWidth="2" />
        
        {/* Valve */}
        <rect x="65" y="30" width="20" height="20" fill="#757575" stroke="#424242" strokeWidth="1" rx="2"/>
        <rect x="70" y="25" width="10" height="5" fill="#9E9E9E" stroke="#616161" strokeWidth="1"/>

        {/* Face */}
        <circle cx="60" cy="90" r="8" fill="white"><animate attributeName="r" values="8;9;8" dur="1s" repeatCount="indefinite" /></circle>
        <circle cx="90" cy="90" r="8" fill="white"><animate attributeName="r" values="8;9;8" dur="1s" repeatCount="indefinite" /></circle>
        <circle cx="60" cy="90" r="4" fill="black" />
        <circle cx="90" cy="90" r="4" fill="black" />
        
        <path d="M65,110 Q75,125 85,110" stroke="black" strokeWidth="2" fill="none" />

        {/* Waving Arm */}
        <g className="animate-wave origin-bottom">
             <path d="M20,100 C10,120 10,140 25,160" stroke="#B71C1C" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="28" cy="165" r="10" fill="#F44336" stroke="#B71C1C" strokeWidth="2" />
        </g>
    </svg>
);


export function SidebarMascot() {
  return (
    <div className="relative mt-auto mb-4 flex justify-center p-4">
       <WavingCylinder className="w-36 h-auto" data-ai-hint="friendly mascot"/>
    </div>
  );
}
