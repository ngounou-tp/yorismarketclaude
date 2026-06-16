import { ProdGrid } from "../components/ProdGrid";
import { MERCH_HUBS } from "../lib/merchHubs";
import "./merchHubPage.css";

/**
 * Landing merchandising premium (/made-in-cameroun, /top-produits, …)
 */
export function MerchHubPage({
  merchHub,
  locale = "fr",
  produits = [],
  produitsLoading,
  user,
  userData,
  wishlist,
  addToCart,
  toggleWish,
  openProductUrl,
  goPage,
}) {
  const hub = MERCH_HUBS[merchHub];
  const isEn = locale === "en";

  if (!hub) {
    return (
      <section className="sec anim">
        <p>Hub introuvable.</p>
        <button type="button" className="form-submit" onClick={() => goPage("produits")}>
          Catalogue
        </button>
      </section>
    );
  }

  return (
    <section className="mhub-page sec anim yorix-page-flow">
      <header className={`mhub-hero mhub-hero--${hub.theme}`}>
        <span className="mhub-hero-emoji" aria-hidden>
          {hub.emoji}
        </span>
        <h1 className="mhub-hero-title">{isEn ? hub.titleEn : hub.titleFr}</h1>
        <p className="mhub-hero-desc">{isEn ? hub.descEn : hub.descFr}</p>
        {merchHub === "made-in-cameroun" && (
          <p className="mhub-hero-note">
            {isEn
              ? "🇨🇲 Badge: seller choice + auto-detection + admin verification (✔)"
              : "🇨🇲 Badge : choix vendeur + détection auto + validation admin (✔)"}
          </p>
        )}
      </header>

      {produitsLoading ? (
        <ProdGrid
          prods={[]}
          user={user}
          userData={userData}
          onAddToCart={addToCart}
          onWish={toggleWish}
          wishlist={wishlist}
          onOpenProductUrl={openProductUrl}
          produitsLoading
        />
      ) : produits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{hub.emoji}</div>
          <p>{isEn ? "No products in this selection yet." : "Aucun produit dans cette sélection pour le moment."}</p>
          <button type="button" className="form-submit" style={{ width: "auto" }} onClick={() => goPage("produits")}>
            {isEn ? "Browse catalog" : "Voir le catalogue"}
          </button>
        </div>
      ) : (
        <ProdGrid
          prods={produits}
          user={user}
          userData={userData}
          onAddToCart={addToCart}
          onWish={toggleWish}
          wishlist={wishlist}
          onOpenProductUrl={openProductUrl}
        />
      )}
    </section>
  );
}
