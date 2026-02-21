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

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    low_stock_count: 0,
    pending_procurement_count: 0,
    active_projects_count: 0,
    recent_procurement: [],
    machinery_stats: { available: 0, in_use: 0, maintenance: 0, total: 0 },
    project_stats: { ongoing: 0, completed: 0 },
    permissions: {},
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get("/api/admin/dashboard-stats");
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
  const canViewInventory = stats.permissions?.can_view_inventory;
  const canCreateProject = stats.permissions?.can_create_project;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-500">Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">
            System Operational
          </span>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value={stats.active_projects_count}
          icon={Briefcase}
          colorClass="bg-gradient-to-br from-blue-50 to-white text-blue-600 border-blue-100"
          delay={0.1}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending_procurement_count}
          subtext="Need approval"
          icon={Clock}
          colorClass="bg-gradient-to-br from-amber-50 to-white text-amber-600 border-amber-100"
          delay={0.2}
        />
        {canViewInventory && (
          <StatCard
            title="Low Stock Items"
            value={stats.low_stock_count}
            icon={AlertTriangle}
            colorClass="bg-gradient-to-br from-red-50 to-white text-red-600 border-red-100"
            delay={0.3}
          />
        )}
        <StatCard
          title="Machinery Active"
          value={stats.machinery_stats?.in_use || 0}
          subtext={`of ${stats.machinery_stats?.total || 0} total units`}
          icon={Truck}
          colorClass="bg-gradient-to-br from-emerald-50 to-white text-emerald-600 border-emerald-100"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="space-y-6">
          {/* Resource Utilization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Equipment
              Usage
            </h3>
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
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div> In
                  Use
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
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {canCreateProject && (
                <QuickActionButton
                  to="/admin/projects"
                  label="New Project"
                  icon={Plus}
                  colorClass="bg-blue-50 hover:bg-blue-100 text-blue-600"
                />
              )}
              <QuickActionButton
                to="/admin/procurement"
                label="Request Materials"
                icon={Package}
                colorClass="bg-amber-50 hover:bg-amber-100 text-amber-600"
              />
              {canViewInventory && (
                <QuickActionButton
                  to="/admin/inventory"
                  label="Add Inventory"
                  icon={Files}
                  colorClass="bg-green-50 hover:bg-green-100 text-green-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">
              Recent Procurement Requests
            </h3>
            <Link
              to="/admin/procurement"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          <RecentProcurementTable
            requests={stats.recent_procurement}
            onViewClick={handleViewDetail}
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
    </motion.div>
  );
};

export default Dashboard;
