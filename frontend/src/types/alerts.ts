export interface WatchlistAlert {
    id: string;
    commodity: string;
    slug: string;
    city: string;
    change_pct: number;
    direction: "spike" | "dip";
    current_price: number;
    previous_price: number;
    title: string;
    message: string;
    severity: "high" | "medium";
    date: string;
    created_at: string;
}

export interface WatchlistAlertsResponse {
    alerts: WatchlistAlert[];
    unread_count: number;
    watchlist: string[];
    home_city: string;
}