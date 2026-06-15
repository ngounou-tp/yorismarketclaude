# Recommandations UX Yorix

## Captures mobiles annotées

### Capture 1 - Catalogue produits

```text
+--------------------------------+
| Header + recherche             |
| [categorie] [rechercher...]    | <- La recherche occupe peu de hauteur, bon point.
+--------------------------------+
| Filtres categorie              | <- Risque de friction si trop de filtres avant les produits.
+--------------------------------+
| [Produit] [Produit]            |
| [Produit] [Produit]            | <- Grille dense, mais les badges peuvent saturer les cartes.
+--------------------------------+
| Nav mobile fixe                | <- Toujours visible, rassurant pour revenir au panier.
+--------------------------------+
```

Probleme identifie : le catalogue est efficace, mais les filtres et badges peuvent repousser les produits critiques sous la ligne de flottaison mobile.

### Capture 2 - Fiche produit

```text
+--------------------------------+
| <- Retour                      |
+--------------------------------+
| Grande image produit           | <- Image claire, mais le CTA achat arrive apres beaucoup d'infos.
|                                |
+--------------------------------+
| Nom, avis, ville, categorie    |
| Prix                           |
| [Commander] [Panier]           | <- CTA principal correct, mais pas assez "express".
+--------------------------------+
| Avis / description             |
+--------------------------------+
```

Probleme identifie : la fiche produit donne confiance, mais l'achat rapide demande encore plusieurs decisions avant le checkout.

### Capture 3 - Panier / achat

```text
+--------------------------------+
| Articles panier                |
| - produit, quantite, prix      |
+--------------------------------+
| Livraison offerte progress     | <- Message utile, mais peut concurrencer le total.
+--------------------------------+
| Total                          |
| [Commander]                    | <- CTA doit rester sticky en bas sur mobile.
+--------------------------------+
```

Probleme identifie : le panier contient les bons signaux, mais le chemin vers paiement mobile peut etre encore plus direct.

## Ameliorations prioritaires

1. Rendre le CTA d'achat sticky sur la fiche produit mobile.
   Le bouton "Commander" ou "Acheter maintenant" devrait rester visible apres le premier scroll, avec le prix et l'etat de stock.

2. Simplifier les cartes produit en mode catalogue mobile.
   Garder nom, prix, image, ville et CTA panier. Deplacer certains badges secondaires dans la fiche produit pour reduire la charge visuelle.

3. Ajouter un mode "Achat express".
   Depuis une carte ou une fiche, l'utilisateur choisit quantite, ville/livraison, moyen de paiement, puis confirme sans parcourir tout le panier.

## Flux ideal "Achat express" mobile

```text
Carte produit
  |
  v
[Acheter maintenant]
  |
  v
Bottom sheet "Achat express"
  - Produit + prix
  - Quantite
  - Ville / quartier de livraison
  - Moyen de paiement: MTN MoMo, Orange Money, cash
  - Resume total
  |
  v
[Confirmer la commande]
  |
  v
Etat confirmation
  - Commande creee
  - Instructions paiement
  - Suivi livraison / WhatsApp vendeur
```

Objectif : permettre un achat en moins de 60 secondes sur mobile, sans supprimer le panier classique pour les achats multi-produits.
