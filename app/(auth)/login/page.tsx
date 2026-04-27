"use client";
import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Heart } from "lucide-react";
import loginbg from "@/app/assets/images/loginbg.png";
import bird from "@/app/assets/images/birds.png";
import logo from "@/app/assets/images/logo.png";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLoader } from "@/app/store/useLoader";

const MoyoMojaLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, serError] = useState("");

  const { showLoader, hideLoader } = useLoader();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    serError("");

    if (!email.trim()) {
      toast.error("Email is required!.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address!.");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required!.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    showLoader();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        hideLoader();
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Login successful! Redirecting..");

      hideLoader();
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      hideLoader();
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src={loginbg}
          alt="Pink background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="lg:w-6/12 relative z-10 min-h-[700px] lg:min-h-screen flex items-center justify-center p-6">
        <div className="relative w-full h-full mt-[-180px] ml-20">
          <Image
            src={bird}
            alt="Two birds in love sitting on a branch"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="lg:w-6/12 relative z-10  flex items-center justify-center   min-h-screen">
        <div className="w-full max-w-[550px] bg-[#FFF6F9] rounded-2xl p-10 lg:h-[600px]  md:h-[0] overflow-y-auto">
          <Image
            src={logo}
            alt="logo"
            className="object-contain  w-1/2 mx-auto"
            priority
          />

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 mt-10">
              Welcome
            </h2>
            <p className="text-gray-600 text-sm mt-4">
              Manage Connection Empower Experiences
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6" noValidate>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border-0 rounded-xl bg-[#FFEBEB] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    placeholder="jabari@gmail.com"
                    aria-label="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 border-0 rounded-xl bg-[#FFEBEB]  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                    placeholder="jabari@123"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-[#FFEBEB] rounded-r-xl transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-1/2  bg-[linear-gradient(90deg,#DD2432,#77131C)]  text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  Login Now
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MoyoMojaLogin;
