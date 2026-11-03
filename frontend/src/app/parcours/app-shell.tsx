"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { logout } from "@/lib/api";

import { BarIcon, CompassIcon, ListIcon, LogoutIcon } from "./icons";
import styles from "./parcours.module.css";

type AppShellProps = {
  active: "modules" | "progress";
  children: ReactNode;
};

export function AppShell({ active, children }: AppShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Navigation principale">
        <Link href="/" className={styles.sidebarBrand}>
          <CompassIcon className={styles.brandIcon} />
          Parcours DevOps Guide
        </Link>

        <nav className={styles.sidebarNav}>
          <span className={styles.sidebarGroupLabel}>Mon parcours</span>
          <Link
            href="/parcours"
            className={styles.sidebarLink}
            aria-current={active === "modules" ? "page" : undefined}
          >
            <ListIcon className={styles.sidebarLinkIcon} />
            Liste des modules
          </Link>
          <Link
            href="/parcours/progression"
            className={styles.sidebarLink}
            aria-current={active === "progress" ? "page" : undefined}
          >
            <BarIcon className={styles.sidebarLinkIcon} />
            Ma progression
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.sidebarLink} onClick={handleLogout}>
            <LogoutIcon className={styles.sidebarLinkIcon} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main id="main-content" className={styles.shellContent}>
        {children}
      </main>
    </div>
  );
}
