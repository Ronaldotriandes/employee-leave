'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import type { Employee, Gender } from '@/lib/types';

const employeeSchema = z.object({
  namaDepan: z.string().min(1, 'First name is required'),
  namaBelakang: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  noHp: z.string().min(1, 'Phone number is required'),
  alamat: z.string().min(1, 'Address is required'),
  jenisKelamin: z.enum(['MALE', 'FEMALE']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const fetchEmployees = async () => {
    try {
      const response = await api.get<Employee[]>('/employee');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (editingEmployee) {
        await api.patch(`/employee/${editingEmployee.id}`, data);
      } else {
        await api.post('/employee', data);
      }
      
      fetchEmployees();
      setDialogOpen(false);
      reset();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to save employee:', error);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/employee/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setValue('namaDepan', employee.namaDepan);
    setValue('namaBelakang', employee.namaBelakang);
    setValue('email', employee.email);
    setValue('noHp', employee.noHp);
    setValue('alamat', employee.alamat);
    setValue('jenisKelamin', employee.jenisKelamin);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    reset();
    setDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namaDepan">First Name</Label>
                  <Input
                    id="namaDepan"
                    {...register('namaDepan')}
                    className={errors.namaDepan ? 'border-red-500' : ''}
                  />
                  {errors.namaDepan && (
                    <p className="text-sm text-red-500 mt-1">{errors.namaDepan.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="namaBelakang">Last Name</Label>
                  <Input
                    id="namaBelakang"
                    {...register('namaBelakang')}
                    className={errors.namaBelakang ? 'border-red-500' : ''}
                  />
                  {errors.namaBelakang && (
                    <p className="text-sm text-red-500 mt-1">{errors.namaBelakang.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="noHp">Phone Number</Label>
                <Input
                  id="noHp"
                  {...register('noHp')}
                  className={errors.noHp ? 'border-red-500' : ''}
                />
                {errors.noHp && (
                  <p className="text-sm text-red-500 mt-1">{errors.noHp.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="alamat">Address</Label>
                <Textarea
                  id="alamat"
                  {...register('alamat')}
                  className={errors.alamat ? 'border-red-500' : ''}
                />
                {errors.alamat && (
                  <p className="text-sm text-red-500 mt-1">{errors.alamat.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="jenisKelamin">Gender</Label>
                <Select onValueChange={(value) => setValue('jenisKelamin', value as Gender)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jenisKelamin && (
                  <p className="text-sm text-red-500 mt-1">{errors.jenisKelamin.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.namaDepan} {employee.namaBelakang}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.noHp}</TableCell>
                  <TableCell>{employee.jenisKelamin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>
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
                                This action cannot be undone. This will permanently delete the employee and all their leave records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteEmployee(employee.id)}>
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
