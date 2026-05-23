import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getUserProfile, getUserRole, sendEmail, emailBienvenue } from "../utils/helpers";
import { isProfileAccessible } from "../lib/userMutations";

/**
 * Session Supabase, profil, modale auth / contrat, actions login-register-logout.
 *
 * @param {object} opts
 * @param {(page: string, opts?: object) => void} opts.goPage
 * @param {import("react").Dispatch<import("react").SetStateAction<string>>} opts.setDashTab
 * @param {import("react").Dispatch<import("react").SetStateAction<boolean>>} opts.setDemandeLivraisonOpen
 * @param {import("react").Dispatch<import("react").SetStateAction<any[]>>} opts.setNotifs
 * @param {(uid: string, limit?: number) => Promise<void>} opts.onProfileLoaded
 */
export function useYorixAuth({ goPage, setDashTab, setDemandeLivraisonOpen, setNotifs, onProfileLoaded }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState("buyer");
  const [authForm, setAuthForm] = useState({ nom: "", email: "", tel: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [contractOpen, setContractOpen] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  const [pendingAction, setPendingAction] = useState(null);

  const enforceProfileAccess = useCallback(async (profile) => {
    if (!profile || isProfileAccessible(profile)) return true;
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setUserRole(null);
    setNotifs([]);
    setAuthError("Ce compte est suspendu ou supprimé. Contactez le support Yorix.");
    return false;
  }, [setNotifs]);

  const chargerProfil = useCallback(
    async (uid) => {
      const profile = await getUserProfile(uid);
      if (!(await enforceProfileAccess(profile))) return;
      const role = getUserRole(profile);
      setUserData(profile);
      setUserRole(role);
      await onProfileLoaded(uid);
    },
    [onProfileLoaded, enforceProfileAccess],
  );

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (cancelled) return;
        if (error) console.warn("Auth getSession:", error.message);
        if (session?.user) {
          setUser(session.user);
          chargerProfil(session.user.id);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.warn("Auth getSession:", e?.message || e);
        if (!cancelled) setLoading(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        chargerProfil(session.user.id);
      } else {
        setUser(null);
        setUserData(null);
        setUserRole(null);
        setNotifs([]);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [chargerProfil, setNotifs]);

  const executePendingAction = useCallback(
    (actionId) => {
      const id = actionId || pendingAction;
      if (!id) return;

      if (id === "buy") goPage("produits");
      else if (id === "sell") goPage("dashboard");
      else if (id === "service") goPage("prestataires");
      else if (id === "delivery") {
        goPage("livraison");
        setTimeout(() => setDemandeLivraisonOpen(true), 300);
      }

      setPendingAction(null);
    },
    [pendingAction, goPage, setDemandeLivraisonOpen],
  );

  const doLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) throw error;
      setUser(data.user);
      await chargerProfil(data.user.id);
      const fresh = await getUserProfile(data.user.id);
      if (!isProfileAccessible(fresh)) {
        setAuthLoading(false);
        return;
      }
      setAuthOpen(false);
      if (pendingAction) {
        setTimeout(() => executePendingAction(pendingAction), 300);
      }
      sendEmail({
        to: authForm.email,
        subject: `Bienvenue sur Yorix, ${authForm.nom} ! 🎉`,
        html: emailBienvenue(authForm.nom, selectedRole),
      }).catch((e) => console.warn("Email bienvenue:", e));
    } catch (err) {
      setAuthError("Email ou mot de passe incorrect.");
    }
    setAuthLoading(false);
  };

  const doRegister = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      if (!authForm.nom || !authForm.email || !authForm.password || !authForm.tel) {
        throw new Error("Tous les champs sont obligatoires.");
      }
      if (!selectedRole) throw new Error("Veuillez choisir un profil (Acheteur, Vendeur, Livreur ou Prestataire).");

      const PRO_ROLES = ["seller", "provider", "delivery"];
      if (PRO_ROLES.includes(selectedRole) && !contractAccepted) {
        setPendingRegistration({
          nom: authForm.nom,
          email: authForm.email,
          tel: authForm.tel,
          password: authForm.password,
          role: selectedRole,
        });
        setAuthLoading(false);
        setContractOpen(true);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            display_name: authForm.nom,
            nom: authForm.nom,
            telephone: authForm.tel,
            role: selectedRole,
          },
        },
      });
      if (error) throw error;

      const uid = data.user?.id;
      if (!uid) throw new Error("Erreur création compte.");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: uid,
        nom: authForm.nom,
        email: authForm.email,
        telephone: authForm.tel,
        role: selectedRole,
        langue: "fr",
        actif: true,
        verifie: false,
        note: 0,
        nombre_avis: 0,
        total_commandes: 0,
      });
      if (profileError) console.error("Profile insert error:", profileError);

      await supabase
        .from("wallets")
        .insert({ user_id: uid, solde: 0, total_gagne: 0, devise: "FCFA" })
        .then((r) => r.error && console.error(r.error));
      await chargerProfil(uid);
      setAuthOpen(false);
      setAuthForm({ nom: "", email: "", tel: "", password: "" });
      setContractAccepted(false);
      setPendingRegistration(null);
      if (pendingAction) {
        setTimeout(() => executePendingAction(pendingAction), 500);
      }
    } catch (err) {
      console.error("Register error:", err);
      setAuthError(
        err.message.includes("already") ? "Cet email est déjà utilisé." : err.message,
      );
    }
    setAuthLoading(false);
  };

  const doGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setAuthError(error.message);
  };

  const doLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setUserRole(null);
    setDashTab("overview");
    goPage("home");
  };

  const handleContractAccepted = async (_acceptanceData) => {
    setContractOpen(false);
    setContractAccepted(true);
    setTimeout(() => {
      doRegister();
    }, 200);
  };

  return {
    user,
    setUser,
    userData,
    setUserData,
    userRole,
    setUserRole,
    loading,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
    selectedRole,
    setSelectedRole,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authLoading,
    setAuthLoading,
    contractOpen,
    setContractOpen,
    contractAccepted,
    setContractAccepted,
    pendingRegistration,
    setPendingRegistration,
    pendingAction,
    setPendingAction,
    chargerProfil,
    doLogin,
    doRegister,
    doGoogle,
    doLogout,
    handleContractAccepted,
    executePendingAction,
  };
}
