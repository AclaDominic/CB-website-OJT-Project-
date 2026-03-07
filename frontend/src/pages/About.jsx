import React, { useState, useEffect, Suspense, lazy } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";
import {
  Calendar,
  ShieldCheck,
  Building2,
  MapPin,
  Info,
  Wrench,
  Zap,
  Eye,
  CheckCircle,
  Shield,
  FlaskConical,
} from "lucide-react";
import PublicPageLayout from "../components/PublicPageLayout";

const Organization = lazy(() => import("./Organization"));

const About = () => {
  const [content, setContent] = useState({
    mission: "",
    vision: "",
    background: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/api/page-contents?page=about");
        const data = response.data;
        const newContent = { ...content };

        data.forEach((item) => {
          if (newContent.hasOwnProperty(item.section_name)) {
            newContent[item.section_name] = item.content;
          }
        });

        setContent(newContent);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <PublicPageLayout
      title="About Cliberduche Corporation"
      subtitle="Established in 2018, we are your one-stop-shop for construction and land development."
    >
      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Mission & Vision Section */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-24 md:mb-32">
            {/* Mission Card */}
            <div className="bg-[#f0f7ff] dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-blue-100/50 dark:border-gray-700 flex flex-col items-start text-left transition-colors duration-200">
              <div className="w-12 h-12 bg-white dark:!bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 shadow-sm transition-colors duration-200">
                <Zap size={24} fill="currentColor" fillOpacity="0.2" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap transition-colors duration-200">
                {content.mission ||
                  "We (Cliberduche Corporation) are a responsible land development company that provides high-quality backfill materials for land development projects and other infrastructures... adhering to environmental regulations of the Philippines while delivering value to our communities, partners, and stakeholders."}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-[#f8fff4] dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-green-100/50 dark:border-gray-700 flex flex-col items-start text-left transition-colors duration-200">
              <div className="w-12 h-12 bg-white dark:!bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-green-500 dark:text-green-400 shadow-sm transition-colors duration-200">
                <Eye size={24} fill="currentColor" fillOpacity="0.2" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
                Our Vision
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap transition-colors duration-200">
                {content.vision ||
                  "To be a highly respected, world-class natural resource land development company committed to international standards, environmental conservation, and sustainable projects."}
              </p>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="mb-24 md:mb-40">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Our Core Values
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Quality */}
              <div className="bg-white dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center transition-colors duration-200">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 shadow-inner">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
                  Quality
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg transition-colors duration-200">
                  High-quality projects aligned with national and local
                  standards.
                </p>
              </div>

              {/* Safety */}
              <div className="bg-white dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center transition-colors duration-200">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6 text-green-500 dark:text-green-400 shadow-inner">
                  <Shield size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
                  Safety
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg transition-colors duration-200">
                  Strict safety practices before, during, and after project
                  execution.
                </p>
              </div>

              {/* Integrity */}
              <div className="bg-white dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700 flex flex-col items-center text-center transition-colors duration-200">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 shadow-inner">
                  <FlaskConical size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-200">
                  Integrity
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg transition-colors duration-200">
                  Compliance with construction laws, reliability, and timely
                  delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Company Background Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight transition-colors duration-200">
                Company Background
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.background
                ? content.background.split("\n").map((line, index) => {
                  const parts = line.split(":");
                  if (parts.length > 1) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(":").trim();

                    let icon = <Info size={24} />;
                    let bgClass = "bg-blue-50";
                    let iconClass = "text-blue-500";

                    if (label.toLowerCase().includes("established")) {
                      icon = <Calendar size={24} />;
                    } else if (label.toLowerCase().includes("registration")) {
                      icon = <ShieldCheck size={24} />;
                      bgClass = "bg-green-50";
                      iconClass = "text-green-500";
                    } else if (label.toLowerCase().includes("industry")) {
                      icon = <Building2 size={24} />;
                    } else if (label.toLowerCase().includes("areas")) {
                      icon = <MapPin size={24} />;
                      bgClass = "bg-green-50";
                      iconClass = "text-green-500";
                    } else if (label.toLowerCase().includes("origin")) {
                      icon = <Info size={24} />;
                    } else if (label.toLowerCase().includes("services")) {
                      icon = <Wrench size={24} />;
                      bgClass = "bg-green-50";
                      iconClass = "text-green-500";
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-center p-8 bg-white dark:!bg-gray-800 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 ${bgClass} ${iconClass} shrink-0 dark:bg-opacity-20`}
                        >
                          {icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {label}
                          </p>
                          <p className="text-gray-800 dark:text-gray-200 font-bold text-lg leading-tight transition-colors duration-200">
                            {value}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return line.trim() ? (
                    <div
                      key={index}
                      className="md:col-span-2 lg:col-span-3 p-8 bg-gray-50/50 dark:!bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-300 text-center italic text-lg transition-colors duration-200"
                    >
                      {line}
                    </div>
                  ) : null;
                })
                : "Loading background..."}
            </div>
          </div>

          {/* Organizational Structure */}
          <div id="organization" className="mt-20">
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Organization />
            </Suspense>
          </div>
        </>
      )}
    </PublicPageLayout>
  );
};

export default About;
