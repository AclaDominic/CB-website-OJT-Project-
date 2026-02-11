import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Toaster } from "react-hot-toast";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">Admin Panel</span>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminLayout;
