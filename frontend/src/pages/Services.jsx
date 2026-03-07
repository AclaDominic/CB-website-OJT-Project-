import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";
import PublicPageLayout from "../components/PublicPageLayout";
import { Trees, Hammer, Shovel, Zap } from "lucide-react";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/api/services");
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const primaryServices = services.filter((s) => s.type === "primary");
  const secondaryServices = services.filter((s) => s.type === "secondary");

  const getServiceIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("land development")) return <Trees size={32} />;
    if (lowerTitle.includes("project management consultation")) return <Hammer size={32} />;
    if (lowerTitle.includes("excavation")) return <Shovel size={32} />;
    return <Zap size={32} />;
  };

  return (
    <PublicPageLayout
      title="Our Services"
      subtitle="Delivering Comprehensive Construction and Strategic Development Solutions Across the Philippines"
    >
      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Primary Services */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Primary Function
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {primaryServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white dark:!bg-gray-800 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 dark:border-gray-700 flex flex-col md:flex-row transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                    <img
                      src={
                        service.image
                          ? service.image.startsWith("http")
                            ? service.image
                            : `${import.meta.env.VITE_API_URL}/storage/${service.image}`
                          : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                      }
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 md:w-3/5 flex flex-col justify-center">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-200">
                        Core Service
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm transition-colors duration-200">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Solutions */}
          <div>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Secondary Function
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {secondaryServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white dark:!bg-gray-800 p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700 flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-8 text-green-500 shadow-inner overflow-hidden group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                    {service.image ? (
                      <img
                        src={
                          service.image.startsWith("http")
                            ? service.image
                            : `${import.meta.env.VITE_API_URL}/storage/${service.image}`
                        }
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      getServiceIcon(service.title)
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-grow transition-colors duration-200">
                    {service.description}
                  </p>

                  <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Learn More
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PublicPageLayout>
  );
};

export default Services;
