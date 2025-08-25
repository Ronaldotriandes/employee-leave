'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

interface Stats {
  totalAdmins: number;
  totalEmployees: number;
  totalLeaves: number;
  pendingLeaves: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAdmins: 0,
    totalEmployees: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log('masuk')

    const fetchStats = async () => {
      setLoading(true);
      try {
        const [adminsRes, employeesRes, leavesRes] = await Promise.all([
          api.get('/admin'),
          api.get('/employee'),
          api.get('/leave'),
        ]);

        setStats({
          totalAdmins: adminsRes.data.length,
          totalEmployees: employeesRes.data.length,
          totalLeaves: leavesRes.data.length,
          pendingLeaves: leavesRes.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeaves}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/employees"
              className="block p-3 border rounded hover:bg-gray-50"
            >
              Manage Employees
            </a>
            <a
              href="/dashboard/leaves"
              className="block p-3 border rounded hover:bg-gray-50"
            >
              Manage Leaves
            </a>
            <a
              href="/dashboard/reports"
              className="block p-3 border rounded hover:bg-gray-50"
            >
              View Reports
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Welcome to the Employee Management System. Use the navigation menu to manage
              employees, track leave requests, and generate reports.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
