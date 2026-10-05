# Notes de soutenance CDA : choix techniques

Notes issues de la séance de révision du 5 octobre 2026. À relire avant la soutenance.

## 1. Next.js et l'éco-conception

### Décision

Je garde Next.js. Le problème n'est pas le framework, mais la façon de l'utiliser : ce qui compte pour l'éco-conception, c'est le mode de rendu choisi pour chaque page.

### React et Next.js : la différence

- **React** est une bibliothèque : elle sert uniquement à construire des interfaces avec des composants. Seule, elle donne une SPA : le serveur envoie un HTML presque vide et le navigateur construit tout avec JavaScript.
- **Next.js** est un framework construit par-dessus React. Il ajoute le routage par dossiers, le choix du mode de rendu page par page, les composants serveur, un backend léger et des optimisations (images, polices, découpage du code).

### Deux questions à ne pas confondre

| Question | Options | Ce que ça change |
|---|---|---|
| **Où** le composant s'exécute | Composant serveur / composant client | La quantité de JavaScript envoyée au navigateur |
| **Quand** la page est générée | Statique (au build) / dynamique (à chaque requête) | Le travail du serveur à chaque visite |

- Un composant serveur n'envoie pas son JavaScript au navigateur.
- Un composant client est pré-rendu en HTML, puis son JavaScript est téléchargé et hydraté dans le navigateur.
- Une page faite de composants serveur peut très bien être générée une seule fois.

### Mes choix de rendu, page par page

| Partie du site | Mode de rendu | Pourquoi |
|---|---|---|
| Accueil, pages de présentation | Statique au build | Identique pour tous, ne change pas |
| Page module | Statique + revalidation à la demande | Identique pour tous, change seulement quand l'admin modifie |
| Page progression | Dynamique | Dépend de l'utilisateur connecté |
| Page admin « gérer les modules » | Dynamique | Réservée à l'admin, données modifiées en direct |
| Badge utilisateur dans la navbar (2 premières lettres du mail) | Composant client | Évite de rendre tout le site dynamique |

### La revalidation à la demande

- Problème : 500 apprenants consultent la page module entre deux modifications. Le serveur ne doit construire la page qu'une fois, pas 500.
- Solution : la page est générée, mise en cache et servie telle quelle. Quand l'admin enregistre une modification, la page est invalidée avec `revalidatePath('/modules')` (ou `revalidateTag`) et reconstruite une seule fois.
- Attention, dans mon architecture le backend est une API Express séparée : `revalidatePath` n'existe que dans Next.js. Il faut donc une petite route côté Next (par exemple `POST /api/revalidate`, protégée par un secret partagé) que l'API Express appelle juste après avoir écrit en base.
- Autre conséquence : pour générer la page modules au build, Next doit pouvoir joindre l'API. Si l'API n'est pas disponible pendant le build (en CI par exemple), la page doit être générée à la première visite puis mise en cache.
- Pourquoi pas un nouveau build à chaque modification : l'admin n'est pas développeur, et reconstruire tout le site pour une faute corrigée n'est ni pratique ni sobre.

### Le piège de la navbar

- Dès qu'un composant serveur lit la session (les cookies), toute la page qui le contient devient dynamique.
- La navbar est dans le layout, donc présente partout : deux lettres personnalisées peuvent rendre tout le site dynamique sans qu'on s'en aperçoive.
- Solution : isoler le badge dans un petit composant client. La page reste statique, seul ce morceau fait une petite requête.

### Phrase prête pour le jury

> « Mes pages de contenu sont générées statiquement et mises en cache. Elles ne sont régénérées que lorsqu'un administrateur modifie un module, grâce à la revalidation à la demande. Le serveur ne recalcule donc rien inutilement. »

### À ne pas dire

- « Next.js n'envoie pas de JavaScript au navigateur » : faux. Il en envoie **moins**, pas zéro (composants client + runtime React/Next).
- Citer le routage par dossiers comme argument d'éco-conception : c'est un confort de développement, rien de plus.

## 2. Hachage des mots de passe : de bcrypt à Argon2id

### Décision

Je remplace bcrypt par **Argon2id**.

### Ce qu'on reproche à bcrypt

- bcrypt ne prend en compte que les **72 premiers octets** du mot de passe. Le reste est ignoré sans erreur.
- Ce sont des octets, pas des caractères : un caractère accentué ou un emoji en occupe plusieurs.
- Conséquence : avec un mot de passe de 80 caractères, taper les 72 premiers suivis de n'importe quoi permet de se connecter.
- Les hachages stockés restent différents grâce au sel aléatoire, mais bcrypt traite les deux mots de passe comme identiques.
- Vocabulaire : c'est une **limite de conception** connue, pas une « faille ». bcrypt reste acceptable, mais il existe mieux.

### Pourquoi un algorithme de hachage doit être lent

- On ne « dé-hache » jamais. Un attaquant qui a volé la base hache des mots de passe candidats et compare.
- Algorithme rapide : environ 1 milliard d'essais par seconde. Algorithme lent : environ 10 par seconde.
- L'utilisateur légitime ne se connecte qu'une fois et ne remarque pas le dixième de seconde. L'attaquant, qui doit faire des milliards d'essais, est le seul pénalisé.

### Pourquoi Argon2id est meilleur

- Les attaquants utilisent des cartes graphiques (GPU) qui lancent des milliers de calculs en parallèle.
- bcrypt ne demande que quelques kilo-octets de mémoire par calcul : facile à paralléliser.
- Argon2id exige beaucoup de mémoire à chaque hachage (algorithme « memory-hard »). À 19 Mo par hachage, 10 000 calculs en parallèle demandent 190 Go de RAM : les GPU perdent leur avantage.
- Vainqueur de la Password Hashing Competition en 2015.
- Premier choix recommandé par l'OWASP pour stocker les mots de passe.
- Pas de limite à 72 octets.
- Trois paramètres : mémoire, nombre d'itérations, parallélisme.
- En Node.js : paquet `argon2` ou `@node-rs/argon2` (une fonction pour hacher, une pour vérifier).

### Quand le mot de passe est-il haché ?

Seulement à trois occasions : l'inscription, la connexion et le changement de mot de passe. Jamais à chaque page.

### Comment le serveur reconnaît l'utilisateur ensuite

1. À la connexion, le serveur vérifie le mot de passe avec Argon2id. C'est le seul moment coûteux.
2. Il crée une session et envoie au navigateur un **cookie** contenant un identifiant de session (ou un jeton signé, type JWT).
3. À chaque page, le navigateur renvoie ce cookie. Le serveur vérifie l'identifiant ou la signature en une fraction de milliseconde, sans hachage.

- Attributs du cookie : `HttpOnly` (illisible par le JavaScript de la page), `Secure` (HTTPS uniquement), `SameSite`.
- Le composant client de la navbar ne stocke pas la session : il demande seulement au serveur « qui correspond à ce cookie ? ».

## 3. La question piège : Argon2id contredit-il l'éco-conception ?

Proposition de réponse, à reformuler avec mes mots :

> « Ce n'est pas contradictoire. L'éco-conception ne consiste pas à consommer le moins possible partout, mais à ne pas consommer inutilement, et protéger les mots de passe de mes utilisateurs n'est pas un usage inutile. Ce coût est proportionné et rare : le hachage n'a lieu qu'à l'inscription et à la connexion, pas à chaque page, puisque la session est ensuite portée par un cookie. J'ai compensé ailleurs, avec des pages statiques mises en cache et régénérées uniquement quand le contenu change. »

Formulations à éviter :

- « J'ai choisi Argon2id pour ses performances » : dire « pour sa résistance aux attaques » (il est volontairement lent).
- « C'est le moindre mal » : dire « c'est un coût proportionné ».

## 4. Encore à faire

- [ ] Vérifier dans le projet que les pages publiques sont bien statiques (la sortie de `next build` indique le mode de rendu de chaque route).
- [ ] Isoler le badge utilisateur de la navbar dans un composant client.
- [ ] Ajouter la revalidation à la demande dans les actions admin (publier, modifier, supprimer un module).
- [ ] Remplacer bcrypt par Argon2id et choisir les paramètres (point de départ OWASP : 19 Mio de mémoire, 2 itérations, parallélisme 1).
- [ ] Décider du mécanisme de session (cookie de session ou JWT) et configurer `HttpOnly`, `Secure`, `SameSite`.
- [ ] Idée produit à garder : prévenir l'apprenant quand un module est modifié ou va être supprimé (message, date d'expiration de l'ancienne version, date de suppression annoncée).
