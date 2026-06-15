function ProductCardSkeleton() {
  return (
    <div className="prod-card skeleton-card" aria-hidden="true">
      <div className="prod-img-wrap">
        <span className="skeleton skeleton-img" />
      </div>
      <div className="prod-info">
        <span className="skeleton skeleton-text skeleton-name" />
        <span className="skeleton skeleton-text-sm skeleton-category" />
        <span className="skeleton skeleton-text skeleton-desc" />
        <span className="skeleton skeleton-text skeleton-desc-short" />
        <span className="skeleton skeleton-price" />
        <span className="skeleton skeleton-button" />
      </div>
    </div>
  );
}

export function SkeletonCard({ count = 1 }) {
  const safeCount = Math.max(1, Number(count) || 1);

  if (safeCount === 1) {
    return <ProductCardSkeleton />;
  }

  return (
    <div className="prod-grid skeleton-grid" aria-label="Chargement des produits">
      {Array.from({ length: safeCount }, (_, index) => (
        <ProductCardSkeleton key={`skeleton-card-${index}`} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="fiche-skeleton" aria-label="Chargement du produit">
      <div className="fiche-skeleton-inner">
        <span className="skeleton fiche-skeleton-back" />
        <div className="fiche-produit-grid">
          <div>
            <span className="skeleton fiche-skeleton-image" />
            <div className="fiche-skeleton-thumbs">
              {Array.from({ length: 4 }, (_, index) => (
                <span className="skeleton fiche-skeleton-thumb" key={`fiche-thumb-${index}`} />
              ))}
            </div>
          </div>
          <div className="fiche-skeleton-info">
            <span className="skeleton fiche-skeleton-strip" />
            <span className="skeleton fiche-skeleton-title" />
            <span className="skeleton fiche-skeleton-line" />
            <span className="skeleton fiche-skeleton-line short" />
            <span className="skeleton fiche-skeleton-price" />
            <span className="skeleton fiche-skeleton-cta" />
            <span className="skeleton fiche-skeleton-ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}
