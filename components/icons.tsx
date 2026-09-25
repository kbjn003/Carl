import type { ReactNode, SVGProps } from "react";

// Inline stroke icons from the mockups in design/. 24px grid, 1.8px stroke.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({ size = 22, strokeWidth = 1.8, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const TodayIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 11l8-6 8 6v8h-5v-5H9v5H4z" />
  </Stroke>
);

export const MemosIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 13l2.5-7h13L21 13" />
    <path d="M3 13v6h18v-6h-5l-1.5 2.5h-5L8 13z" />
  </Stroke>
);

export const WorkboardIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="7" height="16" rx="1.5" />
    <rect x="14" y="4" width="7" height="10" rx="1.5" />
  </Stroke>
);

export const SourcesIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M9 3v4M15 3v4" />
    <path d="M7 7h10v4a5 5 0 0 1-10 0z" />
    <path d="M12 16v5" />
  </Stroke>
);

export const MicIcon = (p: IconProps) => (
  <Stroke size={30} strokeWidth={1.9} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </Stroke>
);

export const SettingsIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Stroke>
);

export const SearchIcon = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </Stroke>
);

export const CloseIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Stroke>
);

export const BackIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Stroke>
);

export const ChevronIcon = (p: IconProps) => (
  <Stroke size={20} {...p}>
    <path d="M9 5l7 7-7 7" />
  </Stroke>
);

export const PauseIcon = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M9 6v12M15 6v12" />
  </Stroke>
);

export const CheckIcon = (p: IconProps) => (
  <Stroke size={34} strokeWidth={2.2} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Stroke>
);

export const CameraIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Stroke>
);

export const LockIcon = (p: IconProps) => (
  <Stroke size={14} {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Stroke>
);

export const PlayIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const MoreIcon = ({ size = 22, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);
