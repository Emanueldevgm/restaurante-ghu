import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navbar } from '@/components/layout/Navbar';

const Auth = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AuthForm />
    </div>
  );
};

export default Auth;
