import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import Organization from "./Organization";
import PageLoader from "../components/PageLoader";
import { Calendar, ShieldCheck, Building2, MapPin, Info, Wrench, Zap, Eye, CheckCircle, Shield, FlaskConical } from "lucide-react";
import bgHeader from "../assets/bg-header-about-us.png";

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

  if (loading) return <PageLoader />;

  return (
    <div className="font-sans bg-slate-50 overflow-hidden relative min-h-screen">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Background Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-green-50/80"></div>

        {/* Decorative Blurred Blobs (Aurora Effect) */}
        {/* Decorative Blurred Blobs (Aurora Effect) */}
        {/* Top Right Blob */}
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>

        {/* Mid Left Blob */}
        <div className="absolute top-[30%] -left-[15%] w-[50%] h-[35%] bg-green-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>

        {/* Deep Center Blob */}
        <div className="absolute top-[55%] left-[20%] w-[45%] h-[25%] bg-blue-50/50 rounded-full blur-[90px]"></div>

        {/* Bottom Right Blob */}
        <div className="absolute bottom-[5%] -right-[5%] w-[55%] h-[30%] bg-green-100/30 rounded-full blur-[110px]"></div>

        {/* Center Right Blob */}
        <div className="absolute top-[45%] -right-[10%] w-[40%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>

        {/* Bottom Left Blob */}
        <div className="absolute -bottom-[5%] -left-[10%] w-[40%] h-[25%] bg-blue-100/20 rounded-full blur-[80px]"></div>

        {/* Bottom Center-Right Blob */}
        <div className="absolute bottom-[15%] right-[25%] w-[45%] h-[20%] bg-green-50/40 rounded-full blur-[100px]"></div>
      </div>
      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500">
        {/* Background Image with Complex Gradient Overlay */}
        {/* Background Image with Complex Gradient Overlay - Clipped to Curve */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgHeader})`,
            backgroundPosition: 'center 45%',
            clipPath: 'url(#heroClipPath)'
          }}
        >
          {/* Multi-layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[#0a1128]/30 mix-blend-multiply"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-6 max-w-6xl -mt-8 sm:-mt-12 lg:-mt-16 transition-all">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight drop-shadow-xl text-white">
            About Cliberduche Corporation
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            Established in 2018, we are your one-stop-shop for construction and
            land development.
          </p>
        </div>

        {/* Asymmetrical Downward Curved Bottom Transition with Gradient Stroke */}
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-24 md:mb-32">
          {/* Mission Card */}
          <div className="bg-[#f0f7ff] p-8 md:p-10 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-blue-100/50 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 text-blue-500 shadow-sm">
              <Zap size={24} fill="currentColor" fillOpacity="0.2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
              {content.mission || "We (Cliberduche Corporation) are a responsible land development company that provides high-quality backfill materials for land development projects and other infrastructures... adhering to environmental regulations of the Philippines while delivering value to our communities, partners, and stakeholders."}
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-[#f8fff4] p-8 md:p-10 rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border border-green-100/50 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 text-green-500 shadow-sm">
              <Eye size={24} fill="currentColor" fillOpacity="0.2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
              {content.vision || "To be a highly respected, world-class natural resource land development company committed to international standards, environmental conservation, and sustainable projects."}
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-24 md:mb-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Quality */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500 shadow-inner">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Quality</h3>
              <p className="text-gray-600 text-base md:text-lg">
                High-quality projects aligned with national and local standards.
              </p>
            </div>

            {/* Safety */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-inner">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Safety</h3>
              <p className="text-gray-600 text-base md:text-lg">
                Strict safety practices before, during, and after project execution.
              </p>
            </div>

            {/* Integrity */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500 shadow-inner">
                <FlaskConical size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Integrity</h3>
              <p className="text-gray-600 text-base md:text-lg">
                Compliance with construction laws, reliability, and timely delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Company Background Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Company Background</h2>
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
                      className="flex items-center p-8 bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 ${bgClass} ${iconClass} shrink-0`}>
                        {icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          {label}
                        </p>
                        <p className="text-gray-800 font-bold text-lg leading-tight">
                          {value}
                        </p>
                      </div>
                    </div>
                  );
                }
                return line.trim() ? (
                  <div key={index} className="md:col-span-2 lg:col-span-3 p-8 bg-gray-50/50 rounded-2xl text-gray-600 text-center italic text-lg">
                    {line}
                  </div>
                ) : null;
              })
              : "Loading background..."}
          </div>
        </div>

        {/* Organizational Structure */}
        <div id="organization" className="mt-20">
          <Organization />
        </div>
      </div>
    </div>
  );
};

export default About;
