"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { createCheckoutSession } from "@/app/actions/stripe";
import { updateDsarRequestStatus } from "@/app/actions/dsar";

interface Company {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  subscriptionStatus: string;
  representation: string;
  employeesCount: number | null;
  field: string | null;
  createdAt: Date;
}

interface DsarRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestText: string;
  status: string;
  createdAt: Date;
}

interface Props {
  company: Company;
  dsarRequests: DsarRequest[];
}

export default function OwnerDashboardClient({ company, dsarRequests }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DsarRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");

  const publicUrl = company.slug ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/c/${company.slug}` : null;
  const isSubscriptionActive = ["active", "trialing"].includes(company.subscriptionStatus);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const result = await createCheckoutSession(company.id);
      if (result.success && result.url) {
        window.location.href = result.url;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const result = await updateDsarRequestStatus(selectedRequest.id, updateStatus);
      if (result.success) {
        setSelectedRequest(null);
        setUpdateStatus("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-gray-600">Status</p>
              <Badge status={company.status} className="mt-2">
                {company.status.toUpperCase()}
              </Badge>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Subscription</p>
              <Badge status={company.subscriptionStatus} className="mt-2">
                {company.subscriptionStatus.toUpperCase()}
              </Badge>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Representation</p>
              <p className="font-semibold mt-2">{company.representation}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="font-semibold mt-2">{company.employeesCount || "N/A"}</p>
            </Card>
          </div>
        </div>

        {company.status === "approved" && !isSubscriptionActive && (
          <Card className="mb-8 bg-yellow-50 border border-yellow-200">
            <p className="mb-4">
              Your company is approved! Subscribe to activate your DSAR portal.
            </p>
            <Button
              variant="primary"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </Button>
          </Card>
        )}

        {publicUrl && isSubscriptionActive && (
          <Card className="mb-8 bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Public Portal URL:</p>
            <p className="font-mono break-all">{publicUrl}</p>
          </Card>
        )}

        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">DSAR Requests</h2>
          {dsarRequests.length === 0 ? (
            <p className="text-gray-600">No DSAR requests yet.</p>
          ) : (
            <div className="space-y-4">
              {dsarRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{request.requesterName}</p>
                      <p className="text-sm text-gray-600">{request.requesterEmail}</p>
                    </div>
                    <Badge status={request.status}>{request.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{request.requestText}</p>
                  <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  <Button
                    variant="secondary"
                    className="mt-3 text-sm px-3 py-1"
                    onClick={() => {
                      setSelectedRequest(request);
                      setUpdateStatus(request.status);
                    }}
                  >
                    Update Status
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update DSAR Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                Update
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
