"use client";

import { createContext, useContext } from "react";

interface AuthContextType {
  name: string;
  role: string;
  user_id:string
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;