import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import storage from "../services/storage";

const AuthContext = createContext();

const isTokenValid = (authData) => {
  if (!authData?.token) return false;
  try {
    const payload = JSON.parse(atob(authData.token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = async (nextAuth) => {
    setAuth(nextAuth);
    await storage.setItem("auth", JSON.stringify(nextAuth));
  };

  const fetchAndPersistCurrentUser = async (token) => {
    try {
      const profile = await authService.getCurrentUser();
      if (profile?.user) {
        const nextAuth = { token, user: profile.user };
        await persistAuth(nextAuth);
        return nextAuth;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("No se pudo obtener perfil actual:", error);
      }
    }
    return null;
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedAuth = await storage.getItem("auth");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          if (isTokenValid(parsed)) {
            setAuth(parsed);
            await fetchAndPersistCurrentUser(parsed.token);
          } else {
            await storage.removeItem("auth");
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error loading auth:", error);
        }
        await storage.removeItem("auth");
      }
      setLoading(false);
    };
    loadAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const profile = await fetchAndPersistCurrentUser(data.token);
    const authData = profile ?? { token: data.token, user: data.user };
    if (!profile) {
      await persistAuth(authData);
    }
    return authData;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const profile = await fetchAndPersistCurrentUser(data.token);
    const authData = profile ?? { token: data.token, user: data.user };
    if (!profile) {
      await persistAuth(authData);
    }
    return authData;
  };

  const updateUser = async (partialUser) => {
    if (!auth) return;
    const merged = { ...auth.user, ...partialUser };
    const nextAuth = { ...auth, user: merged };
    await persistAuth(nextAuth);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error al cerrar sesión:", error);
      }
    }
    await storage.removeItem("auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!auth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
}
