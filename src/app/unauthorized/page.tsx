export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}
