"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Map,
  CreditCard,
  Activity,
  FileText,
} from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/images/dashboard-logo.png";

const SideNavbar = () => {
  const pathname = usePathname();

  // Navigation menu items configuration
  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "users",
      name: "Moyo Moja Users",
      icon: Users,
      href: "/users",
    },
    {
      id: "plan",
      name: "Plan",
      icon: Map,
      href: "/plan",
    },
    {
      id: "payment",
      name: "Payment Gateway",
      icon: CreditCard,
      href: "/payment",
    },
    {
      id: "health",
      name: "Service Health",
      icon: Activity,
      href: "/health",
    },
    {
      id: "content",
      name: "Content Management",
      icon: FileText,
      href: "/content",
    },
    {
      id: "",
      name: "Content Management",
      icon: FileText,
      href: "/content",
    },
  ];

  /**
   * Determines if a navigation item is currently active
   * @param {string} href - The route path
   * @returns {boolean}
   */
  const isActiveRoute = (href: any) => {
    return pathname === href;
  };

  return (
    <aside
      className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-200">
        <Link href="/dashboard" className="block">
          <Image
            src={logo}
            alt="Pink background"
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav
        className="flex-1 px-3 py-4 overflow-y-auto"
        aria-label="Sidebar menu"
      >
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
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
