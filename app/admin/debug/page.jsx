"use client";

import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DebugPage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const supabase = createClient();

  const testProductInsert = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: 'Test Product',
            description: 'Test Description',
            price: 99.99,
            category: 'electronics',
            image: 'https://via.placeholder.com/150',
            created_by: user.id,
          },
        ])
        .select();

      if (error) {
        setTestResult({ success: false, error: error.message, code: error.code });
      } else {
        setTestResult({ success: true, data });
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Admin Debug Info</h1>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">User Info</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify({ 
                id: user?.id,
                email: user?.email,
                authenticated: !!user
              }, null, 2)}
            </pre>
          </div>

          {/* Profile Info */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Profile Info</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>

          {/* Admin Status */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Admin Status</h2>
            <p className="text-lg">
              Is Admin: <span className={isAdmin ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {isAdmin ? "YES ✓" : "NO ✗"}
              </span>
            </p>
          </div>

          {/* Test Product Insert */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Test Product Insert</h2>
            <button
              onClick={testProductInsert}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700"
            >
              Test Insert Product
            </button>

            {testResult && (
              <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-bold mb-2">
                  {testResult.success ? '✓ Success' : '✗ Failed'}
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
            <ul className="space-y-2 text-sm">
              <li>✓ If "Is Admin" shows NO, update your role in Supabase:</li>
              <li className="ml-4 font-mono bg-white p-2 rounded">
                UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
              </li>
              <li>✓ After updating, sign out and sign back in</li>
              <li>✓ If test insert fails, check the error message above</li>
              <li>✓ Common error codes:</li>
              <li className="ml-4">- 42501: Permission denied (RLS policy blocking)</li>
              <li className="ml-4">- 23505: Duplicate key (item already exists)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
