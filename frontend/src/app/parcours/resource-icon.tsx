import styles from "./parcours.module.css";

export type ResourceIconType = "article" | "video" | "link" | "checklist" | "quiz" | "exercise";

/**
 * Memes tracees que mes-guides/prototype.html (symbols ic-article/ic-video/ic-link/
 * ic-checklist/ic-edit), pour garder visuellement la meme identite par type de ressource.
 * Decoratives (aria-hidden) : le libelle texte a cote porte toujours l'information.
 */
const PATHS: Record<ResourceIconType, string> = {
  article: "M7 3.5h7L18 7v13.5H7zM14 3.5V7h4M9.5 12h5M9.5 15.5h5",
  video: "M10 8.5l6 3.5-6 3.5z",
  link: "M10 14l4-4M9 7H6a3 3 0 000 6h1M15 17h3a3 3 0 000-6h-1",
  checklist: "M6 4.5h12v15H6zM8.5 9l1.3 1.3L12.5 7.5M8.5 14.5l1.3 1.3 2.7-2.8M14.5 9h3M14.5 14.5h3",
  quiz: "M9.5 9a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 3.8M12 17h.01",
  exercise: "M16 4l4 4-10 10H6v-4z",
};

const CIRCLE_TYPES = new Set<ResourceIconType>(["video", "quiz"]);

export function ResourceIcon({ type }: { type: ResourceIconType }) {
  return (
    <svg className={styles.resourceIcon} viewBox="0 0 24 24" aria-hidden="true">
      {CIRCLE_TYPES.has(type) && <circle cx="12" cy="12" r="9" />}
      <path d={PATHS[type]} />
    </svg>
  );
}
