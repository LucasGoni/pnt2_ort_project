import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout API error:", error);
      }
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};

export default authService;
