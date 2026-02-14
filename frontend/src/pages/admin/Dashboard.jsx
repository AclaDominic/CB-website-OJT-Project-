import React, { useState, useEffect } from "react";
import axiosClient from "../../lib/axios";
import {
  Activity,
  AlertTriangle,
  Package,
  Clock,
  Briefcase,
  TrendingUp,
  Files,
  Construction,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    low_stock_count: 0,
    pending_procurement_count: 0,
    active_projects_count: 0,
    recent_procurement: [],
  });
  const [loading, setLoading] = useState(true);

  /*
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get("/admin/dashboard-stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-yellow-50 p-6 rounded-full mb-6 mx-auto w-fit">
        <Construction size={64} className="text-yellow-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Dashboard Under Construction
      </h1>
      <p className="text-gray-500 max-w-md mx-auto">
        We're working hard to bring you a new and improved dashboard experience.
        Check back soon!
      </p>
    </div>
  );
};

export default Dashboard;
