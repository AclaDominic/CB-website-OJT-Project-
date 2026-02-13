import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import Organization from "./Organization";

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

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="font-sans">
      {/* Hero */}
      <div className="bg-company-dark py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Cliberduche Corporation
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Established in 2018, we are your one-stop-shop for construction and
            land development.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-blue-50 p-8 rounded-xl shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-company-dark mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed italic whitespace-pre-wrap">
              {content.mission || "Loading mission..."}
            </p>
          </div>
          <div className="bg-green-50 p-8 rounded-xl shadow-sm border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-company-dark mb-4">
              Our Vision
            </h2>
            <p className="text-gray-700 leading-relaxed italic whitespace-pre-wrap">
              {content.vision || "Loading vision..."}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Quality</h3>
              <p className="text-gray-600">
                High-quality projects aligned with national and local standards.
              </p>
            </div>
            <div className="text-center p-6 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Safety</h3>
              <p className="text-gray-600">
                Strict safety practices before, during, and after project
                execution.
              </p>
            </div>
            <div className="text-center p-6 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <p className="text-gray-600">
                Compliance with construction laws, reliability, and timely
                delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-gray-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Company Background
          </h2>
          <div className="text-gray-700 whitespace-pre-wrap">
            {content.background
              ? content.background.split("\n").map((line, index) => {
                  const parts = line.split(":");
                  if (parts.length > 1) {
                    return (
                      <div key={index} className="mb-2">
                        <strong>{parts[0]}:</strong>
                        {parts.slice(1).join(":")}
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="mb-2">
                      {line}
                    </div>
                  );
                })
              : "Loading background..."}
          </div>
        </div>

        {/* Organizational Structure */}
        <div id="organization" className="mt-16">
          <Organization />
        </div>
      </div>
    </div>
  );
};

export default About;
