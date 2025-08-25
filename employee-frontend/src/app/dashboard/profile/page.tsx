'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Gender } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const profileSchema = z.object({
  namaDepan: z.string().min(1, 'First name is required'),
  namaBelakang: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  tanggalLahir: z.string().min(1, 'Birth date is required'),
  jenisKelamin: z.enum(['MALE', 'FEMALE']),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set new password",
  path: ["currentPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { admin, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: admin ? {
      namaDepan: admin.namaDepan,
      namaBelakang: admin.namaBelakang,
      email: admin.email,
      tanggalLahir: admin.tanggalLahir.split('T')[0],
      jenisKelamin: admin.jenisKelamin,
    } : undefined,
  });

  if (!admin) return <div>Loading...</div>;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setMessage('');

      const updateData: any = {
        namaDepan: data.namaDepan,
        namaBelakang: data.namaBelakang,
        email: data.email,
        tanggalLahir: data.tanggalLahir,
        jenisKelamin: data.jenisKelamin,
      };

      if (data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      const response = await api.patch(`/admin/${admin.id}`, updateData);

      const updatedAdmin = { ...admin, ...updateData };
      delete updatedAdmin.currentPassword;
      delete updatedAdmin.newPassword;

      localStorage.setItem('admin', JSON.stringify(updatedAdmin));

      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
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

            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-medium mb-4">Change Password</h3>

              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {message && (
              <div className={`text-sm p-2 rounded ${message.includes('successfully')
                  ? 'text-green-700 bg-green-50'
                  : 'text-red-700 bg-red-50'
                }`}>
                {message}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
