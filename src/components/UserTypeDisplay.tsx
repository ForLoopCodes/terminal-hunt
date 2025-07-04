"use client";

interface UserTypeDisplayProps {
  userType: string;
  companyName?: string;
  isVerified?: boolean;
  className?: string;
}

export function UserTypeDisplay({
  userType,
  companyName,
  isVerified = false,
  className = "",
}: UserTypeDisplayProps) {
  const getUserTypeInfo = (type: string) => {
    switch (type) {
      case "company":
        return {
          icon: "🏢",
          label: "Company",
          color: "text-blue-400",
        };
      case "organization":
        return {
          icon: "🏛️",
          label: "Organization",
          color: "text-green-400",
        };
      case "open_source_project":
        return {
          icon: "🌟",
          label: "Open Source Project",
          color: "text-purple-400",
        };
      case "individual":
      default:
        return {
          icon: "👤",
          label: "Individual",
          color: "text-gray-400",
        };
    }
  };

  const typeInfo = getUserTypeInfo(userType);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm">{typeInfo.icon}</span>
      <span className={`text-xs ${typeInfo.color}`}>
        {companyName || typeInfo.label}
      </span>
      {isVerified && (
        <span className="text-blue-400" title="Verified Account">
          ✓
        </span>
      )}
    </div>
  );
}
