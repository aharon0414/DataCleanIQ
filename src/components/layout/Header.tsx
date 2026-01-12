export function Header() {
  return (
    <header className="bg-white border-b border-gray-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Data Quality Platform</h1>
          </div>
          <nav className="flex items-center gap-4">
            {/* Navigation items will be added here */}
            <span className="text-sm text-gray-700">Dashboard</span>
          </nav>
        </div>
      </div>
    </header>
  );
}