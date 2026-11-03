"use client";

import { useEffect } from "react";

/**
 * RGAA 4.1 (docs/DESIGN.md section 9) : deplace le focus sur le h1 de la page a
 * chaque montage de ce composant, pour que les utilisateurs au clavier/lecteur
 * d'ecran sachent que le contenu a change. Rendu en `<FocusHeading />` (sans
 * contenu visible) a cote du h1 : evite de transformer toute la page en composant
 * client juste pour ce comportement, et se replace naturellement si le h1
 * n'apparait qu'apres un chargement asynchrone (placer ce composant dans le meme
 * bloc conditionnel que ce h1).
 */
export function FocusHeading() {
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>("main h1");
    if (!heading) {
      return;
    }
    if (!heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
    }
    heading.focus();
  }, []);

  return null;
}
