'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import api from '@/lib/api';
import type { Employee, Leave } from '@/lib/types';

interface EmployeeWithLeaves extends Employee {
  leaves: Leave[];
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<EmployeeWithLeaves[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const fetchEmployeesWithLeaves = async () => {
    try {
      const [employeesRes, leavesRes] = await Promise.all([
        api.get<Employee[]>('/employee'),
        api.get<Leave[]>('/leave'),
      ]);

      const employeesWithLeaves = employeesRes.data.map(employee => ({
        ...employee,
        leaves: leavesRes.data.filter(leave => leave.employeeId === employee.id),
      }));

      setEmployees(employeesWithLeaves);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesWithLeaves();
  }, []);

  const getLeavesForYear = (leaves: Leave[], year: string) => {
    return leaves.filter(leave => 
      new Date(leave.tanggalMulaiCuti).getFullYear().toString() === year
    );
  };

  const getLeavesByMonth = (leaves: Leave[], year: string) => {
    const leavesByMonth: { [key: number]: Leave[] } = {};
    const yearLeaves = getLeavesForYear(leaves, year);

    yearLeaves.forEach(leave => {
      const month = new Date(leave.tanggalMulaiCuti).getMonth();
      if (!leavesByMonth[month]) {
        leavesByMonth[month] = [];
      }
      leavesByMonth[month].push(leave);
    });

    return leavesByMonth;
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Email', 'Gender', 'Total Leaves', 'Leave Details'];
    const rows = employees.map(employee => {
      const yearLeaves = getLeavesForYear(employee.leaves, selectedYear);
      const leaveDetails = yearLeaves.map(leave => 
        `${format(new Date(leave.tanggalMulaiCuti), 'dd/MM/yyyy')}: ${leave.alasanCuti}`
      ).join('; ');

      return [
        `${employee.namaDepan} ${employee.namaBelakang}`,
        employee.email,
        employee.jenisKelamin,
        yearLeaves.length.toString(),
        leaveDetails
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-leave-report-${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Leave Reports</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateYearOptions().map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV}>Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Leaves ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.reduce((total, emp) => 
                total + getLeavesForYear(emp.leaves, selectedYear).length, 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Leaves per Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.length > 0 
                ? (employees.reduce((total, emp) => 
                    total + getLeavesForYear(emp.leaves, selectedYear).length, 0
                  ) / employees.length).toFixed(1)
                : '0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Leave Summary - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Total Leaves</TableHead>
                <TableHead>Remaining Days</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const yearLeaves = getLeavesForYear(employee.leaves, selectedYear);
                const leavesByMonth = getLeavesByMonth(employee.leaves, selectedYear);
                const isExpanded = expandedEmployee === employee.id;

                return (
                  <React.Fragment key={employee.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {employee.namaDepan} {employee.namaBelakang}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.jenisKelamin}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={yearLeaves.length >= 10 ? "destructive" : 
                                   yearLeaves.length >= 8 ? "default" : "secondary"}
                        >
                          {yearLeaves.length}/12
                        </Badge>
                      </TableCell>
                      <TableCell>{12 - yearLeaves.length} days</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedEmployee(
                            isExpanded ? null : employee.id
                          )}
                        >
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="font-semibold mb-3">Leave Details for {selectedYear}</h4>
                            
                            {yearLeaves.length === 0 ? (
                              <p className="text-gray-500">No leaves taken in {selectedYear}</p>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(leavesByMonth).map(([monthIndex, monthLeaves]) => (
                                    <div key={monthIndex} className="border rounded p-3">
                                      <h5 className="font-medium text-sm mb-2">
                                        {getMonthName(parseInt(monthIndex))} {selectedYear}
                                      </h5>
                                      {monthLeaves.map((leave) => (
                                        <div key={leave.id} className="text-sm space-y-1">
                                          <div className="font-medium">
                                            {format(new Date(leave.tanggalMulaiCuti), 'dd MMM')}
                                          </div>
                                          <div className="text-gray-600 text-xs">
                                            {leave.alasanCuti}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="border-t pt-3">
                                  <h5 className="font-medium text-sm mb-2">All Leaves:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {yearLeaves.map((leave) => (
                                      <div key={leave.id} className="text-sm flex justify-between bg-white p-2 rounded border">
                                        <span>{format(new Date(leave.tanggalMulaiCuti), 'dd MMM yyyy')}</span>
                                        <span className="text-gray-600 truncate ml-2 max-w-xs">
                                          {leave.alasanCuti}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
