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
