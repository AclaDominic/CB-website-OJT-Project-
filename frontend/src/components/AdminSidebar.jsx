import React, { useState, useEffect } from "react";
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
  Shield,
  Users,
  Package,
  Bell,
  Check,
} from "lucide-react";
import axiosClient from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

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

  // Notifications Logic
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosClient.get("/api/notifications");
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.post(`/api/notifications/${id}/read`);
      setNotifications(notifications.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post("/api/notifications/read-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
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
    {
      path: "/admin/inventory",
      label: "Inventory",
      icon: <Package size={20} />,
    },
    { path: "/admin/inquiries", label: "Inquiries", icon: <Mail size={20} /> },
    { path: "/admin/contact", label: "Contact", icon: <Phone size={20} /> },
  ];

  if (user?.all_permissions?.includes("system.manage_roles")) {
    navItems.push({
      path: "/admin/roles",
      label: "Roles & Permissions",
      icon: <Shield size={20} />,
    });
  }

  if (user?.all_permissions?.includes("system.manage_users")) {
    navItems.push({
      path: "/admin/users",
      label: "User Management",
      icon: <Users size={20} />,
    });
  }

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
        <div className="p-6 border-b border-gray-800 flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="text-green-500" />
              Admin Panel
            </h1>

            {/* Notification Bell */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-400 hover:text-white transition-colors p-1"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown/Modal */}
              {showNotifications && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 text-gray-800 border overflow-hidden">
                  <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border-b hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-800 mb-1">
                              {notification.data.message}
                            </p>
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-600"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

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
