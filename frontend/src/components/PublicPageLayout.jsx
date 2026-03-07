import React from "react";
import bgHeader from "../assets/bg-header-about-us.png";

const PublicPageLayout = ({
  title,
  subtitle,
  bgPosition = "center 45%",
  children,
}) => {
  return (
    <div className="font-sans bg-slate-50 dark:!bg-gray-900 overflow-hidden relative min-h-screen transition-colors duration-200">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Background Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-green-50/80 dark:from-gray-900/80 dark:via-gray-800/50 dark:to-gray-900/80 transition-colors duration-200"></div>

        {/* Decorative Blurred Blobs (Aurora Effect) */}
        {/* Top Right Blob */}
        <div
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[120px] animate-pulse transition-colors duration-200"
          style={{ animationDuration: "8s" }}
        ></div>

        {/* Mid Left Blob */}
        <div
          className="absolute top-[30%] -left-[15%] w-[50%] h-[35%] bg-green-100/30 dark:bg-green-900/20 rounded-full blur-[100px] animate-pulse transition-colors duration-200"
          style={{ animationDuration: "12s" }}
        ></div>

        {/* Deep Center Blob */}
        <div className="absolute top-[55%] left-[20%] w-[45%] h-[25%] bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-[90px] transition-colors duration-200"></div>

        {/* Bottom Right Blob */}
        <div className="absolute bottom-[5%] -right-[5%] w-[55%] h-[30%] bg-green-100/30 dark:bg-green-900/20 rounded-full blur-[110px] transition-colors duration-200"></div>

        {/* Center Right Blob */}
        <div
          className="absolute top-[45%] -right-[10%] w-[40%] h-[30%] bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-[100px] animate-pulse transition-colors duration-200"
          style={{ animationDuration: "10s" }}
        ></div>

        {/* Bottom Left Blob */}
        <div className="absolute -bottom-[5%] -left-[10%] w-[40%] h-[25%] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[80px] transition-colors duration-200"></div>

        {/* Bottom Center-Right Blob */}
        <div className="absolute bottom-[15%] right-[25%] w-[45%] h-[20%] bg-green-50/40 dark:bg-green-900/20 rounded-full blur-[100px] transition-colors duration-200"></div>
      </div>

      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500">
        {/* Background Image with Complex Gradient Overlay - Clipped to Curve */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgHeader})`,
            backgroundPosition: bgPosition,
            clipPath: "url(#heroClipPath)",
          }}
        >
          {/* Multi-layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[#0a1128]/30 mix-blend-multiply"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-6 max-w-6xl -mt-8 sm:-mt-12 lg:-mt-16 transition-all">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight drop-shadow-xl text-white">
            {title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            {subtitle}
          </p>
        </div>

        {/* Seamless Responsive Border & ClipPath definition */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="curveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
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
        {children}
      </div>
    </div>
  );
};

export default PublicPageLayout;
