import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Admin privileges are required.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <button className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
              Go Home
            </button>
          </Link>
          <Link href="/products">
            <button className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
