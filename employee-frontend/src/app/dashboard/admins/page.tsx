'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import type { Admin, Gender } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const adminSchema = z.object({
  namaDepan: z.string().min(1, 'First name is required'),
  namaBelakang: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  tanggalLahir: z.string().min(1, 'Birth date is required'),
  jenisKelamin: z.enum(['MALE', 'FEMALE']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type AdminFormData = z.infer<typeof adminSchema>;

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const fetchAdmins = async () => {
    try {
      const response = await api.get<Admin[]>('/admin');
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    try {
      if (editingAdmin) {
        const updateData = { ...data };
        if (!data.password) {
          delete updateData.password;
        }
        await api.patch(`/admin/${editingAdmin.id}`, updateData);
      } else {
        await api.post('/admin', data);
      }

      fetchAdmins();
      setDialogOpen(false);
      reset();
      setEditingAdmin(null);
    } catch (error) {
      console.error('Failed to save admin:', error);
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      await api.delete(`/admin/${id}`);
      fetchAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setEditingAdmin(admin);
    setValue('namaDepan', admin.namaDepan);
    setValue('namaBelakang', admin.namaBelakang);
    setValue('email', admin.email);
    setValue('tanggalLahir', admin.tanggalLahir.split('T')[0]);
    setValue('jenisKelamin', admin.jenisKelamin);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingAdmin(null);
    reset();
    setDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Add Admin</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
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
                <Label htmlFor="tanggalLahir">Birth Date</Label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  {...register('tanggalLahir')}
                  className={errors.tanggalLahir ? 'border-red-500' : ''}
                />
                {errors.tanggalLahir && (
                  <p className="text-sm text-red-500 mt-1">{errors.tanggalLahir.message}</p>
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

              <div>
                <Label htmlFor="password">Password {editingAdmin && '(Leave blank to keep current)'}</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admins List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.namaDepan} {admin.namaBelakang}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{format(new Date(admin.tanggalLahir), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{admin.jenisKelamin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(admin)}>
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
                                This action cannot be undone. This will permanently delete the admin account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAdmin(admin.id)}>
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
