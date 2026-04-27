"use client";

import React, { useEffect, useState } from "react";
import { ReportTable } from "@/app/components/reports/ReportTable";
import type { ReportUser, SuspendUser } from "@/app/types/report.types";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import toast from "react-hot-toast";
import { X, UserX } from "lucide-react";


// ============= MOCK DATA =============
const mockReportData: ReportUser[] = [
  {
    id: 1,
    userId: "moy_a941abcdfdb743b1...",
    name: "Koda",
    totalReports: 3,
    reportDetails: [
      {
        reportBy: "moy_a941abcdfdb743b1",
        reportOn: "24-12-2025 & 03:15AM",
        reportType: "Fake Profile",
      },
      {
        reportBy: "moy_a941abcdfdb743b1",
        reportOn: "24-12-2025 & 04:15AM",
        reportType: "Scams",
      },
      {
        reportBy: "moy_a941abcdfdb743b1",
        reportOn: "29-12-2025 & 03:15AM",
        reportType: "Inappropriate Content",
      },
    ],
  },
  {
    id: 2,
    userId: "moy_a941abcdfdb743b1...",
    name: "Zyaire",
    totalReports: 5,
    reportDetails: [
      {
        reportBy: "moy_b123abcdfdb743b2",
        reportOn: "23-12-2025 & 02:15AM",
        reportType: "Spam",
      },
      {
        reportBy: "moy_b123abcdfdb743b2",
        reportOn: "23-12-2025 & 05:30AM",
        reportType: "Harassment",
      },
      {
        reportBy: "moy_c456abcdfdb743b3",
        reportOn: "25-12-2025 & 01:45PM",
        reportType: "Fake Profile",
      },
      {
        reportBy: "moy_d789abcdfdb743b4",
        reportOn: "26-12-2025 & 08:20AM",
        reportType: "Scams",
      },
      {
        reportBy: "moy_e012abcdfdb743b5",
        reportOn: "28-12-2025 & 11:30AM",
        reportType: "Inappropriate Content",
      },
    ],
  },
  {
    id: 3,
    userId: "moy_c963cdefgfd965d3...",
    name: "Sarah",
    totalReports: 2,
    reportDetails: [
      {
        reportBy: "moy_f345abcdfdb743b6",
        reportOn: "22-12-2025 & 09:00AM",
        reportType: "Offensive Language",
      },
      {
        reportBy: "moy_g678abcdfdb743b7",
        reportOn: "27-12-2025 & 03:45PM",
        reportType: "Fake Profile",
      },
    ],
  },
  {
    id: 4,
    userId: "moy_d074defgh0a976e4...",
    name: "Michael",
    totalReports: 7,
    reportDetails: [
      {
        reportBy: "moy_h901abcdfdb743b8",
        reportOn: "20-12-2025 & 10:15AM",
        reportType: "Spam",
      },
      {
        reportBy: "moy_i234abcdfdb743b9",
        reportOn: "21-12-2025 & 02:30PM",
        reportType: "Scams",
      },
      {
        reportBy: "moy_j567abcdfdb743c1",
        reportOn: "23-12-2025 & 06:45AM",
        reportType: "Harassment",
      },
    ],
  },
  {
    id: 5,
    userId: "moy_e185efghi1b087f5...",
    name: "Emma",
    totalReports: 4,
    reportDetails: [
      {
        reportBy: "moy_k890abcdfdb743c2",
        reportOn: "24-12-2025 & 01:00PM",
        reportType: "Inappropriate Content",
      },
      {
        reportBy: "moy_l123abcdfdb743c3",
        reportOn: "25-12-2025 & 04:20PM",
        reportType: "Fake Profile",
      },
    ],
  },
  {
    id: 6,
    userId: "moy_f296fghij2c198g6...",
    name: "James",
    totalReports: 6,
    reportDetails: [
      {
        reportBy: "moy_m456abcdfdb743c4",
        reportOn: "26-12-2025 & 09:30AM",
        reportType: "Spam",
      },
      {
        reportBy: "moy_n789abcdfdb743c5",
        reportOn: "27-12-2025 & 11:45AM",
        reportType: "Offensive Language",
      },
    ],
  },
  {
    id: 7,
    userId: "moy_g307ghijk3d209h7...",
    name: "Olivia",
    totalReports: 3,
    reportDetails: [
      {
        reportBy: "moy_o012abcdfdb743c6",
        reportOn: "28-12-2025 & 02:15PM",
        reportType: "Scams",
      },
      {
        reportBy: "moy_p345abcdfdb743c7",
        reportOn: "29-12-2025 & 05:30PM",
        reportType: "Harassment",
      },
    ],
  },
  {
    id: 8,
    userId: "moy_h418hijkl4e310i8...",
    name: "Noah",
    totalReports: 8,
    reportDetails: [
      {
        reportBy: "moy_q678abcdfdb743c8",
        reportOn: "21-12-2025 & 08:00AM",
        reportType: "Fake Profile",
      },
      {
        reportBy: "moy_r901abcdfdb743c9",
        reportOn: "22-12-2025 & 10:30AM",
        reportType: "Inappropriate Content",
      },
    ],
  },
  {
    id: 9,
    userId: "moy_i529ijklm5f421j9...",
    name: "Ava",
    totalReports: 2,
    reportDetails: [
      {
        reportBy: "moy_s234abcdfdb743d1",
        reportOn: "23-12-2025 & 01:45PM",
        reportType: "Spam",
      },
      {
        reportBy: "moy_t567abcdfdb743d2",
        reportOn: "24-12-2025 & 03:00PM",
        reportType: "Offensive Language",
      },
    ],
  },
  {
    id: 10,
    userId: "moy_j630jklmn6g532k0...",
    name: "Liam",
    totalReports: 5,
    reportDetails: [
      {
        reportBy: "moy_u890abcdfdb743d3",
        reportOn: "25-12-2025 & 07:15AM",
        reportType: "Scams",
      },
      {
        reportBy: "moy_v123abcdfdb743d4",
        reportOn: "26-12-2025 & 09:30AM",
        reportType: "Harassment",
      },
    ],
  },
];

// ============= MOCK DATA FOR SUSPEND TAB =============
const mockSuspendData: SuspendUser[] = [
  {
    id: 1,
    userId: "moy_a941abcdfdb743b1...",
    name: "Koda",
    totalReports: 3,
  },
  {
    id: 2,
    userId: "moy_b952bcdefec854c2...",
    name: "Alex",
    totalReports: 5,
  },
  {
    id: 3,
    userId: "moy_c963cdefgfd965d3...",
    name: "Sarah",
    totalReports: 2,
  },
  {
    id: 3,
    userId: "moy_c963cdefgfd965d3...",
    name: "Sarah",
    totalReports: 3,
  },
];
// ============= MAIN PAGE COMPONENT =============
const ReportsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();



  const [activeTab, setActiveTab] = useState<"Report" | "Suspend">("Report");
  const [reportUsers, setReportUsers] = useState<ReportUser[]>([]);
  const [suspendUsers, setSuspendUsers] = useState<SuspendUser[]>([]);

  // report pagination
  const [reportPage, setReportPage] = useState(0);
  const [reportPageSize, setReportPageSize] = useState(10);
  const [rTotalRows, setRtotalRows] = useState(0);
  // Suspend pagination
  const [suspendPage, setSuspendPage] = useState(0);
  const [suspendPageSize, setSuspendPageSize] = useState(10);
  const [sTotalRows, setStotalRows] = useState(0);

  const [selectedUser, setSelectedUser] = useState<ReportUser | null>(null);
  const [selectedSuspendedUser, setSelectedSuspendedUser] =
    useState<SuspendUser | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnSuspendModal, setShowUnSuspendModal] = useState(false);

  const handleSuspendUser = async (userId: string) => {
    const userToSuspend = reportUsers.find((user) => user.userId === userId);
    if (userToSuspend) {
      await suspendAPI(userId);
      fetchReports(reportPage, reportPageSize);
      fetchSuspend(suspendPage, suspendPageSize);
      setActiveTab("Suspend");
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    const userToUnSuspend = suspendUsers.find((user) => user.userId === userId);

    if (userToUnSuspend) {
      await UnsuspendAPI(userToUnSuspend.userId);
      fetchReports(reportPage, reportPageSize);
      fetchSuspend(suspendPage, suspendPageSize);
      setActiveTab("Suspend");
    }
  };


  useEffect(() => {
    const viewFromUrl = searchParams.get("view") || "Report";
    if (viewFromUrl !== activeTab) {
      setActiveTab(viewFromUrl as "Report" | "Suspend");
    }
  }, [searchParams]);

  const suspendAPI = async (userId: string) => {
    try {
      const res = await fetch(`/api/reports?id=${encodeURIComponent(userId)}`, {
        method: "PUT",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        ("Failed to Suspend");
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.message);
    }
  };

  const UnsuspendAPI = async (userId: string) => {
    try {
      const res = await fetch(`/api/unsuspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (res.status === 400) {
        toast.error(data.message);
        ("Failed to Unsuspend");
      } else if (res.status === 200) {
        toast.success(data.message || "User unsuspended successfully");
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.message);
    }
  };

  const fetchReports = async (page: number, limit: number) => {
    try {
      const offset = page * limit;

      const res = await fetch(`/api/reports?limit=${limit}&offset=${offset}`, {
        method: "GET",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        ("Failed to fetch reports");
      }

      setReportUsers(data.data);
      setRtotalRows(data.count);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.message);
    }
  };

  const fetchSuspend = async (page: number, limit: number) => {
    try {
      const offset = page * limit;

      const res = await fetch(`/api/suspend?limit=${limit}&offset=${offset}`, {
        method: "GET",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        ("Failed to fetch reports");
      }

      setSuspendUsers(data.data);
      setStotalRows(data.count);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchReports(reportPage, reportPageSize);
  }, [reportPage, reportPageSize]);

  useEffect(() => {
    fetchSuspend(suspendPage, suspendPageSize);
  }, [suspendPage, suspendPageSize]);

  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;

    await handleSuspendUser(selectedUser.userId);
    setShowSuspendModal(false);
    setSelectedUser(null);
  };

  const handleConfirmUnsuspend = async () => {
    if (!selectedSuspendedUser) return;

    await handleUnsuspendUser(selectedSuspendedUser.userId);
    setShowUnSuspendModal(false);
    setSelectedSuspendedUser(null);
  };

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <div className="flex-1">
          <div className="sticky top-0 z-20 bg-gray-50 px-8 py-6 border-b border-gray-200 px-8 py-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">{activeTab}</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">Overview</span>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="flex gap-8 border-b border-gray-200 sticky top-0">
              <button
                onClick={() => setActiveTab("Report")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "Report"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Report
                {activeTab === "Report" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("Suspend")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "Suspend"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Suspend
                {activeTab === "Suspend" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            </div>

            {/* Table */}
            <div className="mt-6">
              {activeTab === "Report" && (
                <ReportTable
                  style={styles.agGrid}
                  data={reportUsers}
                  totalRecords={rTotalRows}
                  onSuspendUser={handleSuspendUser}
                  showSuspendButton={true}
                  showViewButton={true}
                  activeTab={activeTab}
                  currentPage={reportPage}
                  pageSize={reportPageSize}
                  onPageChange={setReportPage}
                  onPageSizeChange={(size) => {
                    setReportPageSize(size);
                    setReportPage(0);
                  }}
                  onViewUser={(user) => {
                    setSelectedUser(user);
                    setShowViewModal(true);
                  }}
                  onSuspendClick={(user) => {
                    setSelectedUser(user);
                    setShowSuspendModal(true);
                  }}
                />
              )}
              {activeTab === "Suspend" && (
                <ReportTable
                  style={styles.agGrid}
                  data={suspendUsers}
                  totalRecords={sTotalRows}
                  currentPage={suspendPage}
                  pageSize={suspendPageSize}
                  onUnSuspendUser={handleUnsuspendUser}
                  onPageChange={setSuspendPage}
                  onPageSizeChange={(size) => {
                    setSuspendPageSize(size);
                    setSuspendPage(0);
                  }}
                  showSuspendButton={true}
                  activeTab={activeTab}
                  showViewButton={false}
                  onUnsuspendClick={(user) => {
                    setSelectedSuspendedUser(user);
                    setShowUnSuspendModal(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-red-600">
                  Report Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-6">
                Report Info
              </h3>

              <div className="space-y-6">
                {selectedUser.reportDetails?.map((detail, index) => (
                  <div key={index} className="space-y-3">
                    {/* Report By */}
                    <div className="flex items-start gap-4">
                      <p className="text-sm text-gray-600 w-24 flex-shrink-0">
                        Report By
                      </p>
                      <p className="text-sm font-medium text-gray-900 break-all flex-1">
                        {detail.reportBy}
                      </p>
                    </div>

                    {/* Report On */}
                    <div className="flex items-start gap-4">
                      <p className="text-sm text-gray-600 w-24 flex-shrink-0">
                        Report On
                      </p>
                      <p className="text-sm font-medium text-gray-900 break-all flex-1">
                        {detail.reportOn}
                      </p>
                    </div>

                    {/* Report Type */}
                    <div className="flex items-start gap-4">
                      <p className="text-sm text-gray-600 w-24 flex-shrink-0">
                        Report Type
                      </p>
                      <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full">
                        {detail.reportType}
                      </span>
                    </div>

                    {/* Divider between reports */}
                    {index < (selectedUser.reportDetails?.length || 0) - 1 && (
                      <hr className="my-6 border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Suspend User
              </h2>
              <p className="text-gray-600 mb-8">
                Are you sure you want to suspend this Moyo user?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="px-8 py-2.5 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors font-medium"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmSuspend}
                  className="px-8 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UnSuspend Modal */}
      {showUnSuspendModal && selectedSuspendedUser && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unsuspend User
              </h2>
              <p className="text-gray-600 mb-8">
                Are you sure you want to unsuspend this Moyo user?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowUnSuspendModal(false)}
                  className="px-8 py-2.5 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors font-medium"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmUnsuspend}
                  className="px-8 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsPage;
