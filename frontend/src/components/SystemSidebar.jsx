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
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Layers,
  Settings,
  ClipboardList,
} from "lucide-react";
import axiosClient from "../lib/axios";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

import echo from "../lib/echo";

const SystemSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState({
    "Content Management": true,
    Operations: true,
    "System Administration": false,
  });

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
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

  const getDisplayRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return "Admin Panel";
    const roleName = user.roles[0].name;
    if (roleName.length > 12) {
      return roleName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    }
    return roleName;
  };

  const displayLabel = getDisplayRole();

  // Notifications Logic
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time notification updates via Reverb WebSockets
    const channel = echo.channel("admin");
    channel.listen(".App\\Events\\NotificationSent", (e) => {
      fetchNotifications();
    });

    return () => {
      channel.stopListening(".App\\Events\\NotificationSent");
    };
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

  // Navigation Structure
  const navigationGroups = [
    {
      title: null, // Root items
      items: [
        {
          path: "/system",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
        },
      ],
    },
    {
      title: "Content Management",
      icon: <Layers size={18} />,
      items: [
        {
          path: "/system/projects",
          label: "Projects",
          icon: <FolderKanban size={18} />,
        },
        {
          path: "/system/services",
          label: "Services",
          icon: <Briefcase size={18} />,
        },
        {
          path: "/system/resources",
          label: "Resources",
          icon: <Truck size={18} />,
        },
        {
          path: "/system/about",
          label: "About Us",
          icon: <FileText size={18} />,
        },
        {
          path: "/system/contact",
          label: "Contact Info",
          icon: <Phone size={18} />,
        },
      ],
    },
    {
      title: "Operations",
      icon: <ClipboardList size={18} />,
      items: [
        {
          path: "/system/inventory",
          label: "Inventory",
          icon: <Package size={18} />,
        },
        {
          path: "/system/procurement",
          label: "Procurement",
          icon: <ShoppingCart size={18} />,
        },
        {
          path: "/system/inquiries",
          label: "Inquiries",
          icon: <Mail size={18} />,
        },
      ],
    },
    {
      title: "System Administration",
      icon: <Settings size={18} />,
      items: [
        ...(user?.all_permissions?.includes("system.manage_users")
          ? [
              {
                path: "/system/users",
                label: "User Management",
                icon: <Users size={18} />,
              },
            ]
          : []),
        ...(user?.all_permissions?.includes("system.manage_roles")
          ? [
              {
                path: "/system/roles",
                label: "Roles & Permissions",
                icon: <Shield size={18} />,
              },
            ]
          : []),
      ],
    },
  ];

  const SidebarItem = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => onClose && onClose()}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive(item.path)}`}
    >
      {item.icon}
      <span>{item.label}</span>
      {/* Active Indicator for aesthetics */}
      {isActive(item.path).includes("bg-gray-800") && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-company-blue"></div>
      )}
    </Link>
  );

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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-company-blue" />
            <span className="tracking-tight">{displayLabel}</span>
          </h1>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
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

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute top-0 left-full ml-4 w-80 bg-white rounded-lg shadow-xl z-50 text-gray-800 border overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left">
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
                            <p className="text-sm text-gray-800 mb-1 line-clamp-2">
                              {notification.data.message}
                            </p>
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-600 shrink-0 ml-2"
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

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {navigationGroups.map((group, index) => {
            // Check if group has visible items
            if (group.items.length === 0) return null;

            if (!group.title) {
              // Render Root Items (like Dashboard)
              return (
                <div key={index} className="mb-2">
                  {group.items.map((item) => (
                    <SidebarItem key={item.path} item={item} />
                  ))}
                </div>
              );
            }

            return (
              <div key={group.title} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  {expandedGroups[group.title] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>

                {expandedGroups[group.title] && (
                  <div className="mt-1 space-y-1 ml-1 pl-2 border-l border-gray-800 animate-in slide-in-from-left-2 duration-200">
                    {group.items.map((item) => (
                      <SidebarItem key={item.path} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/system/settings"
            onClick={() => onClose && onClose()}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive("/system/settings")}`}
          >
            <Settings size={20} />
            <span>Account Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800/50 hover:text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default SystemSidebar;
