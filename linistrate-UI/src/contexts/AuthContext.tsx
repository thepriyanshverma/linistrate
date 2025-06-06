import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("linistrate_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("linistrate_token");
    const publicPaths = ["/login", "/register"];
    
    // Only redirect to login if no token AND path is NOT public
    if (!token && !publicPaths.includes(location.pathname)) {
      setUser(null);
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const fetchWithAuth = async (input: RequestInfo, init: RequestInit = {}) => {
    const token = localStorage.getItem("linistrate_token");
    const headers = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
      logout(); // token expired or unauthorized
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  };

  const login = async (identifier: string, password: string) => {
    const response = await fetch("http://localhost:8000/user/v1/loginuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();

    const user = {
      id: data.user_id || "1",
      email: data.email,
      name: data.username,
    };

    setUser(user);
    localStorage.setItem("linistrate_user", JSON.stringify(user));
    localStorage.setItem("linistrate_token", data.token);

    navigate("/"); // redirect after login
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await fetch("http://localhost:8000/user/v1/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const userData = await response.json();

    const newUser = {
      id: userData.user_id || "1",
      email,
      name: username,
    };

    setUser(newUser);
    localStorage.setItem("linistrate_user", JSON.stringify(newUser));
    localStorage.setItem("linistrate_token", userData.token || "fake-jwt-token");

    navigate("/"); // redirect after register
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("linistrate_user");
    localStorage.removeItem("linistrate_token");
    navigate("/login"); // redirect on logout
  }, [navigate]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    fetchWithAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
