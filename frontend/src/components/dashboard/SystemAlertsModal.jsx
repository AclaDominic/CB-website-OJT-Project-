import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import axiosClient from "../../lib/axios";

const SystemAlertsModal = ({ isOpen, onClose, alerts, onResolve }) => {
  const [resolvingId, setResolvingId] = useState(null);

  if (!isOpen) return null;

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await axiosClient.post(`/api/admin/system-alerts/${id}/resolve`);
      onResolve();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      alert("Failed to resolve alert. Please try again later.");
    } finally {
      setResolvingId(null);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return <XCircle className="text-red-500 shrink-0" size={24} />;
      case "minor":
        return <AlertTriangle className="text-amber-500 shrink-0" size={24} />;
      default:
        return <AlertTriangle className="text-gray-500 shrink-0" size={24} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50/50";
      case "minor":
        return "border-amber-200 bg-amber-50/50";
      default:
        return "border-gray-200 bg-gray-50/50";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              Active System Alerts
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${getAlertColor(
                    alert.type,
                  )}`}
                >
                  <div className="flex gap-4 items-start">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {alert.type === "critical"
                          ? "Critical Error"
                          : "Minor Problem"}
                        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                          #{alert.id}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Occurred: {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolvingId === alert.id}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium text-sm rounded-lg border shadow-sm hover:bg-gray-50 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resolvingId === alert.id ? (
                      <div className="w-4 h-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Mark Resolved
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">All Clear</h3>
                <p className="text-gray-500 mt-1">
                  There are currently no active system alerts.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SystemAlertsModal;
