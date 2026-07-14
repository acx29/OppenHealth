import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/* Lucide-style monochrome stroke icons, ported from the Login v2 mockup */
export const I = {
    eye: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
            <path d="M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a9.3 9.3 0 0 0 5.4-1.6" />
            <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
            <path d="m2 2 20 20" />
        </svg>
    ),
    key: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="7.5" cy="15.5" r="4" />
            <path d="m10.5 12.5 8-8" />
            <path d="m16 6 2 2" />
            <path d="m13.5 8.5 2 2" />
        </svg>
    ),
    arrow: (p: P) => (
        <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    ),
    check: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    ),
    checkThin: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    ),
    alert: (p: P) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
};

export const GoogleG = () => (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.17-1.97H12v3.72h5.38a4.6 4.6 0 0 1-1.99 3.02v2.5h3.22c1.88-1.74 2.99-4.3 2.99-7.27z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.22-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.09v2.58A9.99 9.99 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.41 13.9a5.99 5.99 0 0 1 0-3.8V7.52H3.09a10 10 0 0 0 0 8.96l3.32-2.58z" />
        <path fill="#EA4335" d="M12 6.18c1.47 0 2.79.5 3.83 1.5l2.85-2.85C16.95 3.2 14.7 2.3 12 2.3A9.99 9.99 0 0 0 3.09 7.52l3.32 2.58C7.2 7.94 9.4 6.18 12 6.18z" />
    </svg>
);
