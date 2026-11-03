"use client";

const REGION_ID = "live-region";

/**
 * RGAA 4.1 (docs/DESIGN.md section 9) : annonce un message aux lecteurs d'ecran via une
 * region `aria-live="polite"` partagee, sans deplacer le focus (contrairement a
 * useFocusHeading). Utilise pour les mises a jour de progression hors navigation.
 */
export function announce(message: string) {
  if (typeof document === "undefined") {
    return;
  }

  let region = document.getElementById(REGION_ID);
  if (!region) {
    region = document.createElement("div");
    region.id = REGION_ID;
    region.setAttribute("aria-live", "polite");
    region.setAttribute("role", "status");
    region.className = "sr-only";
    document.body.appendChild(region);
  }

  region.textContent = "";
  window.requestAnimationFrame(() => {
    region!.textContent = message;
  });
}
