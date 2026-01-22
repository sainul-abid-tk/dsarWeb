"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { approveCompany, rejectCompany } from "@/app/actions/company";
import { updateDsarRequestStatus } from "@/app/actions/dsar";

interface Company {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  representation: string;
  owner: { email: string };
  createdAt: Date;
}

interface DsarRequest {
  id: string;
  companyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestText: string;
  status: string;
  company: { name: string };
  createdAt: Date;
}

interface Props {
  pendingCompanies: Company[];
  dsarRequests: DsarRequest[];
}

export default function AdminDashboardClient({ pendingCompanies, dsarRequests }: Props) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DsarRequest | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");

  async function handleApprove(companyId: string) {
    setLoading(true);
    try {
      const result = await approveCompany(companyId);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(companyId: string) {
    setLoading(true);
    try {
      const result = await rejectCompany(companyId);
      if (result.success) {
        router.refresh();
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Pending Companies Section */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Company Approvals</h2>
          {pendingCompanies.length === 0 ? (
            <p className="text-gray-600">No pending companies.</p>
          ) : (
            <div className="space-y-4">
              {pendingCompanies.map((company) => (
                <div
                  key={company.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.owner.email}</p>
                    </div>
                    <Badge status={company.status}>{company.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Representation: {company.representation}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{formatDate(company.createdAt)}</p>
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(company.id)}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(company.id)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* DSAR Requests Section */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">All DSAR Requests</h2>
          {dsarRequests.length === 0 ? (
            <p className="text-gray-600">No DSAR requests yet.</p>
          ) : (
            <div className="space-y-4">
              {dsarRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="font-semibold">{request.requesterName}</p>
                      <p className="text-sm text-gray-600">{request.requesterEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{request.company.name}</p>
                      <Badge status={request.status}>{request.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{request.requestText}</p>
                  <p className="text-xs text-gray-500 mb-3">{formatDate(request.createdAt)}</p>
                  <Button
                    variant="secondary"
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
