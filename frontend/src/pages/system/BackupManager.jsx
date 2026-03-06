import React, { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Database,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { backupApi } from "../../api/backup";
import PageLoader from "../../components/PageLoader";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../lib/axios";
import ConfirmModal from "../../components/system/ConfirmModal";

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });

  const { hasPermission } = useAuth();
  const canView = hasPermission("view_backups");
  const canCreate = hasPermission("create_backups");
  const canDownload = hasPermission("download_backups");
  const canDelete = hasPermission("delete_backups");

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await backupApi.getBackups();
      setBackups(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch backups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      fetchBackups();
    } else {
      setLoading(false);
    }
  }, [canView]);

  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      setError(null);
      setSuccess(null);
      const res = await backupApi.createBackup();
      setSuccess(res.message || "Backup process started.");
      // Refresh the list after a small delay since backup runs asynchronously
      setTimeout(fetchBackups, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to trigger backup.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDelete = async (fileName) => {
    setConfirmModal({
      isOpen: true,
      message:
        "Are you sure you want to delete this backup archive? This cannot be undone.",
      action: async () => {
        try {
          await backupApi.deleteBackup(fileName);
          setSuccess("Backup deleted successfully.");
          fetchBackups();
        } catch (err) {
          setError(err.response?.data?.message || "Failed to delete backup.");
        }
      },
    });
  };

  const handleDownload = async (fileName) => {
    try {
      // Using axiosClient explicitly here to get the blob directly with Sanctum auth headers
      const response = await axiosClient.get(
        `/api/system/backups/${fileName}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError("Failed to download backup securely.");
    }
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold dark:text-white">Access Denied</h2>
        <p>You do not have permission to view system backups.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center bg-gradient-to-r from-blue-900 to-slate-800 p-6 rounded-xl shadow-lg border border-blue-800/50">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="text-blue-400" />
            System Backups
          </h1>
          <p className="text-blue-200 text-sm">
            Manage your local database dumps and file storage archives.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-blue-500/20"
          >
            {isBackingUp ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            {isBackingUp ? "Generating..." : "Run Backup Now"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Backup Archives
          </h3>
          <button
            onClick={fetchBackups}
            className="p-2 text-gray-500 hover:text-blue-500"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-20">
            <PageLoader message="Loading backups..." />
          </div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No backups found. Run your first backup to secure your data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 text-sm">
                  <th className="p-4 font-medium">Archive Filename</th>
                  <th className="p-4 font-medium text-center">Size (MB)</th>
                  <th className="p-4 font-medium">Date Created</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {(backups || []).map((backup, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {backup.file_name}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {backup.file_size} MB
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                      {backup.date}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {canDownload && (
                          <button
                            onClick={() => handleDownload(backup.file_name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Download Encrypted Archive"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(backup.file_name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Backup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canDownload && backups.length > 0 && (
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5">
          <h3 className="text-amber-800 dark:text-amber-500 font-semibold mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Disaster Recovery Instructions
          </h3>
          <p className="text-amber-700 dark:text-amber-600/80 text-sm mb-3">
            To restore the system in the event of a failure:
          </p>
          <ol className="list-decimal pl-5 text-sm text-amber-700/90 dark:text-amber-600/70 space-y-1">
            <li>
              Download the latest backup archive using the download icon above.
            </li>
            <li>
              Extract the downloaded <code>.zip</code> file using the{" "}
              <b>BACKUP_ARCHIVE_PASSWORD</b> from your secure <code>.env</code>{" "}
              file.
            </li>
            <li>
              Follow the manual import procedures detailed in{" "}
              <code>backupandrestore.md</code> to restore the Database and
              Storage files.
            </li>
          </ol>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.action || (() => {})}
        title="Confirm Delete"
        message={confirmModal.message}
        isDestructive={true}
      />
    </div>
  );
};

export default BackupManager;
