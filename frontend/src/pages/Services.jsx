import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";

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

  return (
    <div className="font-sans pt-20">
      {/* Hero */}
      <div className="bg-company-dark py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-2 text-white">Our Services</h1>
        <p className="text-gray-400">
          Comprehensive Construction & Development Solutions
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Primary Services */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-gray-800 mb-12 border-l-8 border-company-blue pl-6">
                Primary Services
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {primaryServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col md:flex-row"
                  >
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative">
                      {/* Placeholder for service image */}
                      <img
                        src={
                          service.image
                            ? service.image.startsWith("http")
                              ? service.image
                              : `${import.meta.env.VITE_API_URL}/storage/${service.image}`
                            : "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                        }
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Services */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-12 border-l-8 border-company-green pl-6">
                Secondary Services
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {secondaryServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full"
                  >
                    {/* Image or Icon Header */}
                    <div className="h-48 w-full bg-gray-100 relative group overflow-hidden">
                      {service.image ? (
                        <img
                          src={
                            service.image.startsWith("http")
                              ? service.image
                              : `${import.meta.env.VITE_API_URL}/storage/${service.image}`
                          }
                          alt={service.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-company-green/10">
                          <div className="w-16 h-16 bg-company-green/20 rounded-full flex items-center justify-center text-company-green">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                        {service.description}
                      </p>
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
