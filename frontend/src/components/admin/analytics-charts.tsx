"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, Calendar, CheckCircle } from "lucide-react";

type RegistrationTrendPoint = {
  month: string;
  date: string;
  registrations: number;
  surveys: number;
};

type CapacityTrendPoint = {
  month: string;
  date: string;
  utilized: number;
  available: number;
};

type EventTimelinePoint = {
  month: string;
  date: string;
  active: number;
  finished: number;
  upcoming: number;
};

type AttendancePoint = {
  month: string;
  date: string;
  attended: number;
  registered: number;
};

type DashboardChartsData = {
  registrationTrendData: RegistrationTrendPoint[];
  capacityTrendData: CapacityTrendPoint[];
  eventTimelineData: EventTimelinePoint[];
  attendanceData: AttendancePoint[];
};

type AnalyticsChartsProps = {
  data?: DashboardChartsData;
  totalEvents?: number;
  capacityUtilization?: number;
  attendanceRate?: number;
};

type TooltipPayloadEntry = {
  name: string;
  value: number;
  color: string;
  payload: { date?: string };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-[#0B1F23]/95 border border-[#06b6d4]/40 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <p
          className="text-white font-semibold mb-2 text-xs"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {dataPoint.date || label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm flex items-center justify-between gap-3"
            style={{ color: entry.color, fontFamily: "Urbanist, sans-serif" }}
          >
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

function calculateTrendPercent(values: number[]) {
  if (values.length < 2) return 0;

  const previous = values[values.length - 2] ?? 0;
  const latest = values[values.length - 1] ?? 0;

  if (previous === 0) {
    return latest > 0 ? 100 : 0;
  }

  return Math.round(((latest - previous) / previous) * 100);
}

function getTimelineLabel(data: Array<{ date: string }>) {
  if (data.length === 0) return "No timeline data";
  if (data.length === 1) return data[0].date;
  return `${data[0].date} - ${data[data.length - 1].date}`;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  data,
  totalEvents = 0,
  capacityUtilization = 0,
  attendanceRate = 0,
}) => {
  const fallbackData: DashboardChartsData = {
    registrationTrendData: [],
    capacityTrendData: [],
    eventTimelineData: [],
    attendanceData: [],
  };

  const analyticsData = data ?? fallbackData;

  const registrationTrend = analyticsData.registrationTrendData;
  const capacityTrend = analyticsData.capacityTrendData;
  const eventTimeline = analyticsData.eventTimelineData;
  const attendanceTrend = analyticsData.attendanceData;

  const timelineLabel = getTimelineLabel(registrationTrend);
  const registrationTrendPercent = calculateTrendPercent(
    registrationTrend.map((item) => item.registrations),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-semibold !text-white"
          style={{ color: "#ffffff", fontFamily: "Urbanist, sans-serif" }}
        >
          Analytics Overview
        </h2>
        <div
          className="text-sm text-gray-400 bg-[#0B1F23]/40 px-4 py-2 rounded-lg border border-[#06b6d4]/30"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          <span className="text-[#06b6d4] font-semibold">Timeline:</span>{" "}
          {timelineLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0B1F23]/60 via-[#0E1924]/50 to-[#0B1F23]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-[#22d3ee]/60 shadow-lg shadow-black/20 hover:shadow-[#22d3ee]/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#60a5fa]" />
            <h3
              className="text-lg font-semibold !text-white"
              style={{ color: "#ffffff", fontFamily: "Urbanist, sans-serif" }}
            >
              Registration Trends
            </h3>
          </div>
          <p
            className="text-sm text-gray-400 mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Registered attendees and submitted surveys over the last 6 months
          </p>
          <div className="pointer-events-auto">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={registrationTrend}>
                <defs>
                  <linearGradient
                    id="colorRegistrations"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorSurveys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#06b6d4"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Urbanist, sans-serif",
                    color: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#60a5fa"
                  fillOpacity={1}
                  fill="url(#colorRegistrations)"
                  strokeWidth={2}
                  name="Registrations"
                />
                <Area
                  type="monotone"
                  dataKey="surveys"
                  stroke="#34d399"
                  fillOpacity={1}
                  fill="url(#colorSurveys)"
                  strokeWidth={2}
                  name="Survey Responses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#06b6d4]/20">
            <span
              className="text-sm text-gray-400"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {timelineLabel}
            </span>
            <span
              className="text-sm font-semibold text-[#34d399] flex items-center gap-1"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              <TrendingUp className="w-4 h-4" />
              {registrationTrendPercent >= 0
                ? `Up ${registrationTrendPercent}%`
                : `Down ${Math.abs(registrationTrendPercent)}%`}{" "}
              vs last month
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B1F23]/60 via-[#0E1924]/50 to-[#0B1F23]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-[#22d3ee]/60 shadow-lg shadow-black/20 hover:shadow-[#22d3ee]/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#c084fc]" />
            <h3
              className="text-lg font-semibold !text-white"
              style={{ color: "#ffffff", fontFamily: "Urbanist, sans-serif" }}
            >
              Capacity Utilization
            </h3>
          </div>
          <p
            className="text-sm text-gray-400 mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Capacity used vs available for events started each month
          </p>
          <div className="pointer-events-auto">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={capacityTrend}>
                <defs>
                  <linearGradient
                    id="colorUtilized"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorAvailable"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#06b6d4"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Urbanist, sans-serif",
                    color: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="utilized"
                  stroke="#c084fc"
                  fillOpacity={1}
                  fill="url(#colorUtilized)"
                  strokeWidth={2}
                  stackId="1"
                  name="Utilized %"
                />
                <Area
                  type="monotone"
                  dataKey="available"
                  stroke="#94a3b8"
                  fillOpacity={1}
                  fill="url(#colorAvailable)"
                  strokeWidth={2}
                  stackId="1"
                  name="Available %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#06b6d4]/20">
            <span
              className="text-sm text-gray-400"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {timelineLabel}
            </span>
            <span
              className="text-sm font-semibold text-[#c084fc]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Avg: {capacityUtilization}% capacity
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B1F23]/60 via-[#0E1924]/50 to-[#0B1F23]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-[#22d3ee]/60 shadow-lg shadow-black/20 hover:shadow-[#22d3ee]/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#34d399]" />
            <h3
              className="text-lg font-semibold !text-white"
              style={{ color: "#ffffff", fontFamily: "Urbanist, sans-serif" }}
            >
              Event Timeline
            </h3>
          </div>
          <p
            className="text-sm text-gray-400 mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Active, finished, and upcoming events by month window
          </p>
          <div className="pointer-events-auto">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={eventTimeline}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorFinished"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorUpcoming"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#06b6d4"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Urbanist, sans-serif",
                    color: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#34d399"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  strokeWidth={2}
                  name="Active"
                />
                <Area
                  type="monotone"
                  dataKey="finished"
                  stroke="#60a5fa"
                  fillOpacity={1}
                  fill="url(#colorFinished)"
                  strokeWidth={2}
                  name="Finished"
                />
                <Area
                  type="monotone"
                  dataKey="upcoming"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorUpcoming)"
                  strokeWidth={2}
                  name="Upcoming"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#06b6d4]/20">
            <span
              className="text-sm text-gray-400"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {timelineLabel}
            </span>
            <span
              className="text-sm font-semibold text-[#34d399]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {totalEvents} total events
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0B1F23]/60 via-[#0E1924]/50 to-[#0B1F23]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-[#22d3ee]/60 shadow-lg shadow-black/20 hover:shadow-[#22d3ee]/30 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-[#22c55e]" />
            <h3
              className="text-lg font-semibold !text-white"
              style={{ color: "#ffffff", fontFamily: "Urbanist, sans-serif" }}
            >
              Attendance vs Registration
            </h3>
          </div>
          <p
            className="text-sm text-gray-400 mb-4"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Check-ins compared to new registrations each month
          </p>
          <div className="pointer-events-auto">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient
                    id="colorAttended"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorRegistered"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#06b6d4"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontSize: "12px",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "Urbanist, sans-serif",
                    color: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registered"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorRegistered)"
                  strokeWidth={2}
                  name="Registered"
                />
                <Area
                  type="monotone"
                  dataKey="attended"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorAttended)"
                  strokeWidth={2}
                  name="Attended"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#06b6d4]/20">
            <span
              className="text-sm text-gray-400"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {timelineLabel}
            </span>
            <span
              className="text-sm font-semibold text-[#22c55e]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {attendanceRate}% attendance rate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
