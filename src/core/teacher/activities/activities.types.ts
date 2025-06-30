export type ActivityType = "assignment" | "student" | "book" | "system";

export type ActivityStatus = "completed" | "pending" | "failed" | "info";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  details: {
    [key: string]: unknown;
  };
  status: ActivityStatus;
  relatedEntities: {
    students?: string[];
    groups?: string[];
    assignments?: string[];
    books?: string[];
  };
}
