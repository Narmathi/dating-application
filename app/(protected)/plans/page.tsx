"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
// import { AgGridReact } from "ag-grid-react";
// import { ColDef } from "ag-grid-community";
import toast from "react-hot-toast";
import { useLoader } from "@/app/store/useLoader";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type PremiumFeatures = {
  unlimitedSwipe: boolean;
  seeLikes: boolean;
  rewind: boolean;
  travelMode: boolean;
  ghostMode: boolean;
};

type OneTimeFeatures = {
  rewind: boolean;
  superLike: boolean;
  boost: boolean;
};

type PremiumPlan = {
  id: number;
  planNameEn: string;
  planNameSw: string;
  duration: string;
  price: string;
  planType: string;
  features: PremiumFeatures;
  currency: string;
  type: string;
  durationTable: string;
  country: string;
};

type OneTimePlan = {
  id: number;
  planNameEn: string;
  planNameSw: string;
  duration: string;
  price: string;
  planType: string;
  selectedFeature: string;
  durationTable: string;
  currency: string;
  type: string;
  features: OneTimeFeatures;
  country: string;
};

type PremiumFormSection = {
  id: number;
  planNameEn: string;
  planNameSw: string;
  type: string;
  planType: string;
  duration: string;
  price: string;
  features: PremiumFeatures;
  currency: string;
  country: string;
};

type OneTimeFormSection = {
  id: number;
  planNameEn: string;
  planNameSw: string;
  duration: string;
  price: string;
  planType: string;
  selectedFeature: string;
  durationTable: string;
  currency: string;
  type: string;
  features: OneTimeFeatures;
  country: string;
};

const FEATURE_CONFIG: Record<
  string,
  { planType: string; durations: string[] }
> = {
  rewind: {
    planType: "credit",
    durations: ["1", "5", "7"],
  },
  superLike: {
    planType: "credit",
    durations: ["1", "5", "7"],
  },
  boost: {
    planType: "mins",
    durations: ["30", "60", "90"],
  },
};

const durationOptions = {
  week: [
    { value: "1_week", label: "1 Week" },
    { value: "2_week", label: "2 Weeks" },
  ],
  month: [
    { value: "1_month", label: "1 Month" },
    { value: "3_month", label: "3 Months" },
    { value: "6_month", label: "6 Months" },
  ],
};

const Plan = () => {
  const auth = useAuth();
  const dispPlan = auth?.role === "ops_user" ? false : true;
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState("list"); // 'list', 'addPremium', 'addOneTime', 'editPremium', 'editOneTime'
  const [activeTab, setActiveTab] = useState("premium");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showLoader, hideLoader } = useLoader();

  const initialPremiumForm = [
    {
      id: Date.now(),
      planNameEn: "",
      planNameSw: "",
      planType: "",
      duration: "",
      price: "",
      features: {
        unlimitedSwipe: false,
        seeLikes: false,
        rewind: false,
        travelMode: false,
        ghostMode: false,
      },
      currency: "",
      type: "premium",
      durationTable: "",
      country: "",
    },
  ];

  // Stored plans (mock database)
  const [premiumPlans, setPremiumPlans] =
    useState<PremiumPlan[]>(initialPremiumForm);

  const [oneTimePlans, setOneTimePlans] = useState<OneTimePlan[]>([]);

  // Form sections for adding multiple forms at once
  const [premiumFormSections, setPremiumFormSections] = useState<
    PremiumFormSection[]
  >([]);

  const [oneTimeFormSections, setOneTimeFormSections] = useState<
    OneTimeFormSection[]
  >([]);

  const addPremiumFormSection = () => {
    setPremiumFormSections([
      ...premiumFormSections,
      {
        id: Date.now(),
        planNameSw: "",
        planNameEn: "",
        planType: "",
        duration: "",
        price: "",
        features: {
          unlimitedSwipe: false,
          seeLikes: false,
          rewind: false,
          travelMode: false,
          ghostMode: false,
        },
        currency: "",
        country: "",
        type: "",
      },
    ]);
  };

  const addOneTimeFormSection = () => {
    setOneTimeFormSections([
      ...oneTimeFormSections,
      {
        id: Date.now(),
        planNameEn: "",
        planNameSw: "",

        planType: "",
        duration: "",
        price: "",
        selectedFeature: "",
        durationTable: "",
        type: "",
        features: {
          boost: false,
          superLike: false,
          rewind: false,
        },
        currency: "",
        country: "",
      },
    ]);
  };

  const removePremiumFormSection = (id: number) => {
    if (premiumFormSections.length > 1) {
      setPremiumFormSections(
        premiumFormSections.filter((section) => section.id !== id),
      );
    }
  };

  const removeOneTimeFormSection = (id: number) => {
    if (oneTimeFormSections.length > 1) {
      setOneTimeFormSections(
        oneTimeFormSections.filter((section) => section.id !== id),
      );
    }
  };

  const updatePremiumFormSection = (
    id: number,
    field: keyof PremiumFormSection,
    value: any,
  ) => {
    setPremiumFormSections((sections) =>
      sections.map((section) => {
        if (section.id !== id) return section;

        if (field === "planType") {
          return {
            ...section,
            planType: value,
            duration: "", // reset duration
          };
        }

        return { ...section, [field]: value };
      }),
    );
  };

  const updateOneTimeFormSection = (
    id: number,
    field: keyof OneTimeFormSection,
    value: any,
  ) => {
    setOneTimeFormSections((sections) =>
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    );
  };

  const togglePremiumFeature = (
    sectionId: number,
    feature: keyof PremiumFeatures,
  ) => {
    setPremiumFormSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              features: {
                ...section.features,
                [feature]: !section.features[feature],
              },
            }
          : section,
      ),
    );
  };

  const savePremiumForm = async (section: PremiumFormSection) => {
    if (!section.country) {
      toast.error("Please select country!!");
      return;
    }

    if (!section.planNameEn || !section.planNameSw) {
      toast.error("Please fill plan name!!");
      return;
    }

    const hasAnyFeature = Object.values(section.features).some(
      (value) => value === true,
    );
    if (!hasAnyFeature) {
      toast.error("Please select at least one feature!!");
      return;
    }

    // Other validations
    if (!section.planType) {
      toast.error("Please select plan type!!");
      return;
    }

    if (!section.duration) {
      toast.error("Please select duration!!");
      return;
    }

    if (!section.currency) {
      toast.error("Please select currency!!");
      return;
    }

    if (section.country && section.currency) {
      const currencyMap = {
        kenya: "KES",
        tanzania: "TZS",
      } as any;

      const expectedCurrency = currencyMap[section.country];

      if (section.currency !== expectedCurrency) {
        toast.error("Please select currency based on country!");
        return;
      }
    }

    if (!section.price) {
      toast.error("Please enter price!!");
      return;
    }
    if (isNaN(Number(section.price)) || Number(section.price) <= 0) {
      toast.error("Please enter a valid price!!");
      return;
    }

    const rawDuration = section.duration;
    const [valueStr, unit] = rawDuration.split("_");
    const durationValue: number = Number(valueStr);

    const requestData: any = {
      type: "premium",
      plan_name_en: section.planNameEn,
      plan_name_sw: section.planNameSw,
      description: "",
      duration: {
        unit: unit,
        value: durationValue,
      },
      features: section.features,
      pricing: section.price,
      country: section.country,
      currency: section.currency,
    };

    try {
      showLoader();

      const res = await fetch("/api/plans/premium-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) {
        hideLoader();

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }

        if (res.status === 500) {
          toast.error("Server error. Please try again later.");
          return;
        }
        toast.error(data.message || "Something went wrong");
        return;
      }
      hideLoader();
      toast.success("Premium plan saved successfully!");
      const isLastSection = premiumFormSections.length === 1;

      removePremiumFormSection(section.id);

      if (isLastSection) {
        setCurrentView("list");
        setActiveTab("premium");
      }
    } catch (err: any) {
      toast.error("Failed to save plan");
    }
  };

  const fetchPremiumPlans = async () => {
    const res = await fetch("/api/plans/premium-plans", {
      method: "GET",
    });

    const data = await res.json();
    if (res.ok) {
      setPremiumPlans(data.plans);
    } else {
      toast.error("Failed to load plans");
    }
  };

  const fetchoneTimePlans = async () => {
    const res = await fetch("/api/plans/onetime-plans", {
      method: "GET",
    });

    const data = await res.json();
    if (res.ok) {
      setOneTimePlans(data.plans);
    } else {
      toast.error("Failed to load plans");
    }
  };

  const handleFeatureChange = (id: number, feature: string) => {
    const config = FEATURE_CONFIG[feature];

    updateOneTimeFormSection(id, "selectedFeature", feature);
    updateOneTimeFormSection(id, "planType", config?.planType || "");
    updateOneTimeFormSection(id, "duration", "");
  };

  useEffect(() => {
    fetchPremiumPlans();
    fetchoneTimePlans();
  }, [currentView]);

  const saveOneTimeForm = async (section: OneTimeFormSection) => {
    if (!section.country) {
      toast.error("Please select at least one country!!");
      return;
    }
    if (!section.planNameEn || !section.planNameSw) {
      toast.error("Please fill plan name!!");
      return;
    }

    if (!section.selectedFeature) {
      toast.error("Please select at least one feature!!");
      return;
    }

    if (!section.duration) {
      toast.error("Please select duration!!");
      return;
    }

    if (!section.currency) {
      toast.error("Please select currency!!");
      return;
    }

    if (section.country && section.currency) {
      const currencyMap = {
        kenya: "KES",
        tanzania: "TZS",
      } as any;

      const expectedCurrency = currencyMap[section.country];

      if (section.currency !== expectedCurrency) {
        toast.error("Please select currency based on country!");
        return;
      }
    }

    if (!section.price) {
      toast.error("Please enter price!!");
      return;
    }

    if (isNaN(Number(section.price)) || Number(section.price) <= 0) {
      toast.error("Please enter a valid price!!");
      return;
    }

    const hasAnyFeature = Object.values(section.features).some(
      (value) => value === true,
    );

    const rawDuration = section.duration;
    const [valueStr, unit] = rawDuration.split("_");
    const durationValue: number = Number(valueStr);

    const requestData: any = {
      type: "one_time",
      plan_name_en: section.planNameEn,
      plan_name_sw: section.planNameSw,
      description: "",
      duration: {
        unit: section.planType,
        value: section.duration,
      },
      features: section.selectedFeature,
      pricing: section.price,
      currency: section.currency,
      country: section.country,
    };

    try {
      showLoader();

      const res = await fetch("/api/plans/onetime-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) {
        hideLoader();

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }

        if (res.status === 500) {
          toast.error("Server error. Please try again later.");
          return;
        }
        toast.error(data.message || "Something went wrong");
        return;
      }
      hideLoader();
      toast.success("OneTime plan saved successfully!");
      removeOneTimeFormSection(section.id);

      const isLastSection = oneTimeFormSections.length === 1;

      removeOneTimeFormSection(section.id);

      if (isLastSection) {
        setCurrentView("list");
        setActiveTab("onetime");
      }
    } catch (err: any) {
      toast.error("Failed to save plan");
    }
  };

  // const cancelPremiumForm = (id: number) => {
  //   removePremiumFormSection(id);

  //   // If no forms left, go back to list
  //   if (premiumFormSections.length === 1) {
  //     setCurrentView("list");
  //     setActiveTab("premium");
  //   }
  // };

  // const cancelOneTimeForm = (id: number) => {
  //   removeOneTimeFormSection(id);

  //   // If no forms left, go back to list
  //   if (oneTimeFormSections.length === 1) {
  //     setCurrentView("list");
  //     setActiveTab("onetime");
  //   }
  // };

  // const editPremiumPlan = (plan: PremiumPlan) => {
  //   console.log(plan.id);
  //   setEditingId(plan.id);
  //   setPremiumFormSections([
  //     {
  //       id: plan.id,
  //       planNameEn: plan.planNameEn,
  //       planNameSw: plan.planNameSw,
  //       planType: plan.planType,
  //       duration: plan.duration,
  //       price: plan.price,
  //       features: plan.features,
  //       currency: plan.currency,
  //       type: plan.type,
  //     },
  //   ]);
  //   setCurrentView("editPremium");
  // };

  // const editOneTimePlan = (plan: OneTimePlan) => {
  //   setEditingId(plan.id);
  //   setOneTimeFormSections([
  //     {
  //       id: plan.id,
  //       name: plan.name,
  //       planType: plan.planType,
  //       duration: plan.duration,
  //       price: plan.price,
  //       selectedFeature: plan.selectedFeature,
  //     },
  //   ]);
  //   setCurrentView("editOneTime");
  // };

  const updatePremiumPlan = async (section: PremiumFormSection) => {
    if (!section.planNameEn || !section.planNameSw) {
      toast.error("Please fill plan name!!");
      return;
    }

    const hasAnyFeature = Object.values(section.features).some(
      (value) => value === true,
    );
    if (!hasAnyFeature) {
      toast.error("Please select at least one feature!!");
      return;
    }

    // Other validations
    if (!section.planType) {
      toast.error("Please select plan type!!");
      return;
    }

    if (!section.duration) {
      toast.error("Please select duration!!");
      return;
    }

    if (!section.price) {
      toast.error("Please enter price!!");
      return;
    }
    if (isNaN(Number(section.price)) || Number(section.price) <= 0) {
      toast.error("Please enter a valid price!!");
      return;
    }

    const rawDuration = section.duration;
    const [valueStr, unit] = rawDuration.split("_");
    const durationValue: number = Number(valueStr);

    const requestData: any = {
      id: section.id,
      type: "premium",
      plan_name_en: section.planNameEn,
      plan_name_sw: section.planNameSw,
      description: "",
      duration: {
        unit: unit,
        value: durationValue,
      },
      features: section.features,
      pricing: section.price,
    };

    try {
      showLoader();

      const res = await fetch("/api/plans/premium-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (!res.ok) {
        hideLoader();

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }

        if (res.status === 500) {
          toast.error("Server error. Please try again later.");
          return;
        }
        toast.error(data.message || "Something went wrong");
        return;
      }
      hideLoader();
      toast.success("Premium plan saved successfully!");
      removePremiumFormSection(section.id);
    } catch (err: any) {
      toast.error("Failed to save plan");
    }
  };

  const updateOneTimePlan = (section: OneTimeFormSection) => {
    if (
      !section.planNameEn ||
      !section.planType ||
      !section.duration ||
      !section.price ||
      !section.selectedFeature
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setOneTimePlans(
      oneTimePlans.map((plan) =>
        plan.id === editingId
          ? {
              ...plan,
              planNameEn: section.planNameEn,
              duration: section.duration,
              price: section.price,
              planType: section.planType,
              selectedFeature: section.selectedFeature,
            }
          : plan,
      ),
    );

    alert("One-time plan updated successfully!");
    setCurrentView("list");
    setActiveTab("onetime");
    setEditingId(null);
  };

  const deletePlan = (id: number, type: "premium" | "onetime") => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      if (type === "premium") {
        setPremiumPlans(premiumPlans.filter((plan) => plan.id !== id));
      } else {
        setOneTimePlans(oneTimePlans.filter((plan) => plan.id !== id));
      }
      alert("Plan deleted successfully!");
    }
  };

  const getBreadcrumb = () => {
    if (currentView === "addPremium")
      return [
        { label: "Plan", onClick: () => setCurrentView("list") },
        {
          label: "Premium Plan",
          onClick: () => {
            setCurrentView("list");
            setActiveTab("premium");
          },
        },
        { label: "Add Premium Plan", onClick: null },
      ];
    if (currentView === "editPremium")
      return [
        { label: "Plan", onClick: () => setCurrentView("list") },
        {
          label: "Premium Plan",
          onClick: () => {
            setCurrentView("list");
            setActiveTab("premium");
          },
        },
        { label: "Edit Premium Plan", onClick: null },
      ];
    if (currentView === "addOneTime")
      return [
        { label: "Plan", onClick: () => setCurrentView("list") },
        {
          label: "One-Time Payments",
          onClick: () => {
            setCurrentView("list");
            setActiveTab("onetime");
          },
        },
        { label: "Add One-Time Payments", onClick: null },
      ];
    if (currentView === "editOneTime")
      return [
        { label: "Plan", onClick: () => setCurrentView("list") },
        {
          label: "One-Time Payments",
          onClick: () => {
            setCurrentView("list");
            setActiveTab("onetime");
          },
        },
        { label: "Edit One-Time Payment", onClick: null },
      ];
    return [];
  };

  const getFeaturesList = (features: PremiumFeatures) => {
    const featureNames = [];
    if (features.unlimitedSwipe) featureNames.push("Unlimited Swipes");
    if (features.seeLikes) featureNames.push("See Likes");
    if (features.rewind) featureNames.push("Rewind");
    if (features.travelMode) featureNames.push("Travel Mode");
    if (features.ghostMode) featureNames.push("Ghost Mode");
    return featureNames.join(", ") || "No features selected";
  };

  const getFeaturesListOneTime = (features: OneTimeFeatures) => {
    const featureNames = [];
    if (features.rewind) featureNames.push("Rewind");
    if (features.superLike) featureNames.push("Super like");
    if (features.boost) featureNames.push("Boost");
    return featureNames.join(", ") || "No features selected";
  };

  const currentPlans = activeTab === "premium" ? premiumPlans : oneTimePlans;

  // List View
  if (currentView === "list") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-8">
              <button className="text-gray-400 text-sm font-medium hover:text-gray-600">
                Plan
              </button>
              <button className="text-gray-900 text-sm font-medium">
                {activeTab === "premium" ? "Premium Plan" : "One-Time Payments"}
              </button>
            </div>

            <div className="flex gap-4">
              {activeTab === "premium" && dispPlan ? (
                <button
                  onClick={() => {
                    setPremiumFormSections([
                      {
                        id: Date.now(),
                        planNameEn: "",
                        planNameSw: "",
                        planType: "",
                        duration: "",
                        price: "",
                        features: {
                          unlimitedSwipe: false,
                          seeLikes: false,
                          rewind: false,
                          travelMode: false,
                          ghostMode: false,
                        },
                        currency: "",
                        country: "",
                        type: "premium",
                      },
                    ]);
                    setCurrentView("addPremium");
                  }}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Add Premium Plan
                </button>
              ) : activeTab === "onetime" && dispPlan ? (
                <button
                  onClick={() => {
                    setOneTimeFormSections([
                      {
                        id: Date.now(),
                        planNameEn: "",
                        planNameSw: "",
                        planType: "",
                        duration: "",
                        price: "",
                        selectedFeature: "",
                        features: {
                          boost: false,
                          superLike: false,
                          rewind: false,
                        },
                        durationTable: "",
                        currency: "",
                        type: "premium",
                        country: "",
                      },
                    ]);
                    setCurrentView("addOneTime");
                  }}
                  className="px-6 py-2.5 border border-red-500 bg-red-500 text-white rounded-lg  hover:bg-red-50- transition-colors font-medium"
                >
                  Add One-Time Payment
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("premium")}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === "premium"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Premium Plan
              {activeTab === "premium" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("onetime")}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === "onetime"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              One-Time Payments
              {activeTab === "onetime" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Country
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Plan Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Duration
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Features
                  </th>
                  {/* <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Action
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {currentPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {plan.country}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {plan.planNameEn}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {plan.durationTable}
                    </td>
                    <td className="py-4 px-6 text-sm text-red-500 font-medium">
                      {plan.price}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {activeTab === "premium"
                        ? getFeaturesList((plan as PremiumPlan).features)
                        : getFeaturesListOneTime(
                            (plan as OneTimePlan).features,
                          )}
                    </td>
                    {/* <td className="py-4 px-6">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (activeTab === "premium") {
                              editPremiumPlan(plan as PremiumPlan);
                            } else {
                              editOneTimePlan(plan as OneTimePlan);
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() =>
                            deletePlan(
                              plan.id,
                              activeTab as "premium" | "onetime"
                            )
                          }
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Add Premium Plan View
  if (currentView === "addPremium" || currentView === "editPremium") {
    const isEditMode = currentView === "editPremium";
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-full mx-auto">
          <div className="flex gap-2 text-sm text-gray-500 mb-6">
            {getBreadcrumb().map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-2">/</span>}
                <span
                  className={`${
                    crumb.onClick
                      ? "cursor-pointer hover:text-gray-700"
                      : "text-gray-900"
                  }`}
                  onClick={crumb.onClick || undefined}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              {isEditMode ? "Edit Premium Plan" : "Add Premium Plan"}
            </h1>
            {!isEditMode && (
              <button
                onClick={addPremiumFormSection}
                className="text-red-500 font-medium flex items-center gap-1 hover:text-red-600"
              >
                <Plus className="w-5 h-5" />
                Add Feature
              </button>
            )}
          </div>

          <div className="space-y-6">
            {premiumFormSections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? "Plan Details" : `Plan ${sectionIndex + 1}`}
                  </h2>
                  {!isEditMode && premiumFormSections.length > 1 && (
                    <button
                      onClick={() => removePremiumFormSection(section.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="grid grid-cols-2- gap-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          value={section.country}
                          onChange={(e) =>
                            updatePremiumFormSection(
                              section.id,
                              "country",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-400">
                            Select
                          </option>
                          <option value="kenya" className="text-gray-900">
                            Kenya
                          </option>
                          <option value="tanzania" className="text-gray-900">
                            Tanzania
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features - Full Width Right Column */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.features.unlimitedSwipe}
                          onChange={() =>
                            togglePremiumFeature(section.id, "unlimitedSwipe")
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          Unlimited Swipe
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.features.seeLikes}
                          onChange={() =>
                            togglePremiumFeature(section.id, "seeLikes")
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">See Likes</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.features.rewind}
                          onChange={() =>
                            togglePremiumFeature(section.id, "rewind")
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Rewind</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.features.travelMode}
                          onChange={() =>
                            togglePremiumFeature(section.id, "travelMode")
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          Travel Mode
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.features.ghostMode}
                          onChange={() =>
                            togglePremiumFeature(section.id, "ghostMode")
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          Ghost Mode
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-4 gap-x-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Name (En)
                      </label>
                      <input
                        type="text"
                        value={section.planNameEn}
                        onChange={(e) =>
                          updatePremiumFormSection(
                            section.id,
                            "planNameEn",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter plan name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Name (SW)
                      </label>
                      <input
                        type="text"
                        value={section.planNameSw}
                        onChange={(e) =>
                          updatePremiumFormSection(
                            section.id,
                            "planNameSw",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Jina la mpango"
                      />
                    </div>
                  </div>

                  {/* Plan Type and Duration - Half Width Each on Same Row */}
                  <div className="col-span-2 grid grid-cols-4 gap-x-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Type
                      </label>
                      <div className="relative">
                        <select
                          value={section.planType}
                          onChange={(e) =>
                            updatePremiumFormSection(
                              section.id,
                              "planType",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-400">
                            Select
                          </option>
                          <option value="week" className="text-gray-900">
                            Week
                          </option>
                          <option value="month" className="text-gray-900">
                            Month
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <div className="relative">
                        <select
                          value={section.duration}
                          onChange={(e) =>
                            updatePremiumFormSection(
                              section.id,
                              "duration",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-400">
                            Select Duration
                          </option>
                          {section.planType &&
                            durationOptions[
                              section.planType as "week" | "month"
                            ]?.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                className="text-gray-400"
                              >
                                {option.label}
                              </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price - Full Width */}
                  <div className="col-span-2 grid grid-cols-4 gap-x-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <div className="relative">
                        <select
                          value={section.currency}
                          onChange={(e) =>
                            updatePremiumFormSection(
                              section.id,
                              "currency",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-gray-400">
                            Select
                          </option>
                          <option value="KES" className="text-gray-900">
                            KES
                          </option>
                          <option value="TZS" className="text-gray-900">
                            TZS
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="text"
                        value={section.price}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "" || /^\d+$/.test(value)) {
                            updatePremiumFormSection(
                              section.id,
                              "price",
                              value,
                            );
                          }
                        }}
                        placeholder=""
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 grid   gap-x-8"></div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  {/* <button
                    onClick={() => cancelPremiumForm(section.id)}
                    className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button> */}
                  <button
                    onClick={() =>
                      isEditMode
                        ? updatePremiumPlan(section)
                        : savePremiumForm(section)
                    }
                    className="px-8 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Add One-Time Payment View
  if (currentView === "addOneTime" || currentView === "editOneTime") {
    const isEditMode = currentView === "editOneTime";
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-full mx-auto">
          <div className="flex gap-2 text-sm text-gray-500 mb-6">
            {getBreadcrumb().map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="mx-2">/</span>}
                <span
                  className={`${
                    crumb.onClick
                      ? "cursor-pointer hover:text-gray-700"
                      : "text-gray-900"
                  }`}
                  onClick={crumb.onClick || undefined}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              {isEditMode ? "Edit One-Time Payment" : "Add One-Time Payments"}
            </h1>
            {!isEditMode && (
              <button
                onClick={addOneTimeFormSection}
                className="text-red-500 font-medium flex items-center gap-1 hover:text-red-600"
              >
                <Plus className="w-5 h-5" />
                Add Feature
              </button>
            )}
          </div>

          <div className="space-y-6">
            {oneTimeFormSections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? "Plan Details" : `Plan ${sectionIndex + 1}`}
                  </h2>
                  {!isEditMode && oneTimeFormSections.length > 1 && (
                    <button
                      onClick={() => removeOneTimeFormSection(section.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="grid grid-cols-2- gap-x-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={section.country}
                      onChange={(e) =>
                        updateOneTimeFormSection(
                          section.id,
                          "country",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="" className="text-gray-400">
                        Select
                      </option>
                      <option value="kenya" className="text-gray-900">
                        Kenya
                      </option>
                      <option value="tanzania" className="text-gray-900">
                        Tanzania
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <select
                      value={section.selectedFeature}
                      onChange={(e) =>
                        handleFeatureChange(section.id, e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Feature</option>
                      <option value="rewind">Rewind</option>
                      <option value="superLike">Super Like</option>
                      <option value="boost">Boost</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Plan Name (En)
                      </label>
                      <input
                        type="text"
                        value={section.planNameEn}
                        onChange={(e) =>
                          updateOneTimeFormSection(
                            section.id,
                            "planNameEn",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3  bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter plan name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Name (Sw)
                      </label>
                      <input
                        type="text"
                        value={section.planNameSw}
                        onChange={(e) =>
                          updateOneTimeFormSection(
                            section.id,
                            "planNameSw",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter plan name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4"></div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Type
                      </label>
                      <select
                        value={section.planType}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-200 rounded-lg"
                      >
                        <option value={section.planType || ""}>
                          {section.planType || "Select"}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        value={section.duration}
                        onChange={(e) =>
                          updateOneTimeFormSection(
                            section.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select</option>

                        {FEATURE_CONFIG[section.selectedFeature]?.durations.map(
                          (d: any) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4"></div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={section.currency}
                        onChange={(e) =>
                          updateOneTimeFormSection(
                            section.id,
                            "currency",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="" className="text-gray-400">
                          Select
                        </option>
                        <option value="KES" className="text-gray-900">
                          KES
                        </option>
                        <option value="TZS" className="text-gray-900">
                          TZS
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="text"
                        value={section.price}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "" || /^\d+$/.test(value)) {
                            updateOneTimeFormSection(
                              section.id,
                              "price",
                              value,
                            );
                          }
                        }}
                        placeholder=""
                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  {/* <button
                    onClick={() => cancelOneTimeForm(section.id)}
                    className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button> */}
                  <button
                    onClick={() =>
                      isEditMode
                        ? updateOneTimePlan(section)
                        : saveOneTimeForm(section)
                    }
                    className="px-8 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Plan;
