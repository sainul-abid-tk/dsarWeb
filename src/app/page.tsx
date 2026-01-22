import { Button, Card } from "@/components/ui";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Card className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Data Subject Access Request Portal</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A simple, secure platform for managing GDPR/CCPA data subject requests.
            For companies and their end users.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-left">
              <div className="text-4xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="font-bold text-lg mb-2">Register Company</h3>
              <p className="text-gray-600">Company owners create an account and register their company.</p>
            </div>

            <div className="text-left">
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <h3 className="font-bold text-lg mb-2">Admin Approval</h3>
              <p className="text-gray-600">Admin reviews and approves pending company registrations.</p>
            </div>

            <div className="text-left">
              <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
              <h3 className="font-bold text-lg mb-2">Submit DSAR</h3>
              <p className="text-gray-600">End users access the public company page and submit DSAR requests.</p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <h3 className="text-2xl font-bold mb-6">Ready to get started?</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary">Register Company</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}