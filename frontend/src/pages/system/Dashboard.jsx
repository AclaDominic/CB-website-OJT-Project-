import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../lib/axios";
import PageLoader from "../../components/PageLoader";
import {
  Activity,
  AlertTriangle,
  Package,
  Clock,
  Briefcase,
  Files,
  Construction,
  Plus,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  ResourceUtilizationChart,
  RecentProcurementTable,
  QuickActionButton,
} from "../../components/dashboard/DashboardWidgets";
import { motion } from "framer-motion";
import ProcurementDetailModal from "../../components/procurement/ProcurementDetailModal";
import SystemAlertsModal from "../../components/dashboard/SystemAlertsModal";

import echo from "../../lib/echo";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    low_stock_count: 0,
    pending_procurement_count: 0,
    active_projects_count: 0,
    recent_procurement: [],
    machinery_stats: { available: 0, in_use: 0, maintenance: 0, total: 0 },
    project_stats: { ongoing: 0, completed: 0 },
    system_status: "System Operational",
    system_alerts: [],
    permissions: {},
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    // Optionally refresh stats if needed
    fetchStats();
  };

  useEffect(() => {
    fetchStats();

    // Listen for real-time dashboard updates via Reverb WebSockets
    const channel = echo.channel("admin");
    channel.listen(".App\\Events\\DashboardUpdated", (e) => {
      fetchStats();
    });

    // Cleanup listener on component unmount
    return () => {
      channel.stopListening(".App\\Events\\DashboardUpdated");
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get("/api/system/dashboard-stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  if (loading) {
    return <PageLoader />;
  }

  // Permission Checks
  // Permission Checks
  const canViewInventory =
    user?.all_permissions?.includes("inventory.view") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canCreateProject =
    user?.all_permissions?.includes("projects.create") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canViewProject =
    user?.all_permissions?.includes("projects.view") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canViewMachinery =
    user?.all_permissions?.includes("inventory.view") ||
    user?.all_permissions?.includes("procurement.view") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canProcessProcurement =
    user?.all_permissions?.includes("procurement.process") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canCreateProcurement =
    user?.all_permissions?.includes("procurement.create") ||
    user?.roles?.some((r) => r.name === "Admin");
  const canViewProcurement =
    user?.all_permissions?.includes("procurement.view") ||
    user?.roles?.some((r) => r.name === "Admin");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 flex-1 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-500">Here's what's happening today.</p>
        </div>
        <button
          onClick={() => {
            if (stats.system_alerts?.length > 0) {
              setIsAlertsModalOpen(true);
            }
          }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
            stats.system_status === "Critical Problem"
              ? "bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer"
              : stats.system_status === "Minor Problem"
                ? "bg-amber-50 border-amber-200 hover:bg-amber-100 cursor-pointer"
                : "bg-green-50 border-green-100"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              stats.system_status === "Critical Problem"
                ? "bg-red-500"
                : stats.system_status === "Minor Problem"
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
          ></div>
          <span
            className={`text-sm font-medium ${
              stats.system_status === "Critical Problem"
                ? "text-red-700"
                : stats.system_status === "Minor Problem"
                  ? "text-amber-700"
                  : "text-green-700"
            }`}
          >
            {stats.system_status || "System Operational"}
          </span>
          {stats.system_alerts?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-white bg-opacity-50">
              {stats.system_alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <StatCard
          title="Active Projects"
          value={stats.active_projects_count}
          icon={Briefcase}
          colorClass="bg-gradient-to-br from-blue-50 to-white text-blue-600 border-blue-100"
          delay={0.1}
          hasPermission={canViewProject}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending_procurement_count}
          subtext={
            stats.is_personal_procurement_view
              ? "Awaiting approval"
              : "Need approval"
          }
          icon={Clock}
          colorClass="bg-gradient-to-br from-amber-50 to-white text-amber-600 border-amber-100"
          delay={0.2}
          hasPermission={canProcessProcurement}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_count}
          icon={AlertTriangle}
          colorClass="bg-gradient-to-br from-red-50 to-white text-red-600 border-red-100"
          delay={0.3}
          hasPermission={canViewInventory}
        />
        <StatCard
          title="Machinery Active"
          value={stats.machinery_stats?.in_use || 0}
          subtext={`of ${stats.machinery_stats?.total || 0} total units`}
          icon={Truck}
          colorClass="bg-gradient-to-br from-emerald-50 to-white text-emerald-600 border-emerald-100"
          delay={0.4}
          hasPermission={canViewMachinery}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Stats & Actions */}
        <div className="flex flex-col gap-6">
          {/* Resource Utilization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Equipment
              Usage
            </h3>

            {!canViewMachinery ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8 gap-3 bg-gray-50/50 rounded-lg absolute inset-0 mt-14 mb-4 mx-4">
                <AlertTriangle className="w-10 h-10 text-gray-400 opacity-50" />
                <span className="text-sm font-bold tracking-wider uppercase text-gray-400">
                  Not Permitted
                </span>
                <p className="text-xs text-gray-500 text-center max-w-[200px]">
                  You do not have permission to view machinery analytics.
                </p>
              </div>
            ) : (
              <>
                <ResourceUtilizationChart data={stats.machinery_stats} />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                      Available
                    </span>
                    <span className="font-semibold">
                      {stats.machinery_stats?.available}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
                      In Use
                    </span>
                    <span className="font-semibold">
                      {stats.machinery_stats?.in_use}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>{" "}
                      Maintenace
                    </span>
                    <span className="font-semibold">
                      {stats.machinery_stats?.maintenance}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <QuickActionButton
                to="/system/projects"
                label="New Project"
                icon={Plus}
                colorClass="bg-blue-50 hover:bg-blue-100 text-blue-600"
                hasPermission={canCreateProject}
              />
              <QuickActionButton
                to="/system/procurement"
                label="Request Materials"
                icon={Package}
                colorClass="bg-amber-50 hover:bg-amber-100 text-amber-600"
                hasPermission={canCreateProcurement}
              />
              <QuickActionButton
                to="/system/inventory"
                label="Add Inventory"
                icon={Files}
                colorClass="bg-green-50 hover:bg-green-100 text-green-600"
                hasPermission={canViewInventory}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">
              Recent Procurement Requests
            </h3>
            {(canViewProcurement ||
              (stats.is_personal_procurement_view && canCreateProcurement)) && (
              <Link
                to="/system/procurement"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </Link>
            )}
          </div>
          <RecentProcurementTable
            requests={stats.recent_procurement}
            onViewClick={handleViewDetail}
            hasPermission={canViewProcurement || canCreateProcurement}
            isPersonalView={
              !user?.roles?.some(
                (r) => r.name === "Admin" || r.name === "Staff",
              ) && canCreateProcurement
            }
          />
        </div>
      </div>

      {isDetailModalOpen && selectedRequest && (
        <ProcurementDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailClose}
          request={selectedRequest}
        />
      )}

      {isAlertsModalOpen && (
        <SystemAlertsModal
          isOpen={isAlertsModalOpen}
          onClose={() => setIsAlertsModalOpen(false)}
          alerts={stats.system_alerts}
          onResolve={fetchStats}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;
