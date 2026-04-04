"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useState } from "react";

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { StatCard } from "@/components/admin/stat-card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import BokehBackground from "@/components/create-event/bokeh-background";
import Squares from "@/components/create-event/squares-background";
import { Users, Calendar, CheckCircle, MessageSquare } from "lucide-react";
import { getDashboardAnalyticsAction } from "@/actions/eventActions";

type DashboardData = {
  stats: {
    totalRegistrants: number;
    totalEvents: number;
    activeEvents: number;
    upcomingEvents: number;
    checkedInCount: number;
    surveyResponses: number;
    attendanceRate: number;
    capacityUtilization: number;
  };
  charts: {
    registrationTrendData: Array<{
      month: string;
      date: string;
      registrations: number;
      surveys: number;
    }>;
    capacityTrendData: Array<{
      month: string;
      date: string;
      utilized: number;
      available: number;
    }>;
    eventTimelineData: Array<{
      month: string;
      date: string;
      active: number;
      finished: number;
      upcoming: number;
    }>;
    attendanceData: Array<{
      month: string;
      date: string;
      registered: number;
      attended: number;
    }>;
  };
};

const emptyDashboardData: DashboardData = {
  stats: {
    totalRegistrants: 0,
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    checkedInCount: 0,
    surveyResponses: 0,
    attendanceRate: 0,
    capacityUtilization: 0,
  },
  charts: {
    registrationTrendData: [],
    capacityTrendData: [],
    eventTimelineData: [],
    attendanceData: [],
  },
};

export default function AdminDashboard() {
  const { role, loading, initialize } = useUserStore();
  const router = useRouter();
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !role) {
      router.replace("/");
    }
  }, [loading, role, router]);

  useEffect(() => {
    async function loadDashboardData() {
      const result = await getDashboardAnalyticsAction();
      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    }

    if (role) {
      loadDashboardData();
    }
  }, [role]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a05] via-[#1a1405] to-[#0a0a05] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const { stats, charts } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a05] via-[#1a1405] to-[#0a0a05] text-white relative overflow-hidden font-[family-name:var(--font-urbanist)]">
      <BokehBackground />
      <Squares direction="diagonal" speed={0.3} />

      <div className="relative z-10">
        <AdminNavbar activeTab="dashboard" />
        <main className="flex-1 px-4 md:px-8 py-8 pt-28">
          <div className="max-w-7xl mx-auto">
            <AdminBreadcrumbs items={[{ label: "Dashboard" }]} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Registrants"
                value={stats.totalRegistrants}
                icon={Users}
                trend={`${stats.totalEvents} total events`}
                trendUp={stats.totalEvents >= 0}
                color="bg-blue-500/20"
              />
              <StatCard
                title="Active Events"
                value={stats.activeEvents}
                icon={Calendar}
                trend={`${stats.upcomingEvents} upcoming`}
                trendUp={true}
                color="bg-purple-500/20"
              />
              <StatCard
                title="Checked-in Attendees"
                value={stats.checkedInCount}
                icon={CheckCircle}
                trend={`${stats.attendanceRate}% attendance rate`}
                trendUp={true}
                color="bg-green-500/20"
              />
              <StatCard
                title="Survey Responses"
                value={stats.surveyResponses}
                icon={MessageSquare}
                trend={`${stats.capacityUtilization}% capacity used`}
                color="bg-orange-500/20"
              />
            </div>

            {/* Analytics Overview */}
            <AnalyticsCharts
              data={charts}
              totalEvents={stats.totalEvents}
              capacityUtilization={stats.capacityUtilization}
              attendanceRate={stats.attendanceRate}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
