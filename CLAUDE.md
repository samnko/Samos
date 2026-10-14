# Cohen Real Estate: site vitrine

Site vitrine haut de gamme de Cohen Real Estate (agence immobilière à Netanya, fondée par Salomon et Ethan Cohen).
Services : achat, location, gestion Airbnb. Clientèle francophone, israélienne et internationale.

## Stack

- Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP + ScrollTrigger, Lenis. TypeScript strict.
- Next 16 a des changements cassants : lire `node_modules/next/dist/docs/` avant d'utiliser une API inconnue
  (ex. `proxy.ts` remplace `middleware.ts`, `images.qualities` obligatoire, `PageProps`/`LayoutProps` globaux).
- i18n maison : routes `app/[lang]/` avec `fr` (défaut), `he` (RTL complet), `en`.

## Commandes

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build Vercel (proxy de langue + API contact)
npm run lint       # tsc --noEmit
npm run frames     # régénère les frames du hero depuis assets/videos/V1..V6.mp4 (ffmpeg requis)
npm run palette    # extrait la palette de assets/logo.png
```

## Structure

- `app/[lang]/layout.tsx` : layout racine (polices, métadonnées SEO, JSON-LD, header/footer)
- `app/[lang]/page.tsx` : page d'accueil (hero + sections)
- `components/hero/HeroScroll.tsx` : hero « scroll vidéo » sur canvas (frames WebP, préchargement progressif,
  textes par scène via `CAPTION_TIMING`, image fixe si `prefers-reduced-motion`)
- `components/sections/*` : Services, WhyUs, Founders, Listings, Testimonials, Contact (+ ContactForm)
- `lib/i18n/{fr,he,en}.ts` : TOUS les textes. `fr.ts` définit le type `Dictionary` ; `he.ts` et `en.ts` doivent
  avoir exactement les mêmes clés. Toute modification de texte se fait dans les trois langues.
- `lib/site.ts` : coordonnées de l'agence (valeurs `PLACEHOLDER` à remplacer)
- `lib/listings.ts` : biens à la une (données d'exemple, `placeholder: true`)
- `lib/paths.ts` : `withBase()` à utiliser pour tout fichier de `public/` et tout `<a href>` interne
  (le site est aussi publié sous `/Samos` sur GitHub Pages ; `next/link` gère ça tout seul)
- `app/globals.css` : tokens de design (`@theme`) et utilitaires (`btn`, `eyebrow`, `display`, `container-luxe`, reveals)
- `public/frames/` : séquence du hero (689 frames, 16 fps ; desktop 1600 px, mobile 900 px portrait) + `manifest.json`
  (nombre de frames et index de début de chaque vidéo). Ne pas éditer à la main : `npm run frames`.

## Charte

- Couleurs tirées du logo : `navy #213A76` (titres sur fond clair), `ink #0B1733` (fonds sombres),
  `accent #F5352A` (rouge du logo, détails), `accent-deep #C8281E` (petits textes rouges sur clair, boutons),
  `accent-soft #FF8A7F` (petits textes rouges sur sombre). Contrastes WCAG AA vérifiés : les respecter.
- Typo : Cormorant Garamond (titres) + Jost (texte) ; en hébreu, Frank Ruhl Libre + Heebo.
- Logo : `public/logo.png` (fonds clairs) et `public/logo-on-dark.png` (fonds sombres), via `components/Logo.tsx`.
- RTL : utiliser les propriétés logiques Tailwind (`ms-`, `me-`, `ps-`, `start-`, `end-`, `text-start`) et `rtl:`.
  Pas d'italique ni de grand letter-spacing en hébreu.
- Accessibilité : alt sur les images, `prefers-reduced-motion` respecté, focus visibles.

## Déploiement

- **Aperçu public actuel** : https://samnko.github.io/Samos/ servi depuis la branche `gh-pages`.
  `.github/workflows/pages.yml` reconstruit le site en statique (`STATIC_EXPORT=1`, `NEXT_PUBLIC_BASE_PATH=/Samos`)
  et le publie à chaque push sur `master`. Sur cette version statique il n'y a ni `proxy.ts` ni API :
  le formulaire de contact bascule sur WhatsApp.
- **Production prévue** : Vercel (import du dépôt, preset Next.js, sans configuration). Variables :
  `NEXT_PUBLIC_SITE_URL`, et pour le formulaire par email `RESEND_API_KEY` + `CONTACT_TO_EMAIL`
  (optionnel `CONTACT_FROM_EMAIL`).
- Après toute modification : vérifier `npm run lint` et `npm run build` avant de pousser.

## Reste à faire

- Remplacer les coordonnées `PLACEHOLDER` de `lib/site.ts` (téléphone, WhatsApp, email, Instagram, adresse, domaine).
- Remplacer les biens d'exemple de `lib/listings.ts` (photos dans `public/images/listings/`).
- Témoignages réels (clé `testimonials` des dictionnaires) : ne jamais inventer de faux avis.
- Mentions légales : raison sociale, numéro d'entreprise, licence d'agent immobilier (`legal` dans les dictionnaires).
- Vidéos sans le filigrane « Kling AI » : les remettre dans `assets/videos/` puis `npm run frames`.
- Photos des fondateurs en meilleure définition (actuellement 640 px) : `public/images/founders/{salomon,ethan}.jpg`.
- Vérifier l'attribution des portraits (1re photo fournie = Salomon, 2e = Ethan, à confirmer).
- Ne jamais inventer de chiffres (années d'expérience, nombre de ventes…) sans source.
