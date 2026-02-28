import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";
import bgHeader from "../assets/bg-header-about-us.png";
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
    if (lowerTitle.includes("clearing")) return <Trees size={32} />;
    if (lowerTitle.includes("demolition")) return <Hammer size={32} />;
    if (lowerTitle.includes("excavation")) return <Shovel size={32} />;
    return <Zap size={32} />;
  };

  return (
    <div className="font-sans bg-slate-50 overflow-hidden relative min-h-screen">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-green-50/80"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[30%] -left-[15%] w-[50%] h-[35%] bg-green-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[55%] left-[20%] w-[45%] h-[25%] bg-blue-50/50 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-[5%] -right-[5%] w-[55%] h-[30%] bg-green-100/30 rounded-full blur-[110px]"></div>
        <div className="absolute top-[45%] -right-[10%] w-[40%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -bottom-[5%] -left-[10%] w-[40%] h-[25%] bg-blue-100/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[15%] right-[25%] w-[45%] h-[20%] bg-green-50/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgHeader})`,
            backgroundPosition: 'center 40%',
            clipPath: 'url(#heroClipPath)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[#0a1128]/30 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-6 max-w-6xl -mt-8 sm:-mt-12 lg:-mt-16 transition-all">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight drop-shadow-xl text-white">
            Our Services
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            Delivering Comprehensive Construction and Strategic Development Solutions Across the Philippines
          </p>
        </div>

                {/* Seamless Responsive Border & ClipPath definition */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#8bc34a" />
            </linearGradient>
            <clipPath id="heroClipPath" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.7 Q0.33,1.15 0,0.85 Z" />
            </clipPath>
          </defs>
          <path
            d="M0,85 Q33,115 100,70"
            stroke="url(#curveGradient)"
            strokeWidth="10"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Primary Services */}
            <div className="mb-24">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Primary Services</h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {primaryServices.map((service) => (
                  <div
                    key={service.id}
                    className="group bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 flex flex-col md:flex-row transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          Core Service
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
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
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Specialized Solutions</h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {secondaryServices.map((service) => (
                  <div
                    key={service.id}
                    className="group bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-8 text-green-500 shadow-inner overflow-hidden group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
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

                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                      {service.description}
                    </p>

                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center text-green-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      Learn More
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
