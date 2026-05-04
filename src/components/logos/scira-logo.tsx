import React from 'react';

export const SciraLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M 25 25 Q 5 50 25 75 Q 15 50 25 25 Z" />
    <path fillRule="evenodd" d="M 45 15 Q 15 50 45 85 Q 75 50 45 15 Z M 45 25 Q 30 50 45 75 Q 68 50 45 25 Z" />
    <path fillRule="evenodd" d="M 75 20 Q 55 50 75 80 Q 95 50 75 20 Z M 75 28 Q 65 50 75 72 Q 90 50 75 28 Z" />
    <circle cx="92" cy="50" r="4" />
  </svg>
);
