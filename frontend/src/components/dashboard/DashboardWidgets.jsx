import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for class merging
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Status Cards ---
export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative overflow-hidden rounded-xl p-6 shadow-sm border border-gray-100 bg-white",
        colorClass,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtext && (
            <p className="text-xs mt-2 text-gray-500 flex items-center gap-1">
              {subtext}
            </p>
          )}
        </div>
        <div className="p-3 bg-white/50 rounded-lg backdrop-blur-sm">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
      {/* Decorative gradient orb */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
    </motion.div>
  );
};

// --- Charts ---
export const ProjectStatusChart = ({ data }) => {
  // Transform object { ongoing: 5, completed: 10 } to array
  const formattedData = [
    { name: "Planning", value: data.planning || 0, color: "#f59e0b" },
    { name: "Ongoing", value: data.ongoing || 0, color: "#3b82f6" },
    { name: "Completed", value: data.completed || 0, color: "#10b981" },
  ].filter((item) => item.value > 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <RechartsTooltip
            cursor={{ fill: "#f9fafb" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ResourceUtilizationChart = ({ data }) => {
  const formattedData = [
    { name: "Available", value: data.available || 0, color: "#10b981" }, // Green
    { name: "In Use", value: data.in_use || 0, color: "#3b82f6" }, // Blue
    { name: "Maintenance", value: data.maintenance || 0, color: "#ef4444" }, // Red
  ].filter((item) => item.value > 0);

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{ borderRadius: "8px", border: "none" }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Activity Tables ---
export const RecentProcurementTable = ({ requests, onViewClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No recent requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Project / Item</th>
            <th className="px-6 py-3">Requester</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr
              key={req.id}
              className="bg-white border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex flex-col">
                  <span>{req.item_name || "General Request"}</span>
                  <span className="text-xs text-gray-500">
                    {req.project?.name || "No Project"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">{req.user?.name}</td>
              <td className="px-6 py-4 text-gray-500">
                {new Date(req.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}
                >
                  {req.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onViewClick && onViewClick(req)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                >
                  View <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Quick Actions ---
export const QuickActionButton = ({ label, icon: Icon, to, colorClass }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 bg-white",
      colorClass,
    )}
  >
    <div
      className={cn(
        "p-2 rounded-lg bg-opacity-20",
        colorClass.replace("bg-", "text-"),
      )}
    >
      <Icon size={20} />
    </div>
    <span className="font-semibold text-gray-700">{label}</span>
  </Link>
);
