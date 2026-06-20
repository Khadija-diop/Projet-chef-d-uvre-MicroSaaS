# Diagrammes - Etapes B et C

Ce dossier regroupe les **sources** (fichiers `.puml`) et les **exports** (`PNG`) attendus pour le dossier de conception.

## Etape B - UML applicatif

| Fichier source | Export PNG |
| --- | --- |
| `use-case.puml` | `use-case.png` |
| `deployment.puml` | `deployment.png` |

## Etape C - MERISE et sequence

| Fichier source | Export PNG |
| --- | --- |
| `mcd.puml` | `mcd.png` |
| `mld.puml` | `mld.png` |
| `sequence-main-flow.puml` | `sequence-main-flow.png` |

Le **modele physique (MPD)** pour `PostgreSQL` est versionne sous forme de **DDL** dans `docs/MPD.sql`. Ce n'est pas un fichier `.puml` : le livrable physique principal est le script SQL.

## Comment produire les PNG

1. Ouvrir le fichier `.puml` dans un outil avec support PlantUML (plugin IDE, extension VS Code, ou [plantuml.com](https://www.plantuml.com/plantuml/uml) en collant le contenu).
2. Exporter au format **PNG** (ou JPEG si ton outil ne propose que ce format).
3. Enregistrer le fichier dans ce dossier avec **exactement** le nom indique dans le tableau.

Les noms doivent rester stables pour que les liens dans `docs/DATA_MODEL.md` et `docs/SPECS.md` restent corrects.
