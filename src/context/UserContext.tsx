"use client";
import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie"; // Manipular cookies

interface User {
  email: string;
  name: string;
  token: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook personalizado para acessar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Função para verificar se o token está expirado
  function isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  // Checa se há um usuário logado ao iniciar a aplicação
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("user");
      const storedUser = localStorage.getItem("userData");
  
      if (token && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
  
        if (!isTokenExpired(token)) {
          setUser(parsedUser); // Atualiza o estado
          return;
        } else {
          Cookies.remove("user");
          localStorage.removeItem("userData");
        }
      }
  
      router.push("/login");
    }
  }, []);
  

  // Função de login
  async function login(email: string, password: string) {
    try {
      if (!email || !password) {
        alert("Por favor, preencha todos os campos");
        return;
      }

      const response = await fetch("http://localhost:3333/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();


      if (data.token) {
        // Decodifica o token para obter os dados do usuário
        const decoded: any = jwtDecode(data.token);

        const userData: User = {
          email: decoded.email,  // Certifique-se de que 'decoded.email' existe
          name: decoded.name,    // Certifique-se de que 'decoded.name' existe
          token: data.token,
        };

        // Salva todos os dados do usuário no localStorage
        localStorage.setItem("userData", JSON.stringify(userData));
      
        // Salva o token nos cookies
        Cookies.set("user", data.token, { expires: 1, path: "/" });
        setUser(userData);  // Atualiza o estado do usuário
        router.push("/home");
      } else {
        throw new Error("Token não retornado pela API");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Usuário ou senha incorretos!");
    }
  }

  // Função de logout
  function logout() {
    setUser(null);
    Cookies.remove("user");
    localStorage.removeItem("userData");
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
