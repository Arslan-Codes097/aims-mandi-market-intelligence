import os
from datetime import datetime, timedelta
from supabase import create_client, Client
import pandas as pd
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class MarketIntelligence:
    def __init__(self):
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials in .env")
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def get_trend(self, commodity: str, city: str, days: int = 7, date_str: str = None):
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        try:
            end_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Expected YYYY-MM-DD")
            
        start_date = end_date - timedelta(days=days)
        
        response = self.supabase.table('prices').select('*')\
            .ilike('commodity', commodity)\
            .ilike('city', city)\
            .gte('date', start_date.isoformat())\
            .lte('date', end_date.isoformat())\
            .order('date').execute()
            
        data = response.data
        if not data or len(data) < 2:
            # Fix type inconsistency for early return
            if data:
                for d in data:
                    if 'fqp' in d and d['fqp'] is not None and str(d['fqp']).strip() != '-':
                        try:
                            d['fqp'] = float(d['fqp'])
                        except ValueError:
                            pass
            return {"direction": "stable", "pct_change": 0.0, "data_points": data}
            
        df = pd.DataFrame(data)
        df['fqp'] = pd.to_numeric(df['fqp'], errors='coerce')
        df = df.dropna(subset=['fqp'])
        
        if len(df) < 2:
             return {"direction": "stable", "pct_change": 0.0, "data_points": df.to_dict('records')}
             
        start_price = df.iloc[0]['fqp']
        end_price = df.iloc[-1]['fqp']
        
        pct_change = ((end_price - start_price) / start_price) * 100 if start_price > 0 else 0
        
        direction = "stable"
        if pct_change > 2.0:
            direction = "rising"
        elif pct_change < -2.0:
            direction = "falling"
            
        return {
            "direction": direction,
            "pct_change": float(round(pct_change, 2)),
            "data_points": df[['date', 'fqp']].to_dict('records')
        }

    def get_arbitrage(self, commodity: str, date_str: str = None, distance_km: float = None):
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        response = self.supabase.table('prices').select('*')\
            .ilike('commodity', commodity)\
            .eq('date', date_str).execute()
            
        data = response.data
        if not data:
            return {"best_buy_city": None, "best_sell_city": None, "gross_margin": 0, "net_margin": 0, "travel_cost": 0, "prices_by_city": []}
            
        df = pd.DataFrame(data)
        df['fqp'] = pd.to_numeric(df['fqp'], errors='coerce')
        df = df.dropna(subset=['fqp'])
        
        # Add deduplication to fix duplicate row risk
        df = df.drop_duplicates(subset=['city'], keep='last')
        
        if df.empty:
            return {"best_buy_city": None, "best_sell_city": None, "gross_margin": 0, "net_margin": 0, "travel_cost": 0, "prices_by_city": []}
            
        min_row = df.loc[df['fqp'].idxmin()]
        max_row = df.loc[df['fqp'].idxmax()]
        gross_margin = float(max_row['fqp'] - min_row['fqp'])
        
        net_margin = gross_margin
        travel_cost = 0.0
        
        # If distance is provided, calculate true net profit using live Diesel price
        if distance_km and distance_km > 0:
            fuel_response = self.supabase.table('fuel_prices').select('diesel_price')\
                .eq('date', date_str).execute()
            
            diesel_price = 259.0 # Fallback
            if fuel_response.data and len(fuel_response.data) > 0:
                diesel_price = float(fuel_response.data[0]['diesel_price'])
                
            # Assume 5 KM per Liter for commercial truck
            travel_cost = (diesel_price / 5.0) * distance_km
            net_margin = gross_margin - travel_cost
        
        return {
            "best_buy_city": min_row['city'],
            "best_sell_city": max_row['city'],
            "gross_margin": float(round(gross_margin, 2)),
            "net_margin": float(round(net_margin, 2)),
            "travel_cost": float(round(travel_cost, 2)),
            "prices_by_city": df[['city', 'fqp']].to_dict('records')
        }

    def get_anomaly(self, commodity: str, city: str, date_str: str = None):
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Expected YYYY-MM-DD")
            
        start_date = target_date - timedelta(days=30)
        
        response = self.supabase.table('prices').select('*')\
            .ilike('commodity', commodity)\
            .ilike('city', city)\
            .gte('date', start_date.isoformat())\
            .lte('date', target_date.isoformat())\
            .order('date').execute()
            
        data = response.data
        if not data:
            return {"is_anomaly": False, "z_score": 0.0, "expected_range": {"min_expected": 0.0, "max_expected": 0.0}, "actual_price": 0.0}
            
        df = pd.DataFrame(data)
        df['fqp'] = pd.to_numeric(df['fqp'], errors='coerce')
        df = df.dropna(subset=['fqp'])
        
        if df.empty:
            return {"is_anomaly": False, "z_score": 0.0, "expected_range": {"min_expected": 0.0, "max_expected": 0.0}, "actual_price": 0.0}
            
        target_row = df[df['date'] == date_str]
        if target_row.empty:
            return {"is_anomaly": False, "z_score": 0.0, "expected_range": {"min_expected": 0.0, "max_expected": 0.0}, "actual_price": 0.0}
            
        actual_price = float(target_row.iloc[0]['fqp'])
        
        historical_df = df[df['date'] < date_str]
        if len(historical_df) < 3: # Need at least a few days of history
            return {"is_anomaly": False, "z_score": 0.0, "expected_range": {"min_expected": actual_price, "max_expected": actual_price}, "actual_price": actual_price}
            
        mean = float(historical_df['fqp'].mean())
        std = float(historical_df['fqp'].std())
        
        if std == 0 or pd.isna(std):
            z_score = 0.0
        else:
            z_score = float((actual_price - mean) / std)
            
        is_anomaly = abs(z_score) > 2.0
        
        return {
            "is_anomaly": bool(is_anomaly),
            "z_score": float(round(z_score, 2)),
            "expected_range": {
                "min_expected": float(round(mean - (2*std), 2)) if not pd.isna(std) else actual_price,
                "max_expected": float(round(mean + (2*std), 2)) if not pd.isna(std) else actual_price
            },
            "actual_price": actual_price
        }

    def get_advisory(self, commodity: str, city: str, date_str: str = None):
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        trend_data = self.get_trend(commodity, city, days=7, date_str=date_str)
        anomaly_data = self.get_anomaly(commodity, city, date_str)
        
        recommendation = "hold"
        reasoning = "Prices are stable and within expected ranges."
        confidence = "medium"
        
        if trend_data['direction'] == 'rising' and not anomaly_data['is_anomaly']:
            recommendation = "sell"
            reasoning = f"Price is rising steadily (+{trend_data['pct_change']}%). Good time to sell."
            confidence = "high"
        elif anomaly_data['is_anomaly'] and anomaly_data['actual_price'] > anomaly_data['expected_range']['max_expected']:
            recommendation = "sell"
            reasoning = f"Price has spiked unusually high (Z-score: {anomaly_data['z_score']}). Capitalize immediately."
            confidence = "high"
        elif anomaly_data['is_anomaly'] and anomaly_data['actual_price'] < anomaly_data['expected_range']['min_expected']:
            # Added "buy" recommendation for downside anomalies
            recommendation = "buy"
            reasoning = f"Price has crashed unusually low (Z-score: {anomaly_data['z_score']}). Good buying opportunity."
            confidence = "high"
        elif trend_data['direction'] == 'falling':
            recommendation = "buy/hold"
            reasoning = f"Prices are falling ({trend_data['pct_change']}%). Wait for the bottom before buying/selling."
            confidence = "high"
            
        return {
            "recommendation": recommendation,
            "reasoning": reasoning,
            "confidence": confidence
        }

if __name__ == "__main__":
    intel = MarketIntelligence()
    
    print("=== TREND ===")
    print(intel.get_trend("Tomato", "Lahore"))
    
    print("\n=== ARBITRAGE ===")
    print(intel.get_arbitrage("Tomato"))
    
    print("\n=== ANOMALY ===")
    print(intel.get_anomaly("Tomato", "Lahore"))
    
    print("\n=== ADVISORY ===")
    print(intel.get_advisory("Tomato", "Lahore"))
