import { getDashboardAnalyticsRows } from "@/repositories/dashboardRepository";

export type MonthlyTrendPoint = {
  month: string;
  date: string;
  registrations: number;
  surveys: number;
  utilized: number;
  available: number;
  active: number;
  finished: number;
  upcoming: number;
  attended: number;
  registered: number;
};

export type DashboardAnalytics = {
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
    registrationTrendData: Array<
      Pick<MonthlyTrendPoint, "month" | "date" | "registrations" | "surveys">
    >;
    capacityTrendData: Array<
      Pick<MonthlyTrendPoint, "month" | "date" | "utilized" | "available">
    >;
    eventTimelineData: Array<
      Pick<
        MonthlyTrendPoint,
        "month" | "date" | "active" | "finished" | "upcoming"
      >
    >;
    attendanceData: Array<
      Pick<MonthlyTrendPoint, "month" | "date" | "registered" | "attended">
    >;
  };
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function buildMonthBuckets(monthCount: number) {
  const now = new Date();
  const buckets: Array<{
    key: string;
    monthLabel: string;
    fullLabel: string;
    start: Date;
    end: Date;
  }> = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    buckets.push({
      key,
      monthLabel: d.toLocaleString("en-US", { month: "short" }),
      fullLabel: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
      start,
      end,
    });
  }

  return buckets;
}

function toDateOrNull(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const { events, registrants, surveyResponses } =
    await getDashboardAnalyticsRows();
  const monthBuckets = buildMonthBuckets(6);
  const now = new Date();

  const registeredRegistrants = registrants.filter(
    (r) => r.is_registered === true,
  );
  const checkedInRegistrants = registrants.filter((r) => r.check_in === true);

  const activeEvents = events.filter((event) => {
    const start = toDateOrNull(event.start_date);
    const end = toDateOrNull(event.end_date);
    if (!start) return false;
    return start <= now && (!end || end >= now);
  }).length;

  const upcomingEvents = events.filter((event) => {
    const start = toDateOrNull(event.start_date);
    return !!start && start > now;
  }).length;

  const eventRegisteredCounts = new Map<string, number>();
  for (const registrant of registeredRegistrants) {
    const eventId = registrant.event_id;
    eventRegisteredCounts.set(
      eventId,
      (eventRegisteredCounts.get(eventId) ?? 0) + 1,
    );
  }

  const totalCapacity = events.reduce((sum, event) => {
    const capacity = Number(event.capacity ?? 0);
    return capacity > 0 ? sum + capacity : sum;
  }, 0);

  const totalRegistrants = registeredRegistrants.length;
  const checkedInCount = checkedInRegistrants.length;
  const attendanceRate =
    totalRegistrants > 0
      ? Math.round((checkedInCount / totalRegistrants) * 100)
      : 0;

  const totalRegisteredForCapacity = events.reduce((sum, event) => {
    const capacity = Number(event.capacity ?? 0);
    if (capacity <= 0) return sum;
    return sum + (eventRegisteredCounts.get(event.event_id) ?? 0);
  }, 0);

  const capacityUtilization =
    totalCapacity > 0
      ? Math.min(
          100,
          Math.round((totalRegisteredForCapacity / totalCapacity) * 100),
        )
      : 0;

  const registrationTrendData: DashboardAnalytics["charts"]["registrationTrendData"] =
    [];
  const capacityTrendData: DashboardAnalytics["charts"]["capacityTrendData"] =
    [];
  const eventTimelineData: DashboardAnalytics["charts"]["eventTimelineData"] =
    [];
  const attendanceData: DashboardAnalytics["charts"]["attendanceData"] = [];

  for (const bucket of monthBuckets) {
    const registrationsInMonth = registeredRegistrants.filter((r) => {
      const created = toDateOrNull(r.created_at);
      return !!created && created >= bucket.start && created <= bucket.end;
    }).length;

    const surveysInMonth = surveyResponses.filter((r) => {
      const created = toDateOrNull(r.created_at);
      return !!created && created >= bucket.start && created <= bucket.end;
    }).length;

    const attendedInMonth = checkedInRegistrants.filter((r) => {
      const created = toDateOrNull(r.created_at);
      return !!created && created >= bucket.start && created <= bucket.end;
    }).length;

    const eventsStartedInMonth = events.filter((event) => {
      const start = toDateOrNull(event.start_date);
      return !!start && start >= bucket.start && start <= bucket.end;
    });

    const monthCapacity = eventsStartedInMonth.reduce((sum, event) => {
      const capacity = Number(event.capacity ?? 0);
      return capacity > 0 ? sum + capacity : sum;
    }, 0);

    const monthRegisteredForStartedEvents = eventsStartedInMonth.reduce(
      (sum, event) => {
        return sum + (eventRegisteredCounts.get(event.event_id) ?? 0);
      },
      0,
    );

    const utilized =
      monthCapacity > 0
        ? Math.min(
            100,
            Math.round((monthRegisteredForStartedEvents / monthCapacity) * 100),
          )
        : 0;

    const activeInMonth = events.filter((event) => {
      const start = toDateOrNull(event.start_date);
      if (!start) return false;
      const end = toDateOrNull(event.end_date);
      return start <= bucket.end && (!end || end >= bucket.start);
    }).length;

    const finishedInMonth = events.filter((event) => {
      const end = toDateOrNull(event.end_date);
      return !!end && end < bucket.start;
    }).length;

    const upcomingInMonth = events.filter((event) => {
      const start = toDateOrNull(event.start_date);
      return !!start && start > bucket.end;
    }).length;

    registrationTrendData.push({
      month: bucket.monthLabel,
      date: bucket.fullLabel,
      registrations: registrationsInMonth,
      surveys: surveysInMonth,
    });

    capacityTrendData.push({
      month: bucket.monthLabel,
      date: bucket.fullLabel,
      utilized,
      available: Math.max(0, 100 - utilized),
    });

    eventTimelineData.push({
      month: bucket.monthLabel,
      date: bucket.fullLabel,
      active: activeInMonth,
      finished: finishedInMonth,
      upcoming: upcomingInMonth,
    });

    attendanceData.push({
      month: bucket.monthLabel,
      date: bucket.fullLabel,
      registered: registrationsInMonth,
      attended: attendedInMonth,
    });
  }

  return {
    stats: {
      totalRegistrants,
      totalEvents: events.length,
      activeEvents,
      upcomingEvents,
      checkedInCount,
      surveyResponses: surveyResponses.length,
      attendanceRate,
      capacityUtilization,
    },
    charts: {
      registrationTrendData,
      capacityTrendData,
      eventTimelineData,
      attendanceData,
    },
  };
}
