import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import PageLoader from "../components/PageLoader";
import bgHeader from "../assets/bg-header-about-us.png";
import { MapPin, Truck, Boxes, ShieldCheck, Layers, Info } from "lucide-react";

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
            Our Resources
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            Backfill Materials & Heavy Equipment Fleet Dedicated to Excellence
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
            {/* Land Development Sites */}
            <div className="mb-24">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Development Sites</h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className="group bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-72 relative overflow-hidden">
                      <img
                        src={
                          site.image_url
                            ? site.image_url.startsWith("http")
                              ? site.image_url
                              : `${import.meta.env.VITE_API_URL}/storage/${site.image_url}`
                            : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        }
                        alt={site.name}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Strategic Site
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight drop-shadow-md">{site.name}</h3>
                      </div>

                      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur shadow-sm px-4 py-2 rounded-xl flex items-center gap-2 border border-gray-100 transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <Boxes size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-gray-800">{site.capacity}</span>
                      </div>
                    </div>

                    <div className="p-8 flex-grow">
                      <div className="flex items-center gap-2 mb-4 text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                        <MapPin size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{site.location}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed italic text-sm">
                        "{site.description}"
                      </p>

                      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Resource Management</span>
                        <div className="flex items-center gap-1.5 text-green-600">
                          <ShieldCheck size={14} />
                          Active Site
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment List */}
            <div>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Heavy Equipment Fleet</h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedMachinery.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white p-8 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-500 shadow-inner group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                      <Truck size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full mb-4">
                      <Layers size={14} className="text-gray-400" />
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.type}</span>
                    </div>

                    {showPlateNumbers && item.plate_number ? (
                      <div className="mt-auto w-full pt-4 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Plate Number</p>
                        <p className="text-sm text-blue-700 font-mono font-bold bg-blue-50 py-1.5 rounded-lg border border-blue-100/50">
                          {item.plate_number}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-600 py-1 px-3 bg-green-50 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Operational
                      </div>
                    )}
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

export default Resources;
