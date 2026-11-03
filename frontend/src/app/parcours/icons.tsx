import type { ReactNode } from "react";

type IconProps = { className?: string };

function BaseIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-4-2 2-6z" />
    </BaseIcon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </BaseIcon>
  );
}

export function BarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 19V10M12 19V5M19 19v-6" />
    </BaseIcon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 4H6a1 1 0 00-1 1v14a1 1 0 001 1h3M14 16l4-4-4-4M18 12H9" />
    </BaseIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </BaseIcon>
  );
}

export function ProgressIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </BaseIcon>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" strokeDasharray="2 3.4" />
    </BaseIcon>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 6l6 6-6 6" />
    </BaseIcon>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 6l-6 6 6 6M8 12h10" />
    </BaseIcon>
  );
}

export function ArticleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 3.5h7L18 7v13.5H7z" />
      <path d="M14 3.5V7h4M9.5 12h5M9.5 15.5h5" />
    </BaseIcon>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" />
    </BaseIcon>
  );
}

export function LinkTypeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 14l4-4M9 7H6a3 3 0 000 6h1M15 17h3a3 3 0 000-6h-1" />
    </BaseIcon>
  );
}

export function ChecklistIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 4.5h12v15H6z" />
      <path d="M8.5 9l1.3 1.3L12.5 7.5M8.5 14.5l1.3 1.3 2.7-2.8M14.5 9h3M14.5 14.5h3" />
    </BaseIcon>
  );
}
