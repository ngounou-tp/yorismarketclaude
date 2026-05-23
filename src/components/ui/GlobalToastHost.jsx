import { useEffect } from "react";
import { YorixToast, useYorixToast } from "./YorixToast";
import { subscribeAppToast } from "../../lib/appToast";

/** Hôte toast global — une instance pour toute l'application. */
export function GlobalToastHost() {
  const { toast, showToast, clearToast } = useYorixToast();

  useEffect(() => {
    return subscribeAppToast(({ msg, type, duration }) => {
      showToast(msg, type || "error", duration);
    });
  }, [showToast]);

  return <YorixToast toast={toast} onClose={clearToast} />;
}
