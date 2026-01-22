import { Button, Card } from "@/components/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">DSAR Portal</h1>
          <Link href="/">
            <Button variant="secondary">Home</Button>
          </Link>
        </div>
      </nav>

      <Card className="text-center max-w-md mt-16">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <span className="text-5xl">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">Try:</p>
          <div className="flex gap-3 flex-col">
            <Link href="/">
              <Button variant="primary" className="w-full">
                Go to Home
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          If you believe this is a mistake, please contact support.
        </p>
      </Card>
    </div>
  );
}