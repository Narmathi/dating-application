"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  MapPin,
  CreditCard,
  Activity,
  FileText,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import UsersTable from "@/app/(protected)/users/page";

const monthData = [
  { label: "Jan", value: 4200 },
  { label: "Feb", value: 3100 },
  { label: "Mar", value: 5800 },
  { label: "Apr", value: 6500 },
  { label: "May", value: 5200 },
  { label: "Jun", value: 6800 },
  { label: "Jul", value: 6800 },
  { label: "Aug", value: 600 },
  { label: "Sep", value: 5000 },
  { label: "Oct", value: 6800 },
  { label: "Nov", value: 6800 },
  { label: "Dec", value: 6800 },
];

const weeklyData = [
  { label: "Sun", value: 1200 },
  { label: "Mon", value: 2100 },
  { label: "Tue", value: 800 },
  { label: "Wed", value: 1600 },
  { label: "Thu", value: 2400 },
  { label: "Fri", value: 3200 },
  { label: "Sat", value: 2800 },
];

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  iconColor?: string;
  iconBgColor?: string;
}

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const router = useRouter();

  const auth = useAuth();

  const userName = auth?.name || "User";
  const userRole =
    auth?.role === "ops_user" ? "Operations User" : "Super Admin";

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push("/login");
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const handleProfile = () => {
    router.push("/users?view=profile");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="bg-white- border-b- border-gray-200- px-8 py-2 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <button className="text-gray-500 hover:text-gray-900 font-medium">
          Dashboards
        </button>
        <button className="text-gray-900 font-medium border-b-2 border-red-500">
          Overview
        </button>
      </div>
      <div className="relative profile-dropdown">
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {userName?.charAt(0) || "U"}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{userRole}</p>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <button
              onClick={() => {
                handleProfile();
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => {
                handleLogout();
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  iconColor = "text-red-500",
  iconBgColor = "bg-red-50",
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <Icon size={20} className={iconColor} />
        </div>
        <h3 className="text-gray-600 font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {value?.toLocaleString() || "0"}
      </p>
    </div>
  );
};

// User Activity Chart Component
const UserActivityChart = () => {
  const [period, setPeriod] = useState("month");
  const [monthData, setMonthData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const displayData = period === "month" ? monthData : weeklyData;

  const fetchActivityChart = async () => {
    try {
      const response = await fetch(
        `/api/dashboard/totalusers?period=${period}`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (result.status == 400) {
        console.log(result.message);
      }

      if (result.status == 500) {
        console.log(result.message);
      }

      period === "month"
        ? setMonthData(result.data)
        : setWeeklyData(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetchActivityChart();
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, [period]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-red-500">User Activity</h2>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none flex items-center gap-2 px-4 py-2 pr-10 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>

          {/* Chevron icon */}
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 14 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 14 }}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#3d3838",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              cursor={{ stroke: "#ef4444", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: "#fff", stroke: "#000", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  const fetchTotalUsers = async () => {
    try {
      const response = await fetch("/api/dashboard/totalusers", {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        console.log(result.message);
      }

      if (result.status == 500) {
        console.log(result.message);
      }

      setTotalUsers(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPremiumUsers = async () => {
    try {
      const response = await fetch("/api/dashboard/premiumusers", {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        console.log(result.message);
      }

      if (result.status == 500) {
        console.log(result.message);
      }

      setPremiumUsers(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTotalActiveUsers = async () => {
    try {
      const response = await fetch("/api/dashboard/activeusers", {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        console.log(result.message);
      }

      if (result.status == 500) {
        console.log(result.message);
      }

      setActiveUsers(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetchTotalUsers();
      fetchPremiumUsers();
      fetchTotalActiveUsers();
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={User}
              title="Daily Active Users"
              value={activeUsers}
              iconColor="text-red-500"
              iconBgColor="bg-red-50"
            />
            <StatCard
              icon={Users}
              title="Total User"
              value={totalUsers}
              iconColor="text-red-500"
              iconBgColor="bg-red-50"
            />
            <StatCard
              icon={MapPin}
              title="Premium Users"
              value={premiumUsers}
              iconColor="text-red-500"
              iconBgColor="bg-red-50"
            />
          </div>
          <UserActivityChart />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
