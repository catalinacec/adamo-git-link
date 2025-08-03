export interface DashboardResponse {
  welcomeMessage: string;
  plan: string;
  documents: DocumentsDashboard;
  totalDocuments: number;
  notifications: {
    unread: number;
  };
}

export interface DocumentsDashboard {
  completed: number;
  rejected: number;
  in_progress: number;
  draft: number;
  pending: number;
  recycler: number;
}

export interface StatItem {
  icon: string;
  title: string;
  value: string;
  href: string;
  hrefText: string;
}