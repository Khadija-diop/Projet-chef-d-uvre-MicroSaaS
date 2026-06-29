# Sources PlantUML et exports PNG attendus (Phase 1)

| Source `.puml` | Export PNG |
| --- | --- |
| `use-case.puml` | `use-case.png` |
| `mcd.puml` | `mcd.png` |
| `mld.puml` | `mld.png` |
| `mpd.puml` | `mpd.png` |
| `deployment.puml` | `deployment.png` |
| `sequence-main-flow.puml` | `sequence.png` |

Regenerer les exports (si Python ou le chemin avec apostrophe pose probleme, utiliser le chemin court Windows `PROJET~1` depuis `Desktop`) :

```bash
python scripts/render_plantuml.py
```

Sous Windows, alternative si le dossier contient une apostrophe (`ProjetChef-d'œuvre`) :

```powershell
Set-Location C:\Users\UTILIS~1.IDF\Desktop\PROJET~1
java -jar plantuml.jar -tpng docs/diagrams/*.puml
Rename-Item docs/diagrams/sequence-main-flow.png sequence.png
```
