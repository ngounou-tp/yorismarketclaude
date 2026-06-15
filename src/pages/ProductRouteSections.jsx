import { ProdGrid } from "../components/ProdGrid";
import { CategoryFilterPanel } from "../components/categories/CategoryFilterPanel";
import { EscrowPremiumPage } from "./EscrowPremiumPage";

export function ProductRouteSections({
  showProduits,
  page,
  seoCityName,
  produitsFiltres,
  produitsLoading,
  produits,
  filterCat,
  setFilterCat,
  categoryTree = [],
  categoryFilter,
  goToCategory,
  siteLocale = "fr",
  search,
  user,
  userData,
  wishlist,
  addToCart,
  toggleWish,
  openProductUrl,
  dark,
  goPage,
}) {
  if (showProduits) {
    return (
      <section className="sec anim yorix-page-flow yorix-pro-page">
        <div className="sec-head yorix-catalog-head">
          <h1 className="sec-title">
            {page === "seoCity" && seoCityName
              ? `🛍️ Achat en ligne à ${seoCityName} — produits marketplace`
              : "🛍️ Marketplace Cameroun — tous les produits"}
          </h1>
          <div className="yorix-sec-toolbar-end" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span className="yorix-catalog-meta">{produitsFiltres.length} résultat(s)</span>
            {filterCat && (
              <button type="button" className="btn-ghost yorix-pill--ghost" onClick={() => setFilterCat("")}>
                ✕ {filterCat}
              </button>
            )}
          </div>
        </div>
        <CategoryFilterPanel
          tree={categoryTree}
          locale={siteLocale}
          parentSlug={categoryFilter?.parent?.slug || ""}
          subSlug={categoryFilter?.child?.slug || ""}
          filterCat={filterCat}
          onParentChange={(slug) => goToCategory?.({ parentSlug: slug })}
          onSubChange={(sub) =>
            goToCategory?.({
              parentSlug: categoryFilter?.parent?.slug,
              subSlug: sub,
            })
          }
          onLegacyCatChange={setFilterCat}
        />
        {produitsLoading ? (
          <ProdGrid
            prods={[]}
            user={user}
            userData={userData}
            onAddToCart={addToCart}
            onWish={toggleWish}
            wishlist={wishlist}
            onOpenProductUrl={openProductUrl}
            loading
          />
        ) : produitsFiltres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Aucun produit{search ? ` pour « ${search} »` : ""}.</p>
          </div>
        ) : (
          <ProdGrid
            prods={produitsFiltres}
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

  if (page === "escrow" && typeof goPage === "function") {
    return (
      <EscrowPremiumPage
        dark={dark}
        produitsLoading={produitsLoading}
        produits={produits}
        user={user}
        userData={userData}
        wishlist={wishlist}
        addToCart={addToCart}
        toggleWish={toggleWish}
        openProductUrl={openProductUrl}
        goPage={goPage}
      />
    );
  }

  return null;
}
