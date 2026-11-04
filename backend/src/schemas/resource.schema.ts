import { z } from "zod";

// --- Administration des ressources d'un module ---

export const RESOURCE_TYPES = ["article", "video", "link", "checklist"] as const;

/** Types dont le contenu est une URL ouverte telle quelle par le frontend (attribut href). */
export const URL_RESOURCE_TYPES: ReadonlySet<string> = new Set(["video", "link"]);

export const moduleResourceParamsSchema = z.object({
  id: z.string().uuid("Identifiant de module invalide"),
  resourceId: z.string().uuid("Identifiant de ressource invalide"),
});

const resourceTitle = z
  .string("Le titre est obligatoire")
  .trim()
  .min(1, "Le titre est obligatoire")
  .max(150, "Titre trop long (150 caracteres maximum)");
// Un article est du Markdown redige : on borne la taille pour rester bien sous la
// limite par defaut d'express.json() (100 ko) et eviter de stocker des contenus demesures.
const resourceContent = z
  .string("Le contenu est obligatoire")
  .trim()
  .min(1, "Le contenu est obligatoire")
  .max(20_000, "Contenu trop long (20 000 caracteres maximum)");
const resourceType = z.enum(RESOURCE_TYPES, "Type de ressource invalide");
const resourceDisplayOrder = z
  .number("L'ordre d'affichage doit etre un nombre")
  .int("L'ordre d'affichage doit etre un entier")
  .min(1, "L'ordre d'affichage doit etre superieur ou egal a 1")
  .max(10_000, "Ordre d'affichage trop grand");

// La regle "video/lien => URL http(s)" est verifiee par le service sur l'etat final,
// car une modification partielle peut ne changer que le type ou que le contenu.
export const createResourceSchema = z.strictObject({
  title: resourceTitle,
  content: resourceContent,
  resourceType,
  displayOrder: resourceDisplayOrder.optional(),
});

export const updateResourceSchema = z
  .strictObject({
    title: resourceTitle.optional(),
    content: resourceContent.optional(),
    resourceType: resourceType.optional(),
    displayOrder: resourceDisplayOrder.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Aucune modification fournie");

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
