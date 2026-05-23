import { Suspense } from "react";
import { buildEntitySlug, CITY_BY_SLUG } from "../../lib/seoRoutes";
import { WhatsAppFab } from "../WhatsAppFab";
import { supabase, YORIX_WA_NUMBER, MOMO_NUMBER, ORANGE_NUMBER, PAYMENT_WA_NUMBER } from "../../lib/supabase";
import { ROLE_LABELS } from "../../lib/constants";
import { isAdminViewer, canWriteAdmin } from "../../lib/roles";
import { SeoLocalIntro } from "../seo/SeoLocalIntro";
import { ChatUsers } from "../ChatUsers";
import {
  RouteSuspenseFallback,
  LazyHomePage,
  LazyProductRouteSections,
  LazyLivraisonPage,
  LazySiteMarketingPages,
  LazyFicheProduit,
  LazyPrestPage,
  LazyCheckoutPage,
  LazyCartPage,
  LazyAcademyDetail,
  LazyAcademyContactForm,
  LazyLoyaltyPage,
  LazyPromotionsPage,
  LazyMerchHubPage,
  LazySellerDashboard,
  LazyBuyerDashboard,
  LazyDeliveryDashboard,
  LazyProviderDashboard,
  LazyAdminDashboard,
  LazyNotificationsPage,
} from "../../lazyRoutes";

/**
 * Contenu principal des routes (hors header / modales globales).
 * @param {{ ctx: Record<string, unknown> }} props
 */
export function YorixPages({ ctx }) {
  const {
    page,
    route,
    user,
    userData,
    userRole,
    dark,
    goPage,
    filterCat,
    setFilterCat,
    categoryTree,
    categoryFlat,
    categoryLoading,
    reloadCategories,
    categoryFilter,
    goToCategory,
    search,
    setSearch,
    produits,
    produitsLoading,
    wishlist,
    addToCart,
    toggleWish,
    openProductUrl,
    setOnboardingOpen,
    allServices,
    nlEmail,
    setNlEmail,
    nlSent,
    setNlSent,
    commerceDeliveryPolicy,
    showSeoLocal,
    detailProduct,
    detailProductLoading,
    needsProductListingChunk,
    showProduits,
    seoCityName,
    produitsFiltres,
    showLivraison,
    showPrestataires,
    selectedPrest,
    setSelectedPrest,
    prestSyncFilters,
    addServiceToCart,
    cartItems,
    cartSummary,
    changeQty,
    removeItem,
    setCartItems,
    persistCheckoutContact,
    setAuthTab,
    setSelectedRole,
    setAuthOpen,
    setDemandeLivraisonOpen,
    notifs,
    marquerNotifLue,
    openNotificationTarget,
    marquerToutesLues,
    supprimerNotif,
    loadNotifsForUser,
    setNotifPrefs,
    isSiteMarketingPage,
    inscriptionSent,
    setInscriptionSent,
    inscriptionForm,
    setInscriptionForm,
    inscriptionError,
    inscriptionLoading,
    soumettreCandidaturePrestataire,
    academyCourses,
    academyLoading,
    goAcademyDetail,
    blogFilter,
    setBlogFilter,
    selectedCourse,
    goAcademyContact,
    dashTab,
    setDashTab,
    pendingChatConversationId,
    setPendingChatConversationId,
    getDashNav,
    roleChipClass,
    doLogout,
    loyaltyPts,
    setLoyaltyPts,
    totalQty,
    tabActive,
    unread,
    openCart,
  } = ctx;

  return (
    <>
      {page === "merchHub" && route.merchHub && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement sélection..." />}>
          <LazyMerchHubPage
            merchHub={route.merchHub}
            locale={route.locale || "fr"}
            produits={produitsFiltres}
            produitsLoading={produitsLoading}
            user={user}
            userData={userData}
            wishlist={wishlist}
            addToCart={addToCart}
            toggleWish={toggleWish}
            openProductUrl={openProductUrl}
            goPage={goPage}
          />
        </Suspense>
      )}

      {page === "home" && (
        <Suspense fallback={<RouteSuspenseFallback minHeight={280} label="Chargement de l'accueil..." />}>
          <LazyHomePage
            siteLocale={route.locale || "fr"}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            search={search}
            setSearch={setSearch}
            produitsLoading={produitsLoading}
            produits={produits}
            user={user}
            userData={userData}
            wishlist={wishlist}
            addToCart={addToCart}
            toggleWish={toggleWish}
            openProductUrl={openProductUrl}
            setOnboardingOpen={setOnboardingOpen}
            goPage={goPage}
            categoryTree={categoryTree}
            goToCategory={goToCategory}
            allServices={allServices}
            nlEmail={nlEmail}
            setNlEmail={setNlEmail}
            nlSent={nlSent}
            setNlSent={setNlSent}
            freeShippingThresholdXaf={commerceDeliveryPolicy.freeShippingThresholdXaf}
          />
        </Suspense>
      )}

      {showSeoLocal && page === "livraison" && route.citySlug && CITY_BY_SLUG[route.citySlug] && (
        <SeoLocalIntro city={CITY_BY_SLUG[route.citySlug]} mode="livraison" goPage={goPage} />
      )}
      {showSeoLocal && page === "seoCity" && route.citySlug && CITY_BY_SLUG[route.citySlug] && (
        <SeoLocalIntro city={CITY_BY_SLUG[route.citySlug]} mode={route.cityMode || "hub"} goPage={goPage} />
      )}

      {page === "productDetail" && (
        <div className="anim">
          {detailProductLoading ? (
            <div className="loading" style={{ minHeight: 320, justifyContent: "center" }}>
              <div className="spinner" /> Chargement du produit...
            </div>
          ) : detailProduct ? (
            <Suspense fallback={<RouteSuspenseFallback minHeight={320} label="Chargement du produit..." />}>
              <LazyFicheProduit
                product={detailProduct}
                user={user}
                userData={userData}
                onClose={() => goPage("produits")}
                onAddToCart={addToCart}
                siteLocale={route.locale || "fr"}
              />
            </Suspense>
          ) : (
            <section className="sec anim">
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Produit introuvable.</p>
                <button
                  className="form-submit"
                  style={{ width: "auto", marginTop: 16 }}
                  type="button"
                  onClick={() => goPage("produits")}
                >
                  ← Retour aux produits
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {needsProductListingChunk && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement catalogue..." />}>
          <LazyProductRouteSections
            showProduits={showProduits}
            page={page}
            seoCityName={seoCityName}
            produitsFiltres={produitsFiltres}
            produitsLoading={produitsLoading}
            produits={produits}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            categoryTree={categoryTree}
            categoryFilter={categoryFilter}
            goToCategory={goToCategory}
            siteLocale={route.locale || "fr"}
            search={search}
            user={user}
            userData={userData}
            wishlist={wishlist}
            addToCart={addToCart}
            toggleWish={toggleWish}
            openProductUrl={openProductUrl}
            dark={dark}
            goPage={goPage}
          />
        </Suspense>
      )}

      {showLivraison && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement livraison..." />}>
          <LazyLivraisonPage
            route={route}
            user={user}
            userData={userData}
            setDemandeLivraisonOpen={setDemandeLivraisonOpen}
            setAuthTab={setAuthTab}
            setSelectedRole={setSelectedRole}
            setAuthOpen={setAuthOpen}
          />
        </Suspense>
      )}

      {showPrestataires && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement prestataires..." />}>
          <LazyPrestPage
            user={user}
            userData={userData}
            allServices={allServices}
            goPage={goPage}
            setSelectedPrest={setSelectedPrest}
            selectedPrest={selectedPrest}
            onOpenPrestDetail={(p) => goPage("prestDetail", { prestSlug: buildEntitySlug(p.name, p.id) })}
            onClosePrestDetail={() => {
              if (route.metierSlug && route.villeSlug) {
                goPage("prestataires", {
                  metierSlug: route.metierSlug,
                  villeSlug: route.villeSlug,
                });
              } else if (page === "seoCity" && route.cityMode === "prestataires" && route.citySlug) {
                goPage("seoCity", { citySlug: route.citySlug, mode: "prestataires" });
              } else {
                goPage("prestataires");
              }
            }}
            syncFilters={prestSyncFilters}
            onAddServiceToCart={addServiceToCart}
          />
        </Suspense>
      )}

      {page === "cart" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement panier..." />}>
          <LazyCartPage
            cartItems={cartItems}
            cartSummary={cartSummary}
            changeQty={changeQty}
            removeItem={removeItem}
            goPage={goPage}
            addToCart={addToCart}
            produits={produits}
            wishlist={wishlist}
            toggleWish={toggleWish}
          />
        </Suspense>
      )}

      {page === "checkout" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement checkout..." />}>
          <LazyCheckoutPage
            user={user}
            userData={userData}
            cartItems={cartItems}
            summary={cartSummary}
            setCartItems={setCartItems}
            goPage={goPage}
            fallbackWhatsappNumber={PAYMENT_WA_NUMBER}
            momoNumber={MOMO_NUMBER}
            orangeNumber={ORANGE_NUMBER}
            persistCheckoutContact={persistCheckoutContact}
          />
        </Suspense>
      )}

      {page === "notifications" && !user && (
        <section className="sec anim" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "48px 20px" }}>
          <h1 className="sec-title" style={{ fontSize: "1.25rem" }}>
            Vos notifications Yorix
          </h1>
          <p style={{ color: "var(--gray)", marginBottom: 22, fontSize: ".9rem", lineHeight: 1.55 }}>
            Connectez-vous pour suivre les messages, commandes, paiements et livraisons en temps réel.
          </p>
          <button
            type="button"
            className="form-submit"
            style={{ width: "auto", padding: "12px 28px" }}
            onClick={() => {
              setAuthTab("login");
              setAuthOpen(true);
            }}
          >
            Se connecter
          </button>
        </section>
      )}
      {page === "notifications" && user && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement notifications..." />}>
          <LazyNotificationsPage
            user={user}
            notifs={notifs}
            goPage={goPage}
            siteLocale={route.locale || "fr"}
            onMarkRead={marquerNotifLue}
            onOpenNotif={openNotificationTarget}
            onMarkAllRead={marquerToutesLues}
            onDismiss={supprimerNotif}
            refreshNotificationsFull={() => loadNotifsForUser(user.id, 120)}
            onPrefsUpdated={setNotifPrefs}
          />
        </Suspense>
      )}

      {isSiteMarketingPage && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement page..." />}>
          <LazySiteMarketingPages
            page={page}
            goPage={goPage}
            setAuthOpen={setAuthOpen}
            setAuthTab={setAuthTab}
            setSelectedRole={setSelectedRole}
            inscriptionSent={inscriptionSent}
            setInscriptionSent={setInscriptionSent}
            inscriptionForm={inscriptionForm}
            setInscriptionForm={setInscriptionForm}
            inscriptionError={inscriptionError}
            inscriptionLoading={inscriptionLoading}
            submitInscriptionPrestataire={soumettreCandidaturePrestataire}
            academyCourses={academyCourses}
            academyLoading={academyLoading}
            goAcademyDetail={goAcademyDetail}
            blogFilter={blogFilter}
            setBlogFilter={setBlogFilter}
            blogSlug={route.blogSlug}
            nlEmail={nlEmail}
            setNlEmail={setNlEmail}
            nlSent={nlSent}
            setNlSent={setNlSent}
            user={user}
            userData={userData}
            siteLocale={route.locale || "fr"}
          />
        </Suspense>
      )}

      {page === "academyDetail" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement formation..." />}>
          <LazyAcademyDetail course={selectedCourse} goPage={goPage} goContact={goAcademyContact} />
        </Suspense>
      )}

      {page === "academyContact" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement formulaire..." />}>
          <LazyAcademyContactForm course={selectedCourse} user={user} userData={userData} goPage={goPage} />
        </Suspense>
      )}

      {page === "bonsPlans" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement bons plans..." />}>
          <LazyPromotionsPage
            goPage={goPage}
            goToCategory={goToCategory}
            freeShippingThresholdXaf={commerceDeliveryPolicy.freeShippingThresholdXaf}
          />
        </Suspense>
      )}

      {page === "loyalty" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement fidélité..." />}>
          <LazyLoyaltyPage
            user={user}
            userData={userData}
            goPage={goPage}
            setAuthOpen={setAuthOpen}
            setAuthTab={setAuthTab}
          />
        </Suspense>
      )}

      {page === "dashboard" &&
        (user ? (
          <div className="dash-layout anim">
            <div className="dash-sidebar">
              <div className="dash-avatar">{userData?.nom?.[0] || "U"}</div>
              <div className="dash-name" title={userData?.nom || user.email}>
                {userData?.nom || user.email?.split("@")[0] || "Utilisateur"}
              </div>
              <div className="dash-role-badge">
                <span className={`role-chip ${roleChipClass()}`}>{ROLE_LABELS[userRole || "buyer"]}</span>
              </div>
              <div className="dash-nav">
                {getDashNav().map((item) => (
                  <div
                    key={item.id}
                    className={`dash-nav-item${dashTab === item.id ? " active" : ""}`}
                    onClick={() => setDashTab(item.id)}
                  >
                    {item.icon} {item.label}
                  </div>
                ))}
                <div className="dash-nav-divider" />
                <div
                  className={`dash-nav-item${dashTab === "messages" ? " active" : ""}`}
                  onClick={() => setDashTab("messages")}
                >
                  💬 Messages
                </div>
                <div className="dash-nav-item" onClick={doLogout} style={{ color: "var(--red)" }}>
                  🚪 Déconnexion
                </div>
              </div>
            </div>

            <div className="dash-content">
              {dashTab === "messages" && (
                <>
                  <div className="dash-page-title">💬 Messagerie Yorix</div>
                  <div className="info-msg">
                    🔐 Messagerie sécurisée Yorix — téléphones et e-mails masqués entre membres. Photos et liens https autorisés. Canal officiel « Yorix Équipe » pour les annonces.
                  </div>
                  <ChatUsers
                    user={user}
                    userData={userData}
                    initialConversationId={pendingChatConversationId}
                  />
                </>
              )}
              {dashTab !== "messages" && userRole === "seller" && (
                <Suspense fallback={<RouteSuspenseFallback label="Chargement espace vendeur..." />}>
                  <LazySellerDashboard
                    user={user}
                    userData={userData}
                    dashTab={dashTab}
                    setDashTab={setDashTab}
                    categoryTree={categoryTree}
                    categoryFlat={categoryFlat}
                    categoryLoading={categoryLoading}
                    onReloadCategories={reloadCategories}
                  />
                </Suspense>
              )}
              {dashTab !== "messages" && userRole === "delivery" && (
                <Suspense fallback={<RouteSuspenseFallback label="Chargement espace livreur..." />}>
                  <LazyDeliveryDashboard user={user} userData={userData} dashTab={dashTab} setDashTab={setDashTab} />
                </Suspense>
              )}
              {dashTab !== "messages" && userRole === "provider" && (
                <Suspense fallback={<RouteSuspenseFallback label="Chargement espace prestataire..." />}>
                  <LazyProviderDashboard user={user} userData={userData} dashTab={dashTab} setDashTab={setDashTab} />
                </Suspense>
              )}
              {dashTab !== "messages" && (userRole === "buyer" || !userRole) && (
                <Suspense fallback={<RouteSuspenseFallback label="Chargement tableau de bord..." />}>
                  <LazyBuyerDashboard
                    user={user}
                    userData={userData}
                    wishlist={wishlist}
                    totalQty={totalQty}
                    loyaltyPts={loyaltyPts}
                    setLoyaltyPts={setLoyaltyPts}
                    dashTab={dashTab}
                    goPage={goPage}
                  />
                </Suspense>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state anim" style={{ padding: "60px 0" }}>
            <div className="empty-icon">🔐</div>
            <p>Connectez-vous pour accéder à votre espace</p>
            <button className="form-submit" style={{ width: "auto", padding: "11px 28px", marginTop: 16 }} onClick={() => setAuthOpen(true)}>
              Se connecter
            </button>
          </div>
        ))}

      {page !== "home" && (
        <div className="newsletter">
          <div className="nl-title">📬 Restez informé(e)</div>
          <p className="nl-sub">Les meilleures offres Yorix dans votre boîte mail.</p>
          {nlSent ? (
            <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "9px 18px", color: "#fff", fontWeight: 600 }}>
              ✅ Abonné(e) !
            </div>
          ) : (
            <div className="nl-form">
              <input className="nl-input" placeholder="Votre email..." value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} />
              <button
                type="button"
                className="nl-btn"
                onClick={async () => {
                  if (nlEmail) {
                    await supabase.from("newsletter").insert({ email: nlEmail }).catch((e) => console.warn(e?.message));
                    setNlSent(true);
                  }
                }}
              >
                S'abonner 🚀
              </button>
            </div>
          )}
        </div>
      )}

      <div className="yorix-fab-stack" aria-live="polite">
        {user && isAdminViewer(userData) && page !== "admin" && (
          <button type="button" className="admin-quick-pill" onClick={() => goPage("admin")} title={canWriteAdmin(userData) ? "Ouvrir l’administration" : "Consultation partenaire"}>
            {canWriteAdmin(userData) ? "⚙️ Admin Yorix" : "👁️ Consultation Yorix"}
          </button>
        )}
        <WhatsAppFab />
      </div>

      <div className="mobile-nav">
        <div className="mn-inner">
          {[
            { icon: "🏠", label: "Accueil", p: "home" },
            { icon: "🛍️", label: "Produits", p: "produits" },
            { icon: "🛒", label: "Panier", p: "cart", drawer: true },
            { icon: "🔔", label: "Alertes", p: "notifications" },
            { icon: "📊", label: "Mon espace", p: "dashboard" },
            { icon: "💬", label: "WhatsApp", p: "wa" },
          ].map((item) => (
            <div
              key={item.label}
              className={`mn-item${tabActive(item.p) ? " active" : ""}`}
              onClick={() => {
                if (item.p === "wa") {
                  window.open(
                    `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent("Bonjour Yorix ! J'ai besoin d'aide.")}`,
                    "_blank",
                  );
                } else if (item.p === "dashboard" && !user) {
                  setAuthTab("register");
                  setAuthOpen(true);
                } else if (item.p === "notifications" && !user) {
                  goPage("notifications");
                } else if (item.drawer) {
                  openCart();
                } else {
                  goPage(item.p);
                }
              }}
            >
              <div className="mn-icon">{item.icon}</div>
              <div className="mn-label">{item.label}</div>
              {item.p === "cart" && totalQty > 0 && <div className="mn-badge">{totalQty}</div>}
              {item.p === "notifications" && unread > 0 && user && (
                <div className="mn-badge">{unread > 99 ? "99+" : unread}</div>
              )}
              {item.p === "dashboard" && !user && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 2,
                    background: "var(--green)",
                    color: "#fff",
                    fontSize: ".45rem",
                    fontWeight: 700,
                    padding: "1px 3px",
                    borderRadius: 3,
                  }}
                >
                  S'inscrire
                </div>
              )}
            </div>
          ))}
        </div>
        {!user && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px", display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setAuthTab("login");
                setAuthOpen(true);
              }}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 8,
                border: "1.5px solid var(--border)",
                background: "var(--surface)",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
                fontSize: ".78rem",
                cursor: "pointer",
                color: "var(--ink)",
              }}
            >
              🔑 Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("register");
                setSelectedRole("buyer");
                setAuthOpen(true);
              }}
              style={{
                flex: 2,
                padding: "9px",
                borderRadius: 8,
                border: "none",
                background: "var(--green)",
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: ".78rem",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              🚀 S'inscrire gratuitement
            </button>
          </div>
        )}
      </div>

      {page === "admin" && (
        <Suspense fallback={<RouteSuspenseFallback label="Chargement admin..." />}>
          <LazyAdminDashboard user={user} userData={userData} goPage={goPage} />
        </Suspense>
      )}
    </>
  );
}
