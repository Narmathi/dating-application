"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Home,
  Users,
  CreditCard,
  Activity,
  Folder,
  User,
  FileEdit,
} from "lucide-react";

import { useLoader } from "@/app/store/useLoader";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  featureImage: string;
}

interface FormData {
  title: string;
  summary: string;
  content: string;
  featureImages: File[];
}

type BlogPostCardProps = {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
};

const initialContentSection: FormData = {
  title: "",
  summary: "",
  content: "",
  featureImages: [],
};

const BlogPostCard = ({ post, onSelect }: BlogPostCardProps) => {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(post)}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={post.featureImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        {/* Author */}
        {/* <div className="flex items-center gap-2 mb-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-500 font-medium">
            {post.author.name}
          </span>
        </div> */}

        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {post.summary}
        </p>

        <p className="text-sm text-gray-400">{post.date}</p>
      </div>
    </div>
  );
};

// MainComponent
const MoyoMojaCMS = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "blog" | "overview" | "createnew" | "details" | "create"
  >("blog");

  const allowedViews = ["blog", "overview", "createnew", "details", "create"] as const;

  type ViewType = typeof allowedViews[number];

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content/`, {
        method: "GET",
      });

      const result = await response.json();

      if (result.status == 400) {
        toast.error(result.message);
      }

      if (result.status == 500) {
        toast.error(result.message);
      }

      toast.success(result.message);
      setPosts(result.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.success(error.message);
    } finally {
    }
  };
  useEffect(() => {
    fetchContent();
  }, []);


  useEffect(() => {
    const viewFromUrl = searchParams.get("view");

    if (viewFromUrl && allowedViews.includes(viewFromUrl as ViewType)) {
      if (viewFromUrl !== currentView) {
        setCurrentView(viewFromUrl as ViewType);
      }
    } else {

      setCurrentView("blog")
    }
  }, [searchParams]);

  // Create Blog
  const [formData, setFormData] = useState<FormData>(initialContentSection);
  const { showLoader, hideLoader } = useLoader();

  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files).filter(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/svg+xml",
    );
    if (fileArray.length > 0) {
      setFormData((prev) => ({ ...prev, featureImages: [fileArray[0]] }));
    }
  };

  const validateFeatureImages = (images: File[]) => {
    if (images.length <= 0) {
      toast.error("Please Select Image !!");
      return;
    }
    const image = images[0];

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 2 * 1024 * 1024;

    if (!allowedTypes.includes(image.type)) {
      toast.error("Invalid image format");
      return;
    }

    if (image.size > MAX_SIZE) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // for (const file of images) {
    //   if (!allowedTypes.includes(file.type)) {
    //     return "Invalid image format";
    //   }
    //   if (file.size > MAX_SIZE) {
    //     return "Image size must be less than 2MB";
    //   }
    // }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error("Please fill title!!");
      return;
    }
    if (!formData.summary) {
      toast.error("Please fill summary!!");
      return;
    }
    if (!formData.content) {
      toast.error("Please fill content!!");
      return;
    }
    if (!formData.featureImages[0]) {
      validateFeatureImages(formData.featureImages);
    }

    const requestData = new FormData();

    requestData.append("blog_title", formData.title);
    requestData.append("short_summary", formData.summary);
    requestData.append("content", formData.content);
    requestData.append("blog_image", formData.featureImages[0]);

    try {
      showLoader();
      const res = await fetch("/api/content/", {
        method: "POST",
        body: requestData,
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

      setFormData(initialContentSection);
    } catch (err: any) {
      hideLoader();
      toast.error("Failed to save!!");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      featureImages: prev.featureImages.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    setCurrentView("blog");
  }, []);

  const blogPost = {
    title: "Crafting the Perfect Dating Profile: Your Guide to More Matches",
    featuredImage:
      "https://images.unsplash.com/photo-1593642532400-2682810df593?w=1200&h=400&fit=crop",
    content: [
      "While online dating opens doors to great connections, it's important to stay alert. In the world of online dating, your profile is your first impression—and often your only chance to spark interest. With just a few photos and lines of text, you're telling a story about who you are and why someone should swipe right. A well-crafted dating profile doesn't just attract matches; it attracts the right ones.",
      "While online dating opens doors to great connections, it's important to stay alert. In the world of online dating, your profile is your first impression—and often your only chance to spark interest. With just a few photos and lines of text, you're telling a story about who you are and why someone should swipe right. A well-crafted dating profile doesn't just attract matches; it attracts the right ones.",
    ],
    author: {
      name: "Lana Steiner",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
      date: "18 Jan 2022",
    },
  };

  if (currentView === "blog") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex gap-8">
                <button
                  onClick={() => {
                    setActiveTab("Content Management");
                    setCurrentView("blog");
                  }}
                  className={`pb-1 text-sm font-medium transition-colors ${activeTab === "Content Management"
                    ? "text-gray-400"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Content Management
                </button>{" "}
                |
                <button
                  onClick={() => {
                    setActiveTab("Overview");
                    setCurrentView("blog");
                  }}
                  className={`pb-1 text-sm font-semibold transition-colors ${activeTab === "Overview"
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Overview
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={() => {
                  setCurrentView("create");
                }}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Create BlogSpot
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onSelect={(post) => {
                    setCurrentView("details");
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  if (currentView === "createnew") {
    return (
      <>
        {/* Modal */}
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Create New BlogSpot
              </h2>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Blog Title */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title here"
                className="w-full px-4 py-3 bg-red-50 rounded-lg  text-gray-600 border-0 focus:ring-2  focus:ring-red-500 outline-none text-base placeholder-gray-400"
              />
            </div>

            {/* Short Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Short Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="A brief hook to catch attention..."
                rows={3}
                className="w-full px-4 py-3 bg-red-50 text-gray-600 rounded-lg border-0 focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder-gray-400 resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Content."
                rows={6}
                className="w-full text-gray-500 px-4 py-3 bg-red-50 rounded-lg border-0 focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder-gray-400 resize-none"
              />
            </div>

            {/* Feature Images */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Feature Images
              </label>
              <div
                className={`border-2 border-dashed rounded-lg py-12 text-center transition-colors ${dragActive
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white hover:border-red-500 hover:bg-gray-50"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: JPEG, PNG, WEBP
                  </p>
                </label>
              </div>
              {formData.featureImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {formData.featureImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
            >
              Publish Post
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentView === "details") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => {
                    setActiveTab("Content Management");
                    setCurrentView("blog");
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Content Management
                </button>

                <button
                  onClick={() => {
                    setActiveTab("Details");
                    setCurrentView("details");
                  }}
                  className="text-sm font-semibold text-gray-900 transition-colors"
                >
                  Details
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={() => {
                  setCurrentView("create");
                }}
                className="px-6 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Create BlogSpot
              </button>
            </div>
          </div>

          {/* Blog Post Content */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Featured Image */}
              <div className="w-full h-[400px] overflow-hidden">
                <img
                  src={blogPost.featuredImage}
                  alt={blogPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="px-12 py-10">
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                  {blogPost.title}
                </h1>

                {/* Body Text */}
                <div className="space-y-6">
                  {blogPost.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-gray-600 text-base leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-10 pt-8 border-t border-gray-200">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={blogPost.author.avatar || "/default-avatar.png"}
                      alt={blogPost.author.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {blogPost.author.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {blogPost.author.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "create") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="text-red-600 font-semibold cursor-pointer hover:underline">
              User
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Add User</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
        </div>

        {/* Form Container */}
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder=""
                  />
                </div>

                {/* Gender and Date of Birth Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="">Select Option</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfBirth"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                  </div>
                </div>

                {/* Email and Password Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="steve@moyomoja.africa"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      ></button>
                    </div>
                  </div>
                </div>

                {/* Country Code and Mobile Number Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Country Code Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Code
                    </label>
                    <div className="relative">
                      <select
                        name="countryCode"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="+254">+254</option>
                        <option value="+255">+255</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="7XXXXXXXX"
                      maxLength={9}
                    />
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="operations_admin">Operations Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Role Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <div className="relative">
                    <select
                      name="roleName"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="">Select Option</option>
                      <option value="CEO">CEO</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    className="hidden"
                    id="profile-upload"
                  />
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4">
                        <Upload
                          className="w-12 h-12 text-red-500 mx-auto"
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPEG, PNG, SVG
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="px-8 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default MoyoMojaCMS;
