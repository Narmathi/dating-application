"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";

import {
  Search,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  X,
} from "lucide-react";
import {
  Users,
  MapPin,
  User,
  CreditCard,
  Banknote,
  Wallet,
  XCircle,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  CellStyle,
} from "ag-grid-community";

import { LucideIcon } from "lucide-react";
import styles from "./page.module.css";
import { useLoader } from "@/app/store/useLoader";
import toast from "react-hot-toast";
import { EllipsisTooltipComponent } from "@/app/components/EllipsisTooltipComponent";

ModuleRegistry.registerModules([AllCommunityModule]);

type PaymentData = {
  sNo: number;
  userid: string;
  invoiceid: string;
  plantype: string;
  planname: string;
  status: string;
  date: string;
};

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  subtitle1?: string;
  subtitle2?: string;
}

const Payment = () => {
  const auth = useAuth();
  const dispplayCard = auth?.role === "super_admin" ? true : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [rowData, setRowData] = useState<PaymentData[]>();
  const [selectedRow, setSelectedRow] = useState<PaymentData | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [paymentCount, setPaymentCount] = useState({
    totalKenyaCount: 0,
    totalTanzaniaCount: 0,
    cancelledCount: 0,
    totalPaymentCount: 0,
    totalAmount: 0,
    totalCancel: 0,
    totalAmtTZS: 0,
    totalAmtKES: 0,
    totalCancelTZS: 0,
    totalCancelKES: 0,
  });

  const pageSizeOptions = [10, 20, 50, 100];

  const totalPages = Math.ceil(totalRows / pageSize);

  const fetcPaymentData = async (
    page: number,
    limit: number,
    search: string = "",
  ) => {
    try {
      const offset = page * limit;

      const response = await fetch(
        `/api/payment?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
          search,
        )}`,
        {
          method: "GET",
        },
      );

      const result = await response.json();

      if (result.status == 400) {
        toast.error(result.message);
      }

      if (result.status == 500) {
        toast.error(result.message);
      }

      // toast.success(result.message);
      setRowData(result.data || []);
      setTotalRows(result.count || 0);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.success(error.message);
    }
  };

  const fetchPaymentCount = async () => {
    try {
      const response = await fetch(`/api/payment-details`, {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        toast.error(result.message);
      }

      if (result.status == 500) {
        toast.error(result.message);
      }

      setPaymentCount(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.success(error.message);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetcPaymentData(currentPage, pageSize, searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    const fetchData = () => {
      fetchPaymentCount();
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  };

  const columnDefs: ColDef<PaymentData>[] = useMemo(
    () => [
      {
        headerName: "S No",
        field: "sNo",
        width: 100,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "User ID",
        field: "userid",
        flex: 1,
        headerClass: "custom-header",
        cellClass: `custom-cell ${styles.ellipsisCell}`,
        minWidth: 200,
        cellStyle: { color: "#053A88", fontWeight: "500" },
        tooltipValueGetter: (params) => params.value,
        tooltipComponent: CustomTooltip,
        onCellClicked: (params) => {
          if (params.data) {
            handleUserClick(params.data);
          }
        },
      },
      {
        headerName: "Invoice ID",
        field: "invoiceid",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: { color: "#053A88", fontWeight: "500" },
        minWidth: 220,
        tooltipValueGetter: (params) => params.value,
        tooltipComponent: CustomTooltip,
      },
      {
        headerName: "Plan type",
        field: "plantype",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: { color: "#EC4899", fontWeight: "500" },
        minWidth: 180,
      },
      {
        headerName: "Plan name",
        field: "planname",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: { color: "#FF6B35", fontWeight: "500" },
        minWidth: 220,
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: (params): CellStyle => {
          if (params.value == "Failed") {
            return { color: "#db0a0a", fontWeight: "500" };
          } else if (params.value == "Pending") {
            return { color: "#FF6B35", fontWeight: "500" };
          } else if (params.value == "Cancelled") {
            return { color: "#db0a0a", fontWeight: "500" };
          } else {
            return { color: "#0e5c05", fontWeight: "500" };
          }
        },
      },
      {
        headerName: "Date & Time",
        field: "date",
        width: 120,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: { fontWeight: "500" } as CellStyle,
        tooltipValueGetter: (params) => params.value,
        tooltipComponent: CustomTooltip,
      },
    ],
    [],
  );

  const handleUserClick = (row: PaymentData) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="bg-white- border-b- border-gray-200 sticky top-0 z-10 shadow-sm-">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              className={`pb-4 px-2 text-sm font-medium relative text-gray-900`}
            >
              Payment
            </button>{" "}
            |
            <button
              className={`pb-4 px-2 text-sm font-medium relative text-gray-900`}
            >
              OverView
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {dispplayCard && (
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paymentCount && (
              <StatCard
                icon={CreditCard}
                title="Total Number of Payments"
                value={paymentCount.totalPaymentCount}
                iconColor="text-red-500"
                iconBgColor="bg-red-50"

                // trend={
                //   paymentCount.totalPaymentCount > 0
                //     ? { value: 12.5, positive: true }
                //     : { value: 5.2, positive: false }
                // }
              />
            )}

            {paymentCount && (
              <StatCard
                icon={Banknote}
                title="Total Payments in TZS"
                value={paymentCount.totalTanzaniaCount}
                iconColor="text-red-500"
                iconBgColor="bg-red-50"
                subtitle={`Total amount: ${paymentCount.totalAmtTZS.toLocaleString()} TZS`}
              />
            )}
            {paymentCount && (
              <StatCard
                icon={Wallet}
                title="Total Payments in KES"
                value={paymentCount.totalKenyaCount}
                iconColor="text-red-500"
                iconBgColor="bg-red-50"
                subtitle={`Total amount: ${paymentCount.totalAmtKES.toLocaleString()} KES`}
              />
            )}
            {paymentCount && (
              <StatCard
                icon={XCircle}
                title="Total Cancelled Payments"
                value={paymentCount.cancelledCount}
                iconColor="text-red-500"
                iconBgColor="bg-red-50"
              />
            )}
          </div>
        </main>
      )}

      {/* AG Grid */}
      <div className="py-6 px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className={`${styles.agGrid} ag-theme-alpine w-full p-2.5`}
            style={{ height: "calc(111vh - 280px)" }}
          >
            <AgGridReact<PaymentData>
              theme="legacy"
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={false}
              suppressPaginationPanel={true}
              domLayout="normal"
              suppressCellFocus={true}
              rowHeight={48}
              headerHeight={45}
              loading={loading}
              overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading data...</span>'
              overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No data found</span>'
              tooltipShowDelay={0}
              components={{
                CustomTooltip,
              }}
            />
          </div>

          {/* Custom Pagination */}
          <div className="flex justify-end items-center gap-4 p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Page Size:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option
                    className="bg-gray-100 text-gray-900"
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-700">
              {totalRows > 0 ? (
                <>
                  {currentPage * pageSize + 1} to{" "}
                  {Math.min((currentPage + 1) * pageSize, totalRows)} of{" "}
                  {totalRows}
                </>
              ) : (
                "0 to 0 of 0"
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronFirst className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentPage((curr) => curr - 1)}
                disabled={currentPage === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-3 text-sm text-gray-700">
                Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((curr) => curr + 1)}
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronLast className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedRow}
      />
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  subtitle1,
  subtitle2,
  iconColor = "text-red-500",
  iconBgColor = "bg-red-50",
  trend,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`${iconBgColor} p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon size={18} className={iconColor} />
          </div>
          <h3 className="text-gray-500 text-sm font-medium leading-tight">
            {title}
          </h3>
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.positive
                ? "text-emerald-600 bg-emerald-50"
                : "text-red-500 bg-red-50"
            }`}
          >
            {trend.positive ? "▲" : "▼"} {trend.value}%
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
        {value}
      </p>

      {/* Divider */}
      {subtitle && <div className="h-px bg-gray-100 mb-3" />}

      {/* Subtitle */}
      {subtitle && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
        </div>
      )}

      {subtitle1 && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <p className="text-sm text-gray-500 font-medium">{subtitle1}</p>
        </div>
      )}
      {subtitle2 && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <p className="text-sm text-gray-500 font-medium">{subtitle1}</p>
        </div>
      )}
    </div>
  );
};
// Modal Component
const PaymentDetailsModal = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: PaymentData | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-6">
            User Details
          </h2>

          {/* User Details Section */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-start">
              <span className="text-gray-700 font-medium">User ID</span>
              <span className="text-gray-900 text-right break-all max-w-xs">
                {data?.userid}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-700 font-medium">Invoice ID</span>
              <span className="text-gray-900 text-right break-all max-w-xs">
                {data?.invoiceid}
              </span>
            </div>
          </div>

          {/* Plan Details Section */}
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            Plan Details
          </h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Plan type</span>
              <span className="text-gray-900">{data?.plantype}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Plan Name</span>
              <span className="text-gray-900">{data?.planname}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Status</span>
              <span
                className={`${data?.status === "Paid" ? "text-green-600" : "text-red-600"} font-medium`}
              >
                {data?.status}
              </span>
            </div>
          </div>

          {/* Payment Details Section */}
          <h3 className="text-xl font-semibold text-red-600 mb-4">
            Payment Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Date & Time</span>
              <span className="text-gray-900">{data?.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ value, colDef }: any) => {
  let background = "#4f46e5";
  if (colDef.field === "userid") {
    background = "#ec71ae";
  }

  if (colDef.field === "paymentid") {
    background = "#e57b46";
  }
  return (
    <div style={{ background: background, color: "white", padding: 8 }}>
      {colDef.headerName}: {value}
    </div>
  );
};

export default Payment;
