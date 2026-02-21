import React from "react";
import logo from "../assets/logo-cropped.svg";

const PageLoader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-300">
        <img
          src={logo}
          alt="Loading..."
          className="w-48 md:w-64 h-auto animate-zoom-in-out"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-[60vh] items-center justify-center p-8">
      <img
        src={logo}
        alt="Loading..."
        className="w-32 md:w-48 h-auto animate-zoom-in-out"
      />
    </div>
  );
};

export default PageLoader;
