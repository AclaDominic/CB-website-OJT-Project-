import React from "react";
import { Construction } from "lucide-react";

const ProcurementManager = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-gray-500">
      <Construction size={64} className="mb-4" />
      <h1 className="text-2xl font-bold mb-2">Under Construction</h1>
      <p>The Procurement module is currently being developed.</p>
    </div>
  );
};

export default ProcurementManager;
