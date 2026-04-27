interface TabNavigationProps {
  activeTab: "Report" | "Suspend";
  onTabChange: (tab: "Report" | "Suspend") => void;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  return (
    <div className="flex gap-8 border-b border-gray-200">
      <button
        onClick={() => onTabChange("Report")}
        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
          activeTab === "Report"
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
        onClick={() => onTabChange("Suspend")}
        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
          activeTab === "Suspend"
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
  );
};
