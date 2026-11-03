import Link from "next/link";

import styles from "./parcours.module.css";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.back}>
      <svg className={styles.backIcon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 6l-6 6 6 6M8 12h10" />
      </svg>
      {label}
    </Link>
  );
}
