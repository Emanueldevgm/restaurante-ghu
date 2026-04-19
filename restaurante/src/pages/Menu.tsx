import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MenuShowcase } from '@/components/menu/MenuShowcase';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const Menu = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <MenuShowcase />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Menu;
