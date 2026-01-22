"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 function loadUser() {
  const sessionCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("session="));

  if (!sessionCookie) {
    setUser(null);
    setLoading(false); // ✅ important
    return;
  }

  try {
    const raw = sessionCookie.substring(8);
    const decoded = decodeURIComponent(raw);
    const userData = JSON.parse(decoded);
    setUser(userData);
  } catch (e) {
    console.error("Invalid session cookie", e);
    setUser(null);
  } finally {
    setLoading(false); // ✅ important
  }
}



  loadUser();

  window.addEventListener("auth-change", loadUser);
  window.addEventListener("storage", loadUser); // if multiple tabs

  return () => {
    window.removeEventListener("auth-change", loadUser);
    window.removeEventListener("storage", loadUser);
  };
}, []);


  async function handleLogout() {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));

  }

  if (loading) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition">
          <h1 className="text-2xl font-bold text-blue-600">DSAR Portal</h1>
        </Link>
        
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <div className="flex gap-2">
                {user.role === "admin" && (
                  <>
                    <Link href="/admin">
                      <Button variant="secondary" size="sm">Admin Dashboard</Button>
                    </Link>
                  </>
                )}
                {user.role === "owner" && (
                  <>
                    <Link href="/owner">
                      <Button variant="secondary" size="sm">Owner Dashboard</Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="secondary" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}