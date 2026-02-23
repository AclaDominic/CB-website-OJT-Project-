import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../lib/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  errors: [],
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // CSRF Protection for SPA
  const csrf = () => axiosClient.get("/sanctum/csrf-cookie");

  const getUser = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/user");
      setUser(data);
    } catch (e) {
      // Not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const login = async ({ email, password }) => {
    await csrf();
    setErrors([]);
    try {
      await axiosClient.post("/login", { email, password });
      await getUser();
      navigate("/system");
    } catch (e) {
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors);
      }
      throw e;
    }
  };

  const logout = async () => {
    await axiosClient.post("/logout");
    setUser(null);
    navigate("/");
  };

  const hasPermission = (permission) => {
    return user?.all_permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, getUser, errors, loading, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
