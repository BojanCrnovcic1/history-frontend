export interface Visit {
    visitId: string;
    visitorId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    visitedAt: string;
  }
  
  export type Granularity = "day" | "week" | "month" | "year";
  
  export interface VisitStatus {
    visitStatusId: string;
    granularity: Granularity;
    periodKey: string; 
    periodStart: string; 
    totalVisits: number;
    uniqueVisitors: number;
    createdAt: string;
  }
  