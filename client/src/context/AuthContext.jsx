import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  const [token, setToken] = useState(storedToken || null);
  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn,
        isAdmin,
        isSeller
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
