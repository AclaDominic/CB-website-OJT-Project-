import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FolderKanban,
  Truck,
  Phone,
  X,
  Mail,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(path)
      ? "bg-gray-800 text-white"
      : "text-gray-400 hover:bg-gray-800 hover:text-white";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { path: "/admin/about", label: "About", icon: <FileText size={20} /> },
    {
      path: "/admin/services",
      label: "Services",
      icon: <Briefcase size={20} />,
    },
    {
      path: "/admin/projects",
      label: "Projects",
      icon: <FolderKanban size={20} />,
    },
    { path: "/admin/resources", label: "Resources", icon: <Truck size={20} /> },
    { path: "/admin/inquiries", label: "Inquiries", icon: <Mail size={20} /> },
    { path: "/admin/contact", label: "Contact", icon: <Phone size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
                bg-gray-900 w-64 min-h-screen flex flex-col border-r border-gray-800
                fixed md:static inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-green-500" />
            Admin Panel
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
