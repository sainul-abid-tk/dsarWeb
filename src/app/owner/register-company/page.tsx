"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { registerCompany } from "@/app/actions/company";

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    employeesCount: "",
    field: "",
    representation: "EU",
    logo: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get user from session cookie
      const sessionCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session="))
        ?.split("=")[1];

      if (!sessionCookie) {
        setError("Session expired");
        router.push("/auth/login");
        return;
      }

      const user = JSON.parse(decodeURIComponent(sessionCookie));
      const result = await registerCompany(user.id, {
        ...formData,
        employeesCount: formData.employeesCount ? parseInt(formData.employeesCount, 10) : undefined,
        representation: formData.representation as "EU" | "UK" | "EU_UK",
      });

      if (!result.success) {
        setError(result.error || "An error occurred");
        return;
      }

      router.push("/owner");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <h1 className="text-3xl font-bold mb-6">Register Company</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employees">Number of Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={formData.employeesCount}
                  onChange={(e) => setFormData({ ...formData, employeesCount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="field">Field of Work</Label>
                <Input
                  id="field"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Company Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="representation">GDPR Representation *</Label>
              <Select
                id="representation"
                value={formData.representation}
                onChange={(e) => setFormData({ ...formData, representation: e.target.value })}
              >
                <option value="EU">EU Only</option>
                <option value="UK">UK Only</option>
                <option value="EU_UK">EU & UK</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Company"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}