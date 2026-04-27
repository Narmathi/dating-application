"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import { useLoader } from "@/app/store/useLoader";
import toast from "react-hot-toast";

ModuleRegistry.registerModules([AllCommunityModule]);

type UserData = {
  sNo: number;
  area: string;
  gender: string;
  relationShip: string;
  age: number;
};

const MoyoMojaUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "overview">("overview");
  const [rowData, setRowData] = useState<UserData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const pageSizeOptions = [10, 20, 50, 100];

  const totalPages = Math.ceil(totalRows / pageSize);

  const fetchMoyoData = async (
    page: number,
    limit: number,
    search: string = "",
  ) => {
    try {
      const offset = page * limit;

      const response = await fetch(
        `/api/moyo?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
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

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchMoyoData(currentPage, pageSize, searchTerm);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  };

  const columnDefs: ColDef<UserData>[] = useMemo(
    () => [
      {
        headerName: "S No",
        field: "sNo",
        width: 100,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Area",
        field: "area",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Gender",
        field: "gender",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: (params) => {
          if (params.value === "Female") {
            return { color: "#EC4899", fontWeight: "500" };
          }
          return { color: "#374151", fontWeight: "400" };
        },
      },
      {
        headerName: "Relationship",
        field: "relationShip",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellStyle: (params) => {
          if (params.value === "Dating") {
            return { color: "#EC4899", fontWeight: "500" };
          } else if (params.value === "Friendship") {
            return { color: "#FF6B35", fontWeight: "500" };
          }
          return { color: "#374151", fontWeight: "400" };
        },
      },
      {
        headerName: "Age",
        field: "age",
        width: 120,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
    ],
    [],
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="bg-white- border-b- border-gray-200 sticky top-0 z-10 shadow-sm-">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex gap-8">
            {["users", "overview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "users" | "overview")}
                className={`pb-4 px-2 text-sm font-medium relative  ${
                  activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "users" ? "Moyo Moja Users" : "Overview"}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            ))}
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

      {/* AG Grid */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className={`${styles.agGrid} ag-theme-alpine w-full p-2.5`}
            style={{ height: "calc(111vh - 280px)" }}
          >
            <AgGridReact<UserData>
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
    </div>
  );
};

export default MoyoMojaUsersTable;
