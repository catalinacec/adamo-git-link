export interface DashboardResponse {
    welcomeMessage: string;
    plan: string;
    documents: DocumentsDashboard;
    totalDocuments: number;
    notifications: {
        unread: number;
    } 
}

export interface DocumentsDashboard {
    completed: number;
    rejected: number;
    "in_progress": number;
    draft: number;
    pending: number;
    recycler: number;
}
