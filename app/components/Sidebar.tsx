"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Map,
  CreditCard,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/images/dashboard-logo.png";
import type { User } from "@/app/types/auth.d";

interface SideNavbarProps {
  user: User;
}

type Role = "admin" | "ops_user";

type NavItem = {
  id: string;
  name: string;
  icon: any;
  href: string;
  roles: Role[];
};

const SideNavbar = ({ user }: SideNavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const auth = useAuth();

  const userRole = auth?.role === "ops_user" ? "ops_user" : "admin";

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "ops_user"],
    },
    {
      id: "moyo-users",
      name: "Moyo Moja Users",
      icon: Users,
      href: "/moyo-users",
      roles: ["admin"],
    },
    {
      id: "plan",
      name: "Plans",
      icon: Map,
      href: "/plans",
      roles: ["admin", "ops_user"],
    },
    {
      id: "payment",
      name: "Payment Gateway",
      icon: CreditCard,
      href: "/payment",
      roles: ["admin", "ops_user"],
    },
    {
      id: "health",
      name: "Service Health",
      icon: Activity,
      href: "/service-health",
      roles: ["admin", "ops_user"],
    },
    {
      id: "content",
      name: "Content Management",
      icon: FileText,
      href: "/content-management",
      roles: ["admin", "ops_user"],
    },
    {
      id: "users",
      name: "Users",
      icon: Users,
      href: "/users",
      roles: ["admin"],
    },
    {
      id: "reports",
      name: "Reports",
      icon: ClipboardList,
      href: "/reports",
      roles: ["admin", "ops_user"],
    },
  ];

  const isActiveRoute = (href: string) => pathname === href;

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      router.replace(href);
    }
  };

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-200">
        <Link href="/dashboard" className="block">
          <Image
            src={logo}
            alt="Dashboard Logo"
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                      isActive
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={20}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNavbar;
