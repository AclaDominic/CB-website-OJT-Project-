import React, { useState, useEffect } from "react";
import api from "../lib/axios";

const Organization = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/api/organization-members"); // Public route
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching organization members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const leadership = members
    .filter((m) => m.category === "leadership")
    .sort((a, b) => a.order - b.order);
  const management = members
    .filter((m) => m.category === "management")
    .sort((a, b) => a.order - b.order);
  const staff = members
    .filter((m) => m.category === "staff")
    .sort((a, b) => a.order - b.order);

  const DefaultAvatar = () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <section className="font-sans py-16 bg-white" id="organization">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Organizational Chart
          </h2>
          <p className="text-xl text-gray-600">
            The team behind Cliberduche Corporation's success.
          </p>
        </div>

        {/* Tree Visualization */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">Loading structure...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Organizational structure to be updated.
            </div>
          ) : (
            <>
              {/* Level 1: Leadership */}
              {leadership.length > 0 && (
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                  {leadership.map((member) => (
                    <div
                      key={member.id}
                      className="bg-company-blue text-white p-6 rounded-lg shadow-lg text-center w-full max-w-xs md:w-72 transform hover:scale-105 transition-transform"
                    >
                      <div className="w-24 h-24 mx-auto bg-white rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-blue-400">
                        {member.image_path ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${member.image_path}`}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <DefaultAvatar />
                        )}
                      </div>
                      <h3 className="font-bold text-xl">{member.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Connector Line (Only if both leadership and management exist) */}
              {leadership.length > 0 && management.length > 0 && (
                <>
                  <div className="hidden md:block w-1 h-8 bg-gray-300 mx-auto -mt-12 mb-12"></div>
                  <div className="hidden md:block w-full h-1 bg-gray-300 mb-8 max-w-4xl mx-auto"></div>
                </>
              )}

              {/* Level 2: Management */}
              {management.length > 0 && (
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                  {management.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col items-center w-full max-w-xs md:w-64"
                    >
                      {leadership.length > 0 && (
                        <div className="hidden md:block w-1 h-8 bg-gray-300 mb-0"></div>
                      )}
                      <div className="bg-white border-2 border-gray-100 p-4 rounded-lg shadow-sm w-full hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full mb-3 flex items-center justify-center overflow-hidden">
                          {member.image_path ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${member.image_path}`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <DefaultAvatar />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-800">
                          {member.role}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {member.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Level 3: Staff */}
              {staff.length > 0 && (
                <>
                  {management.length > 0 && (
                    <div className="hidden md:block w-1 h-8 bg-gray-300 mx-auto -mt-4 mb-4"></div>
                  )}
                  <div className="flex flex-wrap justify-center gap-8 mt-4">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col items-center w-full max-w-xs md:w-64"
                      >
                        <div className="bg-white border-2 border-gray-100 p-4 rounded-lg shadow-sm w-full hover:shadow-md transition-shadow">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full mb-3 flex items-center justify-center overflow-hidden">
                            {member.image_path ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${member.image_path}`}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <DefaultAvatar />
                            )}
                          </div>
                          <h4 className="font-bold text-gray-800">
                            {member.role}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {member.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Manpower */}
        <div className="mt-20 bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Manpower</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We employ a dedicated team of skilled professionals, engineers,
            equipment operators, and site workers to ensure every project is
            executed with precision and efficiency.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Organization;
