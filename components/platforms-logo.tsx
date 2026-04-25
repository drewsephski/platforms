import type { SVGProps } from "react";

const PlatformsLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 45 45" fill="none">
    {/* Background glow */}
    <circle
      cx="22.5"
      cy="22.5"
      r="20"
      fill="currentColor"
      fillOpacity="0.05"
    />
    
    {/* Bottom platform - largest */}
    <path
      d="M7 28L22.5 36.5L38 28V24L22.5 32.5L7 24V28Z"
      fill="currentColor"
      fillOpacity="0.15"
    />
    
    {/* Middle platform */}
    <path
      d="M9 22L22.5 29.5L36 22V18.5L22.5 26L9 18.5V22Z"
      fill="currentColor"
      fillOpacity="0.3"
    />
    
    {/* Top platform - main */}
    <path
      d="M11 16L22.5 22.5L34 16V13L22.5 19.5L11 13V16Z"
      fill="currentColor"
      fillOpacity="0.5"
    />
    
    {/* Floating element - accent */}
    <path
      d="M22.5 8L28 11V17L22.5 20L17 17V11L22.5 8Z"
      fill="currentColor"
    />
    
    {/* Inner highlight */}
    <path
      d="M22.5 10L26 12V16L22.5 18L19 16V12L22.5 10Z"
      fill="white"
      fillOpacity="0.9"
    />
    
    {/* Core dot */}
    <circle
      cx="22.5"
      cy="14"
      r="1.5"
      fill="currentColor"
    />
  </svg>
);

export { PlatformsLogo };
