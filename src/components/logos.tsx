/**
 * Brand logos for connectors, as inline SVG (no external assets — works
 * offline and under any CSP). Recognizable, simplified marks in brand colors.
 */
import type { ReactNode } from "react";

const V = { width: "100%", height: "100%", viewBox: "0 0 24 24" } as const;

const LOGOS: Record<string, ReactNode> = {
  github: (
    <svg {...V} aria-hidden="true">
      <path
        fill="#1b1f24"
        d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2 0-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.6.1 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z"
      />
    </svg>
  ),
  slack: (
    <svg {...V} aria-hidden="true">
      <rect x="3" y="10.25" width="9" height="3.5" rx="1.75" fill="#E01E5A" />
      <rect x="12" y="3" width="3.5" height="9" rx="1.75" fill="#36C5F0" />
      <rect x="12" y="10.25" width="9" height="3.5" rx="1.75" fill="#2EB67D" />
      <rect x="8.5" y="12" width="3.5" height="9" rx="1.75" fill="#ECB22E" />
    </svg>
  ),
  notion: (
    <svg {...V} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#fff" stroke="#111" strokeWidth="1.4" />
      <path d="M8 16.5V7.5L16 16.5V7.5" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  linear: (
    <svg {...V} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#5E6AD2" />
      <g stroke="#fff" strokeWidth="1.3" opacity="0.92" strokeLinecap="round">
        <path d="M6 13l5 5" />
        <path d="M6 9l9 9" />
        <path d="M7 6l11 11" />
        <path d="M11 6l7 7" />
        <path d="M15 6l3 3" />
      </g>
    </svg>
  ),
  gmail: (
    <svg {...V} aria-hidden="true">
      <path d="M4 6.5h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-2V10l-6 4.2L6 10v9H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1z" fill="#fff" />
      <path d="M3 7.5 12 13.8 21 7.5" fill="none" stroke="#EA4335" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M3 7.5a1 1 0 0 1 1-1h1.5L12 11l6.5-4.5H20a1 1 0 0 1 1 1l-9 6.3z" fill="#EA4335" opacity="0.92" />
    </svg>
  ),
  gdrive: (
    <svg {...V} aria-hidden="true">
      <polygon points="12,3 4.3,16.5 12,16.5" fill="#2684FC" />
      <polygon points="12,3 19.7,16.5 12,16.5" fill="#00AC47" />
      <polygon points="4.3,16.5 19.7,16.5 16,21 8,21" fill="#FFBA00" />
    </svg>
  ),
  gcal: (
    <svg {...V} aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="3" fill="#fff" stroke="#4285F4" strokeWidth="1.6" />
      <rect x="4" y="5" width="16" height="4" rx="3" fill="#4285F4" />
      <text x="12" y="18" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#4285F4" fontFamily="system-ui, sans-serif">31</text>
    </svg>
  ),
  clickup: (
    <svg {...V} aria-hidden="true">
      <path d="M3.5 16.5 7 13.2a3 3 0 0 1 4 0l1 .9 1-.9a3 3 0 0 1 4 0l3.5 3.3-2.3 2.2-3.3-3.1a0.6 0.6 0 0 0-.8 0L13 19.5 9.9 16.6a0.6 0.6 0 0 0-.8 0l-3.3 3.1z" fill="#FD71AF" />
      <path d="M12 4 6.5 9.3l2.3 2.3L12 8.4l3.2 3.2 2.3-2.3z" fill="#49CCF9" />
    </svg>
  ),
  figma: (
    <svg {...V} aria-hidden="true">
      <path d="M9.2 2.5h2.8v5.3H9.2a2.65 2.65 0 0 1 0-5.3z" fill="#F24E1E" />
      <path d="M12 2.5h2.8a2.65 2.65 0 0 1 0 5.3H12z" fill="#FF7262" />
      <path d="M9.2 7.85h2.8v5.3H9.2a2.65 2.65 0 0 1 0-5.3z" fill="#A259FF" />
      <circle cx="14.8" cy="10.5" r="2.65" fill="#1ABCFE" />
      <path d="M9.2 13.2h2.8v2.65a2.65 2.65 0 1 1-2.8-2.65z" fill="#0ACF83" />
    </svg>
  ),
  asana: (
    <svg {...V} aria-hidden="true">
      <circle cx="12" cy="6.2" r="3.2" fill="#F06A6A" />
      <circle cx="6.7" cy="15" r="3.2" fill="#F06A6A" />
      <circle cx="17.3" cy="15" r="3.2" fill="#F06A6A" />
    </svg>
  ),
};

const FALLBACK = (name: string): ReactNode => (
  <svg {...V} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#2a3340" />
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#9aa3b2" fontFamily="system-ui, sans-serif">
      {name.slice(0, 1).toUpperCase()}
    </text>
  </svg>
);

export function Logo({ id, name }: { id: string; name: string }) {
  return <span className="logo">{LOGOS[id] ?? FALLBACK(name)}</span>;
}
