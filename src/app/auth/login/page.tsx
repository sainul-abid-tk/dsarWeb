"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label } from "@/components/ui";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loginRole, setLoginRole] = useState<"admin" | "owner">("owner");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Login failed");
                return;
            }

            const data = await res.json();

            // Check if user role matches selected login role
            if (data.user.role !== loginRole) {
                setError(`This account is registered as a ${data.user.role}, not an ${loginRole}`);
                return;
            }

            const encoded = encodeURIComponent(JSON.stringify(data.user));

            document.cookie = `session=${encoded}; path=/; max-age=86400`;
            document.cookie = `userRole=${data.user.role}; path=/; max-age=86400`;

            // fire AFTER cookies are written
            setTimeout(() => {
                window.dispatchEvent(new Event("auth-change"));
            }, 0);



            // Redirect based on role
            if (data.user.role === "admin") {
                router.push("/admin");
            } else if (data.user.role === "owner") {
                router.push("/owner");
            }
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">DSAR Portal</h1>
                <p className="text-gray-600 mb-6">Sign in to your account</p>

                {/* Role Selection */}
                <div className="mb-6 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="owner"
                            checked={loginRole === "owner"}
                            onChange={(e) => setLoginRole(e.target.value as "owner")}
                            className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Owner Login</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={loginRole === "admin"}
                            onChange={(e) => setLoginRole(e.target.value as "admin")}
                            className="w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Admin Login</span>
                    </label>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={loginRole === "admin" ? "admin@dsar.local" : "owner@company.com"}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : `Sign In as ${loginRole === "admin" ? "Admin" : "Owner"}`}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">New to DSAR Portal?</p>
                    <Link href="/auth/register" className="text-blue-600 hover:underline">
                        Create a company account
                    </Link>
                </div>

                {/* Test Credentials */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div>
                        <p className="text-xs text-gray-500 font-mono font-bold mb-2">Test Admin Credentials:</p>
                        <p className="text-xs text-gray-600">Email: admin@dsar.local</p>
                        <p className="text-xs text-gray-600">Password: admin123</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}