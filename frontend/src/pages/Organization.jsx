import React, { useState, useEffect, useMemo } from "react";
import api from "../lib/axios";

const Organization = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/api/organization-members");
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching organization members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const buildTree = (items, parentId = null) => {
    return items
      .filter((item) => item.parent_id === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  const orgTree = useMemo(() => buildTree(members), [members]);

  const MemberCard = ({ member, isRoot = false }) => {
    const isLeadership = member.category === "leadership";
    const hasChildren = member.children && member.children.length > 0;

    return (
      <div className="flex flex-col items-center relative">
        {/* Connector line FROM parent TO this card (unless root) */}
        {!isRoot && (
          <div className="h-4 w-[1px] bg-slate-300 relative">
            {/* Downward Arrowhead */}
            <div className="absolute bottom-0 -left-[1.5px] w-0 h-0 border-l-[1.5px] border-r-[1.5px] border-t-[3px] border-l-transparent border-r-transparent border-t-slate-300"></div>
          </div>
        )}

        {/* The Card */}
        <div className="relative z-10 w-32 md:w-36 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          {/* Capsule Header */}
          <div className={`mx-1 mt-1 rounded-full py-0.5 px-1.5 text-center ${isLeadership ? 'bg-blue-600' : 'bg-green-300'}`}>
            <span className={`text-[7px] md:text-[8px] font-bold uppercase tracking-tight ${isLeadership ? 'text-white' : 'text-blue-900'}`}>
              {member.role}
            </span>
          </div>
          {/* Name */}
          <div className="py-1.5 px-1 text-center">
            <h3 className="text-gray-800 font-bold text-[9px] md:text-[10px] leading-tight truncate px-1">
              {member.name}
            </h3>
          </div>
        </div>

        {/* Stem down to children crossbar */}
        {hasChildren && (
          <div className="h-4 w-[1px] bg-slate-300 relative"></div>
        )}

        {/* Children Container */}
        {hasChildren && (
          <div className="flex justify-center relative px-1">
            {/* Horizontal Crossbar line */}
            {member.children.length > 1 && (
              <div
                className="absolute top-0 h-[1px] bg-slate-300"
                style={{
                  left: `${100 / (member.children.length * 2)}%`,
                  right: `${100 / (member.children.length * 2)}%`
                }}
              />
            )}

            <div className="flex flex-row justify-center gap-x-1.5 md:gap-x-2">
              {member.children.map((child) => (
                <MemberCard key={child.id} member={child} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="font-sans py-12 bg-gray-50 overflow-hidden" id="organization">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
            Organizational Chart
          </h2>
          <p className="text-base text-gray-600 font-light">
            The team behind Cliberduche Corporation's success.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-xs text-gray-500">Loading structure...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm italic">Organizational structure to be updated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-10 cursor-grab active:cursor-grabbing scrollbar-hide">
            <div className="flex justify-center min-w-max p-4">
              {orgTree.map((root) => (
                <MemberCard key={root.id} member={root} isRoot />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Corporate Info Footer */}
      <div className="max-w-5xl mx-auto px-4 mt-4 pb-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Our Manpower</h3>
          <p className="text-gray-600 leading-relaxed text-sm max-w-2xl mx-auto">
            We employ a dedicated team of skilled professionals, engineers, equipment operators, and site workers
            to ensure every project is executed with precision and efficiency.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Organization;
