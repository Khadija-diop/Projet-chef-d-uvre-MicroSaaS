"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentUser, logout, type AuthUser } from "@/lib/api";

import styles from "./page.module.css";

export function UserMenu() {
    // undefined = je ne sais pas encore, null = personne, AuthUser = quelqu'un est connecte
    const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

    useEffect(() => {
        async function loadUser() {
            try {
                setUser(await getCurrentUser());
            } catch {
                setUser(null);
            }
        }
        loadUser();
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    // Etat 1 : je ne sais pas encore, on n'affiche rien
    if (user === undefined) {
        return null;
    }

    // Etat 2 : personne n'est connecte
    if (user === null) {
        return (
            <>
                <Link href="/connexion">Se connecter</Link>
                <Link href="/inscription" className={styles.btnPrimary}>
                    Creer un compte
                </Link>
            </>
        );
    }

    // Etat 3 : quelqu'un est connecte
    return (
        <div className={styles.userMenu}>
            <span className={styles.badge} title={user.email}>
                {user.email.slice(0, 2).toUpperCase()}
            </span>
            <button type="button" className={styles.btnSecondary} onClick={handleLogout}>
                Se déconnecter
            </button>
        </div>
    );
}