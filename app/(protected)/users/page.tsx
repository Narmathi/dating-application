"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSearchParams } from "next/navigation";

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

import { Upload, Calendar, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import DatePicker from "react-datepicker";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TableData {
  sNo: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  email: number;
  mobile: string;
  role: string;
  roleName: string;
}

interface UserFormSection {
  name: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  password: string;
  mobileNumber: string;
  role: string;
  countryCode: string;
  roleName: string;
  isMobileValid: boolean;
}

const UsersTable = () => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"users" | "overview">("overview");
  const [rowData, setRowData] = useState<TableData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [showPassword, setShowPassword] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentView, setCurrentView] = useState("list");
  const [reloadUsers, setReloadUsers] = useState(false);

  const pageSizeOptions = [10, 20, 50, 100];

  const totalPages = Math.ceil(totalRows / pageSize);

  const initialUserFormSection: UserFormSection = {
    name: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "",
    roleName: "",
    isMobileValid: true,
    countryCode: "+254",
  };

  const [userFormSection, setUserFormSection] = useState<UserFormSection>(
    initialUserFormSection,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUserFormSection((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setUserFormSection((prev) => ({ ...prev, dateOfBirth: "" }));
      return;
    }

    if (!isAtLeast18(date)) {
      toast.error("You must be at least 18 years old.");
      return;
    }

    setUserFormSection((prev) => ({
      ...prev,
      dateOfBirth: date.toISOString().split("T")[0],
    }));
  };

  const isAtLeast18 = (date: Date): boolean => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );

    return date <= eighteenYearsAgo;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/svg+xml")
    ) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert("Please select a valid image file (JPEG, PNG, or SVG)");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/svg+xml")
    ) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert("Please select a valid image file (JPEG, PNG, or SVG)");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password) {
      return "Password is required";
    }

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }

    if (!regex.test(password)) {
      return "Password must contain uppercase, lowercase, number, and special character";
    }

    return null;
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userFormSection.name) {
      toast.error("Please fill name!!");
      return;
    }
    if (!userFormSection.gender) {
      toast.error("Please select gender!!");
      return;
    }
    if (!userFormSection.dateOfBirth) {
      toast.error("Please select dateOfBirth!!");
      return;
    }
    if (!userFormSection.email) {
      toast.error("Please enter email!!");
      return;
    }

    const passwordError = validatePassword(userFormSection.password);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!emailRegex.test(userFormSection.email)) {
      toast.error("Please enter a valid email address!!");
      return;
    }

    if (!userFormSection.email.endsWith("@moyomoja.africa")) {
      toast.error("Only @moyomoja.africa email addresses are allowed!");
      return;
    }

    if (!userFormSection.mobileNumber) {
      toast.error("Please enter mobile number!!");
      return;
    }

    const mobileNumber = userFormSection.mobileNumber.replace(/\D/g, "");

    let numberRegex = /^[167]\d{8}$/;

    // if (userFormSection.countryCode === "+255") {
    //   numberRegex = /^[67]\d{8}$/;
    // }
    // else if (userFormSection.countryCode === "+254") {
    //   numberRegex = /^[17]\d{8}$/;
    // }

    if (!numberRegex.test(mobileNumber)) {
      toast.error(
        userFormSection.countryCode === "+255"
          ? "Invalid Tanzanian number. Must start with 6 or 7 and have 9 digits."
          : "Invalid Kenyan number. Must start with 1 or 7 and have 9 digits.",
      );
      return;
    }

    if (!userFormSection.role) {
      toast.error("Please select role!!");
      return;
    }
    if (!userFormSection.roleName) {
      toast.error("Please select roleName!!");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload a profile picture");
      return;
    }

    const formData = new FormData();

    formData.append("dp", selectedFile);
    formData.append("name", userFormSection.name);
    formData.append("gender", userFormSection.gender);
    formData.append("dob", userFormSection.dateOfBirth);
    formData.append("email", userFormSection.email);
    formData.append("password", userFormSection.password);
    formData.append("mobile", userFormSection.mobileNumber);
    formData.append("role", userFormSection.role);
    formData.append("role_name", userFormSection.roleName);
    formData.append("country_code", userFormSection.countryCode);
    formData.append("description", "");

    try {
      showLoader();
      const res = await fetch("/api/users/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      hideLoader();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }
        if (res.status === 500) {
          toast.error("Server error. Please try again later.");
          return;
        }
        toast.error(data.message || "Something went wrong");
        return;
      }

      setUserFormSection(initialUserFormSection);
      handleRemoveFile();
      setCurrentView("list");
      setReloadUsers((prev) => !prev);
    } catch (err: any) {
      hideLoader();
      toast.error("Failed to save!!");
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/\D/g, "");

    if (inputValue.length > 9) {
      inputValue = inputValue.slice(0, 9);
    }

    let numberRegex = /^[167]\d{8}$/;

    if (userFormSection.countryCode === "+255") {
      numberRegex = /^[67]\d{8}$/;
    } else if (userFormSection.countryCode === "+254") {
      numberRegex = /^[17]\d{8}$/;
    }

    const isValid = numberRegex.test(inputValue);

    setUserFormSection({
      ...userFormSection,
      mobileNumber: inputValue,
      isMobileValid: isValid,
    });
  };

  const fetchUsersData = async (
    page: number,
    limit: number,
    search: string = "",
  ) => {
    try {
      const offset = page * limit;

      const response = await fetch(
        `/api/users/?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
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

  const getUserData = async () => {
    try {
      const userId = auth?.user_id;

      const response = await fetch(`/api/users/unique/?id=${userId}`, {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        toast.error(result.message);
      }

      if (result.status == 500) {
        toast.error(result.message);
      }
      setUserFormSection(result.data);
      setSelectedFile(result.file);
      setPreviewUrl(result.file ?? "");
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.success(error.message);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchUsersData(currentPage, pageSize);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [currentPage, pageSize, reloadUsers]);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [pageSize]);

  useEffect(() => {
    const viewFormUrl = searchParams.get("view") || "list";
    if (viewFormUrl && viewFormUrl !== currentView) {
      setCurrentView(viewFormUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentView === "profile") {
      getUserData();
    }
  }, [currentView]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
  };

  const columnDefs: ColDef<TableData>[] = useMemo(
    () => [
      {
        headerName: "S No",
        field: "sNo",
        width: 100,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Name",
        field: "name",
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
          return { color: "#6495ED", fontWeight: "400" };
        },
      },
      {
        headerName: "Date of Birth",
        field: "dateOfBirth",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },

      {
        headerName: "Email",
        field: "email",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Mobile",
        field: "mobile",
        flex: 1,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Role",
        field: "role",
        width: 120,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
      {
        headerName: "Role Name",
        field: "roleName",
        width: 120,
        headerClass: "custom-header",
        cellClass: "custom-cell",
      },
    ],
    [],
  );

  if (currentView === "list") {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex gap-8">
              {["users", "overview"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "users" | "overview")}
                  className={`pb-4 px-2 text-sm font-medium relative font-bold ${
                    activeTab === tab
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "users" ? "Users" : "Overview"}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => {
                  setCurrentView("userForm");
                  setUserFormSection(initialUserFormSection);
                  handleRemoveFile();
                }}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Add Users
              </button>
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
              <AgGridReact<TableData>
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
  }

  if (currentView === "userForm") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span
                className="text-red-600 font-bold cursor-pointer"
                onClick={() => setCurrentView("list")}
              >
                User
              </span>
              <span>/</span>
              <span className="text-gray-900">Add User</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Add User</h1>
          </div>

          {/* Form */}

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userFormSection.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    placeholder=""
                  />
                </div>

                {/* Gender and Date of Birth Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={userFormSection.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="">Select Option</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date of Birth Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Date of Birth
                    </label>

                    <div className="relative w-full">
                      <DatePicker
                        wrapperClassName="w-full"
                        selected={
                          userFormSection.dateOfBirth
                            ? new Date(userFormSection.dateOfBirth)
                            : null
                        }
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/yyyy"
                        maxDate={new Date()}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <Calendar
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userFormSection.email}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="steve@moyomoja.africa"
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                      </label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={userFormSection.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                          placeholder="Password"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Email Field */}

                {/* Mobile Number Field */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country Code
                      </label>
                      <div className="relative">
                        <select
                          name="countryCode"
                          value={userFormSection.countryCode}
                          onChange={(e) =>
                            setUserFormSection({
                              ...userFormSection,
                              countryCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                        >
                          <option value="+254">+254</option>
                          <option value="+255">+255</option>
                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="number"
                      name="mobileNumber"
                      value={userFormSection.mobileNumber}
                      onChange={handleMobileChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      placeholder="7XXXXXXXX"
                      maxLength={9}
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={userFormSection.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200  text-gray-500  rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      {/* <option value="super_admin">Super Admin</option> */}
                      <option value="super_admin">Super Admin</option>
                      <option value="ops_user">Ops User</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* Role Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role Name
                  </label>
                  <div className="relative">
                    <select
                      name="roleName"
                      value={userFormSection.roleName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50   text-gray-500 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      <option value="CSE">
                        Customer Support Executive(CSE)
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Profile Picture
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload area */}
                <div
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer h-64 relative"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mb-4">
                        <Upload
                          className="w-full h-full text-red-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPEG, PNG, SVG
                      </p>
                    </>
                  )}
                </div>

                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "profile") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              {/* <span className="text-red-600 font-bold cursor-pointer">
                User
              </span> */}
              {/* <span>/</span> */}
              {/* <span className="text-gray-900">View User</span> */}
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Profile Details
            </h1>
          </div>

          {/* Form */}

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userFormSection.name}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    placeholder=""
                  />
                </div>

                {/* Gender and Date of Birth Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={userFormSection.gender || ""}
                        disabled
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="">Select Option</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date of Birth Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 text-gray-500  mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={userFormSection.dateOfBirth}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200  text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userFormSection.email}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        placeholder="steve@moyomoja.africa"
                      />
                    </div>
                  </div>
                </div>
                {/* Email Field */}

                {/* Mobile Number Field */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country Code
                      </label>
                      <div className="relative">
                        <select
                          name="countryCode"
                          value={userFormSection.countryCode}
                          disabled
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                        >
                          <option value="+254">+254</option>
                          <option value="+255">+255</option>
                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={userFormSection.mobileNumber}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      placeholder="7XXXXXXXX"
                      maxLength={9}
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={userFormSection.role || ""}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200  text-gray-500  rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      <option value="ops_user">Ops User</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>

                {/* Role Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role Name
                  </label>
                  <div className="relative">
                    <select
                      name="roleName"
                      value={userFormSection.roleName || ""}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50   text-gray-500 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      <option value="CSE">
                        Customer Support Executive(CSE)
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Profile Picture
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer h-64 relative">
                  {previewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <button
                        disabled
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mb-4">
                        <Upload
                          className="w-full h-full text-red-400"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPEG, PNG, SVG
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default UsersTable;
