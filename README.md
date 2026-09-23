# Cohen Real Estate: site vitrine

Site vitrine haut de gamme de Cohen Real Estate, Netanya. Next.js 16 (App Router), Tailwind CSS 4, GSAP + ScrollTrigger, Lenis. Trois langues : FR (par défaut), HE (RTL complet), EN.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000 (redirige vers /fr, /he ou /en selon le navigateur)
npm run build && npm start
```

## Ajouter les vrais assets

| Fichier | Où le mettre | Puis |
|---|---|---|
| `V1.mp4` … `V6.mp4` | `assets/videos/` (non versionnés) | `npm run frames` |
| `logo.png` | `assets/logo.png` | `npm run palette` (affiche la palette du logo et copie le logo dans `public/`) |
| `salomon.jpg`, `ethan.jpg` | `public/images/founders/` | rien, détectés au build |
| Photos des biens | `public/images/listings/` | renseigner `image` dans `lib/listings.ts` |

`npm run frames` concatène V1 → V6, extrait les WebP (desktop 1920 px q80, mobile 1080 px en recadrage portrait 9:16 q75), écrit `public/frames/manifest.json` (nombre de frames, index de début de chaque vidéo) et génère `public/og.jpg`. Réglages : `FPS=24 MAX_FRAMES=600 DESKTOP_Q=80 MOBILE_Q=75 npm run frames`. Au-delà de `MAX_FRAMES`, le fps baisse automatiquement.

Les frames actuellement dans `public/frames` sont des **placeholders** générés par `npm run frames:placeholder`.

## À compléter avant la mise en ligne

- `lib/site.ts` : téléphone, WhatsApp, email, Instagram, adresse, domaine (tous marqués `PLACEHOLDER`)
- `lib/listings.ts` : vrais biens (les exemples sont marqués « Exemple · à remplacer »)
- `lib/i18n/*.ts` : témoignages réels (entrées `testimonials`), mentions légales (numéro de licence, etc.)
- Formulaire : sur Vercel, définir `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (et éventuellement `CONTACT_FROM_EMAIL`). Sans ces variables, le formulaire propose d'envoyer la demande pré-rédigée sur WhatsApp : aucun contact n'est perdu.
- `NEXT_PUBLIC_SITE_URL` : URL définitive (canonical, sitemap, Open Graph, schema.org)

## Structure

- `components/hero/HeroScroll.tsx` : canvas sticky, préchargement progressif, scrub GSAP, textes par scène
- `components/sections/*` : Services, Pourquoi nous, Fondateurs, Biens, Témoignages, Contact
- `lib/i18n/{fr,he,en}.ts` : tous les textes
- `app/globals.css` : tokens de design (couleurs, typo, boutons)

## Déploiement

Importer le dépôt sur Vercel (preset Next.js, aucune configuration requise).
