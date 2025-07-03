import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(5, 5) scale(0.9)">
        <path
          d="M 50,5 A 45,45 0 1 1 5,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 50,20 A 30,30 0 1 1 20,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </g>
    </svg>
  );
}
