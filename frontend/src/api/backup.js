import axiosClient from "../lib/axios";

export const backupApi = {
  // Get list of backups
  getBackups: async () => {
    const response = await axiosClient.get("/api/system/backups");
    return response.data;
  },

  // Trigger a new backup
  createBackup: async () => {
    const response = await axiosClient.post("/api/system/backups");
    return response.data;
  },

  // Delete a backup
  deleteBackup: async (fileName) => {
    const response = await axiosClient.delete(
      `/api/system/backups/${fileName}`,
    );
    return response.data;
  },

  // Download a backup (URL to trigger the download)
  getDownloadUrl: (fileName) => {
    return `${import.meta.env.VITE_API_BASE_URL}/api/system/backups/${fileName}`;
  },
};
