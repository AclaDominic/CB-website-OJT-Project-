import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";

const ContactEditor = () => {
  const [officeInfo, setOfficeInfo] = useState({
    address: "",
    email: { value: "", visible: true },
    mobile: { value: "", visible: true },
    landline: { value: "", visible: false },
    socials: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        "/api/page-contents?page=contact",
        { skipLoading: true },
      );
      const data = response.data;
      const info = data.find((item) => item.section_name === "office_info");
      if (info) {
        try {
          const parsed = JSON.parse(info.content);
          // Backward compatibility check
          const newInfo = {
            address: parsed.address || "",
            email:
              typeof parsed.email === "string"
                ? { value: parsed.email, visible: true }
                : parsed.email || { value: "", visible: true },
            mobile:
              typeof parsed.mobile === "string"
                ? { value: parsed.mobile, visible: true }
                : parsed.mobile || { value: "", visible: true },
            landline:
              typeof parsed.landline === "string"
                ? { value: parsed.landline, visible: false }
                : parsed.landline || { value: "", visible: false },
            socials: Array.isArray(parsed.socials) ? parsed.socials : [],
          };
          setOfficeInfo(newInfo);
        } catch (e) {
          console.warn("Could not parse office info JSON, resetting fields");
          setOfficeInfo({
            address: info.content,
            email: { value: "", visible: true },
            mobile: { value: "", visible: true },
            landline: { value: "", visible: false },
            socials: [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axiosClient.post(
        "/api/page-contents",
        {
          page_name: "contact",
          section_name: "office_info",
          content: JSON.stringify(officeInfo),
        },
        { skipLoading: true },
      );
      setMessage("Office Information saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (index, field, value) => {
    const newSocials = [...officeInfo.socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setOfficeInfo({ ...officeInfo, socials: newSocials });
  };

  const addSocial = () => {
    setOfficeInfo({
      ...officeInfo,
      socials: [
        ...officeInfo.socials,
        { platform: "facebook", value: "", visible: true },
      ],
    });
  };

  const removeSocial = (index) => {
    const newSocials = officeInfo.socials.filter((_, i) => i !== index);
    setOfficeInfo({ ...officeInfo, socials: newSocials });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-2xl font-bold mb-6">Edit Contact Page</h2>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 fixed top-4 right-4 shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Office Information</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} /> Save
          </button>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Address
          </label>
          <textarea
            className="w-full h-24 p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={officeInfo.address}
            onChange={(e) =>
              setOfficeInfo({ ...officeInfo, address: e.target.value })
            }
            placeholder="Lot 3739 National Highway..."
          />
        </div>

        {/* Contact Details with Visibility Toggles */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="email-visible"
                  checked={officeInfo.email.visible}
                  onChange={(e) =>
                    setOfficeInfo({
                      ...officeInfo,
                      email: { ...officeInfo.email, visible: e.target.checked },
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="email-visible"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Show on website
                </label>
              </div>
            </div>
            <input
              type="email"
              className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!officeInfo.email.visible ? "bg-gray-50 text-gray-500" : ""}`}
              value={officeInfo.email.value}
              onChange={(e) =>
                setOfficeInfo({
                  ...officeInfo,
                  email: { ...officeInfo.email, value: e.target.value },
                })
              }
              placeholder="cliberduche.corp@yahoo.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mobile-visible"
                    checked={officeInfo.mobile.visible}
                    onChange={(e) =>
                      setOfficeInfo({
                        ...officeInfo,
                        mobile: {
                          ...officeInfo.mobile,
                          visible: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="mobile-visible"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Show
                  </label>
                </div>
              </div>
              <input
                type="text"
                className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!officeInfo.mobile.visible ? "bg-gray-50 text-gray-500" : ""}`}
                value={officeInfo.mobile.value}
                onChange={(e) =>
                  setOfficeInfo({
                    ...officeInfo,
                    mobile: { ...officeInfo.mobile, value: e.target.value },
                  })
                }
                placeholder="0917 123 4567"
              />
            </div>

            {/* Landline */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Landline (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="landline-visible"
                    checked={officeInfo.landline.visible}
                    onChange={(e) =>
                      setOfficeInfo({
                        ...officeInfo,
                        landline: {
                          ...officeInfo.landline,
                          visible: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="landline-visible"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Show
                  </label>
                </div>
              </div>
              <input
                type="text"
                className={`w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!officeInfo.landline.visible ? "bg-gray-50 text-gray-500" : ""}`}
                value={officeInfo.landline.value}
                onChange={(e) =>
                  setOfficeInfo({
                    ...officeInfo,
                    landline: { ...officeInfo.landline, value: e.target.value },
                  })
                }
                placeholder="(049) 123 4567"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Social Media Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Social Media & Messaging</h3>
            <button
              onClick={addSocial}
              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={16} /> Add Platform
            </button>
          </div>

          {officeInfo.socials.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-50 rounded">
              No social media links added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {officeInfo.socials.map((social, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start bg-gray-50 p-3 rounded border border-gray-100"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <select
                        value={social.platform}
                        onChange={(e) =>
                          handleSocialChange(index, "platform", e.target.value)
                        }
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="viber">Viber</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={social.value}
                        onChange={(e) =>
                          handleSocialChange(index, "value", e.target.value)
                        }
                        placeholder="URL or Number"
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={social.visible}
                      onChange={(e) =>
                        handleSocialChange(index, "visible", e.target.checked)
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                      title="Toggle Visibility"
                    />
                    <button
                      onClick={() => removeSocial(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;
