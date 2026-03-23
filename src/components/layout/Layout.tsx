import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AccessibilityButton from '../accessibility/AccessibilityButton';

const Layout = () => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="pl-[260px]">
        <Topbar onOpenAccessibility={() => setIsAccessibilityOpen(true)} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
      <AccessibilityButton 
        isOpen={isAccessibilityOpen} 
        onToggle={() => setIsAccessibilityOpen(!isAccessibilityOpen)} 
      />
    </div>
  );
};

export default Layout;
