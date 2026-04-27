"use client";

import { useState, useEffect } from "react";
import { useLoader } from "@/app/store/useLoader";
import toast from "react-hot-toast";

type ServiceStatus = "operational" | "error" | "warning" | "ok";

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  message: string;
}

interface ServiceCardProps {
  service: Service;
}

interface StatusIndicatorProps {
  status: ServiceStatus;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "operational":
      case "ok":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return <div className={`w-4 h-4 rounded-full ${getStatusColor()} `} />;
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  const getMessageColor = () => {
    switch (service.status) {
      case "operational":
      case "ok":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getBackgroundColor = () => {
    switch (service.status) {
      case "operational":
      case "ok":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
        <StatusIndicator status={service.status} />
      </div>

      <div className={`${getBackgroundColor()} rounded-md px-4 py-2`}>
        <p className={`text-sm font-medium ${getMessageColor()}`}>
          {service.message}
        </p>
      </div>
    </div>
  );
};

const PageHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <span className="text-gray-400">Service Health</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Overview</span>
      </div>
    </div>
  );
};

const ServiceHealthPage = () => {
  const [service, setService] = useState<any[]>([]);
  const { showLoader, hideLoader } = useLoader();

  const fetchHealth = async () => {
    showLoader();

    try {
      const response = await fetch("/api/health", {
        method: "GET",
      });

      const result = await response.json();

      if (result.status === 400 || result.status === 500) {
        toast.error(result.message);
        return;
      }

      setService(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetchHealth();
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 border-radius-2">
      <PageHeader />

      <div className="bg-[#fff] p-10 rounded-lg h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {Array.isArray(service) &&
            service.map((serv: any) => (
              <ServiceCard key={serv.id} service={serv} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceHealthPage;
