import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, type User } from "./store";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
    const handler = () => setUser(getCurrentUser());
    window.addEventListener("storage", handler);
    window.addEventListener("phv-auth-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("phv-auth-change", handler);
    };
  }, []);

  return { user, loading, refresh };
}

export function emitAuthChange() {
  window.dispatchEvent(new Event("phv-auth-change"));
}
