import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { TableGrid } from '@/components/reservation/TableGrid';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const Reservas = () => {
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <Navbar />
      <TableGrid />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Reservas;
