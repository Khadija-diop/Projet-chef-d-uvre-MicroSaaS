import type { ModuleDetail } from "@/lib/api";

export type ResourceType = ModuleDetail["resources"][number]["resourceType"];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  article: "Article",
  video: "Vidéo",
  link: "Lien",
  checklist: "Check-list",
};

// "link" et "video" pointent vers une ressource externe (le contenu est une URL) ;
// "article" et "checklist" portent du contenu redige directement dans la ressource.
export const EXTERNAL_LINK_TYPES = new Set<ResourceType>(["link", "video"]);

// N'accepte que http(s) dans un href : bloque "javascript:", "data:"... si le contenu
// devient saisissable par un admin (epic M7).
export function isSafeExternalUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
