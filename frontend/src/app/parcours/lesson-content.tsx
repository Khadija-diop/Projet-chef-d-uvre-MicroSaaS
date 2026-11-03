import { Fragment, type ReactNode } from "react";

import styles from "./parcours.module.css";

/**
 * Rendu markdown-lite pour le contenu redige des lecons (Resource.content) :
 * "## Titre" pour une sous-section, "- " pour une liste a puces, `code` pour
 * du code inline. Le contenu est redige par nous (pas de saisie utilisateur),
 * donc un parseur minimal suffit, sans dependance externe.
 */

type Block = { heading: string | null; lines: string[] };

function parseBlocks(text: string): Block[] {
  return text
    .split(/\n{2,}/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const lines = raw.split("\n");
      if (lines[0].startsWith("## ")) {
        return { heading: lines[0].slice(3).trim(), lines: lines.slice(1) };
      }
      return { heading: null, lines };
    });
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code key={index} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function LessonContent({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className={styles.lesson}>
      {blocks.map((block, index) => {
        const isList = block.lines.length > 0 && block.lines.every((line) => line.startsWith("- "));

        return (
          <Fragment key={index}>
            {block.heading && <h3 className={styles.lessonHeading}>{block.heading}</h3>}
            {isList ? (
              <ul className={styles.lessonList}>
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>{renderInline(line.slice(2))}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.lessonParagraph}>{renderInline(block.lines.join(" "))}</p>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
