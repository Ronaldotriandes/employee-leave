'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { admin, loading, logout } = useAuth();
  console.log(useAuth())
  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Employee Management System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {admin.namaDepan} {admin.namaBelakang}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admins"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Admin Management
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/employees"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Employee Management
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/leaves"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Leave Management
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/reports"
                  className="block px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                >
                  Employee Reports
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
