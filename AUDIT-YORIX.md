# Audit Yorix CM — 20 mai 2026

> **Périmètre :** SPA React/Vite (`src/`), Supabase (`msrymchhhxitdevthvdi`), déploiement Vercel, PWA/TWA Android (`cm.yorix.app`).  
> **Point d’entrée réel :** `src/YorixApp.jsx` (~1 700 lignes) — `src/App.jsx` est un wrapper léger.  
> **Méthode :** revue statique du code, grep structurel, analyse des flux métier (pas de tests manuels navigateur dans cet audit).

---

## 📊 Résumé exécutif

| Métrique | Valeur |
|----------|--------|
| **Bugs critiques** | **9** |
| **Améliorations importantes** | **22** |
| **Nice-to-have** | **14** |
| **Effort total estimé** | **~45–65 h** (tout corriger) |
| **Effort sprint 1 (critiques + top business)** | **~12–18 h** |

### Top 3 priorités à attaquer maintenant

1. **Liens de suivi livraison / notifications cassés** (`/?page=livraison` vs routes `/fr/livraison`) — impact direct clients, livreurs, WhatsApp.
2. **CSS navbar mobile appliqué sur desktop** (`styles.js`, bloc « Navbar mobile optimisée » sans `@media`) — régression navigation desktop + catégories masquées.
3. **Fiche produit non responsive + pas de drawer panier** — friction conversion mobile (Cameroun = majoritairement mobile).

### Écart charte couleur

La charte mentionnée (`#0a7d3e`) **n’existe pas dans le repo**. Le vert réel est `--green: #1a6b3a` dans `src/utils/styles.js`. Décision fondateur requise avant harmonisation.

---

## 🔴 Bugs critiques (à corriger immédiatement)

### Bug #1 : Liens legacy `/?page=` ignorés par le routeur

- **Fichiers :** `src/utils/deliveryWorkflow.js` (anchors `link: \`/?page=livraison`), `src/components/ModalDemandeLivraison.jsx` (`window.location.href = "/?page=livraison&code="`), `src/components/AdminDashboard.jsx` (bouton suivi livraison)
- **Problème :** Le routeur SEO (`src/lib/seoRoutes.js`) utilise des chemins `/fr/...`, pas `?page=`. Les liens WhatsApp, emails et notifications de suivi ouvrent **l’accueil** au lieu de la page livraison / dashboard.
- **Impact business :** **Élevé** — clients et livreurs ne peuvent pas suivre une course ; perte de confiance post-commande.
- **Solution proposée :** Remplacer par `ensureLocalePath('/livraison?code=...')` ou `/fr/livraison?code=...` ; ajouter un redirect legacy dans `YorixApp.jsx` pour `?page=livraison|dashboard|admin`.
- **Effort :** 2–3 h

---

### Bug #2 : Règles CSS « Navbar mobile optimisée » sans `@media`

- **Fichier :** `src/utils/styles.js`, bloc commentaire `/* Navbar mobile optimisée */` (juste après `@media(max-width:500px)`)
- **Problème :** `.nav-search select{display:none}`, `.role-chip{display:none}`, `.btn-ghost span{display:none}` s’appliquent **sur tous les écrans**, y compris desktop 1280px+.
- **Impact business :** **Élevé** — filtre catégorie header invisible, libellés boutons masqués, UX desktop dégradée.
- **Solution proposée :** Encapsuler les lignes 635–649 dans `@media (max-width: 768px) { ... }`.
- **Effort :** 15 min

---

### Bug #3 : Fiche produit en grille 2 colonnes fixe sur mobile

- **Fichier :** `src/components/FicheProduit.jsx`, anchor `gridTemplateColumns: "1fr 1fr"`
- **Problème :** Galerie + infos côte à côte sur 320–414px → texte illisible, CTA « Ajouter au panier » étroit.
- **Impact business :** **Élevé** — page la plus importante pour la conversion.
- **Solution proposée :** Classe CSS `.fiche-produit-grid` avec `grid-template-columns: 1fr` @768px ; conserver 2 colonnes desktop.
- **Effort :** 45 min

---

### Bug #4 : Panier drawer CSS mort — pas de composant

- **Fichiers :** `src/utils/styles.js` (`.cart-overlay`, `.cart-drawer`), `src/components/yorix/YorixHeader.jsx` (icône panier → `goPage("cart")` uniquement)
- **Problème :** ~200 lignes CSS pour un drawer Amazon-style **jamais monté en JSX**. Chaque ajout panier = changement de page complète.
- **Impact business :** **Élevé** — friction mobile, abandon panier.
- **Solution proposée :** Créer `src/components/CartDrawer.jsx` branché sur `useYorixCart` + z-index > 440 (header) ; ou retirer le CSS mort et ajouter **Panier** à la barre mobile.
- **Effort :** 4–6 h (drawer) ou 30 min (onglet mobile seulement)

---

### Bug #5 : Stock non décrémenté à la confirmation commande

- **Fichier :** `supabase/functions/confirm_checkout/index.ts` (aucune mention de `stock`)
- **Problème :** Le checkout vérifie prix/actif mais **pas la quantité vs stock** ; pas de `UPDATE products SET stock = stock - qty`.
- **Impact business :** **Élevé** — survente, litiges vendeurs/acheteurs.
- **Solution proposée :** Dans `confirm_checkout`, vérifier stock par ligne + décrément atomique (RPC ou `UPDATE ... WHERE stock >= qty`).
- **Effort :** 3–4 h

---

### Bug #6 : Statuts commande incohérents (admin vs vendeur)

- **Fichiers :** `confirm_checkout` (`status: "pending"`), `SellerDashboard.jsx` (`delivered`, `shipped`), `AdminDashboard.jsx` (`livre`)
- **Problème :** Filtres et stats ne correspondent pas ; revenus vendeur basés sur `delivered` peuvent diverger des actions admin.
- **Impact business :** **Moyen–élevé** — reporting faux, support client confus.
- **Solution proposée :** Enum unique documenté + migration valeurs + alignement des filtres.
- **Effort :** 4–6 h

---

### Bug #7 : Checkout WhatsApp « succès » même si l’API échoue

- **Fichier :** `src/components/CheckoutPage.jsx`, branche `whatsapp_backup`
- **Problème :** `confirmCheckout` en échec → `console.warn` seulement ; panier vidé + WA ouvert quand même.
- **Impact business :** **Élevé** — commande fantôme, client pense avoir payé.
- **Solution proposée :** Ne vider le panier / ouvrir WA que si `confirmCheckout` retourne OK ; toast d’erreur sinon.
- **Effort :** 1 h

---

### Bug #8 : Erreurs Edge checkout mal remontées au UI

- **Fichiers :** `src/lib/checkoutApi.js`, `src/components/CheckoutPage.jsx`
- **Problème :** `invoke` réussit avec `{ error: "Cart subtotal mismatch" }` (409) sans throw → message générique.
- **Impact business :** **Moyen** — abandon au paiement sans explication.
- **Solution proposée :** Dans `checkoutApi.js`, si `data?.error`, throw avec message traduit.
- **Effort :** 45 min

---

### Bug #9 : Conflits CSS mobile agressifs

- **Fichier :** `src/utils/styles.js`, section `@media(max-width:768px)` (bloc « MOBILE CRITICAL FIX »)
- **Problème :** `* { max-width: 100vw !important; }` et `[style*="display:flex"] { flex-wrap: wrap !important; }` cassent modals, dropdowns, grilles intentionnelles.
- **Impact business :** **Moyen** — bugs visuels aléatoires sur mobile/tablette.
- **Solution proposée :** Supprimer les règles globales `*` / attribut ; cibler des classes `.yorix-*` uniquement.
- **Effort :** 2–3 h

---

## 🟠 Améliorations importantes

### UX / Visuel / Responsive

| # | Problème | Fichier(s) | Impact | Effort |
|---|----------|------------|--------|--------|
| 10 | **Triple WhatsApp** (barre sticky + FAB + onglet mobile) | `styles.js` `.wa-sticky`, `YorixPages.jsx` `.yorix-fab-stack`, `HomePage.jsx` | Moyen | 1 h |
| 11 | **Pas de panier** dans barre mobile `.mobile-nav` | `src/components/yorix/YorixPages.jsx` `.mn-inner` | Élevé | 30 min |
| 12 | **Z-index drawer panier (351) < header (440)** | `styles.js` `.cart-drawer` | Moyen | 15 min |
| 13 | **Topbar réaffichée @768px** (règles contradictoires) | `styles.js` lignes ~1188 vs ~1371 | Moyen | 1 h |
| 14 | **Grilles 2 colonnes inline** sans breakpoint vendeur/admin | `SellerDashboard.jsx`, `AdminDashboard.jsx` | Moyen | 2–3 h |
| 15 | **Zones tactiles < 44px** (`.qty-btn`, `.wish-btn`, `.ci-del` 22px) | `styles.js` | Moyen | 1–2 h |
| 16 | **Textes < 14px** (`.mn-label` .6rem, footer .61rem, admin .62rem) | `styles.js`, composants admin | Moyen | 2 h |
| 17 | **Header : `<span onClick>`** sans clavier/ARIA | `YorixHeader.jsx` topbar + nav tabs | Moyen (a11y) | 1–2 h |
| 18 | **`alert()` contact vendeur** sur fiche produit | `FicheProduit.jsx` | Moyen | 30 min |
| 19 | **Footer logo « rix » en rouge** vs vert marque | `styles.js` `.footer-logo span` | Faible | 15 min |
| 20 | **NotificationBell** fond blanc fixe (dark mode) | `NotificationBell.jsx` CSS inline | Faible | 45 min |

### Images & performance

| # | Problème | Fichier(s) | Impact | Effort |
|---|----------|------------|--------|--------|
| 21 | **`OptimizedImage` sous-utilisé** (~7 fichiers) vs `<img>` (~30+ tags) | `YorixHeader`, `HomePremiumMerch`, `SellerDashboard`, `AdminDashboard`, `BlogPage`, etc. | Élevé (LCP mobile) | 4–6 h |
| 22 | **Catalogue limité 200 produits** sans pagination | `YorixApp.jsx` chargement produits | Moyen | 3–4 h |
| 23 | **Pas de skeleton** sur chargement catalogue | `ProdGrid.jsx`, `HomePage.jsx` | Moyen | 2 h |

### Flux acheteur

| # | Problème | Fichier(s) | Impact | Effort |
|---|----------|------------|--------|--------|
| 24 | **Qty panier > stock** non bloquée côté client | `cartDomain.js`, `CartPage.jsx` | Moyen | 1 h |
| 25 | **Prix panier stale** jusqu’au checkout (409 mismatch) | `cartDomain.js` | Moyen | 2 h |
| 26 | **Suggestions recherche** n’ouvrent pas le produit | `YorixHeader.jsx` | Moyen | 45 min |
| 27 | **`ModalCommander`** ne ouvre pas WhatsApp (nom trompeur) | `ModalCommander.jsx` | Moyen | 1 h |
| 28 | **Retour CinetPay** sans auth → pas de modal connexion | `CheckoutPage.jsx` | Moyen | 1 h |

### Flux vendeur / livreur / admin

| # | Problème | Fichier(s) | Impact | Effort |
|---|----------|------------|--------|--------|
| 29 | **Erreurs vendeur via `alert()`** | `SellerDashboard.jsx` | Moyen | 1–2 h |
| 30 | **Livreur : pas de pool missions ouvertes** | `DeliveryDashboard.jsx` | Moyen | 4 h |
| 31 | **`dashTab` URL non synchronisé** (livreur) | `YorixApp.jsx` vs admin qui lit `?tab=` | Moyen | 1 h |
| 32 | **Admin limité 1000 lignes** users/produits/commandes | `AdminDashboard.jsx` | Moyen | 2 h |
| 33 | **Filtre produits admin** sur `categorie` legacy | `AdminDashboard.jsx` | Faible–moyen | 1 h |

### Auth / PWA / Notifications

| # | Problème | Fichier(s) | Impact | Effort |
|---|----------|------------|--------|--------|
| 34 | **Double service worker** (`sw.js` racine vs `public/sw.js`) | racine + `public/` | Moyen (TWA) | 2 h |
| 35 | **Manifest : icônes SVG seules**, pas de PNG 192/512 | `public/manifest.json` | Moyen (Play Store) | 1 h |
| 36 | **`public/icons/` absent** — precache SW 404 | `sw.js` (racine) | Moyen | 1 h |
| 37 | **NotificationBell** erreurs fetch silencieuses | `NotificationBell.jsx` | Faible | 30 min |
| 38 | **Fidélité : redeem non atomique** | `LoyaltyRedeemModal.jsx` | Moyen | 2 h |

---

## 🟡 Nice-to-have

| # | Sujet | Fichier(s) | Effort |
|---|--------|------------|--------|
| 39 | Harmoniser `--green` → `#0a7d3e` si validé charte | `styles.js`, `manifest.json`, hardcoded hex | 1–2 h |
| 40 | `:focus-visible` global (outline supprimé partout) | `styles.js` | 2 h |
| 41 | i18n checkout étapes 2–3 (FR/EN mixte) | `CheckoutPage.jsx` | 2 h |
| 42 | Sticky « Payer maintenant » mobile checkout | `CheckoutPage.jsx` | 1 h |
| 43 | Supprimer CSS mort `.cart-drawer` si pas de drawer | `styles.js` | 30 min |
| 44 | `share_target` manifest sans handler | `manifest.json` + route | 2 h |
| 45 | Google OAuth sans spinner | `useYorixAuth.js` | 30 min |
| 46 | Newsletter insert sans feedback | `YorixPages.jsx` | 30 min |
| 47 | `DeliveryTracker` message demo code | `DeliveryTracker.jsx` | 15 min |
| 48 | Tests E2E checkout / WhatsApp | nouveau dossier tests | 8 h+ |
| 49 | Pagination blog/academy images lazy | `BlogPage.jsx`, `AcademyPage.jsx` | 2 h |
| 50 | Admin toast z-index 9999 vs modals | `AdminDashboard.jsx` | 15 min |
| 51 | Points fidélité visibles au checkout | `CheckoutPage.jsx` + RPC | 3 h |
| 52 | Consolidation blocs `@media` mobile (1 seule section) | `styles.js` | 3 h |

---

## 📱 Matrice responsive (constats code)

| Breakpoint | Problèmes identifiés |
|------------|---------------------|
| **320px** | Fiche produit 2 col ; textes .6rem illisibles ; FAB + WA + nav empilés ; qty 26px |
| **360px** | Idem + topbar 10px si règle `!important` active |
| **414px** | Grilles vendeur/admin non adaptées |
| **768px** | Conflits topbar / navbar ; home 2 col OK ; cart page 1 col OK |
| **1280px+** | **Régression navbar** (bug #2) masque select catégorie |

---

## ♿ Accessibilité (a11y)

| Critère | État | Action |
|---------|------|--------|
| Contraste WCAG AA | Partiel | Footer gris `.72rem`, badges admin à vérifier |
| Taille corps ≥ 14px mobile | ❌ | Nombreuses règles .6–.7rem |
| Labels inputs | ✅ Checkout bien labellisé | Étendre vendeur |
| Alt images | Partiel | Beaucoup `alt=""` (header search, admin) |
| Focus clavier | ❌ | Spans/divs cliquables sans `role="button"` |
| Touch 44×44 | ❌ | Boutons cart/wish 22–26px |

---

## 🛒 Parcours fonctionnels (synthèse)

### Acheteur

```
Accueil / Produits → FicheProduit → cartDomain (localStorage)
  → CartPage (/panier) → CheckoutPage → create_checkout_intent
  → confirm_checkout → CinetPay | COD | WhatsApp backup
```

**Points forts :** barre de progression checkout, i18n partiel, escrow affiché, politique email notifications récente.  
**Points faibles :** pas de drawer, stock, liens suivi, erreurs checkout, fiche mobile.

### Vendeur

**Points forts :** CategoryPicker + packs modérés, Made in Cameroon, stock lifecycle cron.  
**Points faibles :** alert(), grilles desktop-only, images non optimisées.

### Livreur

**Points forts :** module `deliveryWorkflow.js` riche (accept/refuse, logs).  
**Points faibles :** liens WA cassés, pas de missions pool, dashTab URL.

### Admin

**Points forts :** many tabs, partner read-only, notif in-app nouveaux produits (migration récente).  
**Points faibles :** limites 1000, statuts commande, petits boutons mobile.

---

## 🗂️ Inventaire composants (extrait)

| Zone | Fichiers clés | État global |
|------|---------------|-------------|
| Shell | `YorixApp.jsx`, `YorixHeader.jsx`, `YorixPages.jsx`, `PremiumSiteFooter.jsx` | ⚠️ CSS global fragile |
| Catalogue | `ProdGrid.jsx`, `FicheProduit.jsx`, `HomePage.jsx` | ⚠️ PDP mobile |
| Panier / paiement | `CartPage.jsx`, `CheckoutPage.jsx`, `checkoutApi.js` | ⚠️ erreurs + stock |
| Vendeur | `SellerDashboard.jsx`, `CategoryPicker.jsx` | ⚠️ alert + responsive |
| Admin | `AdminDashboard.jsx`, `AdminPackModeration.jsx` | ⚠️ dense mobile |
| Livraison | `DeliveryDashboard.jsx`, `deliveryWorkflow.js` | 🔴 liens legacy |
| Fidélité | `LoyaltyPage.jsx`, `LoyaltyRedeemModal.jsx` | ⚠️ atomicité |
| PWA | `public/sw.js`, `public/manifest.json` | ⚠️ icônes / drift SW |

---

## 📋 Plan de correction recommandé (ordre)

### Sprint 1 — Confiance & conversion (12–18 h)

1. Bug #1 — URLs livraison / legacy redirect  
2. Bug #2 — `@media` navbar  
3. Bug #3 — FicheProduit responsive  
4. Bug #7 + #8 — Checkout WhatsApp + erreurs API  
5. #11 — Panier dans nav mobile  
6. Bug #5 — Stock checkout (Edge)

### Sprint 2 — Expérience mobile (10–14 h)

7. Bug #4 — CartDrawer ou simplification  
8. Bug #9 — Nettoyage CSS mobile  
9. #10 — Dédupliquer WhatsApp  
10. #15–16 — Touch targets + typo mobile  
11. #21 — OptimizedImage catalogue/header/home  

### Sprint 3 — Opérations & TWA (8–12 h)

12. Bug #6 — Statuts commande  
13. #34–36 — PWA icônes + SW unique  
14. #29–32 — Dashboards vendeur/livreur/admin  
15. #38 — Fidélité atomique  

---

## ⚙️ Rappel conventions (pour les corrections)

- **Vert :** décider `#0a7d3e` vs `#1a6b3a` actuel  
- **Devise :** `25 000 FCFA` (espaces)  
- **WhatsApp :** +237 696 56 56 54  
- **Images :** préférer `OptimizedImage` + Cloudinary `dulwb03nf`  
- **Erreurs :** Toast existant, pas `alert()`  
- **Pas de nouvelle dépendance NPM** sans validation Kouekam  

---

## ✅ Déjà en bon état (ne pas casser)

- Politique notifications email (in-app catalogue / stock / packs) — déployée récemment  
- Navigation notification détail + admin `?tab=`  
- Checkout progress bar + draft localStorage  
- Module livraison `deliveryWorkflow.js` (logique métier)  
- CategoryPicker + taxonomie marketplace  
- Merchandising hubs + modération packs  
- Realtime notifications (Supabase)  
- Tests unitaires partiels (`cartDomain`, `checkoutApi`, `HomePage`)  

---

*Audit généré pour Kouekam / Yorix CM — en attente de vos instructions pour démarrer les corrections fichier par fichier.*
