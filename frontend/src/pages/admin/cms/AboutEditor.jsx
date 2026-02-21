import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Save, Loader2 } from "lucide-react";
import OrganizationManager from "../../../components/admin/OrganizationManager";
import { useAuth } from "../../../context/AuthContext";
import PageLoader from "../../../components/PageLoader";

const AboutEditor = () => {
  const [contents, setContents] = useState({
    mission: "",
    vision: "",
    background: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/page-contents?page=about", {
        skipLoading: true,
      });
      const data = response.data;
      const newContents = { ...contents };

      data.forEach((item) => {
        if (newContents.hasOwnProperty(item.section_name)) {
          newContents[item.section_name] = item.content;
        }
      });

      setContents(newContents);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, value) => {
    setContents((prev) => ({ ...prev, [section]: value }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    setMessage("");
    try {
      await axiosClient.post(
        "/api/page-contents",
        {
          page_name: "about",
          section_name: section,
          content: contents[section],
        },
        { skipLoading: true },
      );
      setMessage(
        `${section.charAt(0).toUpperCase() + section.slice(1)} saved successfully!`,
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit About Page</h2>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 fixed top-4 right-4 shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Mission Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Mission</h3>
            {user?.all_permissions?.includes("cms.edit") && (
              <button
                onClick={() => handleSave("mission")}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
          <textarea
            className="w-full h-32 p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={contents.mission}
            onChange={(e) => handleChange("mission", e.target.value)}
            placeholder="Enter mission statement..."
          />
        </div>

        {/* Vision Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Vision</h3>
            {user?.all_permissions?.includes("cms.edit") && (
              <button
                onClick={() => handleSave("vision")}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
          <textarea
            className="w-full h-32 p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={contents.vision}
            onChange={(e) => handleChange("vision", e.target.value)}
            placeholder="Enter vision statement..."
          />
        </div>

        {/* Company Background Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Company Background</h3>
            {user?.all_permissions?.includes("cms.edit") && (
              <button
                onClick={() => handleSave("background")}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={18} /> Save
              </button>
            )}
          </div>
          <textarea
            className="w-full h-64 p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={contents.background}
            onChange={(e) => handleChange("background", e.target.value)}
            placeholder="Enter company background..."
          />
        </div>

        {/* Organization Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <OrganizationManager />
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;
