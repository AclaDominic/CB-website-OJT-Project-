import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";

const Resources = () => {
  const [machinery, setMachinery] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlateNumbers, setShowPlateNumbers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machineryRes, sitesRes, settingsRes] = await Promise.all([
          api.get("/api/machineries"),
          api.get("/api/development-sites"),
          api.get("/api/page-contents?page=resources"),
        ]);
        setMachinery(machineryRes.data);
        setSites(sitesRes.data);

        // Apply settings
        const settings = settingsRes.data.find(
          (item) => item.section_name === "display_settings",
        );
        if (settings) {
          const config = JSON.parse(settings.content);
          setShowPlateNumbers(config.show_plate_numbers);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter out decommissioned items first
  const activeMachinery = machinery.filter(
    (m) => m.status !== "Decommissioned",
  );

  // Grouping logic
  const displayedMachinery = showPlateNumbers
    ? activeMachinery
    : Object.values(
        activeMachinery.reduce((acc, item) => {
          const key = `${item.name}-${item.type}`;
          if (!acc[key]) {
            acc[key] = item;
          }
          return acc;
        }, {}),
      );

  return (
    <div className="font-sans pt-20">
      <div className="bg-company-dark py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-2 text-white">Our Resources</h1>
        <p className="text-gray-400">
          Backfill Materials & Heavy Equipment Fleet
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Land Development Sites */}
            <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-company-green pl-4">
              Land Development Sites
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group"
                >
                  <div className="h-64 bg-gray-200 relative overflow-hidden">
                    <img
                      src={
                        site.image_url
                          ? site.image_url.startsWith("http")
                            ? site.image_url
                            : `${import.meta.env.VITE_API_URL}/storage/${site.image_url}`
                          : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                      }
                      alt={site.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{site.name}</h3>
                      <p className="text-green-300 font-semibold">
                        {site.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">{site.description}</p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {site.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Equipment List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-company-blue pl-4">
              Heavy Equipment Fleet
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedMachinery.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-6 rounded-lg text-center hover:bg-white hover:shadow-md transition-all border border-gray-100"
                >
                  <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.type}</p>
                  {showPlateNumbers && item.plate_number && (
                    <p className="text-xs text-company-blue mt-2 font-mono bg-company-light inline-block px-2 py-1 rounded">
                      {item.plate_number}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;
