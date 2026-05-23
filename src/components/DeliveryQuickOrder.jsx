// ═══════════════════════════════════════════════════════════════
//  YORIX CM — DELIVERY QUICK ORDER v4
//  ✅ CALCUL DE DISTANCE EN TEMPS RÉEL via dictionnaire de quartiers
//  ✅ Tarifs Yorix CM
//  ✅ Mode urgent × 2
//  
//  💡 COMMENT ÇA MARCHE :
//  L'utilisateur tape "Bastos" → on cherche les coordonnées GPS
//  L'utilisateur tape "Ahala" → on cherche les coordonnées GPS
//  On calcule la distance réelle (formule Haversine) en km
//  Si quartier non trouvé → fallback sur moyenne ville
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { YORIX_WA_NUMBER } from "../lib/supabase";
import { showAppToast } from "../lib/appToast";

// ── TARIFS YORIX CM (FCFA) ──
const TARIFS = {
  document:    { base: 1000, parKm: 75,  icon: "📄", label: "Enveloppe",    desc: "Lettres, documents" },
  petit_colis: { base: 1500, parKm: 100, icon: "📦", label: "Petit colis",  desc: "Moins de 5 kg" },
  moyen_colis: { base: 2000, parKm: 200, icon: "📮", label: "Moyen colis",  desc: "5 à 20 kg" },
  gros_colis:  { base: 3000, parKm: 300, icon: "🪑", label: "Gros colis",   desc: "Plus de 20 kg" },
  repas:       { base: 1500, parKm: 75,  icon: "🍱", label: "Repas",        desc: "Restaurants, plats" },
  courses:     { base: 2500, parKm: 300, icon: "🛒", label: "Courses",      desc: "Marché, supermarché" },
};

// ═══════════════════════════════════════════════════════════════
//  DICTIONNAIRE DES QUARTIERS AVEC COORDONNÉES GPS RÉELLES
//  Tu peux en ajouter facilement : { "nom_quartier": [latitude, longitude] }
//  Recherche le nom → utilise les coordonnées pour calculer la distance
// ═══════════════════════════════════════════════════════════════
const QUARTIERS = {
  // ─── YAOUNDÉ I ───
  "bastos": { ville: "Yaoundé", coords: [3.8920, 11.5180] },
  "etoudi": { ville: "Yaoundé", coords: [3.9120, 11.5380] },
  "messassi": { ville: "Yaoundé", coords: [3.8740, 11.5050] },
  "nlongkak": { ville: "Yaoundé", coords: [3.8950, 11.5290] },
  "elig essono": { ville: "Yaoundé", coords: [3.8890, 11.5290] },
  "elig-essono": { ville: "Yaoundé", coords: [3.8890, 11.5290] },
  "etoa meki": { ville: "Yaoundé", coords: [3.8920, 11.5350] },
  "etoa-meki": { ville: "Yaoundé", coords: [3.8920, 11.5350] },
  "emana": { ville: "Yaoundé", coords: [3.9070, 11.5160] },
  "olembe": { ville: "Yaoundé", coords: [3.9320, 11.4890] },
  "tongolo": { ville: "Yaoundé", coords: [3.9010, 11.5270] },
  "nyom": { ville: "Yaoundé", coords: [3.9440, 11.4970] },
  "okolo": { ville: "Yaoundé", coords: [3.9030, 11.5240] },

  // ─── YAOUNDÉ II ───
  "mokolo": { ville: "Yaoundé", coords: [3.8810, 11.5100] },
  "tsinga": { ville: "Yaoundé", coords: [3.8830, 11.5050] },
  "cite verte": { ville: "Yaoundé", coords: [3.8790, 11.5190] },
  "cité verte": { ville: "Yaoundé", coords: [3.8790, 11.5190] },
  "madagascar": { ville: "Yaoundé", coords: [3.8780, 11.5120] },
  "ekoudou": { ville: "Yaoundé", coords: [3.8800, 11.5070] },
  "briqueterie": { ville: "Yaoundé", coords: [3.8790, 11.5060] },
  "messa": { ville: "Yaoundé", coords: [3.8740, 11.5050] },
  "messa carriere": { ville: "Yaoundé", coords: [3.8760, 11.5040] },
  "messa carrière": { ville: "Yaoundé", coords: [3.8760, 11.5040] },
  "febe": { ville: "Yaoundé", coords: [3.8670, 11.5030] },
  "oliga": { ville: "Yaoundé", coords: [3.8850, 11.5180] },

  // ─── YAOUNDÉ III ───
  "obili": { ville: "Yaoundé", coords: [3.8660, 11.4910] },
  "ngoa ekele": { ville: "Yaoundé", coords: [3.8650, 11.5200] },
  "ngoa-ekele": { ville: "Yaoundé", coords: [3.8650, 11.5200] },
  "melen": { ville: "Yaoundé", coords: [3.8610, 11.4850] },
  "melen 4": { ville: "Yaoundé", coords: [3.8590, 11.4860] },
  "melen 8": { ville: "Yaoundé", coords: [3.8580, 11.4840] },
  "olezoa": { ville: "Yaoundé", coords: [3.8520, 11.5120] },
  "dakar": { ville: "Yaoundé", coords: [3.8500, 11.5180] },
  "efoulan": { ville: "Yaoundé", coords: [3.8350, 11.5100] },
  "ahala": { ville: "Yaoundé", coords: [3.8160, 11.4980] },
  "nsam": { ville: "Yaoundé", coords: [3.8400, 11.5300] },
  "obobogo": { ville: "Yaoundé", coords: [3.8290, 11.5200] },
  "nsimeyong": { ville: "Yaoundé", coords: [3.8480, 11.4940] },
  "nkolmesseng": { ville: "Yaoundé", coords: [3.8560, 11.5480] },

  // ─── YAOUNDÉ IV ───
  "mvan": { ville: "Yaoundé", coords: [3.8270, 11.5210] },
  "mvan nord": { ville: "Yaoundé", coords: [3.8310, 11.5200] },
  "mvan sud": { ville: "Yaoundé", coords: [3.8230, 11.5190] },
  "odza": { ville: "Yaoundé", coords: [3.8000, 11.5500] },
  "ekounou": { ville: "Yaoundé", coords: [3.8420, 11.5480] },
  "biteng": { ville: "Yaoundé", coords: [3.8120, 11.5600] },
  "kondengui": { ville: "Yaoundé", coords: [3.8500, 11.5600] },
  "mimboman": { ville: "Yaoundé", coords: [3.8580, 11.5700] },
  "nkolndongo": { ville: "Yaoundé", coords: [3.8510, 11.5530] },
  "mvog mbi": { ville: "Yaoundé", coords: [3.8440, 11.5350] },
  "mvog-mbi": { ville: "Yaoundé", coords: [3.8440, 11.5350] },
  "ekoumdoum": { ville: "Yaoundé", coords: [3.8060, 11.5650] },

  // ─── YAOUNDÉ V ───
  "mvog ada": { ville: "Yaoundé", coords: [3.8580, 11.5290] },
  "mvog-ada": { ville: "Yaoundé", coords: [3.8580, 11.5290] },
  "essos": { ville: "Yaoundé", coords: [3.8780, 11.5380] },
  "mfandena": { ville: "Yaoundé", coords: [3.8710, 11.5450] },
  "quartier fouda": { ville: "Yaoundé", coords: [3.8670, 11.5260] },
  "fouda": { ville: "Yaoundé", coords: [3.8670, 11.5260] },
  "ngousso": { ville: "Yaoundé", coords: [3.8920, 11.5500] },
  "ngoulmekong": { ville: "Yaoundé", coords: [3.8720, 11.5350] },
  "eleveur": { ville: "Yaoundé", coords: [3.8830, 11.5440] },

  // ─── YAOUNDÉ VI ───
  "biyem assi": { ville: "Yaoundé", coords: [3.8430, 11.4830] },
  "biyem-assi": { ville: "Yaoundé", coords: [3.8430, 11.4830] },
  "mendong": { ville: "Yaoundé", coords: [3.8320, 11.4700] },
  "simbock": { ville: "Yaoundé", coords: [3.8100, 11.4600] },
  "etoug ebe": { ville: "Yaoundé", coords: [3.8400, 11.4700] },
  "etoug-ebe": { ville: "Yaoundé", coords: [3.8400, 11.4700] },
  "mvog betsi": { ville: "Yaoundé", coords: [3.8470, 11.4780] },
  "mvog-betsi": { ville: "Yaoundé", coords: [3.8470, 11.4780] },
  "elig effa": { ville: "Yaoundé", coords: [3.8510, 11.4750] },
  "elig-effa": { ville: "Yaoundé", coords: [3.8510, 11.4750] },

  // ─── YAOUNDÉ VII ───
  "nkolbisson": { ville: "Yaoundé", coords: [3.8700, 11.4500] },
  "etetak": { ville: "Yaoundé", coords: [3.8760, 11.4560] },
  "oyom abang": { ville: "Yaoundé", coords: [3.8800, 11.4620] },
  "oyom-abang": { ville: "Yaoundé", coords: [3.8800, 11.4620] },
  "minkoameyos": { ville: "Yaoundé", coords: [3.8600, 11.4400] },
  "nkolso": { ville: "Yaoundé", coords: [3.8680, 11.4450] },
    "centre ville": { ville: "Yaoundé", coords: [3.8670, 11.5170] },
"centre-ville": { ville: "Yaoundé", coords: [3.8670, 11.5170] },
"yaounde": { ville: "Yaoundé", coords: [3.8670, 11.5170] },
"yaoundé": { ville: "Yaoundé", coords: [3.8670, 11.5170] },

  // ─── DOUALA I (Bonanjo / Akwa / Deido) ───
  "akwa": { ville: "Douala", coords: [4.0511, 9.7679] },
  "bonanjo": { ville: "Douala", coords: [4.0430, 9.6940] },
  "deido": { ville: "Douala", coords: [4.0600, 9.7300] },
  "deïdo": { ville: "Douala", coords: [4.0600, 9.7300] },
  "bonapriso": { ville: "Douala", coords: [4.0320, 9.7080] },
  "bonapriso village": { ville: "Douala", coords: [4.0300, 9.7100] },
  "bali": { ville: "Douala", coords: [4.0500, 9.7480] },
  "new bell": { ville: "Douala", coords: [4.0450, 9.7350] },
  "new-bell": { ville: "Douala", coords: [4.0450, 9.7350] },
  "bonadibong": { ville: "Douala", coords: [4.0550, 9.7420] },

  // ─── DOUALA II (New Bell / Bepanda / Makepe) ───
  "bepanda": { ville: "Douala", coords: [4.0700, 9.7500] },
  "bependa": { ville: "Douala", coords: [4.0700, 9.7500] },
  "makepe": { ville: "Douala", coords: [4.0800, 9.7600] },
  "makepé": { ville: "Douala", coords: [4.0800, 9.7600] },
  "makepe missoke": { ville: "Douala", coords: [4.0850, 9.7650] },
  "makepe petit pays": { ville: "Douala", coords: [4.0870, 9.7700] },
  "ndogpassi": { ville: "Douala", coords: [4.0600, 9.7800] },
  "ndogbong": { ville: "Douala", coords: [4.0720, 9.7750] },
  "cite cicam": { ville: "Douala", coords: [4.0780, 9.7580] },
  "cité cicam": { ville: "Douala", coords: [4.0780, 9.7580] },

  // ─── DOUALA III (Logbaba / Nyalla / PK zones) ───
  "logbaba": { ville: "Douala", coords: [4.0200, 9.8000] },
  "nyalla": { ville: "Douala", coords: [4.0100, 9.7900] },
  "nyala": { ville: "Douala", coords: [4.0100, 9.7900] },
  "pk8": { ville: "Douala", coords: [4.0000, 9.8100] },
  "pk9": { ville: "Douala", coords: [3.9950, 9.8150] },
  "pk10": { ville: "Douala", coords: [3.9900, 9.8200] },
  "pk11": { ville: "Douala", coords: [3.9850, 9.8250] },
  "pk12": { ville: "Douala", coords: [3.9800, 9.8300] },
  "bassa": { ville: "Douala", coords: [4.0400, 9.7900] },
  "ndokoti": { ville: "Douala", coords: [4.0500, 9.7800] },
  "yassa": { ville: "Douala", coords: [4.0000, 9.8350] },

  // ─── DOUALA IV (Bonaberi) ───
  "bonaberi": { ville: "Douala", coords: [4.0700, 9.6800] },
  "bonabéry": { ville: "Douala", coords: [4.0700, 9.6800] },
  "nkomba": { ville: "Douala", coords: [4.0750, 9.6700] },
  "bojongo": { ville: "Douala", coords: [4.0800, 9.6650] },
  "bonendale": { ville: "Douala", coords: [4.0900, 9.6600] },
  "bonassama": { ville: "Douala", coords: [4.0600, 9.6900] },
  "bonamikano": { ville: "Douala", coords: [4.0650, 9.6880] },

  // ─── DOUALA V (Kotto / Logpom / Denver) ───
  "kotto": { ville: "Douala", coords: [4.0900, 9.7800] },
  "kotto village": { ville: "Douala", coords: [4.0920, 9.7820] },
  "logpom": { ville: "Douala", coords: [4.0950, 9.7900] },
  "denver": { ville: "Douala", coords: [4.1000, 9.7880] },
  "bangue": { ville: "Douala", coords: [4.0850, 9.7850] },
  "bangue 1": { ville: "Douala", coords: [4.0840, 9.7840] },
  "bangue 2": { ville: "Douala", coords: [4.0860, 9.7860] },
  "pk14": { ville: "Douala", coords: [3.9700, 9.8400] },
  "pk13": { ville: "Douala", coords: [3.9750, 9.8350] },

  // ─── DOUALA GLOBAL / CENTRE UX ───
  "douala": { ville: "Douala", coords: [4.0511, 9.7679] },
  "centre douala": { ville: "Douala", coords: [4.0511, 9.7679] },
  "centre-ville douala": { ville: "Douala", coords: [4.0511, 9.7679] },
  "aeroport douala": { ville: "Douala", coords: [4.0061, 9.7195] },
  "aéroport douala": { ville: "Douala", coords: [4.0061, 9.7195] },
  "port autonome": { ville: "Douala", coords: [4.0400, 9.6800] },

  // ─── ZONES COMMERCIALES / BUSINESS ───
  "marche central": { ville: "Douala", coords: [4.0480, 9.7500] },
  "marché central": { ville: "Douala", coords: [4.0480, 9.7500] },
  "mboppi": { ville: "Douala", coords: [4.0550, 9.7600] },
  "douche municipale": { ville: "Douala", coords: [4.0530, 9.7520] },
  "village": { ville: "Douala", coords: [4.0580, 9.7400] },
  "feu rouge bessengue": { ville: "Douala", coords: [4.0600, 9.7700] },
  "bessengue": { ville: "Douala", coords: [4.0610, 9.7690] },

  // ─── BAFOUSSAM I (Centre administratif / Commercial) ───
  // (Pas de clé générique "centre-ville" ici — doublon JS avec Yaoundé/Bamenda ; utiliser / ajouter synonymes ci-dessous.)
  "centre commercial": { ville: "Bafoussam", coords: [5.4790, 10.4180] },
  "marche a": { ville: "Bafoussam", coords: [5.4800, 10.4190] },
  "marche central bafoussam": { ville: "Bafoussam", coords: [5.4785, 10.4175] },
  "marche central baf": { ville: "Bafoussam", coords: [5.4785, 10.4175] },
  "banéngo": { ville: "Bafoussam", coords: [5.4860, 10.4100] },
  "tougang": { ville: "Bafoussam", coords: [5.4740, 10.4250] },
  "kamkop": { ville: "Bafoussam", coords: [5.4820, 10.4210] },
  "haoussa": { ville: "Bafoussam", coords: [5.4770, 10.4200] },

  // ─── BAFOUSSAM II (Tamdja / Djeleng / Famla) ───
  "djeleng": { ville: "Bafoussam", coords: [5.4700, 10.4300] },
  "tamdja": { ville: "Bafoussam", coords: [5.4680, 10.4270] },
  "famla": { ville: "Bafoussam", coords: [5.4650, 10.4350] },
  "tamdja carrefour": { ville: "Bafoussam", coords: [5.4690, 10.4280] },
  "cassette": { ville: "Bafoussam", coords: [5.4720, 10.4320] },
  "carrière": { ville: "Bafoussam", coords: [5.4670, 10.4380] },
  "carriere": { ville: "Bafoussam", coords: [5.4670, 10.4380] },
  "banock": { ville: "Bafoussam", coords: [5.4710, 10.4400] },
  "ngouache": { ville: "Bafoussam", coords: [5.4730, 10.4450] },

  // ─── BAFOUSSAM III (Toket / Tyo-ville / Ndiendam) ───
  "toket": { ville: "Bafoussam", coords: [5.4900, 10.4300] },
  "tyo ville": { ville: "Bafoussam", coords: [5.4880, 10.4260] },
  "tyo-ville": { ville: "Bafoussam", coords: [5.4880, 10.4260] },
  "ndiendam": { ville: "Bafoussam", coords: [5.4920, 10.4350] },
  "kouogouo": { ville: "Bafoussam", coords: [5.4950, 10.4380] },
  "tchitchap": { ville: "Bafoussam", coords: [5.4930, 10.4420] },
  "kouekong": { ville: "Bafoussam", coords: [5.5000, 10.4400] },

  // ─── AXES & POINTS STRATÉGIQUES ───
  "entrée de ville": { ville: "Bafoussam", coords: [5.4750, 10.4100] },
  "entree de ville": { ville: "Bafoussam", coords: [5.4750, 10.4100] },
  "sortie bafang": { ville: "Bafoussam", coords: [5.4600, 10.4000] },
  "sortie douala": { ville: "Bafoussam", coords: [5.4700, 10.4050] },
  "sortie yaounde": { ville: "Bafoussam", coords: [5.4850, 10.4300] },
  "sortie yaoundé": { ville: "Bafoussam", coords: [5.4850, 10.4300] },

  // ─── ÉDUCATION / HÔPITAUX / SERVICES ───
  "hopital regional": { ville: "Bafoussam", coords: [5.4790, 10.4220] },
  "hôpital régional": { ville: "Bafoussam", coords: [5.4790, 10.4220] },
  "universite des montagnes": { ville: "Bafoussam", coords: [5.5000, 10.4500] },
  "université des montagnes": { ville: "Bafoussam", coords: [5.5000, 10.4500] },
  "prefecture": { ville: "Bafoussam", coords: [5.4780, 10.4160] },
  "préfecture": { ville: "Bafoussam", coords: [5.4780, 10.4160] },

  // ─── QUARTIERS POPULAIRES / RÉSIDENTIELS ───
  "banengo village": { ville: "Bafoussam", coords: [5.4870, 10.4090] },
  "famla 2": { ville: "Bafoussam", coords: [5.4640, 10.4370] },
  "djeleng 5": { ville: "Bafoussam", coords: [5.4710, 10.4310] },
  "tougang village": { ville: "Bafoussam", coords: [5.4730, 10.4260] },
  "kamkop 2": { ville: "Bafoussam", coords: [5.4830, 10.4220] },

  // ─── TRANSPORT / GARES ───
  "gare routiere": { ville: "Bafoussam", coords: [5.4770, 10.4180] },
  "gare routière": { ville: "Bafoussam", coords: [5.4770, 10.4180] },
  "agence de voyage": { ville: "Bafoussam", coords: [5.4780, 10.4190] },
  "carrefour total": { ville: "Bafoussam", coords: [5.4760, 10.4210] },

  // ─── GLOBAL UX / MATCHING ───
  "bafoussam centre": { ville: "Bafoussam", coords: [5.4781, 10.4170] },
  "bafoussam centre-ville": { ville: "Bafoussam", coords: [5.4781, 10.4170] },

  // ─── BAMENDA I (Up Station / Commercial Avenue / Nkwen core) ───
  // Synonymes centre-ville (évite doublon de clé "centre-ville" avec Yaoundé.)
  "centre ville bamenda": { ville: "Bamenda", coords: [5.9631, 10.1591] },
  "centre-ville bamenda": { ville: "Bamenda", coords: [5.9631, 10.1591] },
  "commercial avenue": { ville: "Bamenda", coords: [5.9590, 10.1510] },
  "commercial avenue food market": { ville: "Bamenda", coords: [5.9580, 10.1520] },
  "up station": { ville: "Bamenda", coords: [5.9700, 10.1600] },
  "station": { ville: "Bamenda", coords: [5.9680, 10.1590] },
  "hospital roundabout": { ville: "Bamenda", coords: [5.9650, 10.1560] },
  "city chemist roundabout": { ville: "Bamenda", coords: [5.9610, 10.1540] },
  "meta quarters": { ville: "Bamenda", coords: [5.9660, 10.1630] },
  "old town": { ville: "Bamenda", coords: [5.9560, 10.1480] },

  // ─── BAMENDA II (Mankon / Food Market / Below Foncha) ───
  "mankon": { ville: "Bamenda", coords: [5.9750, 10.1700] },
  "mankon town": { ville: "Bamenda", coords: [5.9740, 10.1690] },
  "food market": { ville: "Bamenda", coords: [5.9570, 10.1530] },
  "main market": { ville: "Bamenda", coords: [5.9580, 10.1520] },
  "below foncha": { ville: "Bamenda", coords: [5.9520, 10.1490] },
  "foncha street": { ville: "Bamenda", coords: [5.9530, 10.1500] },
  "cow street": { ville: "Bamenda", coords: [5.9550, 10.1510] },
  "mobile nkwen": { ville: "Bamenda", coords: [5.9800, 10.1800] },
  "cow fence": { ville: "Bamenda", coords: [5.9540, 10.1500] },

  // ─── BAMENDA III (Nkwen / Mile 2 / Mile 3 / Mile 4 / Finance) ───
  "nkwen": { ville: "Bamenda", coords: [5.9850, 10.1850] },
  "mile 2": { ville: "Bamenda", coords: [5.9780, 10.1760] },
  "mile 3": { ville: "Bamenda", coords: [5.9860, 10.1840] },
  "mile 4": { ville: "Bamenda", coords: [5.9950, 10.1930] },
  "mile 5": { ville: "Bamenda", coords: [6.0050, 10.2020] },
  "finance junction": { ville: "Bamenda", coords: [5.9820, 10.1810] },
  "finance": { ville: "Bamenda", coords: [5.9820, 10.1810] },
  "hospital roundabout nkwen": { ville: "Bamenda", coords: [5.9840, 10.1820] },
  "fons palace nkwen": { ville: "Bamenda", coords: [5.9890, 10.1880] },

  // ─── UNIVERSITY / EDUCATION HUB ───
  "bambili": { ville: "Bamenda", coords: [5.9900, 10.2500] },
  "university of bamenda": { ville: "Bamenda", coords: [5.9910, 10.2480] },
  "university of bamenda bambili": { ville: "Bamenda", coords: [5.9910, 10.2480] },
  "ambili": { ville: "Bamenda", coords: [5.9880, 10.2450] },

  // ─── MAJOR TRANSPORT / ROAD AXES ───
  "bus station": { ville: "Bamenda", coords: [5.9600, 10.1540] },
  "main bus station": { ville: "Bamenda", coords: [5.9600, 10.1540] },
  "travel agency park": { ville: "Bamenda", coords: [5.9590, 10.1530] },
  "small soppo": { ville: "Bamenda", coords: [5.9500, 10.1450] },
  "big soppo": { ville: "Bamenda", coords: [5.9450, 10.1400] },
  "soppo": { ville: "Bamenda", coords: [5.9480, 10.1430] },

  // ─── GOVERNMENT / ADMINISTRATIVE ───
  "governor's office": { ville: "Bamenda", coords: [5.9670, 10.1580] },
  "governors office": { ville: "Bamenda", coords: [5.9670, 10.1580] },
  "grandstand": { ville: "Bamenda", coords: [5.9640, 10.1570] },
  "court": { ville: "Bamenda", coords: [5.9630, 10.1560] },

  // ─── HEALTH / SERVICES ───
  "bamenda regional hospital": { ville: "Bamenda", coords: [5.9650, 10.1560] },
  "regional hospital": { ville: "Bamenda", coords: [5.9650, 10.1560] },
  "cbc hospital": { ville: "Bamenda", coords: [5.9800, 10.1800] },

  // ─── BUSINESS / HIGH ACTIVITY ───
  "city chemist": { ville: "Bamenda", coords: [5.9610, 10.1540] },
  "pharmacy roundabout": { ville: "Bamenda", coords: [5.9620, 10.1550] },
  "ntamulung": { ville: "Bamenda", coords: [5.9900, 10.2100] },
  "mulang": { ville: "Bamenda", coords: [5.9870, 10.2050] },

  // ─── GLOBAL UX / MATCHING ───
  "bamenda centre": { ville: "Bamenda", coords: [5.9631, 10.1591] },
  "bamenda town": { ville: "Bamenda", coords: [5.9631, 10.1591] },

  // ─── KRIBI (5 points) ───
  "kribi": { ville: "Kribi", coords: [2.9373, 9.9070] },
  "kribi centre": { ville: "Kribi", coords: [2.9373, 9.9070] },
  "grand batanga": { ville: "Kribi", coords: [2.9500, 9.9200] },
  "mboa manga": { ville: "Kribi", coords: [2.9300, 9.9100] },
  "port de kribi": { ville: "Kribi", coords: [2.9000, 9.8800] },

  // ─── GAROUA (5 points) ───
  "garoua": { ville: "Garoua", coords: [9.3010, 13.3970] },
  "garoua centre": { ville: "Garoua", coords: [9.3010, 13.3970] },
  "plateau": { ville: "Garoua", coords: [9.3050, 13.4000] },
  "pitoa road": { ville: "Garoua", coords: [9.3200, 13.4100] },
  "poumpoumre": { ville: "Garoua", coords: [9.2950, 13.3900] },

  // ─── NGAOUNDÉRÉ (5 points) ───
  "ngaoundere": { ville: "Ngaoundéré", coords: [7.3277, 13.5847] },
  "ngaoundere centre": { ville: "Ngaoundéré", coords: [7.3277, 13.5847] },
  "dang": { ville: "Ngaoundéré", coords: [7.3400, 13.5900] },
  "universite ngaoundere": { ville: "Ngaoundéré", coords: [7.3500, 13.6000] },

  // ─── MAROUA (5 points) ───
  "maroua": { ville: "Maroua", coords: [10.5913, 14.3159] },
  "maroua centre": { ville: "Maroua", coords: [10.5913, 14.3159] },
  "domayo": { ville: "Maroua", coords: [10.6000, 14.3200] },
  "harde": { ville: "Maroua", coords: [10.5850, 14.3100] },
  "pitoare": { ville: "Maroua", coords: [10.5950, 14.3250] },

  // ─── EBOLOWA (5 points) ───
  "ebolowa": { ville: "Ebolowa", coords: [2.9167, 11.1500] },
  "ebolowa centre": { ville: "Ebolowa", coords: [2.9167, 11.1500] },
  "nko'ovos": { ville: "Ebolowa", coords: [2.9200, 11.1550] },
  "mekalat": { ville: "Ebolowa", coords: [2.9100, 11.1450] },
  "engo": { ville: "Ebolowa", coords: [2.9250, 11.1600] },

  // ─── BERTOUA (7 points) ───
  "bertoua": { ville: "Bertoua", coords: [4.5773, 13.6846] },
  "bertoua centre": { ville: "Bertoua", coords: [4.5773, 13.6846] },
  "tigaza": { ville: "Bertoua", coords: [4.5800, 13.6900] },
  "monou": { ville: "Bertoua", coords: [4.5700, 13.6800] },
  "mokolo bertoua": { ville: "Bertoua", coords: [4.5750, 13.6880] },
  "nkolbikon": { ville: "Bertoua", coords: [4.5850, 13.6950] },
  "gare routiere bertoua": { ville: "Bertoua", coords: [4.5780, 13.6860] },

  // ─── AUTRES GRANDES VILLES (1 point chacune) ───
  "buea": { ville: "Buea", coords: [4.1550, 9.2310] },
  "limbe": { ville: "Limbe", coords: [4.0244, 9.2061] },
  "kumba": { ville: "Kumba", coords: [4.6363, 9.4469] },
  "edea": { ville: "Edéa", coords: [3.8000, 10.1330] },
  "sangmelima": { ville: "Sangmélima", coords: [2.9330, 11.9830] },
  "mbalmayo": { ville: "Mbalmayo", coords: [3.5167, 11.5000] },
  "nkongsamba": { ville: "Nkongsamba", coords: [4.9500, 9.9330] },
  "dschang": { ville: "Dschang", coords: [5.4430, 10.0540] },
  "foumban": { ville: "Foumban", coords: [5.7260, 10.8980] },
  "foumbot": { ville: "Foumbot", coords: [5.5080, 10.6320] },
  "kousseri": { ville: "Kousseri", coords: [12.0760, 15.0300] },
  "meiganga": { ville: "Meiganga", coords: [6.5167, 14.3000] },
  "tibati": { ville: "Tibati", coords: [6.4667, 12.6333] },
  "batouri": { ville: "Batouri", coords: [4.4330, 14.3670] },
  "yokadouma": { ville: "Yokadouma", coords: [3.5167, 15.0500] },
  "abong mbang": { ville: "Abong-Mbang", coords: [3.9833, 13.1833] },
  "ebolowa sud": { ville: "Ebolowa", coords: [2.9167, 11.1500] },
  "wum": { ville: "Wum", coords: [6.3833, 10.0667] },
  "kumbo": { ville: "Kumbo", coords: [6.2000, 10.6667] },
  "mbouda": { ville: "Mbouda", coords: [5.6260, 10.2550] },
  "tiko": { ville: "Tiko", coords: [4.0750, 9.3600] },
  "mutengene": { ville: "Mutengene", coords: [4.0910, 9.3140] },
  "eyumojock": { ville: "Eyumojock", coords: [5.7500, 8.9833] },
  "mamfe": { ville: "Mamfe", coords: [5.7510, 9.3130] }
};

// ── DISTANCES MOYENNES PAR VILLE (fallback si quartier non trouvé) ──
const DISTANCES_MOYENNES = {
  "Yaoundé":    7,
  "Douala":     6,
  "Bafoussam":  4,
  "Bamenda":    5,
  "Kribi":      3,
  "Garoua":     4,
};

// ═══════════════════════════════════════════════════════════════
//  CALCUL DE DISTANCE — Formule Haversine
//  Calcule la distance à vol d'oiseau entre 2 points GPS
// ═══════════════════════════════════════════════════════════════
function distanceHaversine(coords1, coords2) {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371; // Rayon Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ═══════════════════════════════════════════════════════════════
//  CHERCHE UN QUARTIER DANS LE TEXTE TAPÉ
//  Normalise : minuscules, retire accents, cherche correspondance
// ═══════════════════════════════════════════════════════════════
function chercherQuartier(texte) {
  if (!texte) return null;
  const normalized = texte.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // retire accents
    .trim();

  // Recherche exacte d'abord
  if (QUARTIERS[normalized]) return QUARTIERS[normalized];

  // Recherche : un des quartiers est-il dans le texte ?
  // (ex: "Bastos, Yaoundé" contient "bastos")
  for (const [key, val] of Object.entries(QUARTIERS)) {
    if (normalized.includes(key)) return val;
  }
  return null;
}

export function DeliveryQuickOrder({ user, userData, onOpenFullModal }) {
  const [depart, setDepart]       = useState("");
  const [arrivee, setArrivee]     = useState("");
  const [ville, setVille]         = useState("Douala");
  const [typeColis, setTypeColis] = useState("document");
  const [urgent, setUrgent]       = useState(false);

  // ═══ CALCUL TARIF + DISTANCE INSTANTANÉ ═══
  const estimation = useMemo(() => {
    if (!depart.trim() || !arrivee.trim()) return null;

    // 1️⃣ Chercher les coordonnées des deux adresses
    const departInfo  = chercherQuartier(depart);
    const arriveeInfo = chercherQuartier(arrivee);

    // 2️⃣ Calculer la distance
    let distEstimee;
    let methodeCalcul;

    if (departInfo && arriveeInfo) {
      // Distance réelle calculée à partir des coordonnées GPS
      const distVolOiseau = distanceHaversine(departInfo.coords, arriveeInfo.coords);
      // Multiplier par 1.3 pour estimer la distance routière (vs vol d'oiseau)
      distEstimee = distVolOiseau * 1.3;
      methodeCalcul = "calculée";
    } else if (departInfo || arriveeInfo) {
      // Une seule adresse reconnue → estimation moyenne ville
      const villeDetectee = (departInfo || arriveeInfo).ville;
      distEstimee = DISTANCES_MOYENNES[villeDetectee] || 6;
      methodeCalcul = "estimée";
    } else {
      // Aucune adresse reconnue → fallback ville sélectionnée
      distEstimee = DISTANCES_MOYENNES[ville] || 6;
      methodeCalcul = "estimée";
    }

    // Distance minimum 1km, maximum 50km
    distEstimee = Math.max(1, Math.min(50, distEstimee));

    // 3️⃣ Calculer le prix
    const tarif = TARIFS[typeColis];
    let prix = tarif.base + (distEstimee * tarif.parKm);

    // Mode urgent : tarif × 2
    let tempsMin = Math.round(15 + distEstimee * 3);
    if (urgent) {
      prix = prix * 2;
      tempsMin = Math.round(tempsMin * 0.6);
    }

    // Arrondi au 100 FCFA supérieur
    prix = Math.ceil(prix / 100) * 100;

    return {
      prix,
      tempsMin,
      tempsMax: tempsMin + 10,
      distance: distEstimee.toFixed(1),
      methodeCalcul,
      fourchetteMin: Math.ceil((prix * 0.9) / 100) * 100,
      fourchetteMax: Math.ceil((prix * 1.1) / 100) * 100,
    };
  }, [depart, arrivee, ville, typeColis, urgent]);

  // ── COMMANDER VIA WHATSAPP ──
  const commanderWhatsApp = () => {
    if (!depart.trim() || !arrivee.trim()) {
      showAppToast("Indiquez d'abord les adresses de départ et de destination.", "warning");
      return;
    }
    const tarif = TARIFS[typeColis];
    const lignes = [
      "🚚 *NOUVELLE DEMANDE DE LIVRAISON YORIX*",
      "",
      "📍 *Départ :* " + depart,
      "🏠 *Destination :* " + arrivee,
      "🏙️ *Ville :* " + ville,
      "📦 *Type :* " + tarif.icon + " " + tarif.label + " (" + tarif.desc + ")",
      urgent ? "⚡ *Mode urgent activé* (tarif × 2, livraison prioritaire)" : "",
      "",
      estimation ? "📏 *Distance " + estimation.methodeCalcul + " :* ~" + estimation.distance + " km" : "",
      estimation ? "💰 *Estimation :* " + estimation.fourchetteMin.toLocaleString() + " - " + estimation.fourchetteMax.toLocaleString() + " FCFA" : "",
      estimation ? "⏱ *Temps estimé :* " + estimation.tempsMin + "-" + estimation.tempsMax + " min" : "",
      "",
      "👤 *Client :*",
      "Nom : " + (userData?.nom || "____"),
      "Téléphone : " + (userData?.telephone || "____"),
      "",
      "Merci Yorix ! 🇨🇲",
    ].filter(Boolean).join("\n");

    const url = "https://wa.me/" + YORIX_WA_NUMBER + "?text=" + encodeURIComponent(lignes);
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a1410 0%, #1a3a24 50%, #0d3320 100%)",
        borderRadius: 18,
        padding: "28px 24px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
      }}
    >
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(252,209,22,.08)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, background: "rgba(79,209,125,.06)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(252,209,22,.14)", color: "var(--yellow, #fcd116)",
              border: "1px solid rgba(252,209,22,.28)",
              padding: "5px 14px", borderRadius: 50,
              fontSize: ".7rem", fontWeight: 700, marginBottom: 12,
            }}
          >
            🛵 Yorix Ride — Centre de commande
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.55rem", fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-.5px", lineHeight: 1.2 }}>
            Restez chez vous. <span style={{ color: "#4fd17d" }}>Yorix s'en charge.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".9rem", lineHeight: 1.5, marginBottom: 0, maxWidth: 540 }}>
            Tarif à partir de <strong style={{color:"var(--yellow, #fcd116)"}}>1 000 FCFA</strong> · Distance calculée automatiquement.
          </p>
        </div>

        {/* FORMULAIRE */}
        <div
          style={{
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 14, padding: 16, marginBottom: 14,
          }}
        >
          {/* Adresses */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", pointerEvents: "none" }}>📍</span>
              <input
                type="text"
                placeholder="Départ (ex: Bastos, Yaoundé)"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                list="quartiers-yorix"
                style={{
                  width: "100%", padding: "12px 14px 12px 42px",
                  borderRadius: 10, border: "1.5px solid rgba(255,255,255,.15)",
                  background: "rgba(255,255,255,.08)", color: "#fff",
                  fontSize: ".88rem", fontFamily: "'DM Sans',sans-serif",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", pointerEvents: "none" }}>🏠</span>
              <input
                type="text"
                placeholder="Destination (ex: Ahala, Yaoundé)"
                value={arrivee}
                onChange={(e) => setArrivee(e.target.value)}
                list="quartiers-yorix"
                style={{
                  width: "100%", padding: "12px 14px 12px 42px",
                  borderRadius: 10, border: "1.5px solid rgba(255,255,255,.15)",
                  background: "rgba(255,255,255,.08)", color: "#fff",
                  fontSize: ".88rem", fontFamily: "'DM Sans',sans-serif",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            {/* Datalist pour autocomplétion native */}
            <datalist id="quartiers-yorix">
              {Object.keys(QUARTIERS).map(q => (
                <option key={q} value={q.charAt(0).toUpperCase() + q.slice(1)} />
              ))}
            </datalist>
          </div>

          {/* Ville + urgent */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              style={{
                flex: "1 1 140px", padding: "10px 12px", borderRadius: 9,
                border: "1.5px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.08)", color: "#fff",
                fontSize: ".82rem", fontFamily: "'DM Sans',sans-serif",
                outline: "none", cursor: "pointer",
              }}
            >
              {Object.keys(DISTANCES_MOYENNES).map((v) => (
                <option key={v} value={v} style={{ background: "#1a3a24" }}>📍 {v}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setUrgent(!urgent)}
              style={{
                flex: "1 1 140px", padding: "10px 12px", borderRadius: 9,
                border: urgent ? "1.5px solid var(--yellow, #fcd116)" : "1.5px solid rgba(255,255,255,.15)",
                background: urgent ? "rgba(252,209,22,.18)" : "rgba(255,255,255,.08)",
                color: urgent ? "var(--yellow, #fcd116)" : "#fff",
                fontSize: ".82rem", fontFamily: "'Syne',sans-serif",
                fontWeight: 700, cursor: "pointer", transition: "all .2s",
              }}
            >
              ⚡ {urgent ? "Urgent activé (×2)" : "Mode urgent (×2)"}
            </button>
          </div>

          {/* Type de colis */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.6)", fontWeight: 700, marginBottom: 8, letterSpacing: ".05em" }}>
              TYPE DE COLIS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
              {Object.entries(TARIFS).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeColis(key)}
                  style={{
                    padding: "10px 8px", borderRadius: 9,
                    border: typeColis === key ? "1.5px solid var(--yellow, #fcd116)" : "1.5px solid rgba(255,255,255,.12)",
                    background: typeColis === key ? "rgba(252,209,22,.15)" : "rgba(255,255,255,.05)",
                    color: "#fff", cursor: "pointer", transition: "all .2s",
                    textAlign: "center", fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", marginBottom: 3 }}>{t.icon}</div>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{t.label}</div>
                  <div style={{ fontSize: ".58rem", color: "rgba(255,255,255,.5)", marginTop: 2 }}>
                    dès {t.base.toLocaleString()} F
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ESTIMATION */}
        {estimation && (
          <div
            style={{
              background: "rgba(252,209,22,.12)",
              border: "1.5px solid rgba(252,209,22,.35)",
              borderRadius: 12, padding: "14px 16px", marginBottom: 14,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 10, animation: "yfadeIn .3s ease",
            }}
          >
            <div>
              <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.6)", fontWeight: 700, marginBottom: 3 }}>
                💰 ESTIMATION TARIFAIRE {urgent && "⚡ URGENT"}
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--yellow, #fcd116)", lineHeight: 1.1 }}>
                {estimation.fourchetteMin.toLocaleString()} – {estimation.fourchetteMax.toLocaleString()} FCFA
              </div>
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.65)", marginTop: 3 }}>
                ⏱ {estimation.tempsMin}–{estimation.tempsMax} min · 📏 ~{estimation.distance} km {estimation.methodeCalcul === "calculée" ? "✓" : "(estimée)"}
                {urgent && " · ⚡ Tarif × 2"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.1)", padding: "6px 12px", borderRadius: 50, fontSize: ".68rem", color: "#fff", fontWeight: 600 }}>
              {estimation.methodeCalcul === "calculée" ? "📍 Distance réelle" : "📊 Tarif transparent"}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onOpenFullModal}
            style={{
              flex: "2 1 240px",
              background: "linear-gradient(135deg, var(--yellow, #fcd116), #ffd84a)",
              color: "#0d1f14", border: "none",
              padding: "14px 22px", borderRadius: 11,
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".92rem",
              cursor: "pointer", boxShadow: "0 6px 18px rgba(252,209,22,.35)",
              transition: "transform .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
          >
            🚀 Commander maintenant
          </button>
          <button
            onClick={commanderWhatsApp}
            style={{
              flex: "1 1 180px", background: "#25D366",
              color: "#fff", border: "none",
              padding: "14px 22px", borderRadius: 11,
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".88rem",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6, transition: "transform .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
          >
            💬 Via WhatsApp
          </button>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14, justifyContent: "center" }}>
          {["🔒 Paiement sécurisé", "📍 Suivi GPS", "💰 Tarif transparent", "🆘 Support 7j/7"].map((t) => (
            <span key={t} style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.85)", padding: "5px 11px", borderRadius: 50, fontSize: ".68rem", fontWeight: 600, border: "1px solid rgba(255,255,255,.1)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes yfadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
