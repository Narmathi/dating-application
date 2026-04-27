"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

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
  const [rowData, setRowData] = useState<any[]>([
    { sNo: 1, area: "Area", gender: "Male", relationShip: "Dating", age: 23 },
    { sNo: 2, area: "Area", gender: "Male", relationShip: "Dating", age: 25 },
    {
      sNo: 3,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 26,
    },
    {
      sNo: 4,
      area: "Area",
      gender: "Male",
      relationShip: "Friendship",
      age: 28,
    },
    { sNo: 5, area: "Area", gender: "Male", relationShip: "Dating", age: 23 },
    {
      sNo: 6,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 19,
    },
    { sNo: 7, area: "Area", gender: "Male", relationShip: "Dating", age: 27 },
    { sNo: 8, area: "Area", gender: "Male", relationShip: "Dating", age: 25 },
    {
      sNo: 9,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 24,
    },
    { sNo: 10, area: "Area", gender: "Male", relationShip: "Dating", age: 24 },
    {
      sNo: 11,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 17,
    },
    { sNo: 12, area: "Area", gender: "Male", relationShip: "Dating", age: 27 },
    { sNo: 13, area: "Area", gender: "Male", relationShip: "Dating", age: 22 },
    {
      sNo: 14,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 21,
    },
    { sNo: 15, area: "Area", gender: "Male", relationShip: "Dating", age: 17 },
    { sNo: 16, area: "Area", gender: "Male", relationShip: "Dating", age: 33 },
    {
      sNo: 17,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 26,
    },
    { sNo: 18, area: "Area", gender: "Male", relationShip: "Dating", age: 18 },
    { sNo: 19, area: "Area", gender: "Male", relationShip: "Dating", age: 29 },
    {
      sNo: 20,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 20,
    },
    { sNo: 1, area: "Area", gender: "Male", relationShip: "Dating", age: 23 },
    { sNo: 2, area: "Area", gender: "Male", relationShip: "Dating", age: 25 },
    {
      sNo: 3,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 26,
    },
    {
      sNo: 4,
      area: "Area",
      gender: "Male",
      relationShip: "Friendship",
      age: 28,
    },
    { sNo: 5, area: "Area", gender: "Male", relationShip: "Dating", age: 23 },
    {
      sNo: 6,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 19,
    },
    { sNo: 7, area: "Area", gender: "Male", relationShip: "Dating", age: 27 },
    { sNo: 8, area: "Area", gender: "Male", relationShip: "Dating", age: 25 },
    {
      sNo: 9,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 24,
    },
    { sNo: 10, area: "Area", gender: "Male", relationShip: "Dating", age: 24 },
    {
      sNo: 11,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 17,
    },
    { sNo: 12, area: "Area", gender: "Male", relationShip: "Dating", age: 27 },
    { sNo: 13, area: "Area", gender: "Male", relationShip: "Dating", age: 22 },
    {
      sNo: 14,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 21,
    },
    { sNo: 15, area: "Area", gender: "Male", relationShip: "Dating", age: 17 },
    { sNo: 16, area: "Area", gender: "Male", relationShip: "Dating", age: 33 },
    {
      sNo: 17,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 26,
    },
    { sNo: 18, area: "Area", gender: "Male", relationShip: "Dating", age: 18 },
    { sNo: 19, area: "Area", gender: "Male", relationShip: "Dating", age: 29 },
    {
      sNo: 20,
      area: "Area",
      gender: "Female",
      relationShip: "Friendship",
      age: 20,
    },
  ]);

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
        headerName: "Relation Ship",
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-8">
            {["users", "overview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "users" | "overview")}
                className={`pb-4 px-2 text-sm font-medium relative ${
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
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div className="p-6  border-gray-300 rounded-lg">
        <div className="ag-theme-alpine w-full h-[calc(100vh-160px)] p-2.5">
          <AgGridReact<UserData>
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            suppressCellFocus={true}
            rowHeight={48}
            headerHeight={45}
          />
        </div>
      </div>

      <style>{`
        /* Remove all default AG Grid borders and backgrounds */
        .ag-theme-alpine {
          --ag-border-color: transparent;
          --ag-row-border-color: #E5E7EB;
          --ag-header-background-color: #F9FAFB;
          --ag-background-color: #FFFFFF;
          --ag-odd-row-background-color: #FFFFFF;
          --ag-header-foreground-color: #6B7280;
          --ag-foreground-color: #374151;
          --ag-font-size: 14px;
          --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header Styling */
      .ag-theme-alpine .ag-header {
               background-color: #FFFFFF;
                border-bottom: 1px solid #E5E7EB;
                border-radius: 6px 6px 0 0;
            }

        .ag-theme-alpine .ag-header-cell {
          color: #6B7280;           /* gray-500 */
          font-weight: 600;
          font-size: 13px;
        }


        .ag-theme-alpine .ag-header-cell {
          border-right: none !important;
          padding: 0 16px;
        }

        .ag-paging-description
        {
        display: flex;
        flex-direction: row;
        gap: 10px;
       
        }
        
        .ag-paging-description > span:not(.ag-paging-number) {
             margin-top: 8px;
        }


        .ag-theme-alpine .custom-header {
          color: #3d4046ff;
          font-weight: 500;
          font-size: 15px;
        }

        .ag-theme-alpine .ag-header-cell-text {
          font-weight: 500;
        }

        /* Remove vertical borders between header cells */
        .ag-theme-alpine .ag-header-cell::after {
          display: none;
        }

        /* Row Styling */
        .ag-theme-alpine .ag-row {
          border-bottom: 1px solid #E5E7EB;
          border-left: none;
          border-right: none;
          border-top: none;
        }

        .ag-theme-alpine .ag-cell {
          border-right: none !important;
          border-left: none !important;
          padding: 0 16px;
          line-height: 48px;
          display: flex;
          align-items: center;
        }

        .ag-theme-alpine .custom-cell {
          font-size: 14px;
        }

        /* Hover Effect */
        .ag-theme-alpine .ag-row:hover {
          background-color: #F9FAFB;
        }

        /* Remove all cell focus borders */
        .ag-theme-alpine .ag-cell:focus,
        .ag-theme-alpine .ag-cell:focus-within {
          border: none !important;
          outline: none !important;
        }

        /* Remove row selection styling */
        .ag-theme-alpine .ag-row-selected {
          background-color: transparent;
        }

        .ag-theme-alpine .ag-row-selected:hover {
          background-color: #F9FAFB;
        }

        /* Pagination Styling */
     .ag-theme-alpine .ag-paging-panel {
          border-top: 1px solid #E5E7EB;
          padding: 10px 16px;
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: nowrap;
          min-height: 52px;
        }

        .ag-theme-alpine .ag-paging-row-summary-panel {
         color: #374151;
          font-size: 14px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ag-theme-alpine .ag-paging-page-summary-panel {
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ag-theme-alpine .ag-paging-button {
          border: 1px solid #E5E7EB;
          background-color: #FFFFFF;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .ag-theme-alpine .ag-paging-button:hover:not(:disabled) {
          background-color: #F9FAFB;
        }

        .ag-theme-alpine .ag-paging-button:disabled {
          color: #D1D5DB;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .ag-theme-alpine .ag-paging-number {
          color: #374151;
          border: 1px solid #E5E7EB;
          background-color: #FFFFFF;
          margin: 0 2px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
        }

        .ag-theme-alpine .ag-paging-number:hover {
          background-color: #F9FAFB;
        }

        .ag-theme-alpine .ag-paging-number.ag-paging-number-active {
          background-color: #DC2626;
          color: #FFFFFF;
          border-color: #DC2626;
        }

        /* Remove grid lines */
        .ag-theme-alpine .ag-root-wrapper {
          border: 1px solid #E5E7EB;
  border-radius: 6px;
        }

        .ag-theme-alpine .ag-ltr .ag-cell {
          border-right: none;
        }

        /* Page Size Dropdown */
        .ag-theme-alpine .ag-paging-page-size {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ag-theme-alpine .ag-paging-page-size select {
          border: 1px solid #E5E7EB;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 14px;
          color: #374151;
          background-color: #FFFFFF;
        }


.ag-theme-alpine .ag-paging-number[data-ref="lbCurrent"] {
  background-color: #DC2626; /* red */
  color: #FFFFFF;
  border-color: #DC2626;
  border-radius: 6px;
  font-weight: 600;
}


.ag-paging-panel > .ag-paging-page-size .ag-wrapper {

padding:7px

}




      `}</style>
    </div>
  );
};

export default MoyoMojaUsersTable;
