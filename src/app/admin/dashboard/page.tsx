"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string;
  reason: string;
  status: string;
  reporterUserTag: string;
  appId?: string;
  appName?: string;
  commentId?: string;
  commentContent?: string;
  userId?: string;
  userTag?: string;
  createdAt: string;
  adminNotes?: string;
}

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  totalUsers: number;
  suspendedUsers: number;
  totalApps: number;
  totalComments: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/auth/signin");
        return;
      }

      // Check admin status via API for reliability
      try {
        const response = await fetch("/api/admin/check-status");
        const data = await response.json();
        setIsAdmin(data.isAdmin);
        setAdminCheckLoading(false);

        if (!data.isAdmin) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setAdminCheckLoading(false);
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [session, status, router]);

  useEffect(() => {
    if (!adminCheckLoading && isAdmin) {
      fetchDashboardData();
    }
  }, [adminCheckLoading, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/admin/stats"),
      ]);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (
    reportId: string,
    action: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, adminNotes: notes }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const getReportTarget = (report: Report) => {
    if (report.appId) {
      return `App: ${report.appName}`;
    } else if (report.commentId) {
      return `Comment: ${report.commentContent?.substring(0, 50)}...`;
    } else if (report.userId) {
      return `User: @${report.userTag}`;
    }
    return "Unknown";
  };

  const getReportLink = (report: Report) => {
    if (report.appId) {
      return `/app/${report.appId}`;
    } else if (report.userId) {
      return `/profile/${report.userTag}`;
    }
    return "#";
  };

  if (adminCheckLoading || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="font-mono text-sm"
          style={{ color: "var(--color-text)" }}
        >
          {adminCheckLoading
            ? "checking_admin_access..."
            : "loading_admin_dashboard..."}
        </div>
      </div>
    );
  }

  const termhuntText = `
 ___                                   ___                      ___      
(   )                                 (   )                    (   )     
 | |_     .--.  ___ .-.  ___ .-. .-.   | | .-. ___  ___ ___ .-. | |_     
(   __)  /    \\(   )   \\(   )   '   \\  | |/   (   )(   |   )   (   __)   
 | |    |  .-. ;| ' .-. ;|  .-.  .-. ; |  .-. .| |  | | |  .-. .| |      
 | | ___|  | | ||  / (___) |  | |  | | | |  | || |  | | | |  | || | ___  
 | |(   )  |/  || |      | |  | |  | | | |  | || |  | | | |  | || |(   ) 
 | | | ||  ' _.'| |      | |  | |  | | | |  | || |  | | | |  | || | | |  
 | ' | ||  .'.-.| |      | |  | |  | | | |  | || |  ; ' | |  | || ' | |  
 ' \`-' ;'  \`-' /| |      | |  | |  | | | |  | |' \`-'  / | |  | |' \`-' ;  
  \`.__.  \`.__.'(___)    (___)(___)(___|___)(___)'.__.' (___)(___)\`.__.   
                  
  A D M I N   D A S H B O A R D
  `;

  return (
    <div
      className="min-h-screen pt-20 pb-8 flex flex-col lg:flex-row font-mono"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* Sidebar */}
      <div className="lg:fixed lg:left-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:z-40 lg:w-80 w-full lg:block">
        <div
          className="p-4 border-b"
          style={{ borderColor: "var(--color-accent)" }}
        >
          <h2
            className="font-bold text-sm"
            style={{ color: "var(--color-highlight)" }}
          >
            ADMIN DASHBOARD
          </h2>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto lg:h-full max-h-96 lg:max-h-none">
          {/* Navigation */}
          <div>
            <h3
              className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Navigation
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTab("overview")}
                className="w-full px-3 py-1 text-sm font-medium focus:outline-none text-left"
                style={{
                  backgroundColor:
                    selectedTab === "overview"
                      ? "var(--color-highlight)"
                      : "var(--color-primary)",
                  color:
                    selectedTab === "overview"
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                Overview
              </button>

              <button
                onClick={() => setSelectedTab("reports")}
                className="w-full px-3 py-1 text-sm font-medium focus:outline-none text-left"
                style={{
                  backgroundColor:
                    selectedTab === "reports"
                      ? "var(--color-highlight)"
                      : "var(--color-primary)",
                  color:
                    selectedTab === "reports"
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                Reports ({reports.filter((r) => r.status === "pending").length})
              </button>

              <Link
                href="/admin/users"
                className="block w-full px-3 py-1 text-sm font-medium text-center"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                Manage Users
              </Link>

              <Link
                href="/admin/apps"
                className="block w-full px-3 py-1 text-sm font-medium text-center"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                Manage Apps
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div>
              <h3
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-accent)" }}
              >
                Quick Stats
              </h3>
              <div
                className="text-xs space-y-1"
                style={{ color: "var(--color-text)" }}
              >
                <div>Reports: {stats.totalReports}</div>
                <div>Pending: {stats.pendingReports}</div>
                <div>Users: {stats.totalUsers}</div>
                <div>Suspended: {stats.suspendedUsers}</div>
                <div>Apps: {stats.totalApps}</div>
                <div>Comments: {stats.totalComments}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <pre
              className="text-[8px] md:text-sm whitespace-pre-wrap font-semibold mb-4 lg:mb-6 overflow-x-auto"
              style={{ color: "var(--color-accent)" }}
            >
              {termhuntText}
            </pre>
          </div>

          {/* Content */}
          <div>
            {selectedTab === "overview" && stats && (
              <div className="space-y-6">
                <h3
                  className="text-lg font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  System Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    className="p-4 border"
                    style={{ borderColor: "var(--color-accent)" }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-highlight)" }}
                    >
                      {stats.totalReports}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      Total Reports
                    </div>
                  </div>

                  <div
                    className="p-4 border"
                    style={{ borderColor: "var(--color-accent)" }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-highlight)" }}
                    >
                      {stats.pendingReports}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      Pending Reports
                    </div>
                  </div>

                  <div
                    className="p-4 border"
                    style={{ borderColor: "var(--color-accent)" }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-highlight)" }}
                    >
                      {stats.totalUsers}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      Total Users
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "reports" && (
              <div className="space-y-6">
                <h3
                  className="text-lg font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Reports Management
                </h3>

                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      No reports found
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border"
                        style={{ borderColor: "var(--color-accent)" }}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div className="flex-1">
                            <div
                              className="text-sm font-medium mb-1"
                              style={{ color: "var(--color-text)" }}
                            >
                              {getReportTarget(report)}
                            </div>
                            <div
                              className="text-sm mb-2"
                              style={{ color: "var(--color-text)" }}
                            >
                              Reason: {report.reason}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--color-accent)" }}
                            >
                              Reported by @{report.reporterUserTag} •{" "}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <span
                              className={`text-xs px-2 py-1 ${
                                report.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : report.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={getReportLink(report)}
                            className="text-xs px-2 py-1 border"
                            style={{
                              color: "var(--color-text)",
                              borderColor: "var(--color-accent)",
                            }}
                          >
                            View Target
                          </Link>

                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleReportAction(report.id, "resolved")
                                }
                                className="text-xs px-2 py-1"
                                style={{
                                  backgroundColor: "var(--color-highlight)",
                                  color: "var(--color-primary)",
                                }}
                              >
                                Mark Resolved
                              </button>

                              <button
                                onClick={() =>
                                  handleReportAction(report.id, "dismissed")
                                }
                                className="text-xs px-2 py-1 border"
                                style={{
                                  color: "var(--color-text)",
                                  borderColor: "var(--color-accent)",
                                }}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
