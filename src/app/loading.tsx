import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Navigation Skeleton */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Card className="text-center mb-16">
          <div className="space-y-4">
            <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-5/6 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-left space-y-3">
                <div className="h-10 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}