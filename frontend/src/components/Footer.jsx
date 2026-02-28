import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="bg-[#0d1117] text-white pt-12 pb-8"
      style={{
        borderTop: "4px solid transparent",
        borderImage: "linear-gradient(to right, #1e3a8a, #0d9488, #84cc16) 1",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Cliberduche<span className="text-company-green">Corp</span>
            </h3>
            <p className="text-gray-400">
              Trust & Reliability in Full-Scale Construction Works.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about-us" },
                { name: "Services", path: "/services" },
                { name: "Projects", path: "/projects" },
                { name: "Resources", path: "/resources" },
                { name: "Contact Us", path: "/contact-us" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Contact Us
            </h4>
            <p className="text-gray-400 mb-2">
              Lot 3739 National Highway, 3/F CBD Building
              <br />
              Brgy. Pulo, Cabuyao City, Laguna
            </p>
            <p className="text-gray-400 mb-2">
              Email: cliberduche.corp@yahoo.com
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Cliberduche Corporation. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
