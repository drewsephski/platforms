import type { SVGProps } from "react";

const AuthIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 45 45" fill="none">
    {/* Background shadow layer */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 40.5C32.9934 40.5 41.5 31.9934 41.5 21.5C41.5 11.0066 32.9934 2.5 22.5 2.5C12.0066 2.5 3.5 11.0066 3.5 21.5C3.5 31.9934 12.0066 40.5 22.5 40.5Z"
      fill="currentColor"
      fillOpacity="0.04"
      transform="translate(0, 1)"
    />
    
    {/* Main geometric shape - layered hexagon */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 3.5L40.5 13.5V30.5L22.5 40.5L4.5 30.5V13.5L22.5 3.5Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    
    {/* Middle layer */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 6L37 14.5V29.5L22.5 38L8 29.5V14.5L22.5 6Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    
    {/* Inner layer */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 8.5L34.5 15.5V28.5L22.5 35.5L10.5 28.5V15.5L22.5 8.5Z"
      fill="currentColor"
      fillOpacity="0.35"
    />
    
    {/* Core layer - main shape */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 11L32 17V27L22.5 33L13 27V17L22.5 11Z"
      fill="currentColor"
    />
    
    {/* Accent element - diamond */}
    <path
      d="M22.5 15L27 18V24L22.5 27L18 24V18L22.5 15Z"
      fill="white"
      fillOpacity="0.95"
    />
    
    {/* Inner detail */}
    <circle
      cx="22.5"
      cy="21"
      r="2"
      fill="currentColor"
      fillOpacity="0.8"
    />
  </svg>
);

export { AuthIcon };
