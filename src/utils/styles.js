// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
export const makeCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --ink:${dark?"#e8f0eb":"#0d1f14"};
  --green:#1a6b3a;--green-mid:#27a85a;--green-light:#4fd17d;
  --green-pale:${dark?"#1a3a24":"#c8f5d9"};
  --red:#ce1126;--yellow:#fcd116;--gold:#c9a84c;
  --wa:#25D366;
  --bg:${dark?"#0d1a12":"#f5f2ed"};
  --surface:${dark?"#152118":"#ffffff"};
  --surface2:${dark?"#1c2e22":"#f0ece6"};
  --sand:${dark?"#1a2e1e":"#ede8df"};
  --border:${dark?"#2a4030":"#e2ddd6"};
  --gray:${dark?"#7a9a82":"#6b7a72"};
  --shadow:${dark?"rgba(0,0,0,.45)":"rgba(0,0,0,.08)"};
  --yorix-r-sm:10px;--yorix-r-md:12px;--yorix-r-lg:16px;--yorix-r-xl:20px;
  --yorix-sh-sm:0 4px 20px ${dark?"rgba(0,0,0,.28)":"rgba(13,31,20,.06)"};
  --yorix-sh-md:0 12px 40px ${dark?"rgba(0,0,0,.35)":"rgba(13,31,20,.09)"};
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--ink);transition:background .3s,color .3s;}

/* TOPBAR */
.topbar{background:${dark?"#0a1410":"#0d1f14"};padding:5px 24px;display:flex;align-items:center;justify-content:space-between;font-size:.71rem;color:rgba(255,255,255,.44);}
.topbar-l{display:flex;gap:14px;align-items:center;}
.flag{display:flex;width:17px;height:11px;border-radius:2px;overflow:hidden;}
.fg{flex:1;background:#007a5e;}.fr{flex:1;background:#ce1126;}.fy{flex:1;background:#fcd116;}
.flag-wrap{display:flex;align-items:center;gap:5px;color:#b7e4c7;font-weight:600;}
.topbar-r{display:flex;gap:11px;}
.topbar-r span{cursor:pointer;transition:color .2s;}.topbar-r span:hover{color:#b7e4c7;}

/* NAVBAR · parent sticky via .header-sticky-stack */
.navbar{background:var(--surface);padding:0 24px;display:flex;align-items:center;gap:12px;height:64px;position:relative;z-index:1;border-bottom:1px solid var(--border);box-shadow:none;transition:height .2s ease, padding .2s ease;}
.logo-wrap{cursor:pointer;display:flex;align-items:center;gap:8px;flex-shrink:0;}
.logo-txt{font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;letter-spacing:-1px;color:var(--ink);}
.logo-txt span{color:var(--green);}
.logo-txt sup{font-size:.5rem;background:var(--yellow);color:#0d1f14;padding:1px 4px;border-radius:3px;font-weight:800;vertical-align:super;}
.nav-search-wrap{flex:1;max-width:440px;min-width:0;position:relative;}
.nav-search{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:var(--yorix-r-md);overflow:hidden;transition:border-color .2s,box-shadow .2s;box-shadow:var(--yorix-sh-sm);}
.nav-search:focus-within{border-color:var(--green-mid);box-shadow:0 0 0 2px rgba(39,168,90,.12),var(--yorix-sh-sm);}
.nav-search select{border:none;border-right:1px solid var(--border);background:var(--surface2);padding:8px 7px;font-family:'DM Sans',sans-serif;font-size:.74rem;color:var(--gray);outline:none;min-width:86px;}
.nav-search input{flex:1;min-width:0;border:none;background:transparent;padding:8px 11px;font-family:'DM Sans',sans-serif;font-size:.8rem;outline:none;color:var(--ink);}
.nav-search input::placeholder{color:${dark?"rgba(181,216,188,.42)":"var(--gray)"};opacity:${dark?"1":".82"};}
.nav-search button{background:var(--green);color:#fff;border:none;padding:0 12px;cursor:pointer;font-size:.95rem;transition:filter .15s;}
.nav-search button:hover{filter:brightness(1.05);}
.nav-search-dd{position:absolute;top:calc(100% + 5px);left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--yorix-r-md);box-shadow:var(--yorix-sh-md);z-index:560;max-height:min(320px,52vh);overflow-y:auto;margin:0;padding:6px;display:flex;flex-direction:column;gap:3px;}
.nav-search-dd-item{display:flex;align-items:center;gap:10px;padding:9px 10px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:'DM Sans',sans-serif;color:var(--ink);border-radius:var(--yorix-r-sm);transition:background .12s;font-size:.81rem;line-height:1.35;}
.nav-search-dd-item:hover,.nav-search-dd-item:focus-visible{background:var(--surface2);outline:none;}
.nav-search-dd-img{width:38px;height:38px;border-radius:var(--yorix-r-sm);object-fit:cover;flex-shrink:0;background:var(--surface2);}
.nav-search-dd-ph{display:flex;align-items:center;justify-content:center;font-size:1.05rem;opacity:.55;}
.nav-search-dd-t{font-weight:600;color:var(--ink);font-size:.8rem;}
.nav-search-dd-p{color:var(--gray);font-size:.72rem;margin-top:1px;}
.nav-search-dd-empty{padding:13px;color:var(--gray);font-size:.8rem;text-align:center;line-height:1.45;}
.nav-cta-onboard{background:linear-gradient(135deg,var(--green),#155a31);color:#fff;border:none;padding:7px 13px;border-radius:var(--yorix-r-sm);font-family:'Syne',sans-serif;font-weight:700;font-size:.73rem;cursor:pointer;white-space:nowrap;box-shadow:var(--yorix-sh-sm);transition:transform .15s,filter .15s;}
.nav-cta-onboard:hover{filter:brightness(1.06);transform:translateY(-1px);}
.nav-actions{display:flex;align-items:center;gap:8px;margin-left:auto;}
.btn-ghost{border:1.5px solid var(--border);background:transparent;color:var(--ink);padding:7px 13px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.77rem;font-weight:500;cursor:pointer;transition:all .2s;}
.btn-ghost:hover{border-color:var(--green);color:var(--green);}
.btn-green{background:var(--green);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.77rem;cursor:pointer;}
.btn-red{background:var(--red);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.77rem;cursor:pointer;}
.btn-wa{background:var(--wa);color:#fff;border:none;padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:.77rem;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s;}
.btn-wa:hover{filter:brightness(1.1);transform:translateY(-1px);}
.icon-btn{position:relative;cursor:pointer;background:var(--surface2);border:1.5px solid var(--border);width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all .2s;}
.icon-btn:hover{border-color:var(--green);}
.ibadge{position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;border-radius:50%;width:16px;height:16px;font-size:.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
.dark-toggle{background:var(--surface2);border:1.5px solid var(--border);width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;}
.user-av{width:34px;height:34px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;cursor:pointer;border:2px solid var(--green-pale);}
.role-chip{padding:3px 9px;border-radius:50px;font-size:.64rem;font-weight:700;border:none;cursor:default;}
.chip-buyer{background:#e3f2fd;color:#1565c0;}
.chip-seller{background:var(--green-pale);color:var(--green);}
.chip-delivery{background:#fff3cd;color:#856404;}
.chip-provider{background:#ede7f6;color:#6a1b9a;}
.chip-admin{background:#fef3c7;color:#92400e;}

/* CLUSTER HEADER STICKY (topbar → navbar → onglets → bande paiement) */
.header-sticky-stack{position:sticky;top:0;z-index:440;background:var(--bg);transition:box-shadow .2s ease;}
.header-sticky-stack--compact{box-shadow:0 10px 36px rgba(0,0,0,.07);}
@media (max-width:900px){
.header-sticky-stack--compact .topbar{display:none!important;}
.header-sticky-stack--compact .navbar{height:56px!important;}
.header-sticky-stack--compact .pay-strip{padding-block:5px;font-size:.65rem!important;}
}

.yorix-emotional-nav{display:flex;flex-wrap:wrap;gap:6px;padding:8px 16px;background:linear-gradient(90deg,#007a5e 0%,#1a6b3a 55%,#ce1126 100%);overflow-x:auto;scrollbar-width:none;}
.yorix-emotional-nav::-webkit-scrollbar{display:none;}
.yorix-emotional-nav-btn{flex-shrink:0;border:none;background:rgba(255,255,255,.14);color:#fff;padding:6px 12px;border-radius:999px;font-size:.7rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;white-space:nowrap;border:1px solid rgba(255,255,255,.2);}
.yorix-emotional-nav-btn:hover{background:rgba(255,255,255,.28);}

/* TABS PREMIUM + menu rapide */
.nav-tabs-row{display:flex;align-items:center;gap:10px;background:var(--green);padding:0 16px 0 24px;flex-wrap:nowrap;}
.nav-tabs{flex:1;min-width:0;display:flex;padding:0;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x proximity;}
.nav-tabs::-webkit-scrollbar{display:none;}
.tab{scroll-snap-align:start;color:rgba(255,255,255,.65);padding:10px 14px;font-size:.77rem;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all .18s;font-family:'DM Sans',sans-serif;}
.tab:hover{color:#fff;}.tab.active{color:var(--yellow);border-bottom-color:var(--yellow);}
.nav-quick-wrap{flex-shrink:0;position:relative;}
.nav-quick-btn{display:inline-flex;align-items:center;gap:6px;border:none;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.22);padding:8px 12px;border-radius:10px;font-size:.71rem;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;}
.nav-quick-btn:hover{background:rgba(255,255,255,.22);}
.nav-quick-panel{position:absolute;top:calc(100% + 6px);right:0;background:var(--surface);border-radius:16px;border:1px solid var(--border);box-shadow:0 20px 48px rgba(0,0,0,.14);width:min(720px,calc(100vw - 24px));z-index:505;padding:18px;display:grid;gap:0;}
.nav-quick-panel[hidden]{display:none!important;}
.nav-quick-mega-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
@media (max-width:720px){.nav-quick-mega-cols{grid-template-columns:1fr;}}
.nav-quick-section{border-right:1px solid var(--border);padding-right:12px;margin-right:-2px;}
.nav-quick-section:last-child{border-right:none;padding-right:0;}
@media (max-width:720px){.nav-quick-section{border-right:none;padding-right:0;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:10px;}
.nav-quick-section:last-child{border-bottom:none;padding-bottom:0;margin-bottom:0;}}
.nav-quick-section h4{font-family:'Syne',sans-serif;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--green);margin:0 0 10px;display:flex;align-items:center;gap:6px;}
.nav-quick-links{display:flex;flex-direction:column;gap:4px;}
.nav-quick-links button{border:none;text-align:left;background:var(--surface2);color:var(--ink);padding:9px 10px;border-radius:10px;font-size:.75rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .18s,color .18s,border-color .18s;display:flex;align-items:flex-start;gap:8px;line-height:1.35;border:1px solid transparent;}
.nav-quick-links button:hover{background:var(--green-pale);color:var(--green);border-color:rgba(39,168,90,.35);}
.nav-quick-ico{font-size:1.05rem;line-height:1;flex-shrink:0;}

.admin-quick-pill{background:linear-gradient(135deg,#0d1f14,var(--green));color:#fff;border:none;padding:11px 16px;border-radius:50px;font-size:.74rem;font-weight:800;font-family:'Syne',sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(26,107,58,.38);transition:transform .15s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.admin-quick-pill:hover{transform:translateY(-2px);}
.yorix-fab-stack .admin-quick-pill{position:relative;right:auto;bottom:auto;}


/* PAY STRIP */
.pay-strip{background:var(--surface2);border-bottom:1px solid var(--border);padding:6px 24px;display:flex;align-items:center;gap:14px;font-size:.7rem;color:var(--gray);}
.pay-methods{display:flex;gap:5px;}
.pm{background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:2px 7px;font-weight:600;font-size:.67rem;}
.mtn-b{background:#1a1a1a;color:#ffcc00;border-color:#1a1a1a;}.ora-b{color:#ff6600;}
.strip-right{margin-left:auto;display:flex;gap:12px;}

/* HERO */
.hero{background:linear-gradient(135deg,#0a1410 0%,#1a3a24 55%,var(--green) 100%);padding:44px 24px 52px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle at 78% 50%,rgba(79,209,125,.09) 0%,transparent 58%);}
.hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;position:relative;}
.hero-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(252,209,22,.14);color:var(--yellow);border:1px solid rgba(252,209,22,.28);padding:4px 12px;border-radius:50px;font-size:.7rem;font-weight:600;letter-spacing:.5px;margin-bottom:13px;}
.hero h1{font-family:'Syne',sans-serif;font-size:clamp(1.6rem,3vw,2.6rem);font-weight:800;color:#fff;line-height:1.15;margin-bottom:11px;letter-spacing:-1px;}
.hero h1 em{color:#4fd17d;font-style:normal;}
.hero-sub{color:rgba(255,255,255,.52);font-size:.87rem;line-height:1.75;margin-bottom:24px;}
.hero-ctas{display:flex;gap:8px;margin-bottom:26px;flex-wrap:wrap;}
.cta-y{background:var(--yellow);color:#0d1f14;border:none;padding:10px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:.82rem;cursor:pointer;transition:all .2s;}
.cta-y:hover{background:#e8bf00;transform:translateY(-2px);}
.cta-w{background:rgba(255,255,255,.09);color:#fff;border:1px solid rgba(255,255,255,.22);padding:10px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:500;font-size:.82rem;cursor:pointer;}
.hero-stats{display:flex;gap:22px;flex-wrap:wrap;}
.stat-num{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:#b7e4c7;}
.stat-lbl{font-size:.67rem;color:rgba(255,255,255,.38);}
.hero-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:22px;backdrop-filter:blur(8px);}
.hc-title{font-family:'Syne',sans-serif;font-size:.93rem;font-weight:700;color:#fff;margin-bottom:12px;}
.sf{display:flex;background:#fff;border-radius:9px;overflow:hidden;margin-bottom:8px;}
.sf select,.sf input{border:none;padding:10px 11px;font-family:'DM Sans',sans-serif;font-size:.79rem;outline:none;background:transparent;color:#0d1f14;}
.sf select{background:#f0ece6;border-right:1px solid #e2ddd6;min-width:95px;}
.sbtn{width:100%;background:var(--green);color:#fff;border:none;padding:10px;border-radius:9px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.82rem;cursor:pointer;margin-bottom:8px;}
.pop-row{display:flex;flex-wrap:wrap;gap:5px;align-items:center;}
.pop-lbl{font-size:.67rem;color:rgba(255,255,255,.38);}
.pop-tag{background:rgba(255,255,255,.07);color:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.13);padding:2px 8px;border-radius:50px;font-size:.67rem;cursor:pointer;}
.pop-tag:hover{background:rgba(255,255,255,.15);color:#fff;}

/* SECTIONS */
.sec{max-width:1200px;margin:0 auto;padding:28px 24px;}
.sec-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:17px;}
.sec-title{font-family:'Syne',sans-serif;font-size:clamp(1.12rem,2.1vw,1.34rem);font-weight:800;color:var(--ink);letter-spacing:-.45px;line-height:1.15;}
.card,.yorix-ds-surface{background:var(--surface);border:1px solid var(--border);border-radius:var(--yorix-r-lg);box-shadow:var(--yorix-sh-sm);}
.yorix-ds-lead{color:var(--gray);font-size:.88rem;line-height:1.65;margin-bottom:16px;max-width:56ch;}
.yorix-ds-tight{margin-bottom:6px;}
.yorix-ds-inline-banner{margin-bottom:14px;padding:12px 14px;border-radius:var(--yorix-r-md);background:var(--surface2);border:1px solid var(--border);font-size:.86rem;line-height:1.45;}
.yorix-ds-inset-panel{background:var(--surface2);border-radius:var(--yorix-r-md);padding:13px;margin-bottom:16px;text-align:left;font-size:.84rem;border:1px solid var(--border);}
.yorix-ds-stack{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
.yorix-ds-kvrow{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;font-size:inherit;}
.yorix-ds-kvrow:last-child{margin-bottom:0;}
.yorix-page-flow{padding-bottom:32px;}
@media(max-width:768px){.yorix-page-flow{padding-bottom:calc(72px + env(safe-area-inset-bottom));}}
.yorix-catalog-head{align-items:flex-start;}
.yorix-catalog-meta{font-size:.8rem;color:var(--gray);white-space:nowrap;}
.yorix-pill-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
.yorix-pill{border:1px solid var(--border);background:var(--surface);color:var(--ink);padding:6px 14px;border-radius:50px;font:600 .73rem 'DM Sans',sans-serif;cursor:pointer;transition:background .18s,color .18s,border-color .18s,box-shadow .18s;}
.yorix-pill:hover{border-color:var(--green-mid);}
.yorix-pill.is-active{background:var(--green);border-color:var(--green);color:#fff;box-shadow:0 6px 16px rgba(26,107,58,.22);}
.yorix-pill--ghost{font-size:.72rem;padding:5px 12px;background:transparent;}
.yorix-sec-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.yorix-sec-toolbar-end{display:flex;align-items:center;gap:8px;margin-left:auto;}
.sec-link{font-size:.75rem;color:var(--green);font-weight:600;cursor:pointer;border-bottom:1px solid var(--green-light);}

/* PRODUITS */
.prod-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
.prod-card{background:var(--surface);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .25s;border:1px solid var(--border);display:flex;flex-direction:column;}
.prod-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(26,107,58,.12);}
.prod-img-wrap{position:relative;width:100%;height:160px;background:var(--surface2);overflow:hidden;flex-shrink:0;}
.prod-img-wrap img{width:100%;height:100%;object-fit:cover;}
.prod-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;}
.pbadge-r{position:absolute;top:7px;left:7px;background:var(--red);color:#fff;font-size:.58rem;font-weight:700;padding:2px 6px;border-radius:50px;z-index:1;}
.pbadge-y{position:absolute;top:7px;right:7px;background:var(--yellow);color:#0d1f14;font-size:.58rem;font-weight:700;padding:2px 6px;border-radius:50px;z-index:1;}
.escrow-badge{position:absolute;bottom:6px;left:6px;background:var(--green);color:#fff;font-size:.55rem;font-weight:700;padding:2px 5px;border-radius:50px;z-index:1;}
.wish-btn{position:absolute;bottom:6px;right:6px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center;z-index:1;transition:transform .2s;}
.wish-btn:hover{transform:scale(1.15);}
.prod-info{padding:11px;display:flex;flex-direction:column;gap:5px;flex:1;}
.prod-name{font-size:.8rem;font-weight:600;color:var(--ink);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.prod-loc{font-size:.65rem;color:var(--gray);}
.prod-desc{font-size:.7rem;color:var(--gray);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;}
.prod-stock{font-size:.65rem;font-weight:600;}
.stock-ok{color:var(--green);}
.stock-low{color:#e67e22;}
.stock-out{color:var(--red);}
.prod-rating{display:flex;align-items:center;gap:4px;}
.stars-display{display:flex;gap:1px;}
.star{font-size:.7rem;}.star.filled{color:var(--gold);}.star.empty{color:var(--border);}
.rcount{font-size:.63rem;color:var(--gray);}
.prod-price-row{display:flex;align-items:center;justify-content:space-between;margin-top:auto;}
.price{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;color:var(--green);}
.price-unit{font-size:.62rem;color:var(--gray);font-family:'DM Sans',sans-serif;font-weight:400;}
.add-btn{background:var(--green);color:#fff;border:none;width:26px;height:26px;border-radius:6px;font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
.add-btn:hover{background:#0f4a28;}
.prod-actions{display:flex;gap:5px;margin-top:6px;}
.btn-wa-sm{background:var(--wa);color:#fff;border:none;padding:6px 9px;border-radius:7px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.68rem;cursor:pointer;display:flex;align-items:center;gap:4px;flex:1;justify-content:center;transition:all .2s;}
.btn-wa-sm:hover{filter:brightness(1.1);}
.btn-cmd-sm{background:var(--green);color:#fff;border:none;padding:6px 9px;border-radius:7px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.68rem;cursor:pointer;flex:1;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .2s;}
.btn-cmd-sm:hover{background:#0f4a28;}

/* GALERIE IMAGES */
.img-gallery{display:flex;gap:6px;overflow-x:auto;padding:8px 0;scrollbar-width:thin;}
.img-gallery::-webkit-scrollbar{height:4px;}
.img-gallery-thumb{width:70px;height:70px;border-radius:7px;object-fit:cover;cursor:pointer;border:2px solid transparent;transition:border-color .2s;flex-shrink:0;}
.img-gallery-thumb.active{border-color:var(--green);}
.img-main{width:100%;height:200px;object-fit:cover;border-radius:10px;}

/* LOADING / EMPTY */
.loading{display:flex;align-items:center;justify-content:center;padding:48px;color:var(--gray);gap:10px;font-size:.9rem;}
.spinner{width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty-state{text-align:center;padding:48px;color:var(--gray);}
.empty-icon{font-size:3rem;margin-bottom:12px;}

/* MODALS */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal{background:var(--surface);border-radius:16px;padding:24px;width:100%;max-width:480px;position:relative;border:1px solid var(--border);max-height:92vh;overflow-y:auto;}
.modal-lg{max-width:640px;}
.modal-close{position:absolute;top:12px;right:12px;background:var(--surface2);border:none;width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;color:var(--gray);}
.modal-title{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;color:var(--ink);margin-bottom:3px;letter-spacing:-.5px;}
.modal-sub{font-size:.79rem;color:var(--gray);margin-bottom:18px;}

/* AUTH */
.auth-tabs{display:flex;background:var(--surface2);border-radius:8px;padding:3px;margin-bottom:16px;}
.auth-tab{flex:1;padding:7px;border-radius:6px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:.79rem;font-weight:500;cursor:pointer;color:var(--gray);}
.auth-tab.active{background:var(--surface);color:var(--ink);font-weight:600;box-shadow:0 1px 4px var(--shadow);}
.role-selector{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;}
.role-card{border:2px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;transition:all .2s;text-align:center;background:var(--surface);}
.role-card:hover{border-color:var(--green-mid);}
.role-card.selected{border-color:var(--green);background:var(--green-pale);}
.role-card .rc-icon{font-size:1.6rem;margin-bottom:5px;}
.role-card h4{font-size:.82rem;font-weight:600;color:var(--ink);}
.role-card p{font-size:.69rem;color:var(--gray);margin-top:2px;}

/* FORMS */
.form-group{display:flex;flex-direction:column;gap:4px;margin-bottom:11px;}
.form-label{font-size:.73rem;font-weight:600;color:var(--ink);}
.form-label span{color:var(--red);margin-left:2px;}
.form-input,.form-select{border:1.5px solid var(--border);border-radius:8px;padding:9px 10px;font-family:'DM Sans',sans-serif;font-size:.81rem;color:var(--ink);outline:none;transition:border-color .2s;background:var(--surface);width:100%;}
.form-input:focus,.form-select:focus{border-color:var(--green);}
.form-input.error,.form-select.error{border-color:var(--red);}
.form-textarea{border:1.5px solid var(--border);border-radius:8px;padding:9px 10px;font-family:'DM Sans',sans-serif;font-size:.81rem;color:var(--ink);outline:none;transition:border-color .2s;background:var(--surface);resize:vertical;min-height:80px;width:100%;}
.form-textarea:focus{border-color:var(--green);}
.form-error-text{font-size:.68rem;color:var(--red);margin-top:2px;}
.form-submit{width:100%;background:var(--green);color:#fff;border:none;padding:11px;border-radius:9px;font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;transition:all .2s;margin-top:5px;display:flex;align-items:center;justify-content:center;gap:7px;}
.form-submit:hover:not(:disabled){background:#0f4a28;}
.form-submit:disabled{opacity:.55;cursor:not-allowed;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:0;}
.form-group.full{grid-column:1/-1;}
.divider{display:flex;align-items:center;gap:8px;margin:11px 0;color:var(--gray);font-size:.72rem;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
.social-btn{width:100%;background:var(--surface2);border:1.5px solid var(--border);border-radius:8px;padding:9px;font-family:'DM Sans',sans-serif;font-size:.79rem;cursor:pointer;color:var(--ink);display:flex;align-items:center;justify-content:center;gap:7px;}
.success-msg{background:var(--green-pale);border:1px solid #c0ecd0;border-radius:10px;padding:12px 14px;color:var(--green);font-weight:600;font-size:.82rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.error-msg{background:#f8d7da;border:1px solid #f5c6cb;border-radius:10px;padding:12px 14px;color:#721c24;font-size:.8rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.info-msg{background:#e3f2fd;border:1px solid #bbdefb;border-radius:10px;padding:12px 14px;color:#1565c0;font-size:.8rem;margin-bottom:12px;}

/* IMG UPLOAD MULTI */
.img-upload-area{border:2px dashed var(--border);border-radius:9px;padding:18px;text-align:center;cursor:pointer;transition:all .2s;}
.img-upload-area:hover{border-color:var(--green);background:var(--green-pale);}
.img-upload-area.dragover{border-color:var(--green-mid);background:var(--green-pale);}
.img-upload-icon{font-size:2rem;margin-bottom:6px;}
.img-upload-text{font-size:.79rem;color:var(--gray);}
.img-upload-hint{font-size:.69rem;color:var(--gray);margin-top:3px;opacity:.7;}
.img-previews{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
.img-preview-item{position:relative;width:70px;height:70px;}
.img-preview-item img{width:100%;height:100%;object-fit:cover;border-radius:7px;border:1.5px solid var(--border);}
.img-preview-del{position:absolute;top:-5px;right:-5px;width:18px;height:18px;background:var(--red);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:.65rem;display:flex;align-items:center;justify-content:center;font-weight:700;}
.upload-progress{background:var(--surface2);border-radius:50px;height:6px;margin-top:8px;overflow:hidden;}
.upload-progress-bar{background:var(--green);height:100%;border-radius:50px;transition:width .3s;}

/* TRUST */
.trust{background:${dark?"#0a1410":"#0d1f14"};padding:18px 24px;}
.trust-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:11px;}
.ti{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.7);}
.ti-icon{font-size:1.6rem;}.ti h4{font-size:.78rem;font-weight:600;color:#fff;margin-bottom:1px;}.ti p{font-size:.66rem;opacity:.42;}

/* DASHBOARD */
.dash-layout{display:grid;grid-template-columns:220px 1fr;gap:0;min-height:75vh;max-width:1200px;margin:22px auto;padding:0 24px;}
.dash-sidebar{background:var(--surface);border-radius:13px;padding:18px;border:1px solid var(--border);height:fit-content;position:sticky;top:88px;overflow:hidden;min-width:0;}
.dash-avatar{width:60px;height:60px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 8px;}
.dash-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.92rem;text-align:center;color:var(--ink);margin-bottom:4px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 4px;}
.dash-role-badge{text-align:center;margin-bottom:14px;}
.dash-nav{display:flex;flex-direction:column;gap:2px;}
.dash-nav-item{display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:8px;cursor:pointer;font-size:.8rem;color:var(--gray);font-weight:500;transition:all .2s;}
.dash-nav-item:hover{background:var(--surface2);color:var(--ink);}
.dash-nav-item.active{background:var(--green-pale);color:var(--green);font-weight:600;}
.dash-nav-divider{height:1px;background:var(--border);margin:7px 0;}
.dash-content{padding-left:18px;}
.dash-page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.2rem;color:var(--ink);margin-bottom:16px;letter-spacing:-.5px;display:flex;align-items:center;gap:8px;}
.dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:20px;}
.dstat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:15px;}
.dstat-icon{font-size:1.3rem;margin-bottom:6px;}
.dstat-val{font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:var(--ink);}
.dstat-lbl{font-size:.7rem;color:var(--gray);margin-top:2px;}
.dstat-trend{font-size:.66rem;color:var(--green);font-weight:600;margin-top:3px;}

/* PRODUCT FORM */
.prod-form{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:22px;margin-bottom:20px;}
.pf-title{font-family:'Syne',sans-serif;font-weight:800;font-size:.98rem;color:var(--ink);margin-bottom:16px;display:flex;align-items:center;gap:6px;}

/* ORDERS */
.order-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px;}
.oc-icon{width:42px;height:42px;background:var(--surface2);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
.oc-info{flex:1;}
.oc-name{font-size:.84rem;font-weight:600;color:var(--ink);margin-bottom:2px;}
.oc-meta{font-size:.7rem;color:var(--gray);line-height:1.6;}
.oc-actions{display:flex;flex-direction:column;gap:5px;align-items:flex-end;}
.status-badge{padding:3px 8px;border-radius:50px;font-size:.64rem;font-weight:700;white-space:nowrap;}
.s-pending{background:#fff3cd;color:#856404;}
.s-paid{background:#d4edda;color:#1a6b3a;}
.s-shipped{background:#cce5ff;color:#004085;}
.s-delivered,.s-livre{background:#d4edda;color:#1a6b3a;}
.s-dispute,.s-echec{background:#f8d7da;color:#721c24;}
.s-cancelled{background:#e2e3e5;color:#383d41;}
.s-securise{background:#ede7f6;color:#6a1b9a;}
.s-libere{background:#d4edda;color:#1a6b3a;}
.s-rembourse{background:#cce5ff;color:#004085;}
.s-en_cours{background:#fff3cd;color:#856404;}
.btn-action-sm{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:.69rem;cursor:pointer;color:var(--ink);font-family:'DM Sans',sans-serif;font-weight:500;transition:all .2s;}
.btn-action-sm:hover{background:var(--green-pale);border-color:var(--green);color:var(--green);}

/* AVIS */
.avis-section{margin-top:20px;}
.avis-card{background:var(--surface2);border-radius:10px;padding:13px;margin-bottom:8px;}
.avis-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
.avis-auteur{font-size:.8rem;font-weight:600;color:var(--ink);}
.avis-date{font-size:.67rem;color:var(--gray);}
.avis-texte{font-size:.78rem;color:var(--gray);line-height:1.6;}
.star-input{display:flex;gap:3px;cursor:pointer;}
.star-input span{font-size:1.3rem;transition:transform .15s;}
.star-input span:hover{transform:scale(1.2);}

/* COMMISSION */
.commission-box{background:var(--green-pale);border:1px solid var(--green-light);border-radius:9px;padding:11px 14px;font-size:.77rem;color:var(--green);display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.commission-box strong{font-family:'Syne',sans-serif;}

/* CART */
/* ═══ CART AMAZON STYLE ═══ */
.cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:600;opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(2px);}
.cart-overlay.open{opacity:1;pointer-events:all;}
.cart-drawer{position:fixed;top:0;right:0;width:min(440px,100vw);height:100vh;background:var(--bg);z-index:601;transform:translateX(100%);transition:transform .4s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-8px 0 32px rgba(0,0,0,.2);}
.cart-drawer.open{transform:none;}

/* Header */
.cart-header{background:linear-gradient(135deg,var(--green),#0f4a28);padding:16px 20px;color:#fff;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 12px rgba(0,0,0,.1);}
.cart-header-left{display:flex;align-items:center;gap:10px;}
.cart-header-icon{width:38px;height:38px;background:rgba(255,255,255,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
.cart-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;color:#fff;margin:0;}
.cart-subtitle{font-size:.68rem;color:rgba(255,255,255,.75);margin-top:1px;}
.cart-close{background:rgba(255,255,255,.15);border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1rem;transition:background .2s;}
.cart-close:hover{background:rgba(255,255,255,.25);}

/* Trust bar */
.cart-trust-bar{background:var(--green-pale);padding:8px 16px;display:flex;align-items:center;gap:8px;font-size:.7rem;color:var(--green);font-weight:600;border-bottom:1px solid var(--border);}
.cart-trust-bar span{flex:1;text-align:center;}

/* Empty state */
.cart-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px 30px;text-align:center;}
.cart-empty-icon{font-size:4rem;opacity:.4;}
.cart-empty-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.05rem;color:var(--ink);}
.cart-empty-sub{font-size:.8rem;color:var(--gray);line-height:1.6;max-width:260px;}
.cart-empty-btn{background:var(--green);color:#fff;border:none;padding:11px 24px;border-radius:9px;font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;cursor:pointer;margin-top:6px;transition:all .2s;}
.cart-empty-btn:hover{background:#0f4a28;transform:translateY(-1px);}

/* Items list */
.cart-items{flex:1;overflow-y:auto;padding:12px 16px;background:var(--surface2);}
.cart-items::-webkit-scrollbar{width:6px;}
.cart-items::-webkit-scrollbar-track{background:transparent;}
.cart-items::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

/* Item card */
.cart-item{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px;display:flex;gap:12px;position:relative;transition:all .2s;}
.cart-item:hover{border-color:var(--green-light);box-shadow:0 3px 12px rgba(26,107,58,.08);}

.ci-img{width:78px;height:78px;background:var(--surface2);border-radius:10px;flex-shrink:0;overflow:hidden;border:1px solid var(--border);}
.ci-img img{width:100%;height:100%;object-fit:cover;}
.ci-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:.4;}

.ci-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
.ci-name{font-size:.82rem;font-weight:700;color:var(--ink);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.ci-vendeur{font-size:.67rem;color:var(--gray);display:flex;align-items:center;gap:4px;}
.ci-vendeur strong{color:var(--green);font-weight:600;}
.ci-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;}
.ci-tag{background:var(--surface2);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:.6rem;color:var(--gray);font-weight:500;}
.ci-tag-stock-ok{background:#e6fff0;color:#1a6b3a;border-color:#b7e4c7;}
.ci-tag-stock-low{background:#fff3cd;color:#856404;border-color:#ffe8a1;}
.ci-tag-stock-out{background:#f8d7da;color:#721c24;border-color:#f5c6cb;}

.ci-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:8px;}
.ci-price-block{display:flex;flex-direction:column;}
.ci-unit-price{font-size:.62rem;color:var(--gray);}
.ci-total-price{font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:var(--green);line-height:1;}

.ci-qty{display:flex;align-items:center;gap:0;background:var(--surface2);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
.qty-btn{width:26px;height:26px;background:transparent;border:none;cursor:pointer;font-size:.95rem;display:flex;align-items:center;justify-content:center;color:var(--ink);font-weight:700;transition:background .15s;}
.qty-btn:hover{background:var(--green-pale);color:var(--green);}
.qty-val{font-size:.78rem;font-weight:700;min-width:24px;text-align:center;color:var(--ink);padding:0 2px;}

.ci-del{position:absolute;top:8px;right:8px;background:transparent;border:none;cursor:pointer;font-size:.9rem;color:var(--gray);width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.ci-del:hover{background:#f8d7da;color:var(--red);}

/* Footer */
.cart-footer{background:var(--surface);border-top:2px solid var(--border);padding:14px 18px;box-shadow:0 -4px 16px rgba(0,0,0,.06);}

.cart-promo-row{background:var(--green-pale);border:1px dashed var(--green-light);border-radius:9px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:8px;font-size:.73rem;color:var(--green);font-weight:600;}
.cart-promo-row strong{font-family:'Syne',sans-serif;}

.cart-summary{margin-bottom:10px;}
.cart-total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:.82rem;color:var(--gray);}
.cart-total-row strong{color:var(--ink);font-weight:600;}
.cart-total-row.discount strong{color:var(--green);}
.cart-divider{height:1px;background:var(--border);margin:6px 0;}
.cart-total-row.grand{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:800;color:var(--ink);padding:6px 0 2px;}
.cart-total-row.grand strong{color:var(--green);font-size:1.15rem;}
.cart-savings{font-size:.68rem;color:var(--green);font-weight:600;text-align:right;margin-top:-2px;}

/* Payment methods */
.cart-payment-section{margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);}
.cart-payment-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.78rem;color:var(--ink);margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.cart-payment-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.cart-pay-btn{background:var(--surface2);border:1.5px solid var(--border);border-radius:9px;padding:10px 8px;cursor:pointer;text-align:center;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:'DM Sans',sans-serif;}
.cart-pay-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08);}
.cart-pay-btn.momo{border-color:#ffcc00;background:linear-gradient(135deg,#fffbe6,#fff3b0);}
.cart-pay-btn.momo:hover{background:linear-gradient(135deg,#fff3b0,#ffe066);}
.cart-pay-btn.orange{border-color:#ff6600;background:linear-gradient(135deg,#fff4e6,#ffd9b3);}
.cart-pay-btn.orange:hover{background:linear-gradient(135deg,#ffd9b3,#ffbf80);}
.cart-pay-icon{font-size:1.3rem;}
.cart-pay-label{font-size:.68rem;font-weight:700;color:#1a1a1a;}
.cart-pay-number{font-size:.64rem;color:#444;font-weight:600;}

.cart-wa-confirm{width:100%;background:linear-gradient(135deg,var(--wa),#1ebe5d);color:#fff;border:none;padding:13px;border-radius:10px;font-family:'Syne',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;box-shadow:0 4px 14px rgba(37,211,102,.3);}
.cart-wa-confirm:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,211,102,.4);}

.cart-info-text{font-size:.67rem;color:var(--gray);text-align:center;margin-top:8px;line-height:1.5;}
.cart-info-text strong{color:var(--green);}

/* Cart Page Premium */
.cart-page-wrap{max-width:1280px;}
.cart-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px;flex-wrap:wrap;}
.cart-page-sub{font-size:.84rem;color:var(--gray);margin-top:4px;}
.cart-page-empty{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:42px 22px;text-align:center;}
.cart-page-grid{display:grid;grid-template-columns:1.5fr .8fr;gap:16px;align-items:start;}
.cart-page-main{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;}
.cart-page-trust{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
.cart-page-trust span{background:var(--surface2);border:1px solid var(--border);padding:5px 10px;border-radius:50px;font-size:.7rem;color:var(--gray);font-weight:600;}
.cart-page-item{display:flex;gap:12px;border:1px solid var(--border);background:var(--surface2);border-radius:12px;padding:10px;margin-bottom:10px;}
.cart-page-thumb{width:96px;height:96px;border-radius:10px;overflow:hidden;flex-shrink:0;background:var(--surface);}
.cart-page-content{flex:1;min-width:0;}
.cart-page-title{font-family:'Syne',sans-serif;font-size:.93rem;font-weight:700;color:var(--ink);}
.cart-page-meta{display:flex;gap:5px;flex-wrap:wrap;margin:5px 0;}
.cart-page-line{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.cart-page-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px;}
.cart-page-summary{position:sticky;top:96px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;}
.cart-page-summary h3{font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:var(--ink);margin-bottom:8px;}
.cart-page-reco{margin-top:24px;}

/* Livraison offerte au seuil — UX conversion */
.fs-ship-banner{border-radius:14px;padding:14px 16px;margin-bottom:14px;border:1px solid var(--border);background:linear-gradient(135deg,var(--surface),var(--surface2));box-shadow:0 2px 12px rgba(0,0,0,.045);}
.fs-ship-banner--compact{padding:11px 12px;}
.fs-ship-banner--muted{border-style:dashed;opacity:.95;}
.fs-ship-banner--chase{border-color:rgba(253,209,116,.95);background:linear-gradient(135deg,#fff9e9,#fef6ff);}
.fs-ship-banner--won{border-color:rgba(46,167,107,.65);background:linear-gradient(135deg,#eafaf1,#f3fff9);}
.fs-ship-banner-top{display:flex;flex-direction:column;gap:3px;margin-bottom:8px;}
.fs-ship-eyebrow{font-size:.62rem;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--gray);}
.fs-ship-eyebrow--gold{color:#946200;}
.fs-ship-micro{font-size:.62rem;color:var(--gray);line-height:1.35;}
.fs-ship-title{font-family:'Syne',sans-serif;font-size:.94rem;font-weight:800;color:var(--ink);line-height:1.35;margin-bottom:8px;}
.fs-ship-title--celebrate{margin-bottom:6px;color:#146635;}
.fs-ship-caption{font-size:.75rem;color:var(--gray);margin:0 0 6px;line-height:1.45;}
.fs-ship-track{width:100%;height:9px;background:var(--border);border-radius:99px;overflow:hidden;}
.fs-ship-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold,#fcd116),var(--green,#2eaa6b));transition:width .35s ease;}
.fs-ship-meta{font-size:.7rem;color:var(--gray);margin-top:8px;font-weight:600;}
.fs-ship-badge-live{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#fff4d8,#fde9c9);padding:6px 12px;border-radius:999px;font-size:.72rem;font-weight:800;color:#5c4200;margin-top:4px;border:1px solid rgba(253,209,116,.95);}
.fs-ship-badge{font-size:.7rem;font-weight:800;color:#146635;background:var(--green-pale);padding:5px 10px;border-radius:999px;display:inline-flex;align-items:center;gap:4px;margin-top:6px;}
.fs-reco-tip{font-size:.72rem;color:var(--gray);margin-bottom:10px;line-height:1.45;}
@media(max-width:640px){
  .fs-ship-title{font-size:.86rem;}
}

/* Checkout flow — barre de progression (Panier → Adresse → Paiement → Confirmation) */
.checkout-page-wrap{max-width:980px;margin:0 auto;}
.checkout-progress{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:14px;
  padding:12px 10px 14px;
  margin-bottom:18px;
  box-shadow:0 2px 10px rgba(0,0,0,.04);
}
.checkout-progress-list{
  list-style:none;margin:0;padding:0;display:flex;align-items:stretch;width:100%;
}
.checkout-progress-item{
  flex:1;min-width:0;display:flex;flex-direction:column;align-items:stretch;
}
.checkout-progress-cluster{
  display:flex;align-items:center;width:100%;min-width:0;
}
.checkout-progress-lead{
  flex:1;height:3px;background:var(--border);border-radius:2px;margin-right:6px;
  min-width:6px;align-self:center;
  transition:background .25s ease;
}
.checkout-progress-lead--on{
  background:linear-gradient(90deg,var(--green),#2ec27e);
}
.checkout-progress .checkout-progress-node{
  flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:5px;
  width:92px;padding:6px 4px;background:transparent;border:none;cursor:default;
  color:var(--ink);font-family:inherit;
  transition:transform .15s ease,opacity .15s ease;
  min-height:auto;min-width:0;touch-action:manipulation;
}
.checkout-progress-node:disabled{
  opacity:1;cursor:default;
}
.checkout-progress-node:not(:disabled){
  cursor:pointer;
}
.checkout-progress-node:not(:disabled):hover{
  transform:translateY(-1px);
}
.checkout-progress-node-inner{
  width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:1rem;border:2px solid var(--border);background:var(--surface2);
  transition:border-color .2s,background .2s,color .2s;
}
.checkout-progress-node--todo .checkout-progress-node-inner{color:var(--gray);opacity:.72;}
.checkout-progress-node--current .checkout-progress-node-inner{
  border-color:var(--green);background:var(--green-pale);box-shadow:0 0 0 3px rgba(79,209,125,.22);
  font-weight:800;
}
.checkout-progress-node--done .checkout-progress-node-inner{
  border-color:var(--green);background:var(--green);color:#fff;font-size:.95rem;line-height:1;
}
.checkout-progress-label{
  font-size:.69rem;font-weight:700;color:var(--gray);text-align:center;line-height:1.2;
  max-width:100%;
}
.checkout-progress-node--current .checkout-progress-label{color:var(--ink);font-weight:800;}
.checkout-progress-node--done .checkout-progress-label{color:var(--green);}
.checkout-progress-label-compact{display:none;}
.checkout-confirm-card{text-align:center;padding:8px 4px 4px;}
.checkout-confirm-icon{font-size:2.4rem;line-height:1;margin-bottom:4px;}

.card.checkout-form-card{padding:18px;border-radius:var(--yorix-r-lg);}
.checkout-step-heading{font-weight:800;font-size:.95rem;color:var(--ink);grid-column:1/-1;font-family:'Syne',sans-serif;letter-spacing:-.2px;}
.checkout-step-lead{grid-column:1/-1;font-size:.8rem;color:var(--gray);margin:-4px 0 8px;line-height:1.45;}
.checkout-step-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  align-items:start;
}
@media(max-width:640px){
  .checkout-step-grid{grid-template-columns:1fr;}
}
.checkout-field{display:flex;flex-direction:column;gap:4px;min-width:0;}
.checkout-field-wide{grid-column:1/-1;}
.checkout-field-error{font-size:.72rem;color:#b91c1c;font-weight:600;margin-top:2px;}
.checkout-input-invalid{border-color:#b91c1c !important;box-shadow:0 0 0 1px rgba(185,28,28,.2);}
.checkout-trust-row{
  display:flex;flex-wrap:wrap;gap:8px;
  font-size:.72rem;font-weight:600;color:var(--gray);
}
.checkout-trust-row span{
  background:var(--surface2);border:1px solid var(--border);padding:6px 10px;border-radius:50px;
}
.checkout-estimate-box{
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:var(--yorix-r-md);
  padding:13px;
  box-shadow:var(--yorix-sh-sm);
}
.checkout-pay-recap{font-size:.88rem;}
.checkout-pay-recap-row{display:flex;justify-content:space-between;align-items:baseline;margin-top:4px;}
.checkout-pay-recap-row:first-of-type{margin-top:0;}
.checkout-pay-recap-total{display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-weight:800;font-size:.92rem;font-family:'Syne',sans-serif;}
.checkout-error-banner{color:#b91c1c;font-weight:600;font-size:.84rem;}

@media(max-width:520px){
  .checkout-progress-node{width:72px;padding:4px 2px;}
  .checkout-progress-node-inner{width:32px;height:32px;font-size:.9rem;}
  .checkout-progress-label{font-size:.62rem;}
  .checkout-progress-label-full{display:none;}
  .checkout-progress-label-compact{display:inline;}
}

@media(max-width:900px){
  .admin-layout{flex-direction:column;}
  .admin-sidebar{
    width:100%;height:auto;position:relative;
    padding:10px 0;overflow-x:auto;overflow-y:hidden;
    display:flex;flex-direction:row;align-items:center;
    white-space:nowrap;
  }
  .admin-sidebar-logo{display:none;}
  .admin-nav-item{
    flex-direction:column;gap:2px;padding:8px 14px;
    border-left:none;border-bottom:3px solid transparent;
    font-size:.68rem;min-width:72px;text-align:center;
  }
  .admin-nav-item.active{border-left:none;border-bottom-color:#4fd17d;}
  .admin-nav-item span:first-child{font-size:1.1rem;}
  .admin-content{padding:14px;}
  .admin-page-title{font-size:1.05rem;flex-wrap:wrap;}
  .stat-cards-grid{grid-template-columns:repeat(2,1fr);gap:8px;}
  .stat-card{padding:12px;}
  .stat-card-val{font-size:1.1rem;}
  .stat-card-lbl{font-size:.65rem;}
  .admin-table{font-size:.7rem;}
  .admin-table th,.admin-table td{padding:6px 7px;}
  .admin-filter-row{gap:6px;}
  .admin-search{font-size:.72rem;padding:6px 9px;}
  .admin-action-btn{padding:3px 6px;font-size:.62rem;}
  .admin-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
}
@media(max-width:500px){
  .stat-cards-grid{grid-template-columns:1fr;}
  .admin-content{padding:10px;}
}
/* Navbar mobile optimisée */
@media (max-width:768px){
  .navbar{padding:0 10px;gap:6px;height:54px;}
  .logo-txt{font-size:1.2rem;}
  .logo-txt sup{display:none;}
  .nav-search{max-width:none;flex:1;}
  .nav-search select{display:none;}
  .nav-search input{padding:7px 9px;font-size:.75rem;}
  .nav-search button{padding:0 10px;font-size:.85rem;}
  .nav-actions{gap:5px;}
  .nav-actions .dark-toggle{display:none;}
  .btn-ghost,.btn-green,.btn-red{font-size:.68rem;padding:6px 8px;}
  .btn-ghost span,.btn-green span,.btn-red span{display:none;}
  .user-av{width:30px;height:30px;font-size:.72rem;}
  .role-chip{display:none;}
  .icon-btn{width:34px;height:34px;font-size:.88rem;}
}

.fiche-produit-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start;}
@media (max-width:768px){
  .fiche-produit-grid{grid-template-columns:1fr;gap:20px;}
}

/* NOTIFS — centre premium + ancien fallback */
.notif-backdrop{position:fixed;inset:0;background:rgba(15,20,18,.28);z-index:1050;backdrop-filter:blur(3px);}
.notif-drawer{position:fixed;top:clamp(72px,14vh,102px);right:12px;width:min(408px,calc(100vw - 20px));max-height:calc(100vh - 88px);display:flex;flex-direction:column;background:var(--surface);border-radius:16px;border:1px solid var(--border);box-shadow:0 16px 48px rgba(0,0,0,.14),0 4px 14px rgba(26,107,58,.08);z-index:1060;overflow:hidden;}
.notif-drawer--premium{border-radius:16px;}
.notif-hub{display:flex;flex-direction:column;height:100%;min-height:0;}
.notif-hub--dropdown{min-height:380px;max-height:inherit;}
.notif-hub--page{max-width:760px;margin:0 auto;}
.notif-hub-toolbar{padding:14px 14px 10px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,var(--surface2),var(--surface));flex-shrink:0;position:sticky;top:0;z-index:3;}
.notif-hub-title-row{display:flex;align-items:center;gap:8px;}
.notif-hub-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.02rem;color:var(--ink);margin:0;letter-spacing:-.3px;}
.notif-hub-badge{background:var(--red);color:#fff;font-size:.68rem;font-weight:800;padding:2px 7px;border-radius:50px;min-width:22px;text-align:center;}
.notif-hub-actions-top{display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap;justify-content:space-between;}
.notif-hub-close{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;font-size:.9rem;line-height:1;margin-left:auto;}
.notif-link-btn{background:none;border:none;font-size:.72rem;font-weight:700;color:var(--gray);cursor:pointer;padding:4px 0;}
.notif-link-btn-strong{color:var(--green);}
.notif-filter-strip{display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0;-webkit-overflow-scrolling:touch;}
.notif-chip{
  flex-shrink:0;border:none;border-radius:50px;padding:6px 12px;font-size:.72rem;font-weight:700;background:var(--surface2);color:var(--gray);cursor:pointer;border:1px solid var(--border);
}
.notif-chip--active{background:var(--green-pale);color:var(--green);border-color:var(--green-light);}
.notif-hub-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;}
.notif-hub-scroll--drop{max-height:min(52vh,420px);}
.notif-hub-scroll--page{max-height:none;}
.notif-empty.premium{text-align:center;padding:36px 20px;color:var(--gray);}
.notif-empty-icon{font-size:2rem;margin-bottom:8px;}
.notif-empty-title{font-weight:700;font-size:.92rem;color:var(--ink);margin-bottom:6px;font-family:'Syne',sans-serif;}
.notif-empty-sub{font-size:.78rem;line-height:1.45;margin:0;}
.notif-card-list{list-style:none;margin:0;padding:8px 10px 12px;}
.notif-card-li{
  display:flex;gap:6px;align-items:stretch;background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:10px;
  overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,transform .12s ease;width:100%;box-sizing:border-box;
  animation:notifFadeIn .3s ease both;
}
@keyframes notifFadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.notif-card-li:hover{box-shadow:0 6px 20px rgba(26,107,58,.08);}
.notif-card-li--unread{background:rgba(232,247,239,.45);}
.notif-card-priority-critical{border-left:4px solid #b91c1c;}
.notif-card-priority-important{border-left:4px solid #2563eb;}
.notif-card-priority-promo{border-left:4px solid #d97706;}
.notif-card-priority-standard{border-left:4px solid var(--green-light);}
.notif-card-main{
  flex:1;min-width:0;width:100%;padding:12px 8px 12px 12px;text-align:left;border:none;background:transparent;cursor:pointer;font:inherit;
  touch-action:manipulation;
}
.notif-card-side{display:flex;flex-direction:column;gap:4px;padding:8px 8px 8px 0;flex-shrink:0;}
.notif-mini-btn{width:36px;height:36px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;font-size:.78rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;touch-action:manipulation;}
.notif-mini-btn-del{font-size:.72rem;opacity:.75;}
.notif-card-li--selected{box-shadow:0 0 0 2px rgba(26,107,58,.22);border-color:rgba(26,107,58,.35);}

/* Ligne notification partagée (cloche + centre) */
.notif-row{display:flex;align-items:flex-start;gap:14px;width:100%;box-sizing:border-box;position:relative;min-width:0;padding:4px 0;}
.notif-row--compact{padding:8px 10px;}
.notif-row--compact .notif-thumb-wrap,.notif-row--compact .notif-thumb{width:48px;height:48px;border-radius:14px;}
.notif-row--compact .notif-title{font-size:14px;}
.notif-row--compact .notif-description{font-size:12px;-webkit-line-clamp:2;}
.notif-thumb-wrap{width:56px;height:56px;border-radius:16px;flex-shrink:0;position:relative;overflow:hidden;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;}
.notif-thumb{width:56px;height:56px;border-radius:16px;object-fit:cover;flex-shrink:0;background:var(--surface2);display:block;}
.notif-thumb-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.45rem;line-height:1;background:linear-gradient(145deg,var(--green-pale),var(--surface2));}
.notif-unread-dot{position:absolute;top:4px;right:4px;width:9px;height:9px;background:var(--green);border-radius:50%;border:2px solid var(--surface);box-shadow:0 0 0 1px rgba(26,107,58,.25);}
.notif-row-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;overflow:hidden;}
.notif-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;line-height:1.35;color:var(--ink);margin:0;overflow:hidden;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.notif-description{font-size:13px;color:var(--gray);line-height:1.5;margin:0;overflow:hidden;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.notif-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;flex-wrap:nowrap;min-width:0;}
.notif-badge{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;max-width:50%;}
.notif-time{font-size:12px;color:var(--gray);white-space:nowrap;flex-shrink:0;margin-left:auto;text-align:right;}
.notif-skeleton-list{padding:8px 10px;display:flex;flex-direction:column;gap:10px;}
.notif-skeleton-item{display:flex;gap:12px;align-items:center;padding:8px 0;}
.notif-skeleton-thumb{width:56px;height:56px;border-radius:16px;flex-shrink:0;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);background-size:200% 100%;animation:notifSkel 1.2s ease-in-out infinite;}
.notif-skeleton-lines{flex:1;display:flex;flex-direction:column;gap:8px;}
.notif-skeleton-line{height:10px;border-radius:6px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);background-size:200% 100%;animation:notifSkel 1.2s ease-in-out infinite;}
.notif-skeleton-line--short{width:55%;}
.notif-skeleton-line--tiny{width:35%;height:8px;}
@keyframes notifSkel{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
.notif-hub-body{display:flex;flex:1;min-height:0;flex-direction:column;}
.notif-hub--page .notif-hub-body{min-height:min(70vh,640px);}
@media(min-width:720px){
  .notif-hub--page.notif-hub--has-detail .notif-hub-body{flex-direction:row;align-items:stretch;}
  .notif-hub--page.notif-hub--has-detail .notif-hub-scroll--page{flex:1;min-width:0;border-right:1px solid var(--border);}
  .notif-hub--page .notif-detail{flex:1;min-width:min(360px,42%);max-width:480px;}
}
.notif-card-li--selected{box-shadow:0 0 0 2px rgba(26,107,58,.22);}
.notif-detail{display:flex;flex-direction:column;min-height:0;background:var(--surface);border-top:1px solid var(--border);flex:1;}
.notif-hub--dropdown .notif-detail{max-height:min(46vh,360px);}
.notif-detail__head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border);flex-shrink:0;}
.notif-detail__back{background:none;border:none;color:var(--green);font-weight:700;font-size:.78rem;cursor:pointer;padding:8px 4px;min-height:44px;}
.notif-detail__hero{display:flex;gap:12px;padding:14px 14px 10px;flex-shrink:0;}
.notif-detail__avatar{width:52px;height:52px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--border);flex-shrink:0;}
.notif-detail__avatar img{width:100%;height:100%;object-fit:cover;}
.notif-detail__title{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;margin:0 0 6px;color:var(--ink);line-height:1.3;}
.notif-detail__chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.notif-detail__chip{font-size:.65rem;font-weight:700;padding:3px 8px;border-radius:50px;background:var(--green-pale);color:var(--green);}
.notif-detail__chip--muted{background:var(--surface2);color:var(--gray);}
.notif-detail__time{font-size:.68rem;color:var(--gray);}
.notif-detail__body-wrap{flex:1;min-height:0;overflow-y:auto;padding:0 14px 14px;-webkit-overflow-scrolling:touch;}
.notif-detail__body{margin:0;font-size:.88rem;line-height:1.6;color:var(--ink);white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;}
.notif-detail__link-hint{font-size:.72rem;color:var(--gray);margin:10px 0 0;}
.notif-detail__actions{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--border);flex-shrink:0;}
.notif-detail__btn{min-height:44px;padding:10px 16px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);font-weight:700;font-size:.8rem;cursor:pointer;font-family:'DM Sans',sans-serif;}
.notif-detail__btn--primary{background:var(--green);color:#fff;border-color:var(--green);}
.notif-detail__btn--danger{color:#b91c1c;border-color:#fecaca;background:#fff5f5;}
.notif-page-wrap{padding-bottom:calc(72px + env(safe-area-inset-bottom));}
.notif-hub-footer-premium{border-top:1px solid var(--border);padding:10px 12px;background:var(--surface2);flex-shrink:0;max-height:min(240px,40vh);overflow-y:auto;}
.notif-preferences-mini{display:grid;gap:6px;margin-bottom:8px;font-size:.72rem;color:var(--ink);}
.notif-preferences-title{font-weight:800;font-family:'Syne',sans-serif;font-size:.74rem;color:var(--ink);}
.notif-toggle{display:flex;align-items:center;gap:8px;font-size:.71rem;color:var(--gray);cursor:pointer;font-weight:600;}
.notif-policy-hint{margin:4px 0 0;font-size:.65rem;line-height:1.45;color:var(--gray);font-weight:500;}
@media(max-width:768px){
  .notif-hub--page{max-width:100%;padding:0 4px;}
  .notif-card-li{margin-bottom:8px;border-radius:12px;}
  .notif-card-main{padding:10px 6px 10px 10px;}
  .notif-thumb-wrap,.notif-thumb{width:48px;height:48px;border-radius:14px;}
  .notif-title{font-size:14px;}
  .notif-description{font-size:12px;}
  .notif-badge{font-size:10px;padding:3px 8px;}
  .notif-time{font-size:11px;}
  .notif-hub-scroll--page{max-height:none;}
}
@media(min-width:769px){
  .notif-card-main{padding:14px 10px 14px 14px;}
  .notif-card-li:hover{transform:translateY(-1px);}
  .notif-hub--page .notif-hub-body{border:1px solid var(--border);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.06);overflow:hidden;}
}

/* MESSAGERIE — hub aligné notifications */
.msg-hub{display:flex;height:min(72vh,640px);min-height:420px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(26,107,58,.06);}
.msg-hub--modal{height:min(80vh,680px);max-height:680px;border:none;box-shadow:none;}
.msg-hub-sidebar{width:min(300px,38%);min-width:260px;border-right:1px solid var(--border);display:flex;flex-direction:column;background:linear-gradient(180deg,var(--surface2),var(--surface));flex-shrink:0;}
.msg-hub-toolbar{padding:14px 12px 10px;border-bottom:1px solid var(--border);flex-shrink:0;}
.msg-hub-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.msg-hub-new-btn{flex-shrink:0;padding:7px 12px;border-radius:50px;border:none;background:var(--green);color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:.72rem;cursor:pointer;min-height:36px;touch-action:manipulation;transition:transform .12s ease,filter .15s;}
.msg-hub-new-btn:hover{filter:brightness(1.05);}
.msg-hub-new-btn:active{transform:scale(0.96);}
.msg-hub-new-btn--inline{margin-top:12px;}
.msg-new-modal__backdrop{position:fixed;inset:0;z-index:1090;background:rgba(13,31,20,.45);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);animation:msgNewFadeIn .22s ease;}
.msg-new-modal{position:fixed;z-index:1100;background:var(--surface);color:var(--ink);border:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;max-width:100%;}
.msg-new-modal--sheet{left:0;right:0;bottom:0;max-height:min(88vh,640px);border-radius:18px 18px 0 0;box-shadow:0 -16px 48px rgba(0,0,0,.18);animation:msgNewSheetUp .28s cubic-bezier(0.22,1,0.36,1);padding-bottom:env(safe-area-inset-bottom);}
.msg-new-modal--dialog{left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,92vw);max-height:min(72vh,560px);border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.12),0 4px 20px rgba(26,107,58,.08);animation:msgNewDialogIn .24s ease;}
.msg-new-modal__handle{width:40px;height:4px;border-radius:4px;background:var(--border);margin:8px auto 0;flex-shrink:0;}
.msg-new-modal__head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;flex-shrink:0;border-bottom:1px solid var(--border);}
.msg-new-modal__title{margin:0;font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;color:var(--ink);}
.msg-new-modal__close{width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:var(--surface2);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;}
.msg-new-modal__search-wrap{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0;}
.msg-new-modal__search-icon{font-size:1rem;opacity:.55;flex-shrink:0;}
.msg-new-modal__input{flex:1;border:1.5px solid var(--border);border-radius:12px;padding:11px 12px;font-size:.88rem;background:var(--surface);color:var(--ink);outline:none;min-width:0;box-sizing:border-box;}
.msg-new-modal__input:focus{border-color:var(--green-light);background:var(--green-pale);}
.msg-new-modal__list{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;padding:8px;min-height:0;}
.msg-new-modal__item{width:100%;display:flex;align-items:center;gap:12px;padding:12px;border:none;background:transparent;cursor:pointer;text-align:left;border-radius:14px;transition:background .15s,transform .12s;box-sizing:border-box;max-width:100%;}
.msg-new-modal__item:hover,.msg-new-modal__item:focus-visible{background:rgba(26,107,58,.07);outline:none;}
.msg-new-modal__item:active{transform:scale(0.99);}
.msg-new-modal__av{width:48px;height:48px;border-radius:16px;flex-shrink:0;overflow:hidden;background:var(--green-pale);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;}
.msg-new-modal__av-img{width:100%;height:100%;object-fit:cover;display:block;}
.msg-new-modal__av-fallback{font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;color:var(--green);}
.msg-new-modal__copy{flex:1;min-width:0;overflow:hidden;display:flex;flex-direction:column;gap:2px;}
.msg-new-modal__username{display:block;font-weight:800;font-size:.82rem;color:var(--green);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-new-modal__fullname{display:block;font-weight:700;font-size:.88rem;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-new-modal__sub{display:block;font-size:.72rem;color:var(--gray);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-new-modal__hint,.msg-new-modal__empty{padding:28px 16px;text-align:center;font-size:.8rem;color:var(--gray);line-height:1.5;}
.msg-new-modal__empty-ico{font-size:2rem;display:block;margin-bottom:8px;opacity:.45;}
.msg-new-modal__empty-hint{display:block;font-size:.72rem;margin-top:6px;opacity:.85;}
.msg-new-modal__error{margin:12px;padding:14px;border-radius:12px;background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;font-size:.78rem;line-height:1.45;}
.msg-new-modal__error strong{display:block;margin-bottom:6px;font-family:'Syne',sans-serif;}
.msg-new-modal__error p{margin:0 0 10px;word-break:break-word;}
.msg-new-modal__retry{padding:8px 14px;border-radius:8px;border:none;background:#991b1b;color:#fff;font-weight:700;font-size:.75rem;cursor:pointer;}
.msg-new-modal__skeleton{padding:8px 4px;}
.msg-new-modal__skel-row{display:flex;gap:12px;padding:10px 8px;align-items:center;}
.msg-new-modal__skel-av{width:48px;height:48px;border-radius:16px;flex-shrink:0;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);background-size:200% 100%;animation:notifSkel 1.2s ease-in-out infinite;}
.msg-new-modal__skel-lines{flex:1;display:flex;flex-direction:column;gap:8px;}
.msg-new-modal__skel-line{height:10px;border-radius:6px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);background-size:200% 100%;animation:notifSkel 1.2s ease-in-out infinite;}
.msg-new-modal__skel-line--short{width:45%;}
@keyframes msgNewFadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes msgNewSheetUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes msgNewDialogIn{from{opacity:0;transform:translate(-50%,-46%);}to{opacity:1;transform:translate(-50%,-50%);}}
@media(max-width:768px){.msg-new-modal__input{font-size:16px;}}
@media(min-width:769px){.msg-new-modal__item:hover{transform:translateY(-1px);}}
@media(prefers-reduced-motion:reduce){.msg-new-modal,.msg-new-modal__backdrop{animation:none!important;}}
.msg-composer-spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:msgSpin .7s linear infinite;}
@keyframes msgSpin{to{transform:rotate(360deg);}}
.yorix-toast{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom) + var(--msg-kb-offset,0px));transform:translateX(-50%);z-index:12000;display:flex;align-items:center;gap:10px;max-width:min(92vw,420px);padding:12px 14px;border-radius:14px;background:var(--ink);color:#fff;box-shadow:0 10px 40px rgba(0,0,0,.2);animation:yorixToastIn .28s ease;font-size:.82rem;font-weight:600;line-height:1.35;}
.yorix-toast--error{background:linear-gradient(135deg,#991b1b,#dc2626);}
.yorix-toast--success{background:linear-gradient(135deg,var(--green),#145a32);}
.yorix-toast--info{background:var(--ink);}
.yorix-toast__icon{flex-shrink:0;font-size:1rem;}
.yorix-toast__msg{flex:1;min-width:0;word-break:break-word;}
.yorix-toast__close{flex-shrink:0;width:28px;height:28px;border:none;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;cursor:pointer;font-size:1rem;line-height:1;}
@keyframes yorixToastIn{from{opacity:0;transform:translateX(-50%) translateY(12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
.msg-hub-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;color:var(--ink);margin:0;letter-spacing:-.3px;}
.msg-hub-search{width:100%;margin-top:10px;border:1.5px solid var(--border);border-radius:10px;padding:9px 12px;font-size:.78rem;background:var(--surface);color:var(--ink);outline:none;}
.msg-hub-search:focus{border-color:var(--green-light);}
.msg-hub-conv-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px;}
.msg-conv-item{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:transparent;cursor:pointer;text-align:left;border-radius:12px;margin-bottom:4px;transition:background .15s;}
.msg-conv-item:hover{background:rgba(26,107,58,.06);}
.msg-conv-item--active{background:var(--green-pale);box-shadow:inset 3px 0 0 var(--green);}
.msg-conv-item--yorix .msg-conv-av--brand{background:linear-gradient(135deg,#fcd116,#1a6b3a);color:#fff;font-size:1rem;}
.msg-conv-av{width:44px;height:44px;border-radius:12px;background:var(--green-pale);color:var(--green);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;flex-shrink:0;border:1px solid var(--border);}
.msg-conv-copy{flex:1;min-width:0;}
.msg-conv-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-conv-preview{font-size:.7rem;color:var(--gray);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-conv-badge{color:var(--green);font-size:.55rem;}
.msg-hub-main{flex:1;display:flex;flex-direction:column;min-width:0;background:var(--surface);}
.msg-hub-header{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,var(--green),#145a32);color:#fff;flex-shrink:0;}
.msg-hub-header-copy{flex:1;min-width:0;}
.msg-hub-header-title{font-family:'Syne',sans-serif;font-weight:800;font-size:.92rem;}
.msg-hub-header-sub{font-size:.68rem;opacity:.88;margin-top:2px;}
.msg-hub-back{display:none;width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:1rem;}
.msg-hub-close{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;cursor:pointer;}
.msg-hub-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;background:var(--surface);}
.msg-bubble-row{display:flex;justify-content:flex-start;animation:msgFadeIn .25s ease both;}
@keyframes msgFadeIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
.msg-bubble-row--mine{justify-content:flex-end;}
.msg-bubble-row--system{justify-content:center;}
.msg-bubble{max-width:min(85%,420px);padding:10px 14px;border-radius:14px 14px 14px 4px;background:var(--surface2);border:1px solid var(--border);color:var(--ink);}
.msg-bubble--mine{background:linear-gradient(135deg,var(--green),#1e7a45);color:#fff;border-color:transparent;border-radius:14px 14px 4px 14px;}
.msg-bubble--system{max-width:92%;background:linear-gradient(180deg,#fffbeb,#fff);border-color:#fcd11655;border-radius:14px;}
.msg-system-title{display:block;font-family:'Syne',sans-serif;font-weight:800;font-size:.88rem;margin-bottom:6px;color:var(--ink);}
.msg-bubble-text{font-size:.84rem;line-height:1.45;margin:0;word-break:break-word;overflow-wrap:anywhere;}
.msg-bubble-body{display:flex;flex-direction:column;gap:8px;min-width:0;max-width:100%;}
.msg-bubble-img-wrap{display:block;border-radius:12px;overflow:hidden;max-width:min(260px,100%);flex-shrink:0;}
.msg-bubble-img{width:100%;max-height:220px;object-fit:cover;border-radius:12px;display:block;background:var(--surface2);}
.msg-inline-link{color:inherit;text-decoration:underline;font-weight:600;}
.msg-bubble--mine .msg-inline-link{color:#e8fff0;}
.msg-bubble-cta{display:inline-flex;font-size:.74rem;font-weight:700;color:var(--green);margin-top:4px;}
.msg-bubble--mine .msg-bubble-cta{color:#fcd116;}
.msg-bubble-foot{font-size:.62rem;opacity:.72;margin-top:6px;text-align:right;}
.msg-blocked-banner{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fcd34d;border-radius:14px;padding:14px 16px;color:#78350f;font-size:.78rem;text-align:left;line-height:1.5;box-shadow:0 4px 16px rgba(180,83,9,.08);}
.msg-blocked-banner strong{display:block;font-family:'Syne',sans-serif;font-size:.88rem;margin-bottom:8px;color:#92400e;}
.msg-blocked-reason{font-weight:700;margin:0 0 8px;color:#b45309;}
.msg-blocked-body{margin:0 0 8px;}
.msg-blocked-hint{font-size:.72rem;opacity:.9;margin:0;font-style:italic;}
.msg-hub-composer{border-top:1px solid var(--border);padding:10px 12px calc(10px + env(safe-area-inset-bottom) + var(--msg-kb-offset,0px));background:color-mix(in srgb,var(--surface2) 92%,transparent);flex-shrink:0;position:sticky;bottom:0;z-index:100;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 -4px 20px rgba(0,0,0,.06);}
.msg-feedback{margin:0 0 8px;padding:10px 12px;border-radius:10px;font-size:.78rem;font-weight:600;line-height:1.4;}
.msg-feedback--error{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;}
.msg-feedback--success{background:#dcfce7;color:#166534;border:1px solid #86efac;}
.msg-composer-preview{position:relative;width:72px;height:72px;border-radius:12px;overflow:hidden;border:1px solid var(--border);flex-shrink:0;}
.msg-composer-preview img{width:100%;height:100%;object-fit:cover;display:block;}
.msg-composer-preview-remove{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,.55);color:#fff;cursor:pointer;font-size:.85rem;line-height:1;}
.msg-composer-send{transition:transform .12s ease,opacity .15s;}
.msg-composer-send:not(:disabled):active{transform:scale(0.94);}
.msg-hub-composer--readonly p{margin:0;font-size:.75rem;color:var(--gray);text-align:center;}
.msg-composer-row{display:flex;align-items:center;gap:6px;}
.msg-composer-icon,.msg-composer-send{width:40px;height:40px;border-radius:10px;border:none;cursor:pointer;flex-shrink:0;font-size:1rem;}
.msg-composer-icon{background:var(--surface);border:1px solid var(--border);}
.msg-composer-send{background:var(--green);color:#fff;}
.msg-composer-send:disabled{opacity:.45;cursor:not-allowed;}
.msg-composer-input,.msg-composer-link{flex:1;border:1.5px solid var(--border);border-radius:10px;padding:9px 11px;font-size:.8rem;background:var(--surface);color:var(--ink);outline:none;min-width:0;}
.msg-composer-link{max-width:120px;font-size:.72rem;}
.msg-composer-attachments{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
.msg-attach-chip{display:inline-flex;align-items:center;gap:6px;background:var(--green-pale);color:var(--green);padding:4px 10px;border-radius:50px;font-size:.7rem;font-weight:700;}
.msg-attach-chip button{border:none;background:transparent;cursor:pointer;font-size:.9rem;line-height:1;}
.msg-admin-contact-panel{display:flex;flex-wrap:wrap;gap:8px 14px;padding:8px 14px;background:#eff6ff;border-bottom:1px solid #bfdbfe;font-size:.72rem;}
.msg-admin-contact-label{font-weight:800;color:#1e40af;width:100%;}
.msg-admin-contact-line strong{margin-right:4px;}
.msg-hub-empty,.msg-hub-empty-inline{text-align:center;padding:28px 16px;color:var(--gray);}
.msg-hub-empty-icon{font-size:2.2rem;margin-bottom:8px;}
.msg-hub-hint{font-size:.75rem;margin-top:6px;}
.msg-hub-loading{padding:20px;text-align:center;font-size:.78rem;color:var(--gray);}
.admin-broadcast-intro{color:var(--gray);font-size:.85rem;line-height:1.6;max-width:720px;margin-bottom:20px;}
.admin-broadcast-grid{display:grid;grid-template-columns:1fr min(280px,32%);gap:24px;align-items:start;}
.admin-broadcast-label{display:block;font-size:.78rem;font-weight:700;color:var(--ink);margin-bottom:14px;}
.admin-broadcast-input,.admin-broadcast-textarea{width:100%;margin-top:6px;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:.85rem;}
.admin-broadcast-textarea{resize:vertical;min-height:120px;}
.admin-broadcast-media{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;margin-bottom:16px;}
.admin-broadcast-upload-btn{display:inline-flex;padding:10px 16px;background:var(--surface2);border:1.5px dashed var(--border);border-radius:10px;cursor:pointer;font-size:.8rem;font-weight:700;}
.admin-broadcast-preview img{max-width:140px;border-radius:8px;display:block;margin-top:8px;}
.admin-broadcast-remove-img{margin-top:6px;font-size:.72rem;border:none;background:none;color:var(--red);cursor:pointer;font-weight:700;}
.admin-broadcast-send{width:100%;padding:14px;background:linear-gradient(135deg,var(--green),#145a32);color:#fff;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;cursor:pointer;}
.admin-broadcast-send:disabled{opacity:.55;cursor:wait;}
.admin-broadcast-preview-panel{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:16px;}
.admin-broadcast-preview-title{font-family:'Syne',sans-serif;font-weight:800;font-size:.8rem;margin-bottom:12px;color:var(--gray);}
.admin-broadcast-history{margin-top:32px;}
.admin-broadcast-list{list-style:none;margin:0;padding:0;}
.admin-broadcast-list-item{padding:14px 0;border-bottom:1px solid var(--border);}
.admin-broadcast-list-head{display:flex;justify-content:space-between;gap:12px;font-size:.82rem;margin-bottom:6px;}
.admin-broadcast-muted{font-size:.72rem;color:var(--gray);}
@media(max-width:768px){
  .msg-hub--thread-open .msg-hub-scroll{padding-bottom:calc(12px + var(--msg-kb-offset,0px));}
  .msg-hub{max-width:100%;overflow:hidden;}
  .msg-hub-sidebar{width:100%;min-width:0;max-height:45%;}
  .msg-hub-sidebar--hidden-mobile{display:none;}
  .msg-hub--thread-open .msg-hub-main{flex:1;min-height:0;display:flex;flex-direction:column;}
  .msg-hub-back{display:flex;align-items:center;justify-content:center;}
  .msg-composer-input{font-size:16px;padding:11px 12px;min-height:44px;}
  .msg-composer-link{display:none;}
  .msg-composer-row{gap:8px;}
  .msg-bubble{max-width:min(88%,340px);}
  .admin-broadcast-grid{grid-template-columns:1fr;}
}
@media(min-width:769px){
  .msg-hub-composer{padding:12px 16px;}
  .msg-composer-row{gap:8px;}
  .msg-bubble-row--mine .msg-bubble:hover{filter:brightness(1.02);}
  .msg-conv-item:hover{background:rgba(26,107,58,.06);}
}

/* legacy compat */
.notif-header{padding:12px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.notif-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.86rem;color:var(--ink);}
.notif-clear{font-size:.69rem;color:var(--green);cursor:pointer;font-weight:600;}
.notif-item{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;gap:9px;cursor:pointer;transition:background .2s;}

/* PRESTATAIRES */
.prest-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.prest-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:16px;cursor:pointer;transition:all .25s;}
.prest-card:hover{transform:translateY(-3px);box-shadow:0 7px 20px rgba(26,107,58,.09);border-color:var(--green-light);}
.prest-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.prest-av{width:46px;height:46px;border-radius:11px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:1.4rem;}
.prest-name{font-family:'Syne',sans-serif;font-weight:700;font-size:.88rem;color:var(--ink);}
.prest-meta{font-size:.69rem;color:var(--gray);}
.prest-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:9px;}
.ptag{background:var(--green-pale);color:var(--green);padding:2px 7px;border-radius:50px;font-size:.63rem;font-weight:600;}
.prest-footer{display:flex;align-items:center;justify-content:space-between;}
.prest-price{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:700;color:var(--green);}
.btn-hire{background:var(--green);color:#fff;border:none;padding:5px 12px;border-radius:6px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.7rem;cursor:pointer;}

/* BLOG */
.blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.blog-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;overflow:hidden;cursor:pointer;transition:all .25s;}
.blog-card:hover{transform:translateY(-3px);}
.blog-img{height:120px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--surface2);}
.blog-body{padding:13px;}
.blog-cat{font-size:.63rem;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
.blog-title{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:700;color:var(--ink);margin-bottom:4px;line-height:1.35;}
.blog-excerpt{font-size:.73rem;color:var(--gray);line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.blog-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 13px;border-top:1px solid var(--border);font-size:.67rem;color:var(--gray);}

/* ACADEMY */
.courses-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;}
.course-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;overflow:hidden;cursor:pointer;transition:all .25s;}
.course-card:hover{transform:translateY(-3px);}
.course-img{height:95px;display:flex;align-items:center;justify-content:center;font-size:2.7rem;}
.course-body{padding:12px;}
.course-level{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;}
.level-deb{color:#27a85a;}.level-int{color:#e67e22;}.level-adv{color:var(--red);}
.course-title{font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;color:var(--ink);margin-bottom:4px;}
.course-meta{font-size:.69rem;color:var(--gray);margin-bottom:8px;}
.course-footer{display:flex;align-items:center;justify-content:space-between;}
.course-price{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:700;color:var(--green);}
.course-btn{background:var(--green);color:#fff;border:none;padding:5px 11px;border-radius:6px;font-size:.7rem;font-weight:600;cursor:pointer;}

/* ESCROW STEPS */
.escrow-steps{display:flex;flex-direction:column;gap:10px;}
.estep{display:flex;align-items:flex-start;gap:10px;}
.estep-num{width:24px;height:24px;background:var(--green);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.69rem;font-weight:700;flex-shrink:0;margin-top:1px;}
.estep-text h4{font-size:.8rem;font-weight:600;color:var(--ink);margin-bottom:2px;}
.estep-text p{font-size:.73rem;color:var(--gray);line-height:1.5;}

/* WALLET */
.wallet-card{background:linear-gradient(135deg,#1a3a24,var(--green));border-radius:14px;padding:22px;color:#fff;margin-bottom:18px;}
.wc-label{font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;margin-bottom:4px;}
.wc-amount{font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;color:var(--yellow);}
.wc-sub{font-size:.75rem;opacity:.65;margin-top:4px;}
.info-box{background:var(--surface2);border:1.5px dashed var(--border);border-radius:11px;padding:18px;text-align:center;color:var(--gray);font-size:.82rem;}
.info-box .info-icon{font-size:1.6rem;margin-bottom:8px;}

/* REWARDS */
.rewards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.reward-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center;}
.reward-icon{font-size:1.8rem;margin-bottom:5px;}
.reward-name{font-size:.78rem;font-weight:600;color:var(--ink);margin-bottom:3px;}
.reward-pts{font-size:.71rem;color:var(--gold);font-weight:600;}
.reward-btn{background:var(--green);color:#fff;border:none;padding:5px 11px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.71rem;font-weight:600;cursor:pointer;margin-top:8px;width:100%;}

/* BUSSINESS */
.biz-hero{background:linear-gradient(135deg,#0a1410,#1a3a24);border-radius:14px;padding:28px;margin-bottom:16px;}
.biz-title{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:8px;}
.biz-sub{color:rgba(255,255,255,.5);font-size:.84rem;line-height:1.7;margin-bottom:16px;}
.biz-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:14px;}
.biz-feat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:12px;}
.biz-feat h4{font-size:.79rem;font-weight:600;color:#fff;margin-bottom:2px;}
.biz-feat p{font-size:.69rem;color:rgba(255,255,255,.4);line-height:1.5;}

/* WA + ADMIN — empilés, au-dessus de la barre mobile */
.yorix-fab-stack{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(80px + env(safe-area-inset-bottom));z-index:999;display:flex;flex-direction:column-reverse;align-items:flex-end;gap:11px;pointer-events:none;}
.yorix-fab-stack > *{pointer-events:auto;}
@media (min-width:901px){.yorix-fab-stack{bottom:calc(28px + env(safe-area-inset-bottom));right:max(20px,env(safe-area-inset-right));}}
.yorix-wa-fab{
  width:56px;height:56px;border-radius:50%;
  background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:26px;
  box-shadow:0 4px 16px rgba(37,211,102,.4),0 2px 6px rgba(0,0,0,.15);
  text-decoration:none;cursor:pointer;flex-shrink:0;
  transition:transform .2s ease,box-shadow .2s ease;
}
.yorix-wa-fab:hover{
  transform:scale(1.1);
  box-shadow:0 6px 20px rgba(37,211,102,.5),0 2px 8px rgba(0,0,0,.2);
}
@media (prefers-reduced-motion:reduce){
  .yorix-wa-fab{transition:none;}
  .yorix-wa-fab:hover{transform:none;}
}
@keyframes waPulse{0%{transform:scale(1);opacity:.3;}70%{transform:scale(1.65);opacity:0;}100%{opacity:0;}}
.wa-card{background:var(--surface);border-radius:12px;padding:13px;box-shadow:0 5px 22px var(--shadow);border:1px solid var(--border);min-width:220px;}
.wa-card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;color:var(--ink);margin-bottom:2px;}
.wa-card-sub{font-size:.69rem;color:var(--gray);margin-bottom:9px;}
.wa-link{display:flex;align-items:center;gap:6px;padding:8px 11px;border-radius:8px;text-decoration:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.77rem;transition:all .2s;margin-bottom:5px;cursor:pointer;border:none;width:100%;}
.wa-link-green{background:var(--wa);color:#fff;}
.wa-link-ghost{background:var(--surface2);color:var(--ink);border:1.5px solid var(--border);}

/* NEWSLETTER */
.newsletter{background:linear-gradient(135deg,var(--green),#27a85a);border-radius:14px;padding:26px;text-align:center;margin:0 24px 26px;}
.nl-title{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;color:#fff;margin-bottom:5px;}
.nl-sub{font-size:.82rem;color:rgba(255,255,255,.68);margin-bottom:16px;}
.nl-form{display:flex;max-width:380px;margin:0 auto;gap:7px;}
.nl-input{flex:1;border:none;border-radius:8px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:.82rem;outline:none;}
.nl-btn{background:var(--yellow);color:#0d1f14;border:none;padding:9px 16px;border-radius:8px;font-family:'Syne',sans-serif;font-weight:700;font-size:.79rem;cursor:pointer;}

/* ── ADMIN DASHBOARD ── */
.admin-layout{display:flex;min-height:100vh;gap:0;flex-direction:column;width:100%;}
.admin-layout--readonly .admin-content .admin-action-btn:not([data-readonly-ok]){opacity:.55;pointer-events:none;}
.admin-partner-banner{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:linear-gradient(90deg,#e0f2fe,#f0f9ff);border-bottom:1px solid #bae6fd;color:#0c4a6e;font-size:.82rem;line-height:1.5;}
.admin-partner-banner-icon{font-size:1.4rem;line-height:1;}
.admin-partner-banner strong{display:block;font-family:'Syne',sans-serif;font-weight:800;margin-bottom:2px;}
.admin-partner-banner p{margin:0;font-size:.78rem;opacity:.9;}
.admin-layout-inner{display:flex;flex:1;min-height:0;width:100%;align-items:stretch;}
.admin-sidebar{width:220px;background:${dark?"#060d09":"#0a1a10"};color:#fff;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;}
.admin-sidebar-logo{padding:0 20px 20px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:8px;}
.admin-sidebar-logo-txt{font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;color:#b7e4c7;}
.admin-sidebar-logo-sub{font-size:.65rem;color:rgba(255,255,255,.35);margin-top:2px;}
.admin-nav-item{display:flex;align-items:center;gap:9px;padding:10px 20px;cursor:pointer;font-size:.83rem;color:rgba(255,255,255,.55);transition:all .15s;border-left:3px solid transparent;}
.admin-nav-item:hover{background:rgba(255,255,255,.05);color:#fff;}
.admin-nav-item.active{background:rgba(79,209,125,.1);color:#4fd17d;border-left-color:#4fd17d;}
.admin-content{flex:1;padding:24px;background:var(--bg);overflow-y:auto;min-width:0;}
.admin-page-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.3rem;color:var(--ink);margin-bottom:20px;display:flex;align-items:center;gap:10px;}
.stat-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:24px;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;position:relative;overflow:hidden;}
.stat-card-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:10px;}
.stat-card-val{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;color:var(--ink);line-height:1;}
.stat-card-lbl{font-size:.72rem;color:var(--gray);margin-top:4px;}
.stat-card-trend{font-size:.68rem;font-weight:600;margin-top:6px;}
.admin-table{width:100%;border-collapse:collapse;background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);}
.admin-table th{background:var(--surface2);padding:10px 14px;text-align:left;font-size:.73rem;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border);}
.admin-table td{padding:11px 14px;font-size:.8rem;color:var(--ink);border-bottom:1px solid var(--border);}
.admin-table tr:last-child td{border-bottom:none;}
.admin-table tr:hover td{background:var(--surface2);}
.admin-badge{display:inline-block;padding:2px 8px;border-radius:50px;font-size:.65rem;font-weight:700;}
.admin-badge-green{background:#e6fff0;color:#1a6b3a;}
.admin-badge-red{background:#fff0f0;color:#ce1126;}
.admin-badge-blue{background:#e6f0ff;color:#1a4a9a;}
.admin-badge-yellow{background:#fff9e6;color:#b8860b;}
.admin-badge-gray{background:var(--surface2);color:var(--gray);}
.admin-action-btn{padding:4px 10px;border-radius:6px;border:none;cursor:pointer;font-size:.71rem;font-weight:600;transition:all .15s;}
.admin-search{border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:.82rem;color:var(--ink);background:var(--surface);outline:none;width:100%;max-width:280px;}
.admin-filter-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;}
.admin-section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:20px;}
.admin-section-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.88rem;color:var(--ink);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.admin-alert{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:9px;margin-bottom:8px;font-size:.8rem;}
.admin-alert-red{background:#fff0f0;border:1px solid #f5c6c6;color:#721c24;}
.admin-alert-yellow{background:#fff9e6;border:1px solid #fdecc6;color:#856404;}
.admin-alert-green{background:#e6fff0;border:1px solid #b7e4c7;color:#1a6b3a;}
.chart-bar-wrap{display:flex;align-items:flex-end;gap:5px;height:80px;margin-top:10px;}
.chart-bar{flex:1;background:var(--green);border-radius:3px 3px 0 0;min-width:8px;transition:height .4s;position:relative;cursor:pointer;}
.chart-bar:hover::after{content:attr(data-val);position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--surface);font-size:.62rem;padding:2px 5px;border-radius:4px;white-space:nowrap;}
.chart-labels{display:flex;gap:5px;margin-top:4px;}
.chart-label{flex:1;font-size:.58rem;color:var(--gray);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.admin-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
@media(max-width:768px){
  .admin-layout-inner{flex-direction:column;}
  .admin-sidebar{width:100%;height:auto;position:sticky;top:0;z-index:30;display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:thin;padding:8px 0;}
  .admin-sidebar-logo{display:none;}
  .admin-sidebar>div:last-child{display:none;}
  .admin-nav-item{white-space:nowrap;flex-shrink:0;border-left:none;border-bottom:3px solid transparent;padding:10px 14px;}
  .admin-nav-item.active{border-left:none;border-bottom-color:#4fd17d;}
  .admin-content{padding:14px 12px;padding-bottom:calc(16px + env(safe-area-inset-bottom));}
  .admin-page-title{flex-wrap:wrap;font-size:1.05rem;}
  .stat-cards-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
  .admin-action-btn{min-height:40px;padding:8px 12px;}
}
/* FOOTER */
.footer{position:relative;background:linear-gradient(180deg,${dark?"#050a08":"#07120c"} 0%,${dark?"#060d09":"#0a1a10"} 42%);color:rgba(255,255,255,.5);padding:0 24px 22px;margin-top:40px;border-top:1px solid rgba(255,255,255,.06);}
.footer--premium{padding-top:0;}
.footer-premium-accent{height:3px;background:linear-gradient(90deg,var(--green),var(--yellow),var(--green-mid));opacity:.85;}
.footer-trust-strip{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;align-items:center;padding:14px 0 18px;border-bottom:1px solid rgba(255,255,255,.08);}
.fts-item{font-size:.66rem;font-weight:600;color:rgba(255,255,255,.38);letter-spacing:.02em;}
.footer-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(200px,2fr) repeat(5,minmax(100px,1fr));gap:clamp(16px,2.5vw,28px);margin-bottom:26px;padding-top:22px;}
.footer-brand-col{min-width:0;}
.footer-logo{font-family:'Syne',sans-serif;font-size:1.45rem;font-weight:800;color:#e8f6ec;margin-bottom:9px;letter-spacing:-1px;}
.footer-logo span{color:#ff6b6b;}
.footer-desc{font-size:.74rem;line-height:1.82;margin-bottom:12px;color:rgba(255,255,255,.52);max-width:44ch;}
.footer-contact{font-size:.71rem;color:rgba(255,255,255,.42);display:flex;flex-direction:column;gap:4px;margin-bottom:14px;}
.footer-cta-cluster{display:flex;flex-wrap:wrap;gap:8px;}
.footer-cta-chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#e8f6ec;border-radius:10px;padding:8px 13px;font-size:.71rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background .2s,transform .15s;}
.footer-cta-chip:hover{background:rgba(79,209,125,.18);transform:translateY(-1px);}
.footer-cta-chip--ghost{background:transparent;color:rgba(255,255,255,.55);}
.footer-col h4{color:#fff;font-size:.73rem;font-weight:700;margin-bottom:12px;letter-spacing:.04em;text-transform:uppercase;font-family:'Syne',sans-serif;}
.footer-col ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;}
.footer-col li button{font-size:.72rem;margin:0;color:rgba(255,255,255,.48);transition:color .2s;text-align:left;width:100%;border:none;background:none;padding:4px 0;cursor:pointer;font-family:'DM Sans',sans-serif;line-height:1.45;border-radius:6px;}
.footer-col li button:hover{color:#b7e4c7;}
.footer-col li .footer-seo-link{display:block;font-size:.72rem;margin:0;color:rgba(255,255,255,.48);transition:color .2s;text-align:left;width:100%;padding:4px 0;text-decoration:none;font-family:'DM Sans',sans-serif;line-height:1.45;border-radius:6px;}
.footer-col li .footer-seo-link:hover{color:#b7e4c7;}
.footer-bottom{max-width:1200px;margin:0 auto;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;font-size:.65rem;align-items:center;flex-wrap:wrap;gap:10px;color:rgba(255,255,255,.35);}
.footer-copy{max-width:100%;}
.fb-badges{display:flex;gap:6px;flex-wrap:wrap;}
.fbb{background:rgba(255,255,255,.06);padding:5px 9px;border-radius:8px;font-size:.61rem;color:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.08);}

/* MOBILE NAV */
.mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-top:1px solid var(--border);padding:8px 0 calc(8px + env(safe-area-inset-bottom));z-index:520;box-shadow:0 -12px 32px rgba(0,0,0,.09);}
.mn-inner{display:flex;justify-content:space-around;align-items:center;padding-bottom:6px;}
.mn-item{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;padding:4px 8px;border-radius:8px;transition:all .2s;position:relative;}
.mn-item.active .mn-icon,.mn-item.active .mn-label{color:var(--green);}
.mn-icon{font-size:1.25rem;color:var(--gray);}
.mn-label{font-size:.6rem;color:var(--gray);font-weight:500;}
.mn-badge{position:absolute;top:2px;right:6px;background:var(--red);color:#fff;border-radius:50%;width:14px;height:14px;font-size:.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;}

/* MISC */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.anim{animation:fadeUp .35s ease both;}
.tag{background:var(--surface2);border:1px solid var(--border);border-radius:50px;padding:3px 9px;font-size:.68rem;font-weight:600;color:var(--gray);}
.divider-h{height:1px;background:var(--border);margin:16px 0;}

/* VENDOR BADGES */
.vendor-badge{padding:2px 7px;border-radius:4px;font-size:.6rem;font-weight:700;white-space:nowrap;}
.badge-top{background:#fff9e6;color:#b8860b;}
.badge-verif{background:#e6fff0;color:#1a6b3a;}
.badge-promo{background:#fff0e6;color:#d4520a;}
.badge-flash{background:#ffe6e6;color:#c0392b;}
.badge-best{background:#e6f0ff;color:#1a4a9a;}

/* FLASH CARD */
.prod-card-flash{border-color:#ff4444;box-shadow:0 0 0 1.5px rgba(255,68,68,.2);}
.prod-card-flash .prod-img-wrap::after{content:"⚡ FLASH";position:absolute;top:0;left:0;right:0;background:rgba(255,68,68,.85);color:#fff;font-size:.62rem;font-weight:800;text-align:center;padding:2px;letter-spacing:.5px;}
.pbadge-flash{position:absolute;top:7px;left:7px;background:#ff4444;color:#fff;font-size:.58rem;font-weight:800;padding:3px 7px;border-radius:50px;z-index:2;animation:flashPulse 1.5s infinite;}
@keyframes flashPulse{0%,100%{opacity:1;}50%{opacity:.6;}}
.pbadge-promo{position:absolute;top:7px;left:7px;background:#ff6b35;color:#fff;font-size:.62rem;font-weight:800;padding:3px 8px;border-radius:50px;z-index:2;}

/* TRUST BANNER */
.trust-banner{background:${dark?"#0f1f16":"#f0faf4"};border-bottom:1px solid ${dark?"#2a4030":"#c8f0d8"};padding:8px 20px;display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;}
.tb-item{display:flex;align-items:center;gap:5px;font-size:.72rem;font-weight:600;color:${dark?"#7aca94":"#1a6b3a"};}

/* HERO BADGES */
.hero-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
.hbadge{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);color:#fff;padding:5px 10px;border-radius:50px;font-size:.72rem;font-weight:600;}
.hbadge-green{background:rgba(79,209,125,.15);border-color:rgba(79,209,125,.3);color:#4fd17d;}
.hbadge-yellow{background:rgba(252,209,22,.12);border-color:rgba(252,209,22,.28);color:var(--yellow);}

/* PROD CARD BADGES */
.prod-badge-row{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px;}
.pb{padding:2px 6px;border-radius:4px;font-size:.58rem;font-weight:700;white-space:nowrap;}
.pb-fire{background:#fff0e6;color:#d4520a;}
.pb-truck{background:#e6f4ff;color:#0066cc;}
.pb-cash{background:#e6fff0;color:#1a6b3a;}

/* WHY SECTION */
.why-section{background:${dark?"#0f1a14":"#f8fbf9"};border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:28px 24px;}
.why-inner{max-width:1200px;margin:0 auto;}
.why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px;}
.why-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;text-align:center;}
.why-icon{font-size:2rem;margin-bottom:8px;}
.why-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;color:var(--ink);margin-bottom:4px;}
.why-desc{font-size:.72rem;color:var(--gray);line-height:1.55;}

/* SOCIAL PROOF */
.proof-bar{background:linear-gradient(135deg,#0d1f14,#1a3a24);padding:12px 24px;display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;}
.proof-item{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.85);font-size:.75rem;font-weight:600;}
.proof-num{font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;color:var(--yellow);}

/* HOME PREMIUM (accueil) */
.home-premium{position:relative;}
.hp-trust-marquee{display:flex;gap:0;overflow-x:auto;scrollbar-width:none;padding:11px 20px;background:linear-gradient(90deg,var(--green-pale),var(--surface));border-bottom:1px solid var(--border);-webkit-overflow-scrolling:touch;}
.hp-trust-marquee::-webkit-scrollbar{display:none;}
.hp-trust-node{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;padding:9px 20px;font-size:.7rem;font-weight:700;color:var(--green);white-space:nowrap;border-right:1px solid var(--border);}
.hp-trust-node:last-child{border-right:none;}

.hero.hp-hero-shell{background:linear-gradient(165deg,#030806 0%,#0e2418 38%,#174c2f 72%,#14221a 100%);padding:50px 24px 58px;}
.hero.hp-hero-shell::before{opacity:0;}
.hp-hero-aurora{pointer-events:none;position:absolute;inset:0;background:
  radial-gradient(ellipse 90% 52% at 12% 12%,rgba(252,209,22,.13) 0%,transparent 50%),
  radial-gradient(ellipse 68% 48% at 90% 40%,rgba(79,209,125,.17) 0%,transparent 50%),
  radial-gradient(circle at 48% 125%,rgba(26,107,58,.42) 0%,transparent 45%);}
.hero.hp-hero-shell .hero-inner{position:relative;z-index:1;}
.hero.hp-hero-shell h1{font-size:clamp(1.82rem,4.5vw,3.08rem);line-height:1.05;margin-bottom:12px;}
.hp-hero-sub{max-width:580px;color:rgba(255,255,255,.55)!important;}
.hp-hero-lead{font-size:.8rem;line-height:1.65;color:rgba(255,255,255,.44);max-width:540px;margin-bottom:18px;margin-top:-6px;}

.hp-chip-scroller{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
.hp-chip{display:flex;align-items:flex-start;gap:10px;padding:11px 15px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;text-align:left;font-family:inherit;transition:transform .2s,background .2s,border-color .2s;touch-action:manipulation;}
.hp-chip:hover{background:rgba(255,255,255,.12);transform:translateY(-2px);border-color:rgba(252,209,22,.42);}
.hp-chip-ico{font-size:1.22rem;line-height:1;}
.hp-chip-label{display:block;font-family:'Syne',sans-serif;font-weight:800;font-size:.8rem;}
.hp-chip-desc{display:block;font-size:.64rem;color:rgba(255,255,255,.44);margin-top:2px;}

.hp-cta-primary{box-shadow:0 8px 26px rgba(252,209,22,.38);}
.hp-cta-ghost{backdrop-filter:blur(8px);}
.hp-hero-ctas{margin-top:6px;}

.hp-stat{min-width:92px;}

.hp-search-panel{border-radius:20px;padding:24px 22px;background:rgba(8,18,12,.74);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(18px);box-shadow:0 28px 64px rgba(0,0,0,.42);}
.hp-panel-head{margin-bottom:12px;}
.hc-title{font-size:1rem;}
.hp-panel-sub{font-size:.72rem;color:rgba(255,255,255,.5);margin-top:7px;line-height:1.5;}
.hp-sbtn{font-family:'Syne',sans-serif;font-weight:800;font-size:.83rem;padding:12px;margin-top:2px;}
.hp-panel-bullets{margin:14px 0 0;padding-left:17px;font-size:.68rem;color:rgba(255,255,255,.58);line-height:1.55;}
.hp-panel-bullets li{margin-bottom:7px;}
.hp-inline-link{background:none;border:none;color:#7ef0a8;font-weight:700;cursor:pointer;text-decoration:underline;padding:0;font-size:inherit;font-family:inherit;}

.hp-mega-strip{background:var(--surface);border-bottom:1px solid var(--border);box-shadow:0 10px 32px var(--shadow);}
.hp-mega-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.hp-mega-tile{flex:1;min-width:104px;max-width:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:12px 8px;border-radius:14px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;font-size:.71rem;font-weight:800;color:var(--ink);font-family:inherit;transition:all .2s;touch-action:manipulation;}
.hp-mega-tile span:first-child{font-size:1.32rem;line-height:1;}
.hp-mega-tile:hover{border-color:var(--green-mid);color:var(--green);transform:translateY(-2px);}
.hp-mega-tile--accent{background:linear-gradient(135deg,var(--green-pale),#fff);border-color:var(--green-light);}

.hp-proof-bar{background:linear-gradient(92deg,#0a1510,#1a3826,#0a1510);}
.hp-quotes{background:var(--surface2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:26px 24px;}
.hp-quotes-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.hp-quote-card{margin:0;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px;}
.hp-quote-card blockquote{margin:0;font-size:.82rem;line-height:1.55;color:var(--ink);}
.hp-quote-card figcaption{display:flex;flex-direction:column;gap:3px;font-size:.72rem;color:var(--gray);}
.hp-quote-card figcaption strong{color:var(--green);}

.hp-flash-pill{background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;padding:4px 12px;border-radius:999px;font-size:.61rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;}
.hp-flash-banner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;background:linear-gradient(135deg,#111827,#422006);border-radius:16px;padding:17px 20px;margin-bottom:16px;border:1px solid rgba(251,146,60,.35);}
.hp-flash-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.02rem;color:#fff;}
.hp-flash-sub{font-size:.75rem;color:rgba(255,255,255,.55);margin-top:4px;}
.hp-flash-btn{background:var(--yellow);color:#0d1f14;border:none;padding:11px 20px;border-radius:11px;font-family:'Syne',sans-serif;font-weight:800;font-size:.79rem;cursor:pointer;touch-action:manipulation;}

.hp-bento{padding:38px 24px 46px;background:var(--bg);}
.hp-bento-header{max-width:720px;margin:0 auto 22px;text-align:center;}
.hp-bento-title{font-family:'Syne',sans-serif;font-size:clamp(1.28rem,2.8vw,1.72rem);font-weight:800;color:var(--ink);letter-spacing:-.55px;line-height:1.15;}
.hp-bento-sub{font-size:.84rem;color:var(--gray);margin-top:10px;line-height:1.6;}
.hp-bento-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(12,1fr);gap:13px;}
.hp-bento-card{grid-column:span 4;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:21px;display:flex;flex-direction:column;gap:7px;transition:box-shadow .22s,transform .22s;}
.hp-bento-card:hover{transform:translateY(-3px);box-shadow:0 16px 44px rgba(26,107,58,.13);}
.hp-bento-card--wide{grid-column:span 6;}
.hp-bento-card h3{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:var(--ink);}
.hp-bento-card p{font-size:.75rem;color:var(--gray);line-height:1.55;flex:1;}
.hp-bento-ico{font-size:1.85rem;line-height:1;}
.hp-bento-link{align-self:flex-start;margin-top:6px;background:none;border:none;color:var(--green);font-weight:800;font-size:.74rem;cursor:pointer;padding:0;font-family:inherit;border-bottom:1px solid transparent;}
.hp-bento-link:hover{border-bottom-color:var(--green);}

.hp-trust-inner{align-items:flex-start;}
.hp-ti{padding:10px;border-radius:12px;}

.hp-why-intro{text-align:center;margin-bottom:18px;}
.hp-why-kicker{display:inline-flex;padding:6px 15px;border-radius:999px;background:var(--green-pale);color:var(--green);font-size:.7rem;font-weight:800;margin-bottom:10px;}
.hp-why-heading{font-family:'Syne',sans-serif;font-size:clamp(1.2rem,2.5vw,1.52rem);font-weight:800;color:var(--ink);}
.hp-why-sub{font-size:.8rem;color:var(--gray);margin-top:9px;line-height:1.5;}

.hp-newsletter{border-radius:0!important;margin:0!important;position:relative;overflow:hidden;}
.hp-newsletter::before{content:'';position:absolute;inset:0;background:linear-gradient(118deg,rgba(26,107,58,.95),rgba(10,31,22,.94));z-index:0;}
.hp-newsletter .nl-title,.hp-newsletter .nl-sub{color:#fff!important;}
.hp-newsletter .nl-sub{opacity:.88;}
.hp-nl-form{display:flex!important;gap:10px;flex-wrap:wrap;justify-content:center;max-width:520px;margin:0 auto!important;}
.hp-nl-form .nl-input{flex:1;min-width:200px;background:rgba(255,255,255,.95);}
.hp-nl-success{display:inline-block;background:rgba(255,255,255,.22);border-radius:12px;padding:12px 22px;color:#fff;font-weight:700;}

@media(max-width:992px){
  .hp-bento-card,.hp-bento-card--wide{grid-column:span 6;}
}
@media(max-width:768px){
  .hp-quotes-inner{grid-template-columns:1fr;}
  .hp-mega-inner{justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;}
  .hp-mega-tile{flex:0 0 auto;min-width:118px;}
  .home-premium .hp-hero-grid{display:flex;flex-direction:column;}
  .home-premium .hp-search-panel{order:-1;}
}

/* WA STICKY */
.wa-sticky{display:none;position:fixed;bottom:0;left:0;right:0;z-index:450;background:var(--wa);padding:10px 16px;gap:8px;align-items:center;justify-content:center;box-shadow:0 -3px 16px rgba(0,0,0,.2);}
.wa-sticky-btn{background:#fff;color:#1a5c38;border:none;padding:8px 20px;border-radius:50px;font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;cursor:pointer;flex:1;max-width:260px;}
.wa-sticky-text{color:#fff;font-size:.75rem;font-weight:600;}

@media(max-width:768px){
  .topbar{display:none;}
  .navbar{padding:0 14px;height:56px;}
  .nav-search select{display:none;}
  .btn-ghost,.btn-green,.btn-red,.dark-toggle{display:none;}
  .hero-inner{grid-template-columns:1fr;}
  .hero-card{display:none;}
  .prod-grid{grid-template-columns:repeat(2,1fr);}
  .trust-inner{grid-template-columns:repeat(2,1fr);}
  .prest-grid,.blog-grid,.courses-grid{grid-template-columns:1fr;}
  .rewards-grid{grid-template-columns:repeat(2,1fr);}
  .biz-feats{grid-template-columns:1fr;}
  .why-grid{grid-template-columns:repeat(2,1fr);}
  .proof-bar{gap:14px;}
  .footer-grid{grid-template-columns:1fr;gap:22px;}
  .footer-trust-strip{justify-content:flex-start;padding-left:0;padding-right:0;}
  .dash-layout{grid-template-columns:1fr;padding:0 14px;gap:12px;}
  .dash-sidebar{
    display:flex;
    flex-direction:row;
    flex-wrap:nowrap;
    align-items:center;
    gap:8px;
    position:sticky;
    top:56px;
    z-index:200;
    width:100%;
    max-width:100%;
    height:auto;
    overflow-x:auto;
    overflow-y:hidden;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:thin;
    padding:10px 12px;
    border-radius:10px;
  }
  .dash-sidebar::-webkit-scrollbar{height:4px;}
  .dash-avatar,.dash-name,.dash-role-badge{display:none;}
  .dash-nav{display:flex;flex-direction:row;flex-wrap:nowrap;gap:4px;min-width:min-content;}
  .dash-nav-item{white-space:nowrap;flex-shrink:0;font-size:.72rem;padding:7px 10px;}
  .dash-nav-divider{display:none;width:0;height:0;margin:0;padding:0;border:none;}
  .dash-content{padding-left:0;min-width:0;}
  .dash-stats{grid-template-columns:repeat(2,1fr);}
  .mobile-nav{display:block;}
  .yorix-fab-stack{bottom:calc(80px + env(safe-area-inset-bottom));}
  .form-row{grid-template-columns:1fr;}
  .hero-badges{gap:6px;}
  .hbadge{font-size:.68rem;padding:4px 8px;}
  .trust-banner{gap:12px;padding:8px 14px;}
  .tb-item{font-size:.68rem;}
  .prod-badge-row{gap:3px;}
  .pb{font-size:.55rem;}
  .cart-page-grid{grid-template-columns:1fr;gap:12px;}
  .cart-page-summary{position:static;}
  .cart-page-item{align-items:flex-start;}
  .cart-page-thumb{width:82px;height:82px;}
  .cart-page-actions{flex-wrap:wrap;justify-content:flex-start;}
  .checkout-progress{padding:10px 6px;}
  .checkout-progress-node{width:min(22vw,80px);}
  .notif-drawer{top:56px;right:8px;width:calc(100vw - 16px);border-radius:14px;}
  .notif-hub-scroll--drop{max-height:min(48vh,380px);}
  .notif-hub--page .notif-hub-body{min-height:auto;}
  .notif-detail__actions{flex-direction:column;}
  .notif-detail__btn{width:100%;}
}
/* ========================================
   YORIX CM - MOBILE FIXES
   ======================================== */

html, body, #root {
  overflow-x: hidden;
  max-width: 100vw;
}

*{ box-sizing: border-box; }

img {
  max-width: 100%;
  height: auto;
}

button, a[role="button"], input[type="submit"] {
  min-height: 44px;
  touch-action: manipulation;
}

input, select, textarea {
  font-size: 16px !important;
  max-width: 100%;
}

@media (max-width: 768px) {

  body { font-size: 14px; padding-bottom: 70px; }

  h1 { font-size: 1.75rem !important; line-height: 1.2; }
  h2 { font-size: 1.4rem !important; line-height: 1.3; }
  h3 { font-size: 1.15rem !important; }

  .container, main, section {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  [class*="grid-cols-4"],
  [class*="grid-cols-3"] {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }

  nav {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  nav::-webkit-scrollbar { display: none; }

  form { width: 100%; padding: 12px; }
  form input, form select, form textarea {
    width: 100% !important;
    padding: 12px !important;
    margin-bottom: 10px !important;
    border-radius: 8px;
  }
  form button { width: 100%; padding: 14px !important; margin-top: 8px; }

  [role="dialog"], .modal {
    width: 95vw !important;
    max-width: 95vw !important;
    max-height: 90vh;
    overflow-y: auto;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  iframe[src*="whatsapp"],
  iframe[title*="chat"],
  [class*="chat"],
  [id*="whatsapp"] {
    bottom: 80px !important;
    right: 10px !important;
    transform: scale(0.8);
    transform-origin: bottom right;
  }

  .cart-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }
}

@media (max-width: 400px) {
  [class*="grid-cols-2"] {
    grid-template-columns: 1fr !important;
  }
  h1 { font-size: 1.5rem !important; }
}
/* =========================================================
   YORIX CM - FIX "VERSION ORDINATEUR FORCÉE" SUR MOBILE
   Ce bloc écrase toutes les largeurs fixes problématiques
   ========================================================= */

@media (max-width: 768px) {
  
  /* FORCE toutes les largeurs fixes à devenir flexibles */
  * {
    max-width: 100vw !important;
  }
  
  /* Écrase les min-width qui cassent tout */
  body, #root, main, section, header, footer, nav, aside, div {
    min-width: 0 !important;
  }
  
  /* TOPBAR : force le wrap */
  .topbar,
  [class*="topbar"],
  [class*="top-bar"] {
    flex-wrap: wrap !important;
    padding: 8px !important;
    font-size: 11px !important;
    gap: 6px !important;
    height: auto !important;
  }
  
  /* NAVBAR principale : scrollable horizontalement */
  header nav,
  .navbar,
  [class*="navbar"] {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  header nav::-webkit-scrollbar,
  .navbar::-webkit-scrollbar {
    display: none;
  }
  
  /* Tous les containers flex : permettre le wrap */
  [style*="display:flex"],
  [style*="display: flex"] {
    flex-wrap: wrap !important;
  }
  
  /* HERO / titre principal */
  h1 {
    font-size: 1.8rem !important;
    word-wrap: break-word;
  }
  /* =========================================================
   FIX CIBLÉ — NAVBAR + PAIEMENT SUR MOBILE
   ========================================================= */

@media (max-width: 768px) {
  
  /* ===== NAVBAR PRINCIPALE (Accueil, Produits, Livraison...) ===== */
  /* Force le scroll horizontal au lieu du chevauchement */
  
  nav, 
  .navbar,
  [class*="navbar"],
  header > div:nth-of-type(2),
  header nav {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    white-space: nowrap !important;
    gap: 4px !important;
    padding: 8px 10px !important;
    justify-content: flex-start !important;
  }
  
  nav::-webkit-scrollbar,
  .navbar::-webkit-scrollbar { 
    display: none !important; 
  }
  
  /* Chaque item de navbar : taille fixe lisible */
  nav a, 
  nav button,
  .navbar a,
  .navbar button {
    flex-shrink: 0 !important;
    font-size: 13px !important;
    padding: 6px 10px !important;
    white-space: nowrap !important;
    min-width: auto !important;
  }
  
  /* ===== BARRE PAIEMENT (MTN, Orange, Carte, Cash, J+1...) ===== */
  
  /* Cibler le conteneur "Paiement :" */
  div:has(> :is(.payment-btn, [class*="payment"])),
  [class*="payment"],
  [class*="paiement"] {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    padding: 8px !important;
    align-items: center !important;
  }
  
  /* Boutons de paiement + labels infos */
  [class*="payment"] > *,
  [class*="paiement"] > * {
    flex-shrink: 0 !important;
    font-size: 12px !important;
    padding: 6px 8px !important;
  }
  
  /* ===== TOPBAR (Cameroun CM | FR/EN | +237... | Aide | Contact) ===== */
  
  .topbar,
  [class*="topbar"] {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 6px !important;
    padding: 6px 10px !important;
    font-size: 11px !important;
    justify-content: space-between !important;
    height: auto !important;
  }
  
  /* ===== HEADER top (Yorix + search + icônes) ===== */
  
  header > div:first-of-type {
    flex-wrap: wrap !important;
    gap: 8px !important;
    padding: 8px !important;
  }
  
  /* Input de recherche prend la largeur dispo */
  header input[type="search"],
  header input[type="text"] {
    flex: 1 !important;
    min-width: 150px !important;
    font-size: 14px !important;
  }
}

/* ===== VERY SMALL (< 420px) ===== */
@media (max-width: 420px) {
  
  nav a, nav button {
    font-size: 12px !important;
    padding: 5px 8px !important;
  }
  
  .topbar, [class*="topbar"] {
    font-size: 10px !important;
  }
  
  /* Cacher textes secondaires si trop petit */
  .topbar [class*="help-text"],
  .topbar [class*="optional"] {
    display: none !important;
  }
}
/* =========================================================
   FIX NAVBAR .nav-tabs SUR MOBILE
   ========================================================= */

@media (max-width: 768px) {
  
  /* Navbar principale = .nav-tabs → scroll horizontal */
  .nav-tabs {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    white-space: nowrap !important;
    gap: 4px !important;
    padding: 6px 10px !important;
    width: 100% !important;
    max-width: 100vw !important;
    justify-content: flex-start !important;
  }
  
  .nav-tabs::-webkit-scrollbar {
    display: none !important;
  }
  
  /* Chaque onglet : taille fixe, ne se compresse pas */
  .nav-tabs .tab {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    font-size: 0.85rem !important;
    padding: 8px 12px !important;
    min-width: auto !important;
    display: inline-flex !important;
    align-items: center !important;
  }
  
  /* ═══ FIX PANIER YORIX — Override final ═══ */
.cart-drawer{display:flex !important;flex-direction:column !important;height:100vh !important;max-height:100vh !important;overflow:hidden !important;}
.cart-header,.cart-trust-bar,.cart-footer{flex-shrink:0 !important;}
.cart-items{flex:1 1 auto !important;overflow-y:auto !important;overflow-x:hidden !important;min-height:0 !important;padding:12px 16px !important;}
.cart-items::-webkit-scrollbar{width:6px;}
.cart-items::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
.cart-items::-webkit-scrollbar-track{background:transparent;}
.cart-footer{border-top:1px solid var(--border);background:var(--surface);padding:14px 16px !important;max-height:55vh;overflow-y:auto;}

.cart-item{display:flex !important;gap:12px !important;padding:12px !important;background:var(--surface) !important;border:1px solid var(--border) !important;border-radius:12px !important;margin-bottom:10px !important;position:relative;}
.cart-item:hover{border-color:var(--green-light) !important;}
.ci-img{width:70px !important;height:70px !important;flex-shrink:0 !important;border-radius:10px !important;overflow:hidden !important;background:var(--surface2) !important;display:flex !important;align-items:center !important;justify-content:center !important;}
.ci-img img{width:100% !important;height:100% !important;object-fit:cover !important;}
.ci-info{flex:1 !important;min-width:0 !important;display:flex !important;flex-direction:column !important;gap:3px !important;}
.ci-name{font-family:'Syne',sans-serif !important;font-weight:700 !important;font-size:.88rem !important;color:var(--ink) !important;line-height:1.3 !important;overflow:hidden !important;text-overflow:ellipsis !important;display:-webkit-box !important;-webkit-line-clamp:2 !important;-webkit-box-orient:vertical !important;padding-right:24px !important;}
.ci-vendeur{font-size:.68rem !important;color:var(--gray) !important;}
.ci-meta{display:flex !important;gap:4px !important;flex-wrap:wrap !important;margin-top:2px !important;}
.ci-tag{font-size:.6rem !important;padding:2px 7px !important;border-radius:20px !important;background:var(--surface2) !important;color:var(--gray) !important;font-weight:600 !important;}
.ci-tag-stock-ok{background:var(--green-pale) !important;color:var(--green) !important;}
.ci-tag-stock-low{background:#fff3e0 !important;color:#d97706 !important;}
.ci-tag-stock-out{background:#ffebee !important;color:#ce1126 !important;}
.ci-bottom{display:flex !important;justify-content:space-between !important;align-items:center !important;margin-top:6px !important;gap:8px !important;}
.ci-price-block{display:flex !important;flex-direction:column !important;min-width:0 !important;}
.ci-unit-price{font-size:.64rem !important;color:var(--gray) !important;}
.ci-total-price{font-family:'Syne',sans-serif !important;font-weight:800 !important;font-size:.95rem !important;color:var(--green) !important;}
.ci-qty{display:flex !important;align-items:center !important;gap:4px !important;background:var(--surface2) !important;border-radius:8px !important;padding:2px !important;flex-shrink:0 !important;}
.qty-btn{width:26px !important;height:26px !important;border:none !important;background:var(--surface) !important;border-radius:6px !important;cursor:pointer !important;font-weight:700 !important;font-size:.9rem !important;color:var(--ink) !important;display:flex !important;align-items:center !important;justify-content:center !important;}
.qty-btn:hover{background:var(--green) !important;color:#fff !important;}
.qty-val{min-width:22px !important;text-align:center !important;font-weight:700 !important;font-size:.82rem !important;color:var(--ink) !important;}
.ci-del{position:absolute !important;top:8px !important;right:8px !important;width:26px !important;height:26px !important;border:none !important;background:transparent !important;color:var(--gray) !important;cursor:pointer !important;border-radius:6px !important;font-size:.85rem !important;display:flex !important;align-items:center !important;justify-content:center !important;}
.ci-del:hover{background:#ffebee !important;color:#ce1126 !important;}
}

/* =========================================================
   YORIX PREMIUM MARKETING — breadcrumbs, escrow, help, business
   ========================================================= */
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.yorix-pro-page{padding-top:4px;padding-bottom:32px;}
.loy-page.sec{overflow-x:hidden;}
.loy-page.yorix-pro-page.sec{background:${dark?"linear-gradient(185deg,var(--bg) 0%,#121f16 92%)":"linear-gradient(180deg,var(--bg) 0%,var(--sand) 100%)"};padding-bottom:40px;}
.yorix-loy-hero-bleed{width:100vw;max-width:none;position:relative;left:50%;margin-left:-50vw;box-sizing:border-box;padding-inline:clamp(18px,calc(env(safe-area-inset-left) + 14px),32px);padding-block:0 clamp(8px,1.8vw,12px);}
.yorix-loy-hero-bleed--guest{padding-bottom:clamp(32px,5vw,48px);}
.yorix-loy-hero-bleed--guest::before{content:'';position:absolute;left:4%;right:4%;bottom:-24%;pointer-events:none;height:clamp(200px,45vw,360px);background:radial-gradient(ellipse 85% 50% at 50% 0%,rgba(39,168,90,.13),transparent 72%);opacity:${dark?".42":".95"};}
.yorix-loy-hero-inner{max-width:1200px;margin:0 auto;width:100%;}
.yorix-loy-body-stack{background:var(--surface)!important;border:1px solid var(--border);border-radius:clamp(18px,2.2vw,24px)!important;padding:clamp(22px,3.8vw,34px)!important;box-shadow:${dark?"0 20px 48px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04)":"0 22px 50px rgba(13,31,20,.09),inset 0 1px 0 rgba(255,255,255,.92)"}!important;}
@media(max-width:600px){.yorix-loy-body-stack{border-radius:16px!important;padding:18px 14px!important;}}
.yorix-loy-page-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.55rem,4.8vw,2.25rem);line-height:1.1;color:#fff;margin:8px 0 10px;padding:0;letter-spacing:-.8px;text-shadow:0 8px 32px rgba(0,0,0,.32);}
.yorix-loy-kpi-lead{font-size:.84rem;line-height:1.6;color:rgba(255,255,255,.62);margin:0 0 6px;padding:0;max-width:min(44ch,100%);}
.yorix-level-badge{display:inline-flex!important;align-items:center;gap:4px!important;padding:4px 10px!important;border-radius:999px;font-weight:800!important;font-family:'Syne',sans-serif!important;line-height:1.2!important;font-size:.68rem!important;box-sizing:border-box;}
.yorix-level-badge--lg{gap:7px!important;padding:10px 18px!important;font-size:.92rem!important;box-shadow:0 14px 32px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.4)!important;text-shadow:0 1px 0 rgba(255,255,255,.08);}
.yorix-bc-row{margin-bottom:14px;}
.yorix-bc{margin:0 0 16px;}
.yorix-bc__list{display:flex;flex-wrap:wrap;align-items:center;gap:2px 2px;margin:0;padding:0;font-size:.72rem;list-style:none;}
.yorix-bc__segment,.yorix-bc__item{display:inline-flex;align-items:center;gap:6px;}
.yorix-bc__link,.yorix-bc__current{font-family:'DM Sans',sans-serif;font-size:.72rem;}
.yorix-bc__link{background:none;border:none;padding:0;color:var(--green);font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
.yorix-bc__link:hover{color:var(--green-mid);}
.yorix-bc__current{color:var(--gray);font-weight:600;cursor:default;text-decoration:none;}
.yorix-bc__sep{display:inline;color:var(--gray);opacity:.45;font-weight:500;font-size:.85em;margin-left:2px;margin-right:2px;user-select:none;}
.loy-page .yorix-bc-row--loy{margin-bottom:clamp(14px,2.4vw,20px);}
.loy-page .yorix-bc-row--loy .yorix-bc{margin-bottom:0;}
.loy-page .yorix-bc-row--loy .yorix-bc__list{font-size:.78rem;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:10px 20px 10px 18px;box-shadow:var(--yorix-sh-sm);gap:4px 2px;width:fit-content;max-width:100%;}
.loy-page .yorix-bc-row--loy .yorix-bc__sep{opacity:.4;margin-left:8px;margin-right:8px;}
.loy-shell{display:flex;flex-direction:column;gap:clamp(20px,2.8vw,28px);width:100%;min-width:0;}

.yorix-sec-heading{font-family:'Syne',sans-serif;font-size:clamp(1.15rem,2vw,1.45rem);font-weight:800;color:var(--ink);letter-spacing:-.4px;margin:0 0 18px;line-height:1.2;}
.sec-link-btn{background:none;border:none;padding:0;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:700;color:var(--green);cursor:pointer;border-bottom:1px solid var(--green-light);}
.sec-link-btn:hover{color:var(--green-mid);}
.yorix-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);background:var(--surface2);color:var(--ink);padding:8px 12px;border-radius:50px;font-size:.72rem;font-weight:600;cursor:default;font-family:'DM Sans',sans-serif;}
button.yorix-chip{cursor:pointer;transition:border-color .2s,background .2s;}
button.yorix-chip:hover{background:var(--green-pale);border-color:var(--green);}
.yorix-chip.wa{border-color:rgba(37,211,102,.35);background:rgba(37,211,102,.08);color:#0d5c2e;}
button.yorix-chip.wa:hover{background:rgba(37,211,102,.14);border-color:var(--wa);}

.yorix-details{background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;overflow:hidden;}
.yorix-details summary{cursor:pointer;padding:14px 16px;font-weight:700;font-size:.84rem;color:var(--ink);font-family:'DM Sans',sans-serif;list-style:none;}
.yorix-details summary::-webkit-details-marker{display:none;}
.yorix-details summary::after{content:'+';float:right;font-weight:800;color:var(--gray);transition:transform .2s;}
.yorix-details[open] summary::after{transform:rotate(45deg);}
.yorix-details p{padding:0 16px 16px;font-size:.82rem;line-height:1.7;color:var(--gray);margin:0;}

.yorix-esc-hero{background:linear-gradient(145deg,#060d0a 0%,#0d3320 38%,var(--green) 100%);padding:36px 24px 48px;color:#fff;border-radius:0;margin:0 calc(-1 * max(12px, env(safe-area-inset-left))) 0 calc(-1 * max(12px, env(safe-area-inset-right)));max-width:none;}
@media (min-width:901px){.yorix-esc-hero{border-radius:0 0 20px 20px;margin:0 -24px;}}
.escrow-premium-root .yorix-esc-hero .yorix-bc{margin-bottom:18px;}
.escrow-premium-root .yorix-bc__current,.escrow-premium-root .yorix-bc__link{color:rgba(255,255,255,.92);}
.escrow-premium-root .yorix-bc__link{color:#b7e4c7;}
.escrow-premium-root .yorix-bc__sep{color:rgba(255,255,255,.25);}
.yorix-esc-hero-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.1fr minmax(240px,.9fr);gap:32px;align-items:center;}
.yorix-esc-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(252,209,22,.12);border:1px solid rgba(252,209,22,.35);color:var(--yellow);padding:6px 14px;border-radius:50px;font-size:.7rem;font-weight:700;margin-bottom:14px;}
.yorix-esc-h1{font-family:'Syne',sans-serif;font-size:clamp(1.65rem,3vw,2.5rem);font-weight:800;line-height:1.12;letter-spacing:-1px;margin:0 0 14px;}
.yorix-esc-h1 em{color:#7ef0a8;font-style:normal;}
.yorix-esc-sub{font-size:.9rem;line-height:1.72;color:rgba(255,255,255,.72);margin:0 0 22px;max-width:52ch;}
.yorix-esc-hero-cta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;}
.yorix-esc-badge-row{display:flex;flex-wrap:wrap;gap:8px;}
.yorix-trust-pill{font-size:.66rem;font-weight:700;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);padding:6px 12px;border-radius:50px;}
.yorix-esc-hero-visual{display:flex;justify-content:center;align-items:center;}
.yorix-esc-card-float{background:rgba(255,255,255,.08);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:22px 20px;width:100%;max-width:320px;box-shadow:0 24px 48px rgba(0,0,0,.2);}
.yorix-esc-mini-label{font-family:'Syne',sans-serif;font-size:.74rem;font-weight:800;color:rgba(255,255,255,.55);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em;}
.yorix-esc-mini-flow{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:.8rem;color:rgba(255,255,255,.88);}
.yorix-esc-mini-flow li{display:flex;align-items:center;gap:10px;line-height:1.35;}
.yorix-esc-mini-flow span{flex-shrink:0;width:26px;height:26px;border-radius:8px;background:rgba(252,209,22,.22);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.72rem;color:#fff;}
.yorix-esc-steps-sec{padding-top:40px!important;}
.yorix-step-rail{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media (max-width:900px){.yorix-step-rail{grid-template-columns:1fr 1fr;}}
@media (max-width:520px){.yorix-step-rail{grid-template-columns:1fr;}}
.yorix-step-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 16px 20px;position:relative;transition:box-shadow .2s;border-top:3px solid var(--green);}
.yorix-step-card:hover{box-shadow:0 12px 32px rgba(26,107,58,.08);}
.yorix-step-num{display:inline-block;font-family:'Syne',sans-serif;font-size:.75rem;font-weight:800;color:var(--green);margin-bottom:8px;}
.yorix-step-card h3{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:800;margin:0 0 8px;color:var(--ink);}
.yorix-step-card p{margin:0;font-size:.76rem;line-height:1.65;color:var(--gray);}
.yorix-duo-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media (max-width:720px){.yorix-duo-cards{grid-template-columns:1fr;}}
.yorix-panel{background:var(--surface);border-radius:14px;padding:22px;border:1px solid var(--border);}
.yorix-panel h3{font-family:'Syne',sans-serif;font-size:1rem;font-weight:800;margin:0 0 14px;color:var(--ink);}
.yorix-panel ul{margin:0;padding-left:18px;color:var(--gray);font-size:.82rem;line-height:1.75;}
.yorix-panel li{margin-bottom:8px;}
.yorix-panel--buy{border-left:4px solid #1565c0;background:${dark?"#151d24":"linear-gradient(180deg,#fafdff 0%,var(--surface) 100%)"};}
.yorix-panel--sell{border-left:4px solid var(--green);background:${dark?"#151f18":"linear-gradient(180deg,#f4fff8 0%,var(--surface) 100%)"};}
.yorix-esc-faq{padding-bottom:40px!important;}
.yorix-products-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;border-bottom:1px solid var(--border);padding-bottom:12px;}
.yorix-products-head h2{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:800;margin:0;color:var(--ink);}
@media (max-width:900px){.yorix-esc-hero-grid{grid-template-columns:1fr;}}

.yorix-bus-hero{background:linear-gradient(135deg,#0a1410 0%,#102a1a 45%,#1a5c38 100%);color:#fff;padding:40px 24px 44px;border-radius:0;margin:0 -24px 28px;position:relative;overflow:hidden;}
.yorix-bus-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(252,209,22,.12) 0%,transparent 45%);}
.yorix-bus-hero > *{position:relative;z-index:1;}
.yorix-bus-hero .yorix-bc{margin-bottom:16px;}
.yorix-bus-hero .yorix-bc__current{color:rgba(255,255,255,.75);}
.yorix-bus-hero .yorix-bc__link{color:#b7e4c7;}
.yorix-bus-h1{font-family:'Syne',sans-serif;font-size:clamp(1.6rem,2.8vw,2.35rem);font-weight:800;line-height:1.13;letter-spacing:-.8px;margin:0 0 14px;}
.yorix-bus-h1 span{color:var(--yellow);}
.yorix-bus-lead{font-size:.9rem;line-height:1.75;color:rgba(255,255,255,.72);margin:0 0 22px;max-width:58ch;}
.yorix-bus-cta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px;}
.yorix-bus-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media (max-width:720px){.yorix-bus-metrics{grid-template-columns:1fr;}}
.yorix-bus-metric{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:6px;}
.yorix-bus-metric strong{font-family:'Syne',sans-serif;font-size:.76rem;color:#fff;}
.yorix-bus-metric span{font-size:.68rem;color:rgba(255,255,255,.55);line-height:1.45;}
.yorix-bus-pillars{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
@media (max-width:640px){.yorix-bus-pillars{grid-template-columns:1fr;}}
.yorix-bus-pillar{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;transition:transform .2s,box-shadow .2s;}
.yorix-bus-pillar:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(26,107,58,.1);}
.yorix-bus-pillar-ico{font-size:1.8rem;margin-bottom:10px;}
.yorix-bus-pillar h3{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;margin:0 0 8px;color:var(--ink);}
.yorix-bus-pillar p{margin:0;font-size:.8rem;line-height:1.65;color:var(--gray);}

.yorix-acad-hero{text-align:center;background:linear-gradient(180deg,var(--surface) 0%,var(--surface2) 100%);border:1px solid var(--border);border-radius:18px;padding:36px 22px 32px;margin-bottom:28px;}
.yorix-acad-h1{font-family:'Syne',sans-serif;font-size:clamp(1.45rem,2.5vw,2rem);font-weight:800;color:var(--ink);line-height:1.15;margin:0 0 12px;letter-spacing:-.5px;}
.yorix-acad-h1 span{color:var(--green);}
.yorix-acad-sub{font-size:.88rem;color:var(--gray);line-height:1.7;max-width:640px;margin:0 auto 16px;}
.yorix-acad-tracks{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}

.yorix-trust-badges{display:flex;gap:10px;overflow-x:auto;scrollbar-width:thin;-webkit-overflow-scrolling:touch;padding-bottom:6px;}

.yorix-loy-panel-guest{border-radius:clamp(18px,2vw,24px);text-align:center;color:#fff;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.18);background:linear-gradient(135deg,#143220 0%,var(--green) 55%,#1f8f4f 100%);padding:clamp(36px,5vw,48px) clamp(22px,4vw,40px);box-shadow:0 32px 64px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.1);}
.yorix-loy-ico-big{font-size:3.75rem;line-height:1;margin-bottom:16px;text-shadow:0 8px 24px rgba(0,0,0,.25);}
.yorix-loy-h2{font-family:'Syne',sans-serif;font-size:clamp(1.45rem,2.5vw,1.85rem);font-weight:800;margin:0 0 10px;letter-spacing:-.5px;line-height:1.15;}
.yorix-loy-p{color:rgba(255,255,255,.72);font-size:.9rem;line-height:1.68;max-width:480px;margin:0 auto 22px;}
.yorix-loy-cta-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
.yorix-loy-dash-wrap{margin-bottom:4px;border-radius:clamp(20px,2.4vw,26px);padding:clamp(12px,1.9vw,18px);color:#fff;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.2);background:linear-gradient(135deg,#0c1f14 0%,#152e1f 38%,var(--green) 64%,#1f8f51 100%);box-shadow:0 32px 64px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.12);}
.yorix-loy-dash-wrap::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 55% at 18% -10%,rgba(252,209,22,.16),transparent 52%),radial-gradient(circle at 92% 88%,rgba(255,255,255,.06),transparent 42%);}
.yorix-loy-dash-deco,.yorix-loy-dash-deco--b{position:absolute;border-radius:50%;pointer-events:none;}
.yorix-loy-dash-deco{width:190px;height:190px;top:-36px;right:-36px;background:rgba(252,209,22,.1);}
.yorix-loy-dash-deco--b{width:168px;height:168px;bottom:-44px;left:-38px;background:rgba(255,255,255,.07);}
.yorix-loy-panel-guest::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 90% 70% at 50% -30%,rgba(252,209,22,.18),transparent 55%);pointer-events:none;}
.yorix-loy-guest-perks{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:20px auto 0;max-width:560px;}
.yorix-loy-guest-perk{background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.2);border-radius:50px;padding:7px 14px;font-size:.7rem;font-weight:700;color:rgba(255,255,255,.88);letter-spacing:.02em;}
.yorix-loy-inner{position:relative;z-index:2;background:rgba(0,0,0,.14);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:clamp(14px,1.8vw,17px);padding:clamp(20px,3.4vw,30px);border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);}
.yorix-loy-kpi-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px 20px;flex-wrap:wrap;margin-bottom:clamp(14px,2vw,18px);}
.yorix-loy-kpi-label{display:block;font-size:.61rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:rgba(252,209,22,.78);}
.yorix-loy-kpi-sub{font-family:'Syne',sans-serif;font-size:clamp(1.08rem,2.4vw,1.28rem);font-weight:800;color:rgba(255,255,255,.96);margin-top:6px;line-height:1.2;}
.yorix-loy-big-pts{font-family:'Syne',sans-serif;font-size:clamp(2.35rem,6vw,3.25rem);font-weight:800;color:var(--yellow);line-height:1;margin-bottom:10px;text-shadow:0 4px 32px rgba(0,0,0,.35),0 0 40px rgba(252,209,22,.2);}
.yorix-loy-big-pts .yorix-loy-pts-suffix{font-size:1.1rem;font-weight:700;color:rgba(255,255,255,.55);vertical-align:super;margin-left:4px;}
.yorix-loy-meta{font-size:.8rem;line-height:1.55;color:rgba(255,255,255,.78);margin-bottom:16px;max-width:62ch;}
.yorix-loy-meta strong{font-weight:800;color:rgba(255,255,255,.95);}
.yorix-loy-progress{height:12px;border-radius:50px;background:rgba(0,0,0,.28);overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,.22);}
.yorix-loy-progress-bar{height:100%;border-radius:50px;background:linear-gradient(90deg,#c9a010,var(--yellow),#fff9c4);transition:width .85s cubic-bezier(.4,0,.2,1);box-shadow:0 0 16px rgba(252,209,22,.35);}
.yorix-loy-actions{display:flex;gap:12px;margin-top:clamp(20px,2.8vw,24px);flex-wrap:wrap;}
.yorix-loy-btn-pri,.yorix-loy-btn-sec{-webkit-appearance:none;appearance:none;display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:1.2;}
.yorix-loy-btn-pri{flex:1;min-width:min(148px,100%);background:linear-gradient(180deg,#ffe566,var(--yellow) 42%,#e8b800);color:#0d1f14;border:none;padding:13px 20px;border-radius:var(--yorix-r-md);font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;letter-spacing:.02em;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.45);transition:transform .18s,filter .18s;}
.yorix-loy-btn-pri:hover{filter:brightness(1.05);transform:translateY(-2px);}
.yorix-loy-btn-pri:active{transform:translateY(0);}
.yorix-loy-btn-sec{flex:1;min-width:min(148px,100%);background:rgba(255,255,255,.12);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,.35);padding:13px 20px;border-radius:var(--yorix-r-md);font-family:'Syne',sans-serif;font-weight:800;font-size:.81rem;letter-spacing:.02em;cursor:pointer;transition:background .2s,border-color .2s;}
.yorix-loy-btn-sec:hover{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.5);}
.loy-page .loy-stats-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:clamp(12px,1.8vw,16px)!important;margin-bottom:22px;width:100%;}
@media(max-width:900px){.loy-page .loy-stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}}
@media(max-width:380px){.loy-page .loy-stats-grid{grid-template-columns:1fr!important;}}
.loy-stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--yorix-r-lg);padding:18px 12px;text-align:center;box-shadow:var(--yorix-sh-sm);transition:transform .18s,border-color .2s,box-shadow .2s;}
.loy-page .loy-stat-card{border-top:3px solid var(--green-mid);}
.loy-stat-card:hover{border-color:var(--green-mid);transform:translateY(-3px);box-shadow:var(--yorix-sh-md);}
.loy-stat-ico{font-size:1.85rem;line-height:1;margin-bottom:10px;filter:${dark?"brightness(1.08)":"none"};}
.loy-stat-val{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.15rem,2.6vw,1.35rem);color:var(--ink);}
.loy-stat-lbl{font-size:.7rem;color:var(--gray);font-weight:700;margin-top:5px;text-transform:uppercase;letter-spacing:.04em;}
.loy-howto{background:linear-gradient(160deg,var(--green-pale) 0%,var(--surface) 48%);border:1px solid var(--border);border-radius:var(--yorix-r-xl);padding:clamp(22px,3vw,28px);margin-bottom:8px;box-shadow:var(--yorix-sh-md);border-top:3px solid var(--green-mid);}
.loy-howto-title{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.02rem,2vw,1.12rem);color:var(--green);margin-bottom:18px;display:flex;align-items:center;gap:8px;letter-spacing:-.25px;line-height:1.25;}
.loy-page .loy-howto-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:clamp(14px,2vw,18px)!important;width:100%;}
@media(max-width:720px){.loy-page .loy-howto-grid{grid-template-columns:1fr!important;}}
.loy-howto-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--yorix-r-md);padding:18px 14px;text-align:center;box-shadow:var(--yorix-sh-sm);transition:border-color .2s;}
.loy-howto-card:hover{border-color:var(--green-light);}
.loy-howto-emoji{font-size:2.1rem;margin-bottom:10px;line-height:1;}
.loy-howto-h{font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;color:var(--ink);margin-bottom:6px;}
.loy-howto-d{font-size:.76rem;color:var(--gray);line-height:1.55;}
.loy-page .loy-tabs{display:flex!important;flex-wrap:nowrap;gap:6px;margin-bottom:22px;padding:6px;background:var(--surface2);border-radius:var(--yorix-r-lg);border:1px solid var(--border);box-shadow:var(--yorix-sh-sm);overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;width:100%;min-width:0;}
.loy-tabs::-webkit-scrollbar{display:none;}
.loy-tab{flex:1;min-width:fit-content;background:transparent;border:none;cursor:pointer;padding:12px 18px;border-radius:var(--yorix-r-md);font-family:'Syne',sans-serif;font-weight:700;font-size:.78rem;color:var(--gray);white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s;}
.loy-tab:hover{color:var(--ink);background:var(--surface2);}
.loy-tab.is-active{background:var(--surface);color:var(--green);box-shadow:var(--yorix-sh-sm);border:1px solid var(--border);}
.loy-tab-count{opacity:.55;font-size:.72rem;font-weight:600;margin-left:4px;}
.loy-page .rewards-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(176px,1fr))!important;gap:16px!important;width:100%;}
.loy-page .reward-card{border-radius:var(--yorix-r-lg);padding:20px 16px;border:1px solid var(--border);box-shadow:var(--yorix-sh-sm);transition:transform .22s,box-shadow .22s,border-color .22s;}
.loy-page .reward-card:hover{transform:translateY(-4px);box-shadow:var(--yorix-sh-md);border-color:rgba(79,209,125,.45);}
.loy-page .reward-card.is-locked{opacity:.92;}
.loy-reward-val-badge{position:absolute;top:12px;right:12px;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;font-size:.58rem;font-weight:800;padding:5px 9px;border-radius:8px;box-shadow:0 4px 12px rgba(26,107,58,.25);}
.loy-page .reward-icon{width:56px;height:56px;margin:4px auto 12px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:1.65rem;}
.loy-page .reward-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.84rem;line-height:1.25;color:var(--ink);margin-bottom:6px;}
.loy-page .reward-desc{font-size:.72rem;color:var(--gray);line-height:1.5;margin-bottom:10px;min-height:2.15em;}
.loy-page .reward-pts{font-family:'Syne',sans-serif;font-weight:800;font-size:.92rem;margin-bottom:12px;}
.loy-page .reward-btn{border-radius:var(--yorix-r-md);padding:11px;font-size:.76rem;font-weight:800;font-family:'Syne',sans-serif;transition:filter .15s,transform .15s;}
.loy-page .reward-btn:hover:not(:disabled){transform:translateY(-1px);}
.loy-page .reward-btn--afford{background:var(--green)!important;color:#fff!important;border:none!important;}
.loy-page .reward-btn--locked{background:var(--surface2)!important;color:var(--gray)!important;border:1px solid var(--border)!important;}
.loy-page .loy-packs-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(216px,1fr))!important;gap:18px!important;width:100%;}
.loy-pack-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--yorix-r-xl);padding:22px 18px 18px;cursor:pointer;position:relative;transition:transform .22s,box-shadow .22s,border-color .22s;text-align:center;box-shadow:var(--yorix-sh-sm);}
.loy-pack-card:hover{transform:translateY(-5px);box-shadow:var(--yorix-sh-md);}
.loy-pack-card--deal{border-color:rgba(252,209,22,.65);background:linear-gradient(180deg,var(--surface) 0%,rgba(252,209,22,.07) 100%);}
.loy-pack-card--pop{border-color:rgba(39,168,90,.55);}
.loy-pack-card--new{border-color:rgba(124,58,237,.35);}
.loy-pack-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:.56rem;font-weight:800;padding:6px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:.08em;font-family:'Syne',sans-serif;white-space:nowrap;box-shadow:var(--yorix-sh-sm);}
.loy-pack-badge--deal{background:var(--yellow);color:#0d1f14;}
.loy-pack-badge--pop{background:var(--green);color:#fff;}
.loy-pack-badge--new{background:#7c3aed;color:#fff;}
.loy-pack-emoji-wrap{width:72px;height:72px;border-radius:20px;display:flex;align-items:center;justify-content:center;margin:10px auto 14px;font-size:2.35rem;}
.loy-pack-title{font-family:'Syne',sans-serif;font-weight:800;font-size:.91rem;color:var(--ink);margin-bottom:8px;line-height:1.25;}
.loy-pack-pts{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:var(--green);line-height:1;}
.loy-pack-bonus{text-align:center;font-size:.72rem;color:#b45309;font-weight:700;margin-top:6px;}
.loy-pack-price{font-size:.93rem;font-weight:800;color:var(--ink);margin-top:10px;font-family:'Syne',sans-serif;}
.loy-pack-unit{font-size:.64rem;color:var(--gray);margin-top:4px;}
.loy-pack-buy{width:100%;margin-top:14px;background:var(--green);color:#fff;border:none;padding:11px;border-radius:var(--yorix-r-md);font-family:'Syne',sans-serif;font-weight:800;font-size:.76rem;pointer-events:none;box-shadow:0 6px 18px rgba(26,107,58,.28);}
.loy-history{border-radius:var(--yorix-r-lg);overflow:hidden;border:1px solid var(--border);background:var(--surface);box-shadow:var(--yorix-sh-sm);}
.loy-history-row{display:flex;align-items:center;gap:14px;padding:15px 18px;border-bottom:1px solid var(--border);transition:background .14s;}
.loy-history-row:last-child{border-bottom:none;}
.loy-history-row:hover{background:var(--surface2);}
.loy-history-ico{width:44px;height:44px;border-radius:14px;background:linear-gradient(145deg,var(--surface2),var(--surface));border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
.loy-history-body{flex:1;min-width:0;}
.loy-history-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;color:var(--ink);}
.loy-history-sub{font-size:.71rem;color:var(--gray);margin-top:4px;line-height:1.45;}
.loy-history-pts{text-align:right;flex-shrink:0;}
.loy-history-amt{font-family:'Syne',sans-serif;font-weight:800;font-size:.98rem;}
.loy-history-amt--gain{color:var(--green);}
.loy-history-amt--loss{color:var(--red);}
.loy-history-date{font-size:.63rem;color:var(--gray);margin-top:3px;}
.loy-codes-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.05rem;color:var(--ink);margin:32px 0 14px;letter-spacing:-.3px;}
.loy-page .loy-codes-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(252px,1fr))!important;gap:14px!important;width:100%;}
.loy-code-card{background:var(--surface);border:2px dashed rgba(79,209,125,.65);border-radius:var(--yorix-r-md);padding:16px 18px;box-shadow:var(--yorix-sh-sm);}
.loy-code-name{font-size:.75rem;color:var(--gray);margin-bottom:8px;font-weight:600;}
.loy-code-val{font-family:'Syne',sans-serif;font-weight:800;font-size:1.08rem;color:var(--green);letter-spacing:.06em;}
.loy-code-meta{display:flex;justify-content:space-between;gap:8px;margin-top:12px;font-size:.66rem;color:var(--gray);flex-wrap:wrap;}

/* =========================================================
   YORIX REWARDS — Refonte premium (V2)
   prefix: .yorix-loy-v2 / .yloy-*
   ========================================================= */
.yorix-loy-v2{display:block;background:${dark?"linear-gradient(180deg,#0a1410 0%,#0d1a12 100%)":"linear-gradient(180deg,#fbfaf7 0%,#f3efe7 100%)"};color:var(--ink);padding:0 0 clamp(40px,6vw,72px);overflow-x:hidden;}
.yorix-loy-v2 .yloy-section-inner{max-width:1200px;margin:0 auto;padding:0 clamp(16px,3vw,28px);width:100%;box-sizing:border-box;}
.yorix-loy-v2 .yloy-section{padding:clamp(40px,6vw,72px) 0;position:relative;}
.yorix-loy-v2 .yloy-section--tinted{background:${dark?"linear-gradient(180deg,#0d1a12 0%,#101f17 50%,#0d1a12 100%)":"linear-gradient(180deg,#fbfaf7 0%,#eef1ec 50%,#fbfaf7 100%)"};}

.yorix-loy-v2 .yloy-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'Syne',sans-serif;font-size:.7rem;font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.16em;margin-bottom:14px;}
.yorix-loy-v2 .yloy-eyebrow--on-dark{color:rgba(252,209,22,.85);}
.yorix-loy-v2 .yloy-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--yellow);box-shadow:0 0 14px rgba(252,209,22,.65);}
.yorix-loy-v2 .yloy-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(2rem,5.2vw,3.4rem);line-height:1.06;letter-spacing:-1.4px;margin:0 0 16px;color:#fff;text-wrap:balance;}
.yorix-loy-v2 .yloy-h1 em{font-style:normal;background:linear-gradient(135deg,#ffe566 0%,var(--yellow) 50%,#f1b805 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
.yorix-loy-v2 .yloy-h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.45rem,3vw,2.05rem);line-height:1.12;letter-spacing:-.7px;color:var(--ink);margin:0 0 12px;text-wrap:balance;}
.yorix-loy-v2 .yloy-h2 em{font-style:normal;color:var(--green);}
.yorix-loy-v2 .yloy-h2--on-dark{color:#fff;}
.yorix-loy-v2 .yloy-h2--on-dark em{background:linear-gradient(135deg,#ffe566,var(--yellow));-webkit-background-clip:text;background-clip:text;color:transparent;}
.yorix-loy-v2 .yloy-h2--center{text-align:center;}
.yorix-loy-v2 .yloy-sub{font-size:clamp(.92rem,1.6vw,1.02rem);line-height:1.7;color:rgba(255,255,255,.72);margin:0 0 22px;max-width:54ch;}
.yorix-loy-v2 .yloy-sub--on-dark{color:rgba(255,255,255,.74);}
.yorix-loy-v2 .yloy-sub strong{color:#fff;font-weight:700;}
.yorix-loy-v2 .yloy-lead{font-size:clamp(.88rem,1.4vw,.95rem);line-height:1.7;color:var(--gray);max-width:62ch;margin:0;}
.yorix-loy-v2 .yloy-lead--center{margin:0 auto 22px;text-align:center;}

.yorix-loy-v2 .yloy-section-head{margin-bottom:clamp(26px,3.4vw,38px);}
.yorix-loy-v2 .yloy-section-head .yloy-h2{margin-bottom:10px;}

/* ───────── HERO ───────── */
.yorix-loy-v2 .yloy-hero{position:relative;padding:clamp(28px,4vw,40px) 0 clamp(48px,7vw,84px);background:linear-gradient(135deg,#070d0a 0%,#0a1f14 28%,#0d3320 58%,var(--green) 100%);color:#fff;overflow:hidden;isolation:isolate;}
.yorix-loy-v2 .yloy-hero-fx{position:absolute;inset:0;z-index:0;pointer-events:none;}
.yorix-loy-v2 .yloy-hero-glow{position:absolute;border-radius:50%;filter:blur(60px);opacity:.6;}
.yorix-loy-v2 .yloy-hero-glow--a{width:520px;height:520px;top:-120px;right:-120px;background:radial-gradient(circle,rgba(252,209,22,.35),transparent 65%);}
.yorix-loy-v2 .yloy-hero-glow--b{width:420px;height:420px;bottom:-160px;left:-80px;background:radial-gradient(circle,rgba(79,209,125,.32),transparent 65%);}
.yorix-loy-v2 .yloy-hero-grid-deco{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,#000 0%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,#000 0%,transparent 80%);opacity:.45;}
.yorix-loy-v2 .yloy-hero-inner{position:relative;z-index:1;}
.yorix-loy-v2 .yloy-hero-bc{margin-bottom:clamp(20px,3vw,28px);}
.yorix-loy-v2 .yloy-hero-bc .yorix-bc__list{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:999px;padding:9px 18px;width:fit-content;}
.yorix-loy-v2 .yloy-hero-bc .yorix-bc__link{color:#b7e4c7;}
.yorix-loy-v2 .yloy-hero-bc .yorix-bc__current{color:rgba(255,255,255,.7);}
.yorix-loy-v2 .yloy-hero-bc .yorix-bc__sep{color:rgba(255,255,255,.35);opacity:1;}
.yorix-loy-v2 .yloy-hero-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(28px,4vw,56px);align-items:center;}
@media (max-width:920px){.yorix-loy-v2 .yloy-hero-grid{grid-template-columns:1fr;gap:36px;}}
.yorix-loy-v2 .yloy-hero-left{min-width:0;}
.yorix-loy-v2 .yloy-hero-right{position:relative;display:flex;justify-content:center;align-items:center;min-width:0;}

.yorix-loy-v2 .yloy-hero-perks{list-style:none;margin:0 0 26px;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px;}
@media (max-width:520px){.yorix-loy-v2 .yloy-hero-perks{grid-template-columns:1fr;}}
.yorix-loy-v2 .yloy-hero-perks li{display:inline-flex;align-items:center;gap:10px;color:rgba(255,255,255,.85);font-size:.86rem;line-height:1.4;}
.yorix-loy-v2 .yloy-hero-perks li strong{font-weight:700;color:#fff;margin-right:4px;}
.yorix-loy-v2 .yloy-hero-perks li > span{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:rgba(252,209,22,.16);border:1px solid rgba(252,209,22,.32);font-size:.95rem;}

.yorix-loy-v2 .yloy-hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;}
.yorix-loy-v2 .yloy-btn{display:inline-flex;align-items:center;justify-content:center;text-align:center;line-height:1.2;cursor:pointer;padding:14px 22px;border-radius:12px;font-family:'Syne',sans-serif;font-weight:800;font-size:.84rem;letter-spacing:.02em;border:none;transition:transform .18s ease,filter .18s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;-webkit-appearance:none;appearance:none;}
.yorix-loy-v2 .yloy-btn--pri{background:linear-gradient(180deg,#ffe566,var(--yellow) 45%,#e8b800);color:#0d1f14;box-shadow:0 12px 30px rgba(252,209,22,.32),inset 0 1px 0 rgba(255,255,255,.5);}
.yorix-loy-v2 .yloy-btn--pri:hover{filter:brightness(1.06);transform:translateY(-2px);box-shadow:0 16px 36px rgba(252,209,22,.4),inset 0 1px 0 rgba(255,255,255,.55);}
.yorix-loy-v2 .yloy-btn--pri:active{transform:translateY(0);}
.yorix-loy-v2 .yloy-btn--sec{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.32);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
.yorix-loy-v2 .yloy-btn--sec:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.5);transform:translateY(-2px);}
.yorix-loy-v2 .yloy-btn--ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.34);}
.yorix-loy-v2 .yloy-btn--ghost:hover{background:rgba(255,255,255,.08);border-color:#fff;}

.yorix-loy-v2 .yloy-hero-trust{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px 14px;color:rgba(255,255,255,.62);font-size:.75rem;}
.yorix-loy-v2 .yloy-hero-trust li{display:inline-flex;align-items:center;gap:6px;}

/* ───────── VIP CARD ───────── */
.yorix-loy-v2 .yloy-vipcard{position:relative;z-index:2;width:min(420px,100%);background:linear-gradient(135deg,#0c1f14 0%,#163a23 45%,var(--green) 100%);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:clamp(20px,2.8vw,28px);color:#fff;box-shadow:0 40px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.14);overflow:hidden;transform:perspective(1200px) rotateY(-6deg) rotateX(2deg);transition:transform .4s cubic-bezier(.2,.8,.2,1);}
.yorix-loy-v2 .yloy-vipcard:hover{transform:perspective(1200px) rotateY(-3deg) rotateX(1deg) translateY(-4px);}
.yorix-loy-v2 .yloy-vipcard-shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.12) 50%,transparent 65%);pointer-events:none;animation:yloyShine 5.2s ease-in-out infinite;}
@keyframes yloyShine{0%,100%{transform:translateX(-30%);}50%{transform:translateX(30%);}}
.yorix-loy-v2 .yloy-vipcard-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:24px;position:relative;z-index:1;}
.yorix-loy-v2 .yloy-vipcard-brand{display:flex;align-items:center;gap:10px;}
.yorix-loy-v2 .yloy-vipcard-logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--yellow),#e8b800);color:#0d1f14;display:inline-flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;box-shadow:0 6px 16px rgba(252,209,22,.4);}
.yorix-loy-v2 .yloy-vipcard-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.18em;color:rgba(255,255,255,.78);}
.yorix-loy-v2 .yloy-vipcard-name em{font-style:normal;color:var(--yellow);}
.yorix-loy-v2 .yloy-vipcard-mid{position:relative;z-index:1;}
.yorix-loy-v2 .yloy-vipcard-lbl{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.55);margin-bottom:6px;}
.yorix-loy-v2 .yloy-vipcard-pts{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(2.2rem,5.4vw,3rem);line-height:1;color:var(--yellow);text-shadow:0 4px 24px rgba(252,209,22,.4);margin-bottom:8px;}
.yorix-loy-v2 .yloy-vipcard-pts small{font-size:1rem;font-weight:700;color:rgba(255,255,255,.55);margin-left:4px;vertical-align:super;}
.yorix-loy-v2 .yloy-vipcard-meta{font-size:.78rem;color:rgba(255,255,255,.72);margin-bottom:14px;line-height:1.45;}
.yorix-loy-v2 .yloy-vipcard-meta strong{color:#fff;font-weight:700;}
.yorix-loy-v2 .yloy-vipcard-progress{height:9px;border-radius:50px;background:rgba(0,0,0,.32);overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,.3);margin-bottom:22px;}
.yorix-loy-v2 .yloy-vipcard-progress-bar{height:100%;border-radius:50px;background:linear-gradient(90deg,#c9a010,var(--yellow),#fff9c4);box-shadow:0 0 14px rgba(252,209,22,.5);transition:width .8s cubic-bezier(.4,0,.2,1);}
.yorix-loy-v2 .yloy-vipcard-foot{display:flex;justify-content:space-between;gap:12px;position:relative;z-index:1;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);}
.yorix-loy-v2 .yloy-vipcard-flbl{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.5);margin-bottom:3px;}
.yorix-loy-v2 .yloy-vipcard-fval{font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;color:#fff;letter-spacing:.04em;}

.yorix-loy-v2 .yloy-orbit{position:absolute;border-radius:50%;pointer-events:none;z-index:0;}
.yorix-loy-v2 .yloy-orbit--a{width:140px;height:140px;top:-30px;right:30px;background:rgba(252,209,22,.18);filter:blur(40px);}
.yorix-loy-v2 .yloy-orbit--b{width:180px;height:180px;bottom:-30px;left:-20px;background:rgba(79,209,125,.22);filter:blur(50px);}

/* ───────── EARN GRID ───────── */
.yorix-loy-v2 .yloy-earn-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(14px,2vw,20px);}
@media (max-width:980px){.yorix-loy-v2 .yloy-earn-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media (max-width:520px){.yorix-loy-v2 .yloy-earn-grid{grid-template-columns:1fr;}}
.yorix-loy-v2 .yloy-earn-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(20px,2.4vw,26px) clamp(18px,2vw,22px);box-shadow:${dark?"0 14px 32px rgba(0,0,0,.32)":"0 14px 34px rgba(13,31,20,.06)"};transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;position:relative;overflow:hidden;}
.yorix-loy-v2 .yloy-earn-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--green),var(--green-light));transform:scaleX(.35);transform-origin:left;transition:transform .35s ease;}
.yorix-loy-v2 .yloy-earn-card:hover{transform:translateY(-5px);box-shadow:${dark?"0 22px 48px rgba(0,0,0,.42)":"0 22px 48px rgba(13,31,20,.1)"};border-color:rgba(79,209,125,.4);}
.yorix-loy-v2 .yloy-earn-card:hover::before{transform:scaleX(1);}
.yorix-loy-v2 .yloy-earn-emoji{font-size:2.2rem;line-height:1;margin-bottom:14px;display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,${dark?"#1c2e22":"#f0fff5"},${dark?"#152118":"#e2f7ec"});border:1px solid var(--border);}
.yorix-loy-v2 .yloy-earn-t{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;color:var(--ink);margin:0 0 8px;letter-spacing:-.3px;}
.yorix-loy-v2 .yloy-earn-d{font-size:.82rem;line-height:1.6;color:var(--gray);margin:0 0 14px;}
.yorix-loy-v2 .yloy-earn-pts{display:inline-flex;align-items:center;background:var(--green-pale);color:var(--green);border:1px solid rgba(39,168,90,.32);padding:5px 12px;border-radius:999px;font-family:'Syne',sans-serif;font-weight:800;font-size:.7rem;letter-spacing:.04em;}

/* ───────── TIERS ───────── */
.yorix-loy-v2 .yloy-tiers{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(14px,2vw,20px);}
@media (max-width:980px){.yorix-loy-v2 .yloy-tiers{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media (max-width:560px){.yorix-loy-v2 .yloy-tiers{grid-template-columns:1fr;}}
.yorix-loy-v2 .yloy-tier{--tier-color:#CD7F32;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(22px,2.6vw,28px) clamp(18px,2vw,22px) clamp(20px,2.4vw,24px);position:relative;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;overflow:hidden;}
.yorix-loy-v2 .yloy-tier::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--tier-color),color-mix(in srgb,var(--tier-color) 60%,#fff));}
.yorix-loy-v2 .yloy-tier:hover{transform:translateY(-4px);box-shadow:${dark?"0 22px 48px rgba(0,0,0,.42)":"0 22px 48px rgba(13,31,20,.1)"};border-color:color-mix(in srgb,var(--tier-color) 45%,var(--border));}
.yorix-loy-v2 .yloy-tier.is-current{border-color:var(--tier-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--tier-color) 18%,transparent),0 22px 48px rgba(0,0,0,.14);}
.yorix-loy-v2 .yloy-tier-now{position:absolute;top:14px;right:14px;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;font-family:'Syne',sans-serif;font-size:.6rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:999px;box-shadow:0 6px 14px rgba(26,107,58,.3);}
.yorix-loy-v2 .yloy-tier-emoji{font-size:2.4rem;line-height:1;margin-bottom:12px;}
.yorix-loy-v2 .yloy-tier-name{font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;color:var(--tier-color);margin:0 0 6px;letter-spacing:-.4px;}
.yorix-loy-v2 .yloy-tier-thresh{font-size:.74rem;font-weight:700;color:var(--gray);margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em;}
.yorix-loy-v2 .yloy-tier-pitch{font-size:.82rem;line-height:1.6;color:var(--ink);margin:0 0 14px;}
.yorix-loy-v2 .yloy-tier-perks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.yorix-loy-v2 .yloy-tier-perks li{display:flex;align-items:flex-start;gap:8px;font-size:.78rem;line-height:1.45;color:var(--gray);}
.yorix-loy-v2 .yloy-tier-perks li span{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--tier-color) 18%,transparent);color:var(--tier-color);font-weight:800;font-size:.62rem;}

/* ───────── REFERRAL ───────── */
.yorix-loy-v2 .yloy-referral{position:relative;background:linear-gradient(135deg,#0a1f14 0%,#143b25 50%,var(--green) 100%);border-radius:24px;padding:clamp(28px,3.6vw,42px) clamp(24px,3vw,36px);color:#fff;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(24px,3vw,36px);align-items:center;overflow:hidden;box-shadow:0 28px 64px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.1);}
@media (max-width:820px){.yorix-loy-v2 .yloy-referral{grid-template-columns:1fr;padding:clamp(24px,4vw,32px);}}
.yorix-loy-v2 .yloy-referral-fx{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 90% 10%,rgba(252,209,22,.22),transparent 50%),radial-gradient(circle at 10% 90%,rgba(79,209,125,.2),transparent 55%);}
.yorix-loy-v2 .yloy-referral-left{position:relative;z-index:1;}
.yorix-loy-v2 .yloy-referral-right{position:relative;z-index:1;background:rgba(0,0,0,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:clamp(18px,2vw,22px);}
.yorix-loy-v2 .yloy-referral-lbl{display:block;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:10px;}
.yorix-loy-v2 .yloy-referral-row{display:flex;gap:8px;flex-wrap:wrap;}
.yorix-loy-v2 .yloy-referral-inp{flex:1;min-width:200px;padding:13px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none;}
.yorix-loy-v2 .yloy-referral-inp:focus{border-color:var(--yellow);background:rgba(255,255,255,.14);}
.yorix-loy-v2 .yloy-referral-btn{flex-shrink:0;}
.yorix-loy-v2 .yloy-referral-meta{margin-top:12px;font-size:.74rem;color:rgba(255,255,255,.55);line-height:1.5;}

/* ───────── NEWSLETTER ───────── */
.yorix-loy-v2 .yloy-nl{position:relative;background:${dark?"linear-gradient(160deg,#152118 0%,#1c2e22 100%)":"linear-gradient(160deg,#ffffff 0%,#fbf9f3 100%)"};border:1px solid var(--border);border-radius:24px;padding:clamp(32px,4vw,48px) clamp(22px,3vw,40px);text-align:center;box-shadow:${dark?"0 24px 56px rgba(0,0,0,.36)":"0 24px 56px rgba(13,31,20,.08)"};overflow:hidden;}
.yorix-loy-v2 .yloy-nl::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--yellow),var(--green),var(--yellow));}
.yorix-loy-v2 .yloy-nl::after{content:'';position:absolute;bottom:-100px;right:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(252,209,22,.12),transparent 70%);pointer-events:none;}
.yorix-loy-v2 .yloy-nl-ico{font-size:2.6rem;line-height:1;margin-bottom:14px;position:relative;z-index:1;}
.yorix-loy-v2 .yloy-nl .yloy-h2{margin-bottom:10px;position:relative;z-index:1;}
.yorix-loy-v2 .yloy-nl .yloy-lead{position:relative;z-index:1;}
.yorix-loy-v2 .yloy-nl-form{display:flex;gap:10px;max-width:520px;margin:20px auto 14px;flex-wrap:wrap;position:relative;z-index:1;}
.yorix-loy-v2 .yloy-nl-input{flex:1;min-width:220px;padding:14px 16px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface);color:var(--ink);font-family:'DM Sans',sans-serif;font-size:.92rem;outline:none;transition:border-color .18s,box-shadow .18s;}
.yorix-loy-v2 .yloy-nl-input:focus{border-color:var(--green);box-shadow:0 0 0 4px rgba(39,168,90,.18);}
.yorix-loy-v2 .yloy-nl-submit{padding:14px 24px;}
.yorix-loy-v2 .yloy-nl-note{font-size:.74rem;color:var(--gray);line-height:1.5;position:relative;z-index:1;}

/* ───────── FAQ ───────── */
.yorix-loy-v2 .yloy-faq{display:flex;flex-direction:column;gap:10px;max-width:860px;margin:0 auto;}
.yorix-loy-v2 .yloy-faq-item{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:border-color .2s,box-shadow .2s;}
.yorix-loy-v2 .yloy-faq-item:hover{border-color:var(--green-mid);}
.yorix-loy-v2 .yloy-faq-item[open]{border-color:var(--green);box-shadow:${dark?"0 10px 28px rgba(0,0,0,.32)":"0 10px 28px rgba(26,107,58,.08)"};}
.yorix-loy-v2 .yloy-faq-item summary{cursor:pointer;padding:18px 56px 18px 22px;font-family:'Syne',sans-serif;font-weight:800;font-size:.92rem;color:var(--ink);position:relative;list-style:none;line-height:1.4;}
.yorix-loy-v2 .yloy-faq-item summary::-webkit-details-marker{display:none;}
.yorix-loy-v2 .yloy-faq-item summary::after{content:'+';position:absolute;right:20px;top:50%;transform:translateY(-50%);font-family:'Syne',sans-serif;font-weight:800;font-size:1.45rem;color:var(--green);transition:transform .25s ease;width:28px;height:28px;border-radius:50%;background:var(--green-pale);display:inline-flex;align-items:center;justify-content:center;}
.yorix-loy-v2 .yloy-faq-item[open] summary::after{transform:translateY(-50%) rotate(45deg);}
.yorix-loy-v2 .yloy-faq-item p{margin:0;padding:0 22px 20px;font-size:.86rem;line-height:1.72;color:var(--gray);}

/* ───────── FINAL CTA ───────── */
.yorix-loy-v2 .yloy-final-cta{background:linear-gradient(135deg,#0a1f14 0%,#143b25 50%,var(--green) 100%);border-radius:24px;padding:clamp(28px,3.6vw,42px) clamp(24px,3vw,36px);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:clamp(22px,3vw,32px);flex-wrap:wrap;box-shadow:0 28px 64px rgba(0,0,0,.32);}
.yorix-loy-v2 .yloy-final-cta .yloy-h2{margin-bottom:6px;}
.yorix-loy-v2 .yloy-final-cta-actions{display:flex;gap:10px;flex-wrap:wrap;}

/* ───────── EMBEDDED LEGACY (tabs/grids) RAFFINEMENT ───────── */
.yorix-loy-v2 .loy-stats-grid{margin-top:0;margin-bottom:clamp(22px,2.6vw,28px);}
.yorix-loy-v2 .loy-tabs{margin-bottom:clamp(22px,2.6vw,28px);}
.yorix-loy-v2 .loy-stat-card{padding:clamp(18px,2.2vw,22px) 12px;}
.yorix-loy-v2 .loy-stat-val{font-size:clamp(1.3rem,2.8vw,1.55rem);}
.yorix-loy-v2 .empty-state{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(36px,5vw,56px) 24px;}
.yorix-loy-v2 .empty-icon{font-size:3rem;margin-bottom:14px;line-height:1;}

/* Compatibilité avec anciennes pages : si on revient sur .sec wrapper, on désactive */
.yorix-loy-v2.sec{max-width:none!important;padding:0!important;margin:0!important;}

/* ═══════════════════════════════════════════════════════════════════════════
   🏆 YORIX HOMEPAGE — PREMIUM REVAMP (animations, hero immersif, storytelling)
   GPU-friendly · prefers-reduced-motion safe · mobile-first
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Reveal au scroll (générique) ─────────────────────────────────────── */
.yx-reveal{opacity:0;transform:translateY(22px);transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1);transition-delay:var(--yx-d,0ms);will-change:opacity,transform;}
.yx-reveal.is-in{opacity:1;transform:translateY(0);}
.yx-reveal.yx-reveal-left{transform:translateX(-26px);}
.yx-reveal.yx-reveal-right{transform:translateX(26px);}
.yx-reveal.yx-reveal-left.is-in,.yx-reveal.yx-reveal-right.is-in{transform:translateX(0);}
.yx-reveal.yx-reveal-scale{transform:scale(.92);}
.yx-reveal.yx-reveal-scale.is-in{transform:scale(1);}
@media(prefers-reduced-motion:reduce){.yx-reveal{opacity:1;transform:none!important;transition:none;}}

/* ─── Keyframes premium (GPU-only) ─────────────────────────────────────── */
@keyframes yx-float{0%,100%{transform:translate3d(0,0,0);}50%{transform:translate3d(0,-12px,0);}}
@keyframes yx-float-slow{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(0,-18px,0) scale(1.03);}}
@keyframes yx-spin-slow{from{transform:rotate(0);}to{transform:rotate(360deg);}}
@keyframes yx-pulse-glow{0%,100%{box-shadow:0 0 0 0 rgba(252,209,22,.45),0 10px 28px rgba(252,209,22,.4);}50%{box-shadow:0 0 0 14px rgba(252,209,22,0),0 14px 32px rgba(252,209,22,.55);}}
@keyframes yx-pulse-ring{0%{box-shadow:0 0 0 0 rgba(79,209,125,.55);}70%{box-shadow:0 0 0 22px rgba(79,209,125,0);}100%{box-shadow:0 0 0 0 rgba(79,209,125,0);}}
@keyframes yx-aurora-shift{0%{background-position:0% 50%,100% 50%,50% 50%;}50%{background-position:100% 50%,0% 50%,50% 100%;}100%{background-position:0% 50%,100% 50%,50% 50%;}}
@keyframes yx-shine{0%{transform:translateX(-100%);}100%{transform:translateX(180%);}}
@keyframes yx-marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes yx-fade-up{from{opacity:0;transform:translate3d(0,18px,0);}to{opacity:1;transform:none;}}
@keyframes yx-tilt-in{from{opacity:0;transform:perspective(900px) rotateX(8deg) translateY(20px);}to{opacity:1;transform:perspective(900px) rotateX(0) translateY(0);}}
@keyframes yx-gradient-text{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
@keyframes yx-count-pop{0%{transform:scale(1);}40%{transform:scale(1.08);}100%{transform:scale(1);}}
@keyframes yx-bounce-soft{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}

/* ─── HERO IMMERSIF (overrides additifs sur .hero.hp-hero-shell) ───────── */
.hp-hero-shell{position:relative;overflow:hidden;}
.hp-hero-shell .hp-hero-aurora{
  background:
    radial-gradient(ellipse 70% 50% at 10% 8%,rgba(252,209,22,.16) 0%,transparent 55%),
    radial-gradient(ellipse 60% 50% at 88% 32%,rgba(79,209,125,.22) 0%,transparent 55%),
    radial-gradient(circle at 50% 130%,rgba(26,107,58,.55) 0%,transparent 50%);
  background-size:200% 200%,200% 200%,200% 200%;
  animation:yx-aurora-shift 18s ease-in-out infinite;
  opacity:.95;
}
@media(prefers-reduced-motion:reduce){.hp-hero-shell .hp-hero-aurora{animation:none;}}

/* Particules flottantes décoratives (3 spheres) */
.yx-hero-orbs{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.yx-hero-orbs::before,.yx-hero-orbs::after,
.yx-hero-orbs span{position:absolute;border-radius:50%;filter:blur(40px);will-change:transform;}
.yx-hero-orbs::before{content:"";width:280px;height:280px;top:-60px;left:-80px;background:radial-gradient(circle,rgba(252,209,22,.45),transparent 70%);animation:yx-float-slow 12s ease-in-out infinite;}
.yx-hero-orbs::after{content:"";width:220px;height:220px;bottom:-50px;right:-50px;background:radial-gradient(circle,rgba(79,209,125,.45),transparent 70%);animation:yx-float-slow 14s ease-in-out infinite reverse;}
.yx-hero-orbs span{width:160px;height:160px;top:35%;left:48%;background:radial-gradient(circle,rgba(26,107,58,.4),transparent 70%);animation:yx-float 10s ease-in-out infinite;}
@media(prefers-reduced-motion:reduce){.yx-hero-orbs::before,.yx-hero-orbs::after,.yx-hero-orbs span{animation:none;}}
@media(max-width:768px){.yx-hero-orbs::before{width:180px;height:180px;}.yx-hero-orbs::after{width:140px;height:140px;}.yx-hero-orbs span{display:none;}}

/* Titre hero avec gradient animé sur le <em> */
.hp-hero-shell h1 em{font-style:normal;background:linear-gradient(120deg,#fcd116 0%,#4fd17d 38%,#7ef0a8 64%,#fcd116 100%);background-size:220% 220%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:yx-gradient-text 8s ease infinite;display:inline-block;}
@media(prefers-reduced-motion:reduce){.hp-hero-shell h1 em{animation:none;}}

/* Entrée fluide du contenu hero */
.hp-hero-copy>*{animation:yx-fade-up .8s cubic-bezier(.22,1,.36,1) backwards;}
.hp-hero-copy>:nth-child(1){animation-delay:.05s;}
.hp-hero-copy>:nth-child(2){animation-delay:.15s;}
.hp-hero-copy>:nth-child(3){animation-delay:.25s;}
.hp-hero-copy>:nth-child(4){animation-delay:.35s;}
.hp-hero-copy>:nth-child(5){animation-delay:.45s;}
.hp-hero-copy>:nth-child(6){animation-delay:.55s;}
.hp-hero-copy>:nth-child(7){animation-delay:.65s;}
.hp-hero-copy>:nth-child(8){animation-delay:.75s;}
@media(prefers-reduced-motion:reduce){.hp-hero-copy>*{animation:none;}}

/* CTA principal avec halo pulsant */
.hp-cta-primary{position:relative;overflow:hidden;animation:yx-pulse-glow 3.4s ease-in-out infinite;}
.hp-cta-primary::after{content:"";position:absolute;top:0;left:0;width:35%;height:100%;background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.55) 50%,transparent 100%);transform:translateX(-100%);}
.hp-cta-primary:hover::after{animation:yx-shine 1.1s ease forwards;}
.hp-cta-primary:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(252,209,22,.55);}
@media(prefers-reduced-motion:reduce){.hp-cta-primary{animation:none;}.hp-cta-primary::after{display:none;}}

.hp-cta-ghost{transition:all .25s ease;}
.hp-cta-ghost:hover{background:rgba(255,255,255,.14)!important;transform:translateY(-2px);}

/* Chips quick-links avec petit lift + glow */
.hp-chip{position:relative;overflow:hidden;}
.hp-chip::before{content:"";position:absolute;inset:-1px;border-radius:14px;background:linear-gradient(135deg,rgba(252,209,22,.4),rgba(79,209,125,.35));opacity:0;transition:opacity .35s ease;z-index:-1;}
.hp-chip:hover::before{opacity:1;}
.hp-chip:active{transform:translateY(0) scale(.98);}

/* Panel de recherche avec shine au hover */
.hp-search-panel{position:relative;overflow:hidden;}
.hp-search-panel::before{content:"";position:absolute;top:-2px;left:-30%;width:60%;height:2px;background:linear-gradient(90deg,transparent,rgba(252,209,22,.85),transparent);animation:yx-marquee 6s linear infinite;pointer-events:none;}
@media(prefers-reduced-motion:reduce){.hp-search-panel::before{animation:none;display:none;}}

/* ─── COUNTERS ANIMÉS ──────────────────────────────────────────────────── */
.yx-counter-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:1200px;margin:0 auto;padding:32px 24px;}
.yx-counter{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:22px 18px;text-align:center;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;}
.yx-counter:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(26,107,58,.12);border-color:var(--green-light);}
.yx-counter::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(26,107,58,.08),transparent 60%);opacity:0;transition:opacity .35s ease;}
.yx-counter:hover::before{opacity:1;}
.yx-counter-icon{font-size:1.9rem;line-height:1;margin-bottom:8px;display:inline-block;}
.yx-counter:hover .yx-counter-icon{animation:yx-bounce-soft .9s ease infinite;}
.yx-counter-num{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.45rem,3vw,2.1rem);color:var(--green);letter-spacing:-.5px;line-height:1.1;}
.yx-counter-lbl{font-size:.74rem;font-weight:600;color:var(--gray);margin-top:4px;letter-spacing:.02em;}
.yx-counter-sub{font-size:.65rem;color:var(--gray);margin-top:6px;opacity:.78;}
@media(max-width:768px){.yx-counter-grid{grid-template-columns:repeat(2,1fr);padding:24px 16px;gap:10px;}.yx-counter{padding:18px 14px;}}

/* ─── MARQUEE PARTENAIRES / CATÉGORIES ─────────────────────────────────── */
.yx-marquee-wrap{overflow:hidden;padding:20px 0;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);}
.yx-marquee-track{display:flex;gap:42px;width:max-content;animation:yx-marquee 35s linear infinite;}
.yx-marquee-wrap:hover .yx-marquee-track{animation-play-state:paused;}
.yx-marquee-item{display:inline-flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;font-weight:800;font-size:.92rem;color:var(--ink);white-space:nowrap;letter-spacing:.02em;opacity:.78;transition:opacity .2s ease;}
.yx-marquee-item:hover{opacity:1;color:var(--green);}
.yx-marquee-item .yx-mq-ico{font-size:1.2rem;line-height:1;}
.yx-marquee-item .yx-mq-dot{width:6px;height:6px;border-radius:50%;background:var(--green-mid);opacity:.45;}
@media(prefers-reduced-motion:reduce){.yx-marquee-track{animation:none;flex-wrap:wrap;justify-content:center;}}

/* ─── HOW IT WORKS (timeline horizontale premium) ──────────────────────── */
.yx-how-section{max-width:1200px;margin:0 auto;padding:48px 24px 36px;}
.yx-how-head{text-align:center;margin-bottom:36px;}
.yx-how-kicker{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:var(--green-pale);color:var(--green);font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;}
.yx-how-title{font-family:'Syne',sans-serif;font-size:clamp(1.45rem,3.2vw,2.05rem);font-weight:800;color:var(--ink);letter-spacing:-.6px;line-height:1.15;}
.yx-how-sub{font-size:.88rem;color:var(--gray);margin-top:10px;line-height:1.65;max-width:540px;margin-left:auto;margin-right:auto;}
.yx-how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;position:relative;}
.yx-how-grid::before{content:"";position:absolute;top:48px;left:8%;right:8%;height:2px;background:repeating-linear-gradient(90deg,var(--green-light) 0 8px,transparent 8px 16px);opacity:.55;}
.yx-how-step{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:24px 18px;text-align:center;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;z-index:1;}
.yx-how-step:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(26,107,58,.13);border-color:var(--green-light);}
.yx-how-num{position:absolute;top:-13px;left:50%;transform:translateX(-50%);width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(26,107,58,.4);}
.yx-how-ico{font-size:2.2rem;line-height:1;margin:8px 0 12px;display:inline-block;}
.yx-how-step:hover .yx-how-ico{animation:yx-bounce-soft 1s ease infinite;}
.yx-how-step h4{font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;color:var(--ink);margin-bottom:6px;}
.yx-how-step p{font-size:.77rem;color:var(--gray);line-height:1.55;}
@media(max-width:992px){.yx-how-grid{grid-template-columns:repeat(2,1fr);}.yx-how-grid::before{display:none;}}
@media(max-width:520px){.yx-how-grid{grid-template-columns:1fr;}}

/* ─── BENTO CARDS amélioration premium ─────────────────────────────────── */
.hp-bento-card{position:relative;overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,border-color .35s ease;}
.hp-bento-card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,transparent 0%,rgba(26,107,58,.04) 100%);opacity:0;transition:opacity .4s ease;pointer-events:none;}
.hp-bento-card::after{content:"";position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle at top right,rgba(252,209,22,.18),transparent 70%);opacity:0;transition:opacity .4s ease;pointer-events:none;}
.hp-bento-card:hover{transform:translateY(-6px) scale(1.015);box-shadow:0 22px 56px rgba(26,107,58,.16);border-color:var(--green-light);}
.hp-bento-card:hover::before,.hp-bento-card:hover::after{opacity:1;}
.hp-bento-card:hover .hp-bento-ico{animation:yx-float 2s ease-in-out infinite;}
.hp-bento-link{position:relative;overflow:hidden;}
.hp-bento-link::before{content:"";position:absolute;bottom:-1px;left:0;right:0;height:1px;background:var(--green);transform:scaleX(0);transform-origin:left;transition:transform .35s ease;}
.hp-bento-link:hover::before{transform:scaleX(1);}

/* ─── PROD GRID hover boost (additif sans casser ProdGrid) ─────────────── */
.home-premium .prod-card,.home-premium .prod-grid>*{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease;}
.home-premium .prod-card:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(13,31,20,.15);}

/* ─── PROOF BAR animée ─────────────────────────────────────────────────── */
.hp-proof-bar.yx-proof-glow{background:linear-gradient(92deg,#0a1510,#1a3826,#0a1510),linear-gradient(120deg,rgba(252,209,22,.06),rgba(79,209,125,.06));background-blend-mode:overlay;}
.hp-proof-bar .proof-item{transition:transform .25s ease,color .25s ease;}
.hp-proof-bar .proof-item:hover{transform:translateY(-2px);}
.hp-proof-bar .proof-num{display:inline-block;}
.hp-proof-bar .proof-item:hover .proof-num{animation:yx-bounce-soft .8s ease infinite;}

/* ─── TESTIMONIALS amélioration premium ────────────────────────────────── */
.hp-quote-card{position:relative;overflow:hidden;transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease;}
.hp-quote-card::before{content:"\\201C";position:absolute;top:-22px;right:6px;font-family:'Syne',sans-serif;font-weight:800;font-size:6rem;color:var(--green-pale);line-height:1;opacity:.85;pointer-events:none;}
.hp-quote-card:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(26,107,58,.13);border-color:var(--green-light);}
.hp-quote-card blockquote{position:relative;z-index:1;}

/* ─── BADGES animés (entrée + flottement) ──────────────────────────────── */
.hero-badges .hbadge{transition:transform .25s ease,box-shadow .25s ease;}
.hero-badges .hbadge:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,.18);}

/* ─── PREMIUM NEWSLETTER (overrides additifs) ──────────────────────────── */
.hp-newsletter{position:relative;}
.hp-newsletter::after{content:"";position:absolute;inset:0;background:
  radial-gradient(circle at 15% 20%,rgba(252,209,22,.18),transparent 50%),
  radial-gradient(circle at 85% 80%,rgba(79,209,125,.18),transparent 50%);
  background-size:140% 140%;animation:yx-aurora-shift 22s ease-in-out infinite;z-index:0;pointer-events:none;}
.hp-newsletter>*{position:relative;z-index:1;}
@media(prefers-reduced-motion:reduce){.hp-newsletter::after{animation:none;}}

/* ─── PROMO BANNER haut de page (animée + countdown) ───────────────────── */
.yx-promo-banner{position:relative;display:flex;align-items:center;justify-content:center;gap:14px;padding:11px 24px;background:linear-gradient(92deg,#0d1f14 0%,#1a6b3a 50%,#0d1f14 100%);background-size:240% 100%;animation:yx-aurora-shift 14s ease-in-out infinite;color:#fff;font-size:.78rem;font-weight:600;flex-wrap:nowrap;text-align:center;border-bottom:1px solid rgba(252,209,22,.25);overflow:hidden;line-height:1.25;}
.yx-promo-banner::before{content:"";position:absolute;top:0;left:-50%;width:30%;height:100%;background:linear-gradient(120deg,transparent,rgba(252,209,22,.18),transparent);animation:yx-marquee 7s linear infinite;pointer-events:none;}
.yx-promo-banner>*{position:relative;z-index:1;}
.yx-promo-banner .yx-promo-icon{font-size:1rem;animation:yx-bounce-soft 1.8s ease-in-out infinite;flex:0 0 auto;}
.yx-promo-banner .yx-promo-text{min-width:0;}
.yx-promo-banner strong{color:var(--yellow);font-family:'Syne',sans-serif;font-weight:800;letter-spacing:.02em;}
.yx-promo-banner .yx-promo-cta{background:var(--yellow);color:#0d1f14;padding:5px 13px;border-radius:999px;font-family:'Syne',sans-serif;font-weight:800;font-size:.72rem;text-decoration:none;border:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;flex:0 0 auto;white-space:nowrap;}
.yx-promo-banner .yx-promo-cta:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(252,209,22,.5);}
@media(prefers-reduced-motion:reduce){.yx-promo-banner,.yx-promo-banner::before{animation:none;}}
@media(max-width:560px){.yx-promo-banner{font-size:.72rem;padding:9px 14px;gap:8px;flex-wrap:wrap;}.yx-promo-banner .yx-promo-text{flex:1 1 100%;order:2;}.yx-promo-banner .yx-promo-icon{order:1;}.yx-promo-banner .yx-promo-cta{order:3;}}

/* ─── SOCIAL PROOF strip (avis + chiffres) ─────────────────────────────── */
.yx-social-proof{max-width:1200px;margin:0 auto;padding:36px 24px 24px;display:grid;grid-template-columns:1.2fr 2fr;gap:24px;align-items:center;}
.yx-sp-rating{background:linear-gradient(135deg,#fef3c7,#fed7aa);border:1px solid #f59e0b;border-radius:20px;padding:24px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 12px 32px rgba(245,158,11,.18);}
.yx-sp-stars{font-size:1.6rem;letter-spacing:2px;line-height:1;}
.yx-sp-stars span{display:inline-block;animation:yx-bounce-soft 1.6s ease-in-out infinite;}
.yx-sp-stars span:nth-child(2){animation-delay:.1s;}
.yx-sp-stars span:nth-child(3){animation-delay:.2s;}
.yx-sp-stars span:nth-child(4){animation-delay:.3s;}
.yx-sp-stars span:nth-child(5){animation-delay:.4s;}
.yx-sp-score{font-family:'Syne',sans-serif;font-weight:800;font-size:2.4rem;color:#92400e;line-height:1;}
.yx-sp-label{font-size:.78rem;color:#78350f;font-weight:600;text-align:center;}
.yx-sp-logos{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:flex-end;}
.yx-sp-logo{padding:11px 18px;border:1px solid var(--border);border-radius:14px;background:var(--surface);font-family:'Syne',sans-serif;font-weight:800;font-size:.78rem;color:var(--gray);transition:all .25s ease;}
.yx-sp-logo:hover{color:var(--green);border-color:var(--green-light);transform:translateY(-2px);}
@media(max-width:768px){.yx-social-proof{grid-template-columns:1fr;}.yx-sp-logos{justify-content:center;}}

/* ─── CATEGORY CARDS (carrousel premium) ───────────────────────────────── */
.yx-cat-section{max-width:1200px;margin:0 auto;padding:36px 24px;}
.yx-cat-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
.yx-cat-title{font-family:'Syne',sans-serif;font-size:clamp(1.25rem,2.4vw,1.55rem);font-weight:800;color:var(--ink);letter-spacing:-.4px;}
.yx-cat-sub{font-size:.82rem;color:var(--gray);margin-top:6px;}
.yx-cat-link{font-family:'Syne',sans-serif;font-weight:800;font-size:.78rem;color:var(--green);cursor:pointer;background:none;border:none;padding:0;border-bottom:1px solid transparent;transition:border-color .25s ease;}
.yx-cat-link:hover{border-bottom-color:var(--green);}
.yx-cat-scroller{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(170px,1fr);gap:14px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--green-light) transparent;}
.yx-cat-scroller::-webkit-scrollbar{height:6px;}
.yx-cat-scroller::-webkit-scrollbar-thumb{background:var(--green-light);border-radius:99px;}
.yx-cat-card{scroll-snap-align:start;position:relative;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:22px 18px;cursor:pointer;text-align:center;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);}
.yx-cat-card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,var(--green-pale) 0%,transparent 100%);opacity:0;transition:opacity .35s ease;}
.yx-cat-card:hover{transform:translateY(-5px);box-shadow:0 22px 50px rgba(26,107,58,.16);border-color:var(--green);}
.yx-cat-card:hover::before{opacity:1;}
.yx-cat-emoji{position:relative;z-index:1;font-size:2.4rem;line-height:1;display:inline-block;margin-bottom:10px;transition:transform .35s ease;}
.yx-cat-card:hover .yx-cat-emoji{transform:scale(1.15) rotate(-6deg);}
.yx-cat-name{position:relative;z-index:1;font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;color:var(--ink);line-height:1.3;}
.yx-cat-count{position:relative;z-index:1;font-size:.66rem;color:var(--gray);margin-top:4px;}
@media(max-width:540px){.yx-cat-scroller{grid-auto-columns:minmax(140px,1fr);}}

/* ─── SCROLL INDICATOR animé ───────────────────────────────────────────── */
.yx-scroll-hint{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;color:rgba(255,255,255,.55);font-size:.66rem;letter-spacing:.2em;font-weight:600;text-transform:uppercase;pointer-events:none;}
.yx-scroll-hint::after{content:"";width:1px;height:22px;background:linear-gradient(180deg,rgba(255,255,255,.55),transparent);animation:yx-bounce-soft 1.8s ease-in-out infinite;}
@media(prefers-reduced-motion:reduce){.yx-scroll-hint::after{animation:none;}}
@media(max-width:768px){.yx-scroll-hint{display:none;}}

/* ═══════════════════════════════════════════════════════════════════════════
   🎯 YORIX CM - MOBILE FIXES V2 - REFONTE PREMIUM
   Ce fichier surcharge tous les bugs visuels mobile sans casser le desktop
   
   À COLLER À LA FIN de ton fichier styles.js (juste avant le backtick fermant)
   ═══════════════════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣ FIX CRITIQUE : DOUBLON BOUTON WHATSAPP
   On garde uniquement .yorix-wa-fab (le bouton rond moderne)
   On désactive complètement .wa-sticky (l'ancienne barre verte)
   ─────────────────────────────────────────────────────────────────────────── */

.wa-sticky {
  display: none !important;
}

/* Le bouton WhatsApp moderne (.yorix-wa-fab) reste visible */
.yorix-wa-fab {
  display: flex !important;
  animation: none !important; /* On enlève le pulse-ring qui était sur .wa-sticky */
}

/* ───────────────────────────────────────────────────────────────────────────
   2️⃣ FIX MOBILE : TOPBAR ULTRA-COMPACTE
   Sur mobile (< 768px), masquer complètement la topbar.
   Garder uniquement langue + drapeau dans le navbar.
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  /* Cacher toute la topbar - on rapatrie l'essentiel dans le navbar */
  .topbar {
    display: none !important;
  }
  
  /* Cacher aussi la barre marketing "PARAPHARMECIE DES VICTOIRES" */
  .yx-promo-banner,
  [class*="promo-banner"] {
    font-size: 0.7rem !important;
    padding: 6px 10px !important;
    flex-wrap: wrap !important;
    gap: 4px !important;
  }
  
  .yx-promo-banner .yx-promo-cta {
    font-size: 0.65rem !important;
    padding: 3px 8px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   3️⃣ FIX MOBILE : NAVBAR HEADER OPTIMISÉE
   Header simplifié : Logo + Recherche + Panier + Menu Burger
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .navbar {
    padding: 8px 12px !important;
    gap: 8px !important;
    height: auto !important;
    min-height: 56px !important;
  }
  
  /* Logo plus compact */
  .logo-txt {
    font-size: 1.25rem !important;
    letter-spacing: -0.5px !important;
  }
  .logo-txt sup {
    display: none !important;
  }
  
  /* Barre de recherche prend toute la place dispo */
  .nav-search-wrap {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }
  
  .nav-search {
    border-radius: 20px !important;
    box-shadow: none !important;
    border: 1px solid var(--border) !important;
  }
  
  /* Cacher le select catégorie sur mobile (trop dense) */
  .nav-search select {
    display: none !important;
  }
  
  .nav-search input {
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
  }
  
  .nav-search button {
    padding: 0 12px !important;
    font-size: 0.95rem !important;
  }
  
  /* CACHER le bouton "Démarrer" sur mobile - il sera dans le menu burger */
  .nav-cta-onboard {
    display: none !important;
  }

  .nav-lang-mobile {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex-shrink: 0 !important;
    font-size: 0.72rem !important;
    font-weight: 600 !important;
  }

  .nav-lang-mobile button {
    background: none !important;
    border: none !important;
    padding: 2px 4px !important;
    min-height: auto !important;
    cursor: pointer !important;
    color: var(--gray) !important;
    font: inherit !important;
  }

  .nav-lang-mobile button.active {
    color: var(--green) !important;
    font-weight: 800 !important;
  }

  .user-menu-mobile {
    display: block !important;
    position: relative !important;
  }

  .nav-auth-desktop {
    display: none !important;
  }
  
  /* Actions header : on garde panier + avatar + menu, on cache le reste */
  .nav-actions {
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
  
  .nav-actions .btn-ghost,
  .nav-actions .btn-green,
  .nav-actions .btn-red,
  .nav-actions .btn-wa,
  .nav-actions .dark-toggle {
    display: none !important;
  }
  
  /* Avatar plus visible */
  .user-av {
    width: 34px !important;
    height: 34px !important;
    font-size: 0.85rem !important;
    border: 2px solid var(--green-pale) !important;
  }
  
  /* Icônes panier/notif */
  .icon-btn {
    width: 36px !important;
    height: 36px !important;
    font-size: 1rem !important;
    border: 1px solid var(--border) !important;
    background: var(--surface) !important;
  }
  
  /* Badge sur les icônes */
  .ibadge {
    background: #fbbf24 !important;
    color: #0d1f14 !important;
    font-weight: 800 !important;
  }
  
  /* Cacher les role-chip sur mobile */
  .role-chip {
    display: none !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   4️⃣ FIX MOBILE : PAY STRIP (Paiement: MTN, Orange, Carte, J+1...)
   Scroll horizontal au lieu de superposition
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .pay-strip {
    padding: 8px 12px !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    gap: 8px !important;
    font-size: 0.7rem !important;
    white-space: nowrap !important;
    align-items: center !important;
  }
  
  .pay-strip::-webkit-scrollbar {
    display: none !important;
  }
  
  /* Tous les éléments enfants restent sur une ligne */
  .pay-strip > * {
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }
  
  .pay-methods {
    gap: 4px !important;
    flex-shrink: 0 !important;
  }
  
  .pm {
    padding: 3px 8px !important;
    font-size: 0.65rem !important;
    border-radius: 6px !important;
  }
  
  /* "Strip right" (Livraison offerte dès 50 000 FCFA) reste lisible */
  .strip-right {
    margin-left: 8px !important;
    gap: 8px !important;
    flex-shrink: 0 !important;
  }
  
  .strip-right > * {
    font-size: 0.66rem !important;
    color: var(--gray) !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   5️⃣ FIX MOBILE : ONGLETS DE NAVIGATION (Accueil, Produits, etc.)
   Scroll horizontal propre avec scroll-snap
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .nav-tabs-row {
    padding: 0 8px !important;
    gap: 0 !important;
  }
  
  .nav-tabs {
    flex: 1 !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    scroll-snap-type: x proximity !important;
  }
  
  .nav-tabs::-webkit-scrollbar {
    display: none !important;
  }
  
  .tab {
    scroll-snap-align: start !important;
    flex-shrink: 0 !important;
    padding: 10px 14px !important;
    font-size: 0.78rem !important;
    white-space: nowrap !important;
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
  }
  
  /* "Navigation" bouton plus compact */
  .nav-quick-btn {
    padding: 7px 11px !important;
    font-size: 0.68rem !important;
    flex-shrink: 0 !important;
  }
  
  /* "Made in Cameroun" et les emotional buttons */
  .yorix-emotional-nav {
    padding: 6px 12px !important;
    gap: 5px !important;
  }
  
  .yorix-emotional-nav-btn {
    padding: 5px 11px !important;
    font-size: 0.66rem !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   6️⃣ FIX MOBILE : HERO SECTION
   Plus aéré, CTA plus visibles, panneau de recherche au-dessus
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .hero,
  .hp-hero-shell {
    padding: 28px 16px 36px !important;
  }
  
  .hero h1,
  .hp-hero-shell h1 {
    font-size: clamp(1.5rem, 6vw, 2rem) !important;
    line-height: 1.15 !important;
    margin-bottom: 10px !important;
  }
  
  .hero-sub,
  .hp-hero-sub {
    font-size: 0.82rem !important;
    line-height: 1.65 !important;
    margin-bottom: 18px !important;
  }
  
  /* CTAs en colonne sur mobile pour plus de visibilité */
  .hero-ctas,
  .hp-hero-ctas {
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 22px !important;
  }
  
  .hero-ctas .cta-y,
  .hero-ctas .cta-w,
  .hp-cta-primary,
  .hp-cta-ghost {
    width: 100% !important;
    padding: 12px 18px !important;
    font-size: 0.86rem !important;
    justify-content: center !important;
    display: flex !important;
    align-items: center !important;
    min-height: 48px !important;
  }
  
  /* Cacher la carte de recherche complexe sur mobile (trop dense) */
  /* Si tu veux la garder, retire ce display:none */
  .hero-card,
  .hp-search-panel {
    margin-top: 18px !important;
    padding: 16px !important;
    border-radius: 14px !important;
  }
  
  /* Stats du hero - plus compactes */
  .hero-stats,
  .yhm3-hero-stats {
    gap: 14px !important;
    margin-top: 14px !important;
  }
  
  .stat-num,
  .yhm3-hero-stat-val {
    font-size: 1.2rem !important;
  }
  
  .stat-lbl,
  .yhm3-hero-stat-lbl {
    font-size: 0.62rem !important;
  }
  
  /* Hero chips/badges */
  .hp-chip-scroller {
    overflow-x: auto !important;
    flex-wrap: nowrap !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    padding-bottom: 8px !important;
    margin: 0 -16px 14px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  
  .hp-chip-scroller::-webkit-scrollbar {
    display: none !important;
  }
  
  .hp-chip {
    flex-shrink: 0 !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   7️⃣ FIX MOBILE : BOUTON WHATSAPP FLOTTANT
   Position parfaite, au-dessus du bottom nav, taille tactile
   ─────────────────────────────────────────────────────────────────────────── */

.yorix-wa-fab {
  width: 56px !important;
  height: 56px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
  color: #fff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 26px !important;
  box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 2px 6px rgba(0,0,0,0.15) !important;
  text-decoration: none !important;
  cursor: pointer !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.yorix-wa-fab:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5), 0 2px 8px rgba(0,0,0,0.2) !important;
}

@media (min-width: 901px) {
  .yorix-fab-stack {
    bottom: 28px !important;
    right: 24px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   8️⃣ FIX MOBILE : BOTTOM NAV (barre du bas)
   4 items propres avec icônes claires
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .mobile-nav {
    display: block !important;
    background: #fff !important;
    border-top: 1px solid var(--border) !important;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08) !important;
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom)) !important;
  }
  
  .mn-inner {
    padding: 4px 8px !important;
  }
  
  .mn-item {
    flex: 1 !important;
    min-height: 52px !important;
    padding: 6px 4px !important;
    gap: 3px !important;
    border-radius: 10px !important;
    transition: background 0.2s ease !important;
  }
  
  .mn-item:active {
    background: var(--green-pale) !important;
  }
  
  .mn-icon {
    font-size: 1.4rem !important;
    line-height: 1 !important;
  }
  
  .mn-label {
    font-size: 0.62rem !important;
    font-weight: 600 !important;
  }
  
  .mn-item.active .mn-icon,
  .mn-item.active .mn-label {
    color: var(--green) !important;
    font-weight: 700 !important;
  }
  
  /* Badge sur Panier */
  .mn-badge {
    background: #fbbf24 !important;
    color: #0d1f14 !important;
    font-weight: 800 !important;
    top: 4px !important;
    right: calc(50% - 14px) !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   9️⃣ FIX MOBILE : SECTIONS GÉNÉRALES
   Padding, marges, lisibilité
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .sec {
    padding: 24px 16px !important;
  }
  
  .sec-head {
    margin-bottom: 14px !important;
    gap: 10px !important;
  }
  
  .sec-title {
    font-size: 1.1rem !important;
    line-height: 1.2 !important;
  }
  
  /* Grille produits : 2 colonnes propres */
  .prod-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
  
  .prod-card {
    border-radius: 10px !important;
  }
  
  .prod-img-wrap {
    height: 130px !important;
  }
  
  .prod-info {
    padding: 9px !important;
    gap: 4px !important;
  }
  
  .prod-name {
    font-size: 0.78rem !important;
    -webkit-line-clamp: 2 !important;
  }
  
  .price {
    font-size: 0.9rem !important;
  }
  
  /* Boutons produit plus tactiles */
  .add-btn {
    min-width: 32px !important;
    min-height: 32px !important;
  }
  
  .btn-wa-sm,
  .btn-cmd-sm {
    padding: 7px 8px !important;
    font-size: 0.66rem !important;
    min-height: 36px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   🔟 FIX GLOBAL : OVERFLOW & ZONES TACTILES
   ─────────────────────────────────────────────────────────────────────────── */

html, body, #root {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}

* {
  -webkit-tap-highlight-color: transparent;
}

img, video {
  max-width: 100% !important;
  height: auto !important;
}

/* Zone tactile minimum 44x44px sur tous les boutons */
@media (max-width: 768px) {
  button,
  a[role="button"],
  input[type="submit"],
  input[type="button"],
  .tab,
  .mn-item,
  .icon-btn,
  .user-av {
    min-height: 44px !important;
    touch-action: manipulation !important;
  }
  
  /* Inputs taille minimum pour éviter zoom iOS */
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣1️⃣ FIX MOBILE : CART DRAWER
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .cart-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .cart-header {
    padding: 14px 16px !important;
  }
  
  .cart-title {
    font-size: 1rem !important;
  }
  
  .cart-items {
    padding: 10px 12px !important;
  }
  
  .cart-item {
    padding: 10px !important;
  }
  
  .ci-img {
    width: 64px !important;
    height: 64px !important;
  }
  
  .ci-name {
    font-size: 0.82rem !important;
  }
  
  .cart-footer {
    padding: 12px 14px !important;
  }
  
  .cart-pay-btn {
    padding: 10px 8px !important;
  }
  
  .cart-wa-confirm {
    padding: 14px !important;
    font-size: 0.88rem !important;
    min-height: 48px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣2️⃣ FIX MOBILE : DASHBOARDS (Admin, Vendeur, etc.)
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .dash-content {
    padding: 0 !important;
  }
  
  .dash-page-title {
    font-size: 1.1rem !important;
    margin-bottom: 14px !important;
  }
  
  .dash-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }
  
  .dstat {
    padding: 12px !important;
  }
  
  .dstat-val {
    font-size: 1.15rem !important;
  }
  
  .dstat-lbl {
    font-size: 0.66rem !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣3️⃣ FIX MOBILE : MODALS & POPUPS
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .modal {
    padding: 20px 16px !important;
    max-height: 90vh !important;
    width: 95vw !important;
    border-radius: 14px !important;
  }
  
  .modal-title {
    font-size: 1.1rem !important;
  }
  
  .modal-sub {
    font-size: 0.78rem !important;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 11px !important;
    font-size: 16px !important;
    min-height: 44px !important;
  }
  
  .form-submit {
    padding: 13px !important;
    font-size: 0.9rem !important;
    min-height: 48px !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣4️⃣ AMÉLIORATION : ANIMATIONS PLUS DOUCES
   ─────────────────────────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣5️⃣ FIX SPÉCIFIQUE : CACHER LE SPONSOR "PARAPHARMECIE" SUR MOBILE
   Si c'est un partenaire, il pollue le mobile. À cacher.
   ─────────────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  /* Cible la ligne avec "Aide", "Contact", et le nom du sponsor */
  .topbar-r {
    display: none !important;
  }
  
  /* Si le sponsor a une classe spécifique, on peut le cibler */
  [class*="sponsor"],
  [class*="partner-strip"] {
    display: none !important;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
   1️⃣6️⃣ MENU BURGER UTILISATEUR - VISIBLE SUR MOBILE
   Pour Mon profil + Déconnexion accessibles facilement
   ─────────────────────────────────────────────────────────────────────────── */

/* Menu burger utilisateur — mobile uniquement */
.nav-lang-mobile,
.user-menu-mobile {
  display: none;
}

@media (max-width: 768px) {
.user-menu-trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 38px !important;
  height: 38px !important;
  border-radius: 50% !important;
  background: var(--green-pale) !important;
  border: 2px solid var(--green) !important;
  color: var(--green) !important;
  cursor: pointer !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
}

/* Dropdown du menu user */
.user-menu-dropdown {
  position: absolute !important;
  top: calc(100% + 8px) !important;
  right: 0 !important;
  min-width: 220px !important;
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
  padding: 8px !important;
  z-index: 1000 !important;
}

.user-menu-dropdown a,
.user-menu-dropdown button {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 14px !important;
  border-radius: 8px !important;
  font-size: 0.85rem !important;
  color: var(--ink) !important;
  cursor: pointer !important;
  text-decoration: none !important;
  border: none !important;
  background: transparent !important;
  width: 100% !important;
  text-align: left !important;
  min-height: 44px !important;
}

.user-menu-dropdown a:hover,
.user-menu-dropdown button:hover {
  background: var(--surface2) !important;
}

/* Le bouton déconnexion en rouge, bien visible */
.user-menu-dropdown .logout-btn {
  color: var(--red) !important;
  font-weight: 600 !important;
  border-top: 1px solid var(--border) !important;
  margin-top: 4px !important;
  padding-top: 12px !important;
}

.user-menu-dropdown .logout-btn:hover {
  background: rgba(206, 17, 38, 0.08) !important;
}
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIN DES FIXES MOBILE V2
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   🎯 YORIX CM - SPRINT 2 & 3 FIXES
   Menu burger + FicheProduit + Cart + Dashboards + Checkout
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── 1. USER MENU DRAWER ───────────────────────────────────────────────── */
.umd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 700;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}
.umd-overlay.open {
  opacity: 1;
  pointer-events: all;
}
.umd-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(380px, 100vw);
  height: 100vh;
  height: 100dvh;
  background: var(--surface, #ffffff);
  z-index: 701;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.umd-drawer.open {
  transform: translateX(0);
}
.umd-header {
  background: linear-gradient(135deg, var(--green, #1a6b3a), #0f4a28);
  color: #fff;
  padding: 24px 20px 22px;
  position: relative;
  flex-shrink: 0;
}
.umd-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.umd-close:hover {
  background: rgba(255, 255, 255, 0.28);
}
.umd-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}
.umd-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0d1f14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.umd-avatar-guest {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 2rem;
}
.umd-role-pill {
  position: absolute;
  bottom: -4px;
  right: -8px;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.62rem;
  font-weight: 800;
  border: 2px solid #fff;
  font-family: 'Syne', sans-serif;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.umd-name {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  margin: 8px 0 4px;
  color: #fff;
  line-height: 1.2;
  word-wrap: break-word;
}
.umd-email {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.78);
  margin: 0 0 12px;
  word-break: break-all;
}
.umd-cta-login {
  width: 100%;
  background: #fbbf24;
  color: #0d1f14;
  border: none;
  padding: 11px 16px;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;
}
.umd-cta-login:hover {
  background: #f59e0b;
  transform: translateY(-1px);
}
.umd-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border, #e2ddd6);
  padding: 0;
  flex-shrink: 0;
}
.umd-stat {
  background: var(--surface, #fff);
  border: none;
  padding: 14px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: background 0.2s ease;
  font-family: inherit;
}
.umd-stat:hover {
  background: var(--surface2, #f0ece6);
}
.umd-stat-val {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--ink, #0d1f14);
  line-height: 1;
}
.umd-stat-gold .umd-stat-val {
  color: #f59e0b;
}
.umd-stat-lbl {
  font-size: 0.65rem;
  color: var(--gray, #6b7a72);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.umd-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 20px;
  -webkit-overflow-scrolling: touch;
}
.umd-nav::-webkit-scrollbar {
  width: 4px;
}
.umd-nav::-webkit-scrollbar-thumb {
  background: var(--border, #e2ddd6);
  border-radius: 2px;
}
.umd-section-title {
  padding: 14px 20px 6px;
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray, #6b7a72);
}
.umd-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 13px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--ink, #0d1f14);
  font-weight: 500;
  transition: background 0.15s ease;
  min-height: 50px;
}
.umd-nav-item:hover {
  background: var(--surface2, #f0ece6);
}
.umd-nav-item:active {
  background: var(--green-pale, #c8f5d9);
}
.umd-nav-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
  line-height: 1;
}
.umd-nav-label {
  flex: 1;
  font-weight: 500;
  line-height: 1.3;
}
.umd-nav-arrow {
  color: var(--gray, #6b7a72);
  font-size: 1.1rem;
  opacity: 0.5;
  flex-shrink: 0;
}
.umd-nav-meta {
  font-size: 0.72rem;
  color: var(--gray, #6b7a72);
  font-weight: 600;
  flex-shrink: 0;
}
.umd-nav-meta-hot {
  background: #fef2f2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 0.62rem;
  font-weight: 800;
}
.umd-badge {
  background: #fbbf24;
  color: #0d1f14;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 50px;
  flex-shrink: 0;
  min-width: 24px;
  text-align: center;
}
.umd-nav-item-highlight {
  background: linear-gradient(90deg, var(--green-pale, #c8f5d9), transparent);
  border-left: 3px solid var(--green, #1a6b3a);
}
.umd-nav-item-admin {
  background: linear-gradient(90deg, #fef3c7, transparent);
  border-left: 3px solid #92400e;
  color: #92400e;
  font-weight: 600;
}
.umd-nav-item-wa {
  background: linear-gradient(90deg, rgba(37, 211, 102, 0.08), transparent);
  border-left: 3px solid #25D366;
}
.umd-nav-item-wa:hover {
  background: linear-gradient(90deg, rgba(37, 211, 102, 0.14), transparent);
}
.umd-nav-item-toggle {
  cursor: default;
}
.umd-nav-item-toggle:hover {
  background: transparent;
}
.umd-toggle {
  width: 44px;
  height: 24px;
  border-radius: 50px;
  background: var(--border, #e2ddd6);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
  flex-shrink: 0;
  padding: 0;
}
.umd-toggle-on {
  background: var(--green, #1a6b3a);
}
.umd-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.umd-toggle-on .umd-toggle-knob {
  transform: translateX(20px);
}
.umd-lang-switch {
  display: flex;
  background: var(--surface2, #f0ece6);
  border-radius: 8px;
  padding: 2px;
  flex-shrink: 0;
}
.umd-lang-switch button {
  background: transparent;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--gray, #6b7a72);
  min-height: 32px;
}
.umd-lang-switch button.active {
  background: var(--surface, #fff);
  color: var(--green, #1a6b3a);
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.umd-cta-become-seller {
  margin: 16px 16px 8px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0d1f14;
  border: none;
  padding: 13px;
  border-radius: 12px;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  width: calc(100% - 32px);
  display: block;
  text-align: center;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
  transition: all 0.2s ease;
  min-height: 48px;
}
.umd-cta-become-seller:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}
.umd-logout {
  margin: 12px 16px 8px;
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
  padding: 14px;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  min-height: 48px;
}
.umd-logout:hover {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
  transform: translateY(-1px);
}
.umd-logout:active {
  transform: translateY(0);
}
.umd-footer {
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border, #e2ddd6);
  background: var(--surface2, #f0ece6);
  flex-shrink: 0;
  text-align: center;
}
.umd-footer-text {
  font-size: 0.74rem;
  color: var(--gray, #6b7a72);
  margin: 0 0 3px;
}
.umd-footer-text strong {
  color: var(--green, #1a6b3a);
}
.umd-footer-version {
  font-size: 0.62rem;
  color: var(--gray, #6b7a72);
  opacity: 0.6;
  margin: 0;
}
.umd-trigger {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--surface2, #f0ece6);
  border: 1px solid var(--border, #e2ddd6);
  color: var(--ink, #0d1f14);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  position: relative;
}
.umd-trigger:hover {
  border-color: var(--green, #1a6b3a);
  background: var(--green-pale, #c8f5d9);
}

/* ─── 2. FICHE PRODUIT mobile ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .fiche-produit-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  .img-main {
    width: 100% !important;
    height: 280px !important;
    object-fit: cover !important;
    border-radius: 12px !important;
  }
  .img-gallery {
    gap: 6px !important;
    padding: 8px 0 !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  .img-gallery::-webkit-scrollbar {
    display: none !important;
  }
  .img-gallery-thumb {
    width: 64px !important;
    height: 64px !important;
    flex-shrink: 0 !important;
  }
  .fp-title,
  .product-title {
    font-size: 1.3rem !important;
    line-height: 1.25 !important;
    margin-bottom: 8px !important;
  }
  .fp-price,
  .product-price {
    font-size: 1.6rem !important;
    font-weight: 800 !important;
    color: var(--green, #1a6b3a) !important;
    margin-bottom: 12px !important;
  }
  .fp-add-cart,
  .product-add-cart {
    position: sticky !important;
    bottom: 80px !important;
    z-index: 100 !important;
    width: 100% !important;
    padding: 14px !important;
    font-size: 0.95rem !important;
    min-height: 52px !important;
    background: var(--green, #1a6b3a) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 16px rgba(26, 107, 58, 0.3) !important;
  }
  .fp-description {
    font-size: 0.88rem !important;
    line-height: 1.7 !important;
    color: var(--gray, #6b7a72) !important;
  }
}

/* ─── 3. CART DRAWER mobile ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .cart-header {
    padding: 14px 16px !important;
  }
  .cart-header-icon {
    width: 36px !important;
    height: 36px !important;
  }
  .cart-title {
    font-size: 0.95rem !important;
  }
  .cart-subtitle {
    font-size: 0.66rem !important;
  }
  .cart-trust-bar {
    padding: 7px 12px !important;
    font-size: 0.66rem !important;
    gap: 6px !important;
  }
  .cart-item {
    padding: 10px !important;
    gap: 10px !important;
  }
  .ci-img {
    width: 64px !important;
    height: 64px !important;
  }
  .ci-name {
    font-size: 0.82rem !important;
    -webkit-line-clamp: 2 !important;
    padding-right: 24px !important;
  }
  .ci-vendeur {
    font-size: 0.66rem !important;
  }
  .ci-total-price {
    font-size: 0.95rem !important;
  }
  .ci-unit-price {
    font-size: 0.6rem !important;
  }
  .qty-btn {
    width: 30px !important;
    height: 30px !important;
    font-size: 1rem !important;
  }
  .qty-val {
    font-size: 0.85rem !important;
  }
  .ci-del {
    width: 28px !important;
    height: 28px !important;
    top: 8px !important;
    right: 8px !important;
  }
  .cart-footer {
    padding: 12px 16px !important;
    max-height: 60vh !important;
  }
  .cart-total-row {
    font-size: 0.85rem !important;
    padding: 5px 0 !important;
  }
  .cart-total-row.grand {
    font-size: 1.1rem !important;
  }
  .cart-total-row.grand strong {
    font-size: 1.2rem !important;
  }
  .cart-pay-btn {
    padding: 12px 8px !important;
    min-height: 64px !important;
  }
  .cart-pay-icon {
    font-size: 1.4rem !important;
  }
  .cart-pay-label {
    font-size: 0.72rem !important;
  }
  .cart-wa-confirm {
    padding: 14px !important;
    font-size: 0.92rem !important;
    min-height: 52px !important;
    border-radius: 12px !important;
  }
  .cart-empty {
    padding: 40px 24px !important;
  }
  .cart-empty-icon {
    font-size: 4rem !important;
  }
  .cart-empty-title {
    font-size: 1.05rem !important;
  }
  .cart-empty-sub {
    font-size: 0.82rem !important;
  }
  .cart-empty-btn {
    padding: 13px 28px !important;
    font-size: 0.88rem !important;
    min-height: 48px !important;
  }
}

/* ─── 4. DASHBOARD mobile ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-layout-inner,
  .dash-layout {
    flex-direction: column !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    padding: 0 !important;
  }
  .admin-sidebar,
  .dash-sidebar {
    position: sticky !important;
    top: 56px !important;
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    padding: 10px !important;
    gap: 6px !important;
    background: var(--surface, #fff) !important;
    border-bottom: 1px solid var(--border, #e2ddd6) !important;
    z-index: 200 !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }
  .admin-sidebar::-webkit-scrollbar,
  .dash-sidebar::-webkit-scrollbar {
    display: none !important;
  }
  .admin-sidebar-logo,
  .dash-avatar,
  .dash-name,
  .dash-role-badge {
    display: none !important;
  }
  .admin-nav-item,
  .dash-nav-item {
    flex-shrink: 0 !important;
    white-space: nowrap !important;
    border-left: none !important;
    border-bottom: 3px solid transparent !important;
    padding: 8px 14px !important;
    font-size: 0.78rem !important;
    min-height: 44px !important;
    border-radius: 8px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  .admin-nav-item.active,
  .dash-nav-item.active {
    border-left: none !important;
    border-bottom-color: var(--green, #1a6b3a) !important;
    background: var(--green-pale, #c8f5d9) !important;
  }
  .admin-content,
  .dash-content {
    padding: 16px 12px calc(80px + env(safe-area-inset-bottom)) !important;
    min-width: 0 !important;
  }
  .admin-page-title,
  .dash-page-title {
    font-size: 1.15rem !important;
    margin-bottom: 14px !important;
    flex-wrap: wrap !important;
  }
  .stat-cards-grid,
  .dash-stats {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    margin-bottom: 16px !important;
  }
  .stat-card,
  .dstat {
    padding: 12px !important;
    border-radius: 10px !important;
  }
  .stat-card-icon,
  .dstat-icon {
    font-size: 1.1rem !important;
    width: 36px !important;
    height: 36px !important;
    margin-bottom: 6px !important;
  }
  .stat-card-val,
  .dstat-val {
    font-size: 1.1rem !important;
  }
  .stat-card-lbl,
  .dstat-lbl {
    font-size: 0.65rem !important;
  }
  .admin-table-wrap,
  .admin-table {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .admin-table {
    min-width: 600px !important;
    font-size: 0.72rem !important;
  }
  .admin-table th,
  .admin-table td {
    padding: 8px 10px !important;
  }
  .admin-action-btn {
    padding: 6px 10px !important;
    font-size: 0.65rem !important;
    min-height: 36px !important;
  }
  .admin-search {
    width: 100% !important;
    max-width: none !important;
    font-size: 16px !important;
    padding: 10px 12px !important;
  }
  .admin-filter-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  .admin-section {
    padding: 14px !important;
    margin-bottom: 14px !important;
  }
  .admin-section-title {
    font-size: 0.85rem !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
  }
  .chart-bar-wrap {
    height: 60px !important;
  }
}

/* ─── 5. CHECKOUT mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .checkout-page-wrap {
    padding: 0 12px !important;
  }
  .checkout-progress {
    padding: 10px 8px 12px !important;
    margin-bottom: 14px !important;
    border-radius: 12px !important;
  }
  .checkout-progress-node {
    width: min(22vw, 78px) !important;
    padding: 4px 2px !important;
  }
  .checkout-progress-node-inner {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.9rem !important;
  }
  .checkout-progress-label {
    font-size: 0.6rem !important;
    line-height: 1.15 !important;
  }
  .checkout-progress-lead {
    height: 2px !important;
    margin-right: 4px !important;
  }
  .card.checkout-form-card {
    padding: 16px !important;
    border-radius: 12px !important;
    margin-bottom: 14px !important;
  }
  .checkout-step-heading {
    font-size: 0.95rem !important;
    margin-bottom: 8px !important;
  }
  .checkout-step-lead {
    font-size: 0.78rem !important;
    margin-bottom: 12px !important;
  }
  .checkout-step-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
  .checkout-field {
    gap: 4px !important;
  }
  .checkout-field input,
  .checkout-field select,
  .checkout-field textarea {
    font-size: 16px !important;
    padding: 12px !important;
    min-height: 48px !important;
    border-radius: 10px !important;
    border: 1.5px solid var(--border, #e2ddd6) !important;
  }
  .checkout-field input:focus,
  .checkout-field select:focus,
  .checkout-field textarea:focus {
    border-color: var(--green, #1a6b3a) !important;
    box-shadow: 0 0 0 3px rgba(26, 107, 58, 0.15) !important;
  }
  .checkout-trust-row {
    flex-direction: column !important;
    gap: 6px !important;
    align-items: stretch !important;
  }
  .checkout-trust-row span {
    text-align: center !important;
    padding: 8px 12px !important;
    font-size: 0.74rem !important;
  }
  .checkout-estimate-box {
    padding: 12px !important;
    border-radius: 10px !important;
    position: sticky !important;
    bottom: 0 !important;
    z-index: 50 !important;
    background: var(--surface, #fff) !important;
    margin: 0 -12px !important;
    border-bottom: none !important;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08) !important;
  }
  .checkout-pay-recap {
    font-size: 0.84rem !important;
  }
  .checkout-pay-recap-total {
    font-size: 1rem !important;
    margin-top: 10px !important;
    padding-top: 10px !important;
  }
  .checkout-submit-btn,
  .checkout-cta {
    width: 100% !important;
    padding: 14px !important;
    font-size: 0.95rem !important;
    min-height: 52px !important;
    border-radius: 12px !important;
    background: var(--green, #1a6b3a) !important;
    color: #fff !important;
    font-weight: 700 !important;
    border: none !important;
    box-shadow: 0 4px 16px rgba(26, 107, 58, 0.3) !important;
    margin-top: 12px !important;
  }
}

/* ─── 6. GLOBAL UI ────────────────────────────────────────────────────────── */
html {
  scroll-behavior: smooth !important;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(26, 107, 58, 0.4) !important;
  outline-offset: 2px !important;
}
@keyframes umd-skeleton {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.umd-skeleton {
  background: linear-gradient(90deg,
    var(--surface2, #f0ece6) 25%,
    var(--surface, #fff) 50%,
    var(--surface2, #f0ece6) 75%
  );
  background-size: 200% 100%;
  animation: umd-skeleton 1.4s ease-in-out infinite;
  border-radius: 8px;
}
.toast,
[class*="toast"] {
  border-radius: 12px !important;
  padding: 12px 16px !important;
  font-size: 0.88rem !important;
  font-weight: 500 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

/* ═══════════════════════════════════════════════════════════════════════════
   YORIX — HEADER MOBILE PREMIUM (≤768px uniquement)
   Logo · Langue · Catégories · Notifications · Profil + recherche ligne 2
   ═══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .header-sticky-stack {
    position: sticky !important;
    top: 0 !important;
    z-index: 440 !important;
    backdrop-filter: blur(14px) saturate(1.15) !important;
    -webkit-backdrop-filter: blur(14px) saturate(1.15) !important;
    background: color-mix(in srgb, var(--surface) 90%, transparent) !important;
    box-shadow: 0 4px 24px rgba(13, 31, 20, 0.08) !important;
  }

  .header-sticky-stack--compact {
    box-shadow: 0 6px 28px rgba(13, 31, 20, 0.12) !important;
  }

  .navbar.navbar--yorix-mobile {
    display: grid !important;
    grid-template-columns: auto auto minmax(0, 1fr) auto !important;
    grid-template-rows: auto auto !important;
    grid-template-areas:
      "logo lang cats actions"
      "search search search search" !important;
    align-items: center !important;
    gap: 6px 8px !important;
    padding: 8px 10px 10px !important;
    height: auto !important;
    min-height: 52px !important;
    max-width: 100vw !important;
    overflow: hidden !important;
    background: transparent !important;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 85%, transparent) !important;
  }

  .navbar.navbar--yorix-mobile .logo-wrap {
    grid-area: logo !important;
    flex-shrink: 0 !important;
    min-width: 0 !important;
  }

  .navbar.navbar--yorix-mobile .nav-lang-mobile {
    grid-area: lang !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 2px !important;
    flex-shrink: 0 !important;
    padding: 4px 6px !important;
    border-radius: 8px !important;
    background: var(--surface2) !important;
    border: 1px solid var(--border) !important;
    font-size: 0.64rem !important;
    font-weight: 700 !important;
    line-height: 1 !important;
  }

  .navbar.navbar--yorix-mobile .nav-lang-mobile span[aria-hidden] {
    opacity: 0.35 !important;
    font-size: 0.58rem !important;
  }

  .navbar.navbar--yorix-mobile .nav-lang-mobile button {
    padding: 4px 5px !important;
    min-height: 28px !important;
    min-width: 26px !important;
    border-radius: 6px !important;
    touch-action: manipulation !important;
  }

  .navbar.navbar--yorix-mobile .nav-lang-mobile button.active {
    background: var(--green-pale) !important;
    color: var(--green) !important;
  }

  .navbar.navbar--yorix-mobile .cat-mega-wrap {
    grid-area: cats !important;
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
  }

  .navbar.navbar--yorix-mobile .nav-search-wrap {
    grid-area: search !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }

  .navbar.navbar--yorix-mobile .nav-actions {
    grid-area: actions !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 4px !important;
    margin-left: 0 !important;
    flex-shrink: 0 !important;
    min-width: 0 !important;
  }

  /* Panier dans la bottom nav — libère l'espace header */
  .navbar.navbar--yorix-mobile .nav-actions > .icon-btn {
    display: none !important;
  }

  .navbar.navbar--yorix-mobile .ybell-wrap {
    flex-shrink: 0 !important;
    position: relative !important;
    z-index: 3 !important;
  }

  .navbar.navbar--yorix-mobile .user-menu-mobile {
    flex-shrink: 0 !important;
  }

  .navbar.navbar--yorix-mobile .user-menu-trigger.umd-trigger {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    border-radius: 50% !important;
    border: 2px solid var(--green) !important;
    background: linear-gradient(145deg, var(--green-pale), var(--surface)) !important;
    box-shadow: 0 2px 10px rgba(26, 107, 58, 0.18) !important;
    font-size: 0.88rem !important;
    font-weight: 800 !important;
    transition: transform 0.12s ease, box-shadow 0.15s ease !important;
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .navbar.navbar--yorix-mobile .user-menu-trigger.umd-trigger:active {
    transform: scale(0.94) !important;
    box-shadow: 0 1px 6px rgba(26, 107, 58, 0.22) !important;
  }

  .navbar.navbar--yorix-mobile .nav-search {
    border-radius: 12px !important;
    min-height: 42px !important;
  }

  .navbar.navbar--yorix-mobile .nav-search input {
    font-size: 16px !important;
    padding: 10px 12px !important;
  }

  .navbar.navbar--yorix-mobile .nav-search button {
    min-width: 44px !important;
  }

  /* Empêche le scroll horizontal global sur petits Android */
  .header-sticky-stack,
  .navbar.navbar--yorix-mobile,
  .nav-tabs-row,
  .pay-strip {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .nav-tabs-row {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .yorix-emotional-nav {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (max-width: 360px) {
  .navbar.navbar--yorix-mobile .categories-title {
    max-width: 72px !important;
  }

  .navbar.navbar--yorix-mobile .logo-txt {
    font-size: 1.1rem !important;
  }

  .navbar.navbar--yorix-mobile .nav-lang-mobile {
    font-size: 0.6rem !important;
    padding: 3px 5px !important;
  }
}

`;
