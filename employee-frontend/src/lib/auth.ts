'use client';

import { useState, useEffect } from 'react';

export interface Admin {
  id: string;
  namaDepan: string;
  namaBelakang: string;
  email: string;
  tanggalLahir: string;
  jenisKelamin: 'MALE' | 'FEMALE';
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData && adminData !== 'undefined') {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Failed to parse admin data:', error);
        localStorage.removeItem('admin');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, adminData: Admin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return { admin, loading, login, logout };
};
