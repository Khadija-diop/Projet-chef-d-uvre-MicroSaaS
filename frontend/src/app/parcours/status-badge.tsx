import type { ProgressStatus } from "@/lib/api";

import { CheckIcon, CircleIcon, ProgressIcon } from "./icons";
import styles from "./parcours.module.css";

const STATUS_META: Record<ProgressStatus, { icon: typeof CheckIcon; label: string; badgeClass: string }> = {
  done: { icon: CheckIcon, label: "Terminé", badgeClass: styles.badgeDone },
  in_progress: { icon: ProgressIcon, label: "En cours", badgeClass: styles.badgeInProgress },
  todo: { icon: CircleIcon, label: "À faire", badgeClass: styles.badgeTodo },
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const { icon: Icon, label, badgeClass } = STATUS_META[status];
  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      <Icon className={styles.badgeIcon} />
      {label}
    </span>
  );
}
