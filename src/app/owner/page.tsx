import { cookies } from "next/headers";
import { getOwnerCompany } from "@/app/actions/company";
import { getCompanyDsarRequests } from "@/app/actions/dsar";
import { Button, Card } from "@/components/ui";
import Link from "next/link";
import OwnerDashboardClient from "./client";

export default async function OwnerDashboard() {
  // Get user from session cookie
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get("session");
  
  if (!sessionCookie) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <h1 className="text-3xl font-bold mb-4">Owner Dashboard</h1>
            <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
            <Link href="/auth/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  let userId: string;
  try {
    const user = JSON.parse(sessionCookie.value);
    userId = user.id;
  } catch {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <h1 className="text-3xl font-bold mb-4">Owner Dashboard</h1>
            <p className="text-gray-600 mb-6">Session error. Please log in again.</p>
            <Link href="/auth/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }
  
  const company = await getOwnerCompany(userId);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <h1 className="text-3xl font-bold mb-4">Owner Dashboard</h1>
            <p className="text-gray-600 mb-6">No company registered yet.</p>
            <Link href="/owner/register-company">
              <Button variant="primary">Register Company</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const { requests: dsarRequests } = await getCompanyDsarRequests(company.id);

  return (
    <OwnerDashboardClient 
      company={company} 
      dsarRequests={dsarRequests}
    />
  );
}