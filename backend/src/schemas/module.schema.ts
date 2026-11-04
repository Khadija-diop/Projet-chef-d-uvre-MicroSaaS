import { z } from "zod";

export const moduleIdParamsSchema = z.object({
  id: z.string().uuid("Identifiant de module invalide"),
});

export const quizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("Identifiant de question invalide"),
        choiceId: z.string().uuid("Identifiant de reponse invalide"),
      }),
    )
    .min(1, "Au moins une reponse est requise")
    .max(50, "Trop de reponses"),
});

export const exerciseSubmissionSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "La reponse ne doit pas etre vide")
    .max(4000, "Reponse trop longue"),
});

// --- Administration des modules ---

export const MODULE_PUBLICATION_STATUSES = ["draft", "published", "hidden"] as const;

const moduleTitle = z
  .string("Le titre est obligatoire")
  .trim()
  .min(1, "Le titre est obligatoire")
  .max(150, "Titre trop long (150 caracteres maximum)");
const moduleShortDescription = z
  .string("La description doit etre un texte")
  .trim()
  .max(300, "Description trop longue (300 caracteres maximum)");
const moduleLearningObjective = z
  .string("L'objectif pedagogique doit etre un texte")
  .trim()
  .max(500, "Objectif pedagogique trop long (500 caracteres maximum)");
const moduleDisplayOrder = z
  .number("L'ordre d'affichage doit etre un nombre")
  .int("L'ordre d'affichage doit etre un entier")
  .min(1, "L'ordre d'affichage doit etre superieur ou egal a 1")
  .max(10_000, "Ordre d'affichage trop grand");
const modulePublicationStatus = z.enum(MODULE_PUBLICATION_STATUSES, "Statut de publication invalide");

// Description et objectif peuvent rester vides tant que le module n'est pas publie :
// la regle "publie => titre + description + objectif" est verifiee par le service,
// car elle depend aussi de l'etat deja enregistre lors d'une modification partielle.
export const createModuleSchema = z.strictObject({
  title: moduleTitle,
  shortDescription: moduleShortDescription.default(""),
  learningObjective: moduleLearningObjective.default(""),
  displayOrder: moduleDisplayOrder.optional(),
  publicationStatus: modulePublicationStatus.default("draft"),
});

export const updateModuleSchema = z
  .strictObject({
    title: moduleTitle.optional(),
    shortDescription: moduleShortDescription.optional(),
    learningObjective: moduleLearningObjective.optional(),
    displayOrder: moduleDisplayOrder.optional(),
    publicationStatus: modulePublicationStatus.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Aucune modification fournie");

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
