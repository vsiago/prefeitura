"use client";

import { useAuth } from "@/context/UserContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center flex-col">
      {user ? (
        <>
          <h1 className="text-3xl font-bold">
            Bem-vindo à área privada, {user.name}!
          </h1>
          <p className="text-lg">Seu e-mail: {user.email}</p>
          <button
            onClick={logout}
            className="mt-4 p-2 bg-red-500 text-white rounded"
          >
            Deslogar
          </button>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </main>
  );
}
