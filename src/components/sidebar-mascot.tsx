
"use client";

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function SidebarMascot() {
  return (
    <div className="relative mt-auto mb-4 flex justify-center p-4">
       <div className="w-48 h-48">
            <div className="relative w-full h-full">
                {/* Body */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-red-500 rounded-t-full rounded-b-lg border-2 border-red-700"></div>
                {/* Top handle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-10 bg-red-500 border-2 border-red-700 rounded-t-lg">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-background rounded-sm"></div>
                </div>
                 <div className="absolute top-0 left-1/2 -translate-x-[70px] w-6 h-8 bg-red-500 border-2 border-red-700 rounded-t-md"></div>
                 <div className="absolute top-0 left-1/2 translate-x-[46px] w-6 h-8 bg-red-500 border-2 border-red-700 rounded-t-md"></div>

                {/* Eyes */}
                <div className="absolute top-20 left-1/2 -translate-x-[140%] w-10 h-10 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                    <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
                </div>
                <div className="absolute top-20 left-1/2 translate-x-[40%] w-10 h-10 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                    <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
                </div>

                {/* Mouth */}
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-800 rounded-b-full overflow-hidden">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-white rounded-t-full"></div>
                </div>

                {/* Arms */}
                <div className="absolute top-24 left-0 w-12 h-4 bg-red-500 rounded-l-full animate-wave-left origin-right"></div>
                 <div className="absolute top-24 right-0 w-12 h-4 bg-red-500 rounded-r-full animate-wave-right origin-left"></div>


                {/* Hands */}
                 <div className="absolute top-20 -left-6 w-10 h-10 bg-white rounded-full border-2 border-gray-800 animate-wave-left origin-right"></div>
                 <div className="absolute top-20 -right-6 w-10 h-10 bg-white rounded-full border-2 border-gray-800 animate-wave-right origin-left"></div>

                {/* Feet */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-[150%] w-8 h-4 bg-red-600 rounded-full border-2 border-red-800"></div>
                <div className="absolute -bottom-2 left-1/2 translate-x-[50%] w-8 h-4 bg-red-600 rounded-full border-2 border-red-800"></div>
            </div>
       </div>
    </div>
  );
}
