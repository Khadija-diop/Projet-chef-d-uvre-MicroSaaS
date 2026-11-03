import Link from "next/link";

import styles from "./page.module.css";
import { UserMenu } from "./user-menu";

/** En-tete et pied de page partages par toutes les pages avec navigation (hors ecrans d'auth). */
export function SiteHeader() {
  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand}>
        <svg className={styles.brandIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-2 6-4-2 2-6z" />
        </svg>
        Parcours DevOps Guide
      </Link>
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link href="/parcours">Voir le parcours</Link>
        <UserMenu />
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return <footer className={styles.footer}>Projet Chef-d&apos;oeuvre: DevOps Guide</footer>;
}
