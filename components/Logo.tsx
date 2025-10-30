
import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    width="256" 
    height="256" 
    viewBox="0 0 256 256" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_101_2)">
      <rect width="48" height="112" x="32" y="72" fill="#3b82f6" rx="8"/>
      <rect width="48" height="112" x="176" y="72" fill="#3b82f6" rx="8"/>
      <rect width="96" height="32" x="80" y="112" fill="#93c5fd" rx="8"/>
    </g>
    <defs>
      <clipPath id="clip0_101_2">
        <rect width="256" height="256" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);
