"use client";

import { useState } from "react";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { submitDsarRequest } from "@/app/actions/dsar";
import { Badge } from "@/components/ui";

interface Company {
  id: string;
  name: string;
  logo: string | null;
  status: string;
  subscriptionStatus: string;
  representation: string;
  employeesCount: number | null;
  field: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  company: Company;
  isActive: boolean;
}

export default function PublicCompanyClient({ company, isActive }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requestText: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await submitDsarRequest(company.id, formData);

      if (!result.success) {
        setError(result.error || "An error occurred while submitting your request.");
        return;
      }

      setSubmitted(true);
      setFormData({
        requesterName: "",
        requesterEmail: "",
        requesterPhone: "",
        requestText: "",
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-24 h-24 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <p className="text-gray-600 mt-2">{company.field}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600">Representation</p>
              <p className="font-semibold mt-1">{company.representation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="font-semibold mt-1">{company.employeesCount || "N/A"}</p>
            </div>
            {company.address && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold mt-1">{company.address}</p>
              </div>
            )}
            {company.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a href={`mailto:${company.email}`} className="text-blue-600">
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold mt-1">{company.phone}</p>
              </div>
            )}
          </div>
        </Card>

        {!isActive ? (
          <Card className="bg-red-50 border border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-2">Portal Inactive</h2>
            <p className="text-red-700">
              This company's DSAR portal is currently inactive. Please contact the company directly.
            </p>
          </Card>
        ) : (
          <Card>
            <h2 className="text-2xl font-bold mb-6">Submit DSAR Request</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                ✓ Your DSAR request has been submitted successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="request">Request Details *</Label>
                <Textarea
                  id="request"
                  rows={6}
                  value={formData.requestText}
                  onChange={(e) => setFormData({ ...formData, requestText: e.target.value })}
                  placeholder="Please describe your DSAR request..."
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit DSAR Request"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
