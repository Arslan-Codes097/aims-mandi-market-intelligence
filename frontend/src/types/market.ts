export type TrendDirection = "rising" | "falling" | "stable";
export type Recommendation = "buy" | "sell" | "hold";
export type Confidence = "low" | "medium" | "high";

export interface TrendDataPoint {
    date: string;
    price: number;
}

export interface TrendResponse {
    direction: TrendDirection;
    pct_change: number;
    data_points: TrendDataPoint[];
}

export interface AnomalyResponse {
    is_anomaly: boolean;
    z_score: number;
    expected_range: { min_expected: number; max_expected: number };
    actual_price: number;
}

export interface CityPrice {
    city: string;
    price: number;
}

export interface ArbitrageResponse {
    best_buy_city: string;
    best_sell_city: string;
    margin: number;
    prices_by_city: CityPrice[];
}

export interface AdvisoryResponse {
    recommendation: Recommendation;
    reasoning: string;
    confidence: Confidence;
}

export interface UserPreferences {
    preferred_cities: string[];
    preferred_commodities: string[];
    watchlist: string[];
    updated_at: string;
}

export interface ArbitrageRoute {
    buy_city: string;
    sell_city: string;
    buy_price: number;
    sell_price: number;
    gross_margin: number;
    distance_km: number | null;
    fuel_cost: number | null;
    net_profit: number | null;
}

export interface CommoditiesResponse {
    commodities: string[];
}

export interface CitiesResponse {
    cities: string[];
}