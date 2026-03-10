"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

import { AdminNavbar } from '@/components/admin/admin-navbar';
import { StatCard } from '@/components/admin/stat-card';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import BokehBackground from '@/components/create-event/bokeh-background';
import Squares from '@/components/create-event/squares-background';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  Building2,
} from 'lucide-react';

const mockStats = {
  totalRegistrants: 1247,
  totalEvents: 12,
  activeEvents: 5,
  upcomingEvents: 3,
  volunteers: 89,
  partneredOrgs: 15,
};

export default function AdminDashboard() {
  const { role, loading, initialize, userId,  } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !role) {
      router.replace("/");
    }
  }, [loading, role, router]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-[#0a1520] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f14] via-[#0a1520] to-[#120c08] text-white relative overflow-hidden font-[family-name:var(--font-urbanist)]">
      <BokehBackground />
      <Squares direction="diagonal" speed={0.3} />
      
      <div className="relative z-10">
        <AdminNavbar activeTab="dashboard" />
        <main className="flex-1 px-4 md:px-8 py-8 pt-28">
          <div className="max-w-7xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Registrants"
                value={mockStats.totalRegistrants}
                icon={Users}
                trend="+12% from last month"
                trendUp={true}
                color="bg-blue-500/20"
              />
              <StatCard
                title="Active Events"
                value={mockStats.activeEvents}
                icon={Calendar}
                trend={`${mockStats.upcomingEvents} upcoming`}
                trendUp={true}
                color="bg-purple-500/20"
              />
              <StatCard
                title="Volunteers"
                value={mockStats.volunteers}
                icon={UserPlus}
                trend="+8% this week"
                trendUp={true}
                color="bg-green-500/20"
              />
              <StatCard
                title="Partnered Orgs"
                value={mockStats.partneredOrgs}
                icon={Building2}
                color="bg-orange-500/20"
              />
            </div>

            {/* Analytics Overview */}
            <AnalyticsCharts />
          </div>
        </main>
      </div>
    </div>
  );
}
