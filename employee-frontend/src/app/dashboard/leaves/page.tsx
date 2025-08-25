'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import type { Employee, Leave } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const leaveSchema = z.object({
  alasanCuti: z.string().min(1, 'Leave reason is required'),
  tanggalMulaiCuti: z.string().min(1, 'Start date is required'),
  tanggalSelesaiCuti: z.string().min(1, 'End date is required'),
  employeeId: z.string().min(1, 'Employee is required'),
}).refine((data) => {
  const startDate = new Date(data.tanggalMulaiCuti);
  const endDate = new Date(data.tanggalSelesaiCuti);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['tanggalSelesaiCuti'],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveWithEmployee extends Leave {
  employee: Employee;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [validationError, setValidationError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  });

  const selectedEmployeeId = watch('employeeId');

  const fetchLeaves = async () => {
    try {
      const response = await api.get<LeaveWithEmployee[]>('/leave');
      setLeaves(response.data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get<Employee[]>('/employee');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchLeaves(), fetchEmployees()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const validateLeaveRules = async (data: LeaveFormData): Promise<boolean> => {
    if (!selectedEmployeeId) return false;

    const startDate = new Date(data.tanggalMulaiCuti);
    const endDate = new Date(data.tanggalSelesaiCuti);
    const currentYear = new Date().getFullYear();

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysDiff > 1) {
      setValidationError('Each leave request can only be for 1 day');
      return false;
    }

    const employeeLeaves = leaves.filter(leave =>
      leave.employeeId === selectedEmployeeId &&
      new Date(leave.tanggalMulaiCuti).getFullYear() === currentYear
    );

    if (employeeLeaves.length >= 12) {
      setValidationError('Employee has already used maximum 12 days of leave this year');
      return false;
    }

    const startMonth = startDate.getMonth();
    const hasLeaveInMonth = employeeLeaves.some(leave => {
      const leaveMonth = new Date(leave.tanggalMulaiCuti).getMonth();
      return leaveMonth === startMonth;
    });

    if (hasLeaveInMonth && !editingLeave) {
      setValidationError('Employee has already taken leave in this month');
      return false;
    }

    setValidationError('');
    return true;
  };

  const onSubmit = async (data: LeaveFormData) => {
    try {
      const isValid = await validateLeaveRules(data);
      if (!isValid) return;

      if (editingLeave) {
        await api.patch(`/leave/${editingLeave.id}`, data);
      } else {
        await api.post('/leave', data);
      }

      fetchLeaves();
      setDialogOpen(false);
      reset();
      setEditingLeave(null);
      setValidationError('');
    } catch (error) {
      console.error('Failed to save leave:', error);
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      await api.delete(`/leave/${id}`);
      fetchLeaves();
    } catch (error) {
      console.error('Failed to delete leave:', error);
    }
  };

  const openEditDialog = (leave: Leave) => {
    setEditingLeave(leave);
    setValue('alasanCuti', leave.alasanCuti);
    setValue('tanggalMulaiCuti', leave.tanggalMulaiCuti.split('T')[0]);
    setValue('tanggalSelesaiCuti', leave.tanggalSelesaiCuti.split('T')[0]);
    setValue('employeeId', leave.employeeId);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingLeave(null);
    reset();
    setValidationError('');
    setDialogOpen(true);
  };

  const getDaysUsed = (employeeId: string) => {
    const currentYear = new Date().getFullYear();
    return leaves.filter(leave =>
      leave.employeeId === employeeId &&
      new Date(leave.tanggalMulaiCuti).getFullYear() === currentYear
    ).length;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Add Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLeave ? 'Edit Leave' : 'Add New Leave'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="employeeId">Employee</Label>
                <Select onValueChange={(value) => setValue('employeeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.namaDepan} {employee.namaBelakang}
                        <span className="text-sm text-gray-500 ml-2">
                          ({getDaysUsed(employee.id)}/12 days used)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-red-500 mt-1">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="alasanCuti">Leave Reason</Label>
                <Textarea
                  id="alasanCuti"
                  {...register('alasanCuti')}
                  className={errors.alasanCuti ? 'border-red-500' : ''}
                  placeholder="Enter reason for leave..."
                />
                {errors.alasanCuti && (
                  <p className="text-sm text-red-500 mt-1">{errors.alasanCuti.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tanggalMulaiCuti">Start Date</Label>
                  <Input
                    id="tanggalMulaiCuti"
                    type="date"
                    {...register('tanggalMulaiCuti')}
                    className={errors.tanggalMulaiCuti ? 'border-red-500' : ''}
                  />
                  {errors.tanggalMulaiCuti && (
                    <p className="text-sm text-red-500 mt-1">{errors.tanggalMulaiCuti.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tanggalSelesaiCuti">End Date</Label>
                  <Input
                    id="tanggalSelesaiCuti"
                    type="date"
                    {...register('tanggalSelesaiCuti')}
                    className={errors.tanggalSelesaiCuti ? 'border-red-500' : ''}
                  />
                  {errors.tanggalSelesaiCuti && (
                    <p className="text-sm text-red-500 mt-1">{errors.tanggalSelesaiCuti.message}</p>
                  )}
                </div>
              </div>

              {validationError && (
                <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                  {validationError}
                </div>
              )}

              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                <strong>Leave Rules:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Maximum 12 days per year per employee</li>
                  <li>Maximum 1 day per month per employee</li>
                  <li>Each request can only be for 1 day</li>
                </ul>
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingLeave ? 'Update Leave' : 'Create Leave'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    {leave.employee.namaDepan} {leave.employee.namaBelakang}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {leave.alasanCuti}
                  </TableCell>
                  <TableCell>
                    {format(new Date(leave.tanggalMulaiCuti), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(leave.tanggalSelesaiCuti), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getDaysUsed(leave.employeeId)}/12
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(leave)}>
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the leave request.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteLeave(leave.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
