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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    let interval;
    if (primaryServices.length > 0 && !isPaused && !selectedService) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % primaryServices.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [primaryServices.length, isPaused, selectedService]);

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
          {/* Primary Services Carousel */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Primary Function
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="relative overflow-hidden max-w-5xl mx-auto rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-700 bg-white dark:!bg-gray-800">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {primaryServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="w-full flex-shrink-0 flex flex-col md:flex-row group cursor-pointer"
                    onClick={() => setIsPaused(!isPaused)}
                    onDoubleClick={() => setSelectedService(service)}
                  >
                    <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                      <img
                        src={
                          service.image
                            ? service.image.startsWith("http")
                              ? service.image
                              : `${import.meta.env.VITE_API_URL}/storage/${service.image}`
                            : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                        }
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-gray-800/20"></div>
                    </div>
                    <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center relative">
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest rounded-full transition-colors duration-200 shadow-sm">
                          Core Service
                        </span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg transition-colors duration-200">
                        {service.description}
                      </p>

                      {/* Carousel Indicators */}
                      <div className="absolute bottom-6 right-8 flex gap-2">
                        {primaryServices.map((_, dotIndex) => (
                          <button
                            key={dotIndex}
                            onClick={() => setCurrentSlide(dotIndex)}
                            className={`h-2 rounded-full transition-all duration-300 ${dotIndex === currentSlide
                              ? "w-8 bg-blue-500"
                              : "w-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                              }`}
                            aria-label={`Go to slide ${dotIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedService(null)}
          ></div>
          <div className="relative bg-white dark:!bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all scale-100 flex-shrink border border-gray-100 dark:border-gray-700">
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              aria-label="Close details"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex-shrink-0 relative h-64 sm:h-80 md:h-96 w-full">
              <img
                src={
                  selectedService.image
                    ? selectedService.image.startsWith("http")
                      ? selectedService.image
                      : `${import.meta.env.VITE_API_URL}/storage/${selectedService.image}`
                    : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                }
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-sm">
                  {selectedService.type === 'primary' ? 'Core Service Detailed View' : 'Specialized Solution'}
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 drop-shadow-md">
                  {selectedService.title}
                </h3>
              </div>
            </div>
            <div className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                {/* Check if description contains line breaks to split into paragraphs, else render normally */}
                {selectedService.description?.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicPageLayout>
  );
};

export default Services;
