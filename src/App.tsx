import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Main content area - will hold upload/dashboard components */}
        <div className="text-center text-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Data Quality Platform</h2>
          <p>Upload and analyze your data</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;