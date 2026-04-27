"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  X,
  UserX,
} from "lucide-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type { ReportUser, SuspendUser } from "@/app/types/report.types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface ReportTableProps {
  data: ReportUser[] | SuspendUser[];
  totalRecords: number;
  onSuspendUser?: (userId: string) => void;
  showSuspendButton: boolean;
  showViewButton: boolean;
  activeTab: string;
  style: string;

  currentPage: number;
  pageSize: number;
  onUnSuspendUser?: (userId: string) => void;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewUser?: (user: ReportUser) => void;
  onSuspendClick?: (user: ReportUser) => void;
  onUnsuspendClick?: (user: SuspendUser) => void;
}

// Action buttons cell renderer
const ActionButtonsRenderer = (props: any) => {
  const { onView, onSuspend, showSuspend } = props;

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={onView}
        className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md flex items-center gap-1.5 transition-colors"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        View
      </button>
      {showSuspend && (
        <button
          onClick={onSuspend}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md flex items-center gap-1.5 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth={2} />
          </svg>
          Suspend
        </button>
      )}
    </div>
  );
};

const ActionSuspendRender = (props: any) => {
  const { onUnsuspend, showUnsuspend } = props;

  return (
    <div className="flex items-center gap-2 mt-2">
      {showUnsuspend && (
        <button
          onClick={onUnsuspend}
          className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md flex items-center gap-1.5 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth={2} />
          </svg>
          Unsuspend
        </button>
      )}
    </div>
  );
};

export const ReportTable = ({
  data,
  totalRecords,
  onSuspendUser,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,

  showSuspendButton,
  showViewButton,
  style,
  onSuspendClick,
  onUnsuspendClick,
  onViewUser,
}: ReportTableProps) => {
  const pageSizeOptions = [10, 20, 50, 100];

  // Calculate total pages based on total records
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Calculate display range
  const startRecord = totalRecords > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalRecords);

  const handleViewClick = (user: ReportUser) => {
    onViewUser?.(user);
  };

  const handleSuspendClick = (user: ReportUser) => {
    onSuspendClick?.(user);
  };
  const handleUnSuspendClick = (user: SuspendUser) => {
    onUnsuspendClick?.(user);
  };

  const CustomTooltip = ({ value, colDef }: any) => {
    let background = "#4f46e5";
    if (colDef.field === "userId") {
      background = "#ec71ae";
    }

    return (
      <div style={{ background: background, color: "white", padding: 8 }}>
        {colDef.headerName}: {value}
      </div>
    );
  };

  const columnDefs: ColDef<ReportUser>[] = useMemo(() => {
    const baseColumns: ColDef<ReportUser>[] = [
      {
        headerName: "S.No",
        valueGetter: (params) => {
          const rowIndex = params.node?.rowIndex;
          if (rowIndex == null) return "";
          return currentPage * pageSize + rowIndex + 1;
        },
        width: 100,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "User ID",
        field: "userId",
        flex: 1,
        minWidth: 250,
        headerClass: "custom-header",
        cellClass: "custom-cell text-blue-900 font-bold",
        tooltipValueGetter: (params) => params.value,
        tooltipComponent: CustomTooltip,
      },
      {
        headerName: "Name",
        field: "name",
        flex: 1,
        minWidth: 200,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
    ];

    if (showSuspendButton && showViewButton) {
      (baseColumns.push({
        headerName: "Total Report",
        field: "totalReports",
        width: 200,
        headerClass: "custom-header",
        cellClass: "custom-cell text-blue-700 font-medium",
      }),
        baseColumns.push({
          headerName: "Action",
          field: "action",
          width: 250,
          headerClass: "custom-header",
          cellClass: "custom-cell",
          cellRenderer: (params: any) => {
            return (
              <ActionButtonsRenderer
                onView={() => handleViewClick(params.data)}
                onSuspend={() => handleSuspendClick(params.data)}
                showSuspend={showSuspendButton}
              />
            );
          },
        }));
    } else if (showSuspendButton) {
      baseColumns.push({
        headerName: "Action",
        field: "action",
        width: 250,
        headerClass: "custom-header",
        cellClass: "custom-cell",
        cellRenderer: (params: any) => {
          return (
            <ActionSuspendRender
              onUnsuspend={() => handleUnSuspendClick(params.data)}
              showUnsuspend={true}
            />
          );
        },
      });
    }

    return baseColumns;
  }, [currentPage, pageSize, showSuspendButton, showViewButton]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: false,
      resizable: false,
      suppressMovable: true,
    }),
    [],
  );

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
    onPageChange(0);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div
          className={`${style} ag-theme-alpine w-full p-2.5`}
          style={{ height: "calc(-280px + 111vh)" }}
        >
          <AgGridReact
            theme="legacy"
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={false}
            suppressPaginationPanel={true}
            domLayout="normal"
            suppressCellFocus={true}
            rowHeight={48}
            headerHeight={45}
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
            {totalRecords > 0 ? (
              <>
                {startRecord} to {endRecord} of {totalRecords}
              </>
            ) : (
              "0 to 0 of 0"
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronFirst className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronLast className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
