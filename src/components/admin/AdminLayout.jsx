import { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 font-body flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
        <AdminHeader setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1440px] mx-auto p-4 lg:p-8 xl:px-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
