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

import { usePathname, useSearchParams } from "next/navigation";

import { useLoader } from "@/app/store/useLoader";
import toast from "react-hot-toast";

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
  authorImage: File | null;
  language: string;
  author: string;
}

type ImageField = "featureImages" | "authorImage";

type BlogPostCardProps = {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
};

type CreateBlogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const initialContentSection: FormData = {
  title: "",
  summary: "",
  content: "",
  featureImages: [],
  language: "",
  author: "",
  authorImage: null,
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
          data-id={post.id}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        {post?.author?.name && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={post.author.avatar || "/default-avatar.png"}
              alt={post.author.name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.currentTarget.src = "/default-avatar.png";
              }}
            />
            <span className="text-sm text-gray-500 font-medium">
              {post.author.name}
            </span>
          </div>
        )}
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

// Blog Modal Component
const CreateBlogModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateBlogModalProps) => {
  const [formData, setFormData] = useState<FormData>(initialContentSection);
  const { showLoader, hideLoader } = useLoader();

  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    // ---- TITLE (60 chars) ----
    if (name === "title") {
      const trimmed = value.slice(0, 60);

      setFormData((prev) => ({ ...prev, title: trimmed }));
      return;
    }

    // ---- SUMMARY (1500 words) ----
    if (name === "summary") {
      const words = value.trim().split(/\s+/);

      const limited =
        words.length > 1500 ? words.slice(0, 1500).join(" ") : value;

      setFormData((prev) => ({ ...prev, summary: limited }));
      return;
    }

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

  const handleDrop = (e: React.DragEvent, field: ImageField) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files, field);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ImageField,
  ) => {
    if (e.target.files) {
      handleFiles(e.target.files, field);
    }
  };

  const handleFiles = (files: FileList, field: ImageField) => {
    const fileArray = Array.from(files).filter(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/svg+xml",
    );

    if (!fileArray.length) return;

    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "featureImages"
          ? [fileArray[0]] // array
          : fileArray[0], // single file
    }));
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

  const validateAuthorImage = (img: File | null): boolean => {
    if (!img) {
      toast.error("Please select an image!!");
      return false;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(img.type)) {
      toast.error("Invalid image format. Only JPG, PNG, WEBP allowed.");
      return false;
    }

    if (img.size > MAX_SIZE) {
      toast.error("Image size must be less than 2MB");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!formData.language) {
      toast.error("Please select language!!");
      return;
    }

    if (!formData.title) {
      toast.error("Please fill title!!");
      return;
    }
    if (formData.title.length > 60) {
      toast.error("Title must be under 60 characters");
      return;
    }

    if (!formData.summary) {
      toast.error("Please fill summary!!");
      return;
    }

    const summaryWords = formData.summary.trim().split(/\s+/).length;

    if (summaryWords > 1500) {
      toast.error("Summary must be under 1500 words");
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
    requestData.append("language", formData.language);
    requestData.append("author", formData.author);
    if (formData.authorImage && validateAuthorImage(formData.authorImage)) {
      requestData.append("author_image", formData.authorImage);
    }

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

      onSuccess();
    } catch (err: any) {
      hideLoader();
      toast.error("Failed to save!!");
    }
  };

  if (!isOpen) return null;

  const removeImage = (field: ImageField, index?: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "featureImages"
          ? prev.featureImages.filter((_, i) => i !== index)
          : null,
    }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

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
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Language
            </label>

            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-red-50 rounded-lg text-gray-600 border-0 focus:ring-2 focus:ring-red-500 outline-none text-base"
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

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
            <p
              className={`text-xs mt-1 ${formData.title.length > 55 ? "text-red-500" : "text-gray-400"
                }`}
            >
              {formData.title.length}/60 characters
            </p>
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
            <p className="text-xs text-gray-400 mt-1">
              {formData.summary.trim()
                ? formData.summary.trim().split(/\s+/).length
                : 0}
              /1500 words
            </p>
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
              onDrop={(e) => handleDrop(e, "featureImages")}
            >
              <input
                type="file"
                id="file-upload"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={(e) => handleFileChange(e, "featureImages")}
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
                      onClick={() => removeImage("featureImages", index)}
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

          {/* Blog Title */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Author Name
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-red-50 rounded-lg  text-gray-600 border-0 focus:ring-2  focus:ring-red-500 outline-none text-base placeholder-gray-400"
            />
          </div>
          {/* Author Profile */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Author Profile Image
            </label>
            <div
              className={`border-2 border-dashed rounded-lg py-12 text-center transition-colors ${dragActive
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white hover:border-red-500 hover:bg-gray-50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, "authorImage")}
            >
              <input
                type="file"
                id="author-upload"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={(e) => handleFileChange(e, "authorImage")}
                className="hidden"
              />
              <label htmlFor="author-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: JPEG, PNG, WEBP
                </p>
              </label>
            </div>
            {formData.authorImage && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(formData.authorImage)}
                    alt="Author preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeImage("authorImage")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {formData.authorImage.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
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
};

// MainComponent
const MoyoMojaCMS = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const pathname = usePathname();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"blog" | "details">("blog");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<[] | null>(null);
  const [reloadUsers, setReloadUsers] = useState(false);

  const searchParams = useSearchParams();


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

      // toast.success(result.message);
      setPosts(result.data);
      setReloadUsers((prev) => !prev);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message);
    } finally {
    }
  };
  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (currentView === "blog") {
      fetchContent();
    }
  }, [currentView]);


  useEffect(() => {
    const viewFromUrl = searchParams.get("view") || "blog";
    if (viewFromUrl !== currentView) {
      setCurrentView(viewFromUrl as "blog" | "details");
    }
  }, [searchParams]);



  useEffect(() => {
    async function fetchUniqueDatas() {
      if (currentView === "details" && selectedPostId) {
        try {
          const response = await fetch(
            `/api/content/details?id=${selectedPostId}`,
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

          setSelectedPost(result.data);
        } catch (error: any) {
          console.error("Error fetching data:", error);
          toast.error(error.message);
        } finally {
        }
      }
    }

    fetchUniqueDatas();
  }, [currentView, selectedPostId]);

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
                    (setActiveTab("ContentManagement"), setCurrentView("blog"));
                  }}
                  className={`pb-1 text-sm font-medium transition-colors ${activeTab === "ContentManagement"
                    ? "text-gray-400"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  ContentManagement
                </button>
                <button
                  onClick={() => setActiveTab("Overview")}
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
                  setIsModalOpen(true);
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
              {posts?.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onSelect={(post) => {
                    setCurrentView("details");

                    setSelectedPostId(post.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Create Blog Modal */}
        <CreateBlogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchContent();
          }}
        />

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

  if (currentView === "details") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => {
                    setActiveTab("ContentManagement");
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


            </div>
          </div>

          {/* Blog Post Content */}

          {selectedPost &&
            selectedPost.map((data: any) => (
              <div key={data.id} className="max-w-5xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Featured Image */}
                  <div className="w-full h-[400px] overflow-hidden">
                    <img
                      src={data.featureImage}
                      alt={data.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="px-12 py-10">
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                      {data.title}
                    </h1>

                    {/* Body Text */}
                    <div className="space-y-6">
                      <p className="text-gray-600 text-base leading-relaxed">
                        {data.content}
                      </p>
                    </div>

                    {/* Author Info */}
                    {data?.author?.name && (
                      <div className="flex items-center gap-3 mt-10 pt-8 border-t border-gray-200">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={data.author.avatar || "/default-avatar.png"}
                            alt={data.author.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/default-avatar.png";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {data.author.name}
                          </p>
                          <p className="text-xs text-gray-500">{data.date}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
};

export default MoyoMojaCMS;
