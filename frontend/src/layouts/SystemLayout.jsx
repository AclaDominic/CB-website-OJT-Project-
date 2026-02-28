import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Toaster } from "react-hot-toast";
import SystemSidebar from "../components/SystemSidebar";

const SystemLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-100 via-sky-50 to-green-100 overflow-hidden">
      <SystemSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-auto w-full flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">
            System Portal
          </span>
        </div>

        <div className="p-4 md:p-8 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default SystemLayout;
