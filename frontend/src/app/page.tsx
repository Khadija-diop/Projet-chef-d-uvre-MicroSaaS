import Link from "next/link";

import styles from "./page.module.css";

const cards = [
  {
    title: "Un parcours en modules",
    text: "Des etapes DevOps structurees et progressives, pensees pour un public debutant.",
  },
  {
    title: "Suivi de progression",
    text: "Marque chaque module comme termine et visualise ou tu en es dans le parcours.",
  },
  {
    title: "Contenus pedagogiques",
    text: "Des pages claires sur Git, la CI/CD, Docker et Ansible, appliquees a un vrai projet.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          Parcours DevOps Guide
        </Link>
        <nav className={styles.nav}>
          <Link href="/connexion">Se connecter</Link>
          <Link href="/inscription" className={styles.btnPrimary}>
            Creer un compte
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Site-lab pedagogique · DevOps</p>
          <h1 className={styles.title}>
            Apprendre le DevOps par la pratique
          </h1>
          <p className={styles.subtitle}>
            Un parcours guide pour apprenant·es debutant·es : suis des modules
            structures, enregistre ta progression et decouvre les etapes d&apos;un
            vrai cycle de vie DevOps.
          </p>

          <p className={styles.pitch}>
            Le site est lui-meme construit, securise, automatise et deploye avec
            les outils qu&apos;il enseigne&nbsp;: <strong>dogfooding</strong> de bout
            en bout.
          </p>

          <div className={styles.actions}>
            <Link href="/inscription" className={styles.btnPrimary}>
              Commencer le parcours
            </Link>
            <Link href="/connexion" className={styles.btnSecondary}>
              J&apos;ai deja un compte
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce que tu vas pratiquer</h2>
          <div className={styles.cards}>
            {cards.map((card) => (
              <article key={card.title} className={styles.card}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        Projet Chef-d&apos;oeuvre · CDA — Parcours DevOps Guide
      </footer>
    </div>
  );
}
