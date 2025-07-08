export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
