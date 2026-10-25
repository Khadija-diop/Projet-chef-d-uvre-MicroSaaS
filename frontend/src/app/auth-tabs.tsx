import Link from "next/link";

import styles from "./auth.module.css";

type AuthTabsProps = {
  active: "connexion" | "inscription";
};

export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Authentification">
      <Link
        href="/connexion"
        className={
          active === "connexion" ? `${styles.tab} ${styles.tabActive}` : styles.tab
        }
        aria-current={active === "connexion" ? "page" : undefined}
      >
        Se connecter
      </Link>
      <Link
        href="/inscription"
        className={
          active === "inscription" ? `${styles.tab} ${styles.tabActive}` : styles.tab
        }
        aria-current={active === "inscription" ? "page" : undefined}
      >
        Créer un compte
      </Link>
    </nav>
  );
}
