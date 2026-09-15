import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class FuelScraper:
    def __init__(self):
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None

    def get_live_diesel_price(self):
        """
        Scrapes the official PSO website for live High Speed Diesel prices.
        """
        import requests
        from bs4 import BeautifulSoup
        
        try:
            url = "https://psopk.com/en/fuels/fuel-prices"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the td containing HI-CETANE DIESEL EURO 5
            diesel_td = soup.find('td', string=lambda text: text and 'HI-CETANE DIESEL EURO 5' in text)
            if diesel_td:
                price_td = diesel_td.find_next_sibling('td')
                if price_td:
                    # Extract the number from "Rs.403.32/Ltr"
                    price_str = price_td.text.replace('Rs.', '').replace('/Ltr', '').strip()
                    return float(price_str)
                    
        except Exception as e:
            print(f"Error scraping live diesel price: {e}")
            
        # Fallback if scraping fails
        return 403.32

    def run_daily_update(self, date_str=None):
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
            
        price = self.get_live_diesel_price()
        
        record = {
            "date": date_str,
            "diesel_price": price
        }
        
        if self.supabase:
            try:
                self.supabase.table('fuel_prices').upsert([record], on_conflict="date").execute()
                print(f"Saved Diesel Price {price} PKR/L for {date_str}")
            except Exception as e:
                print(f"Error saving fuel price: {e}")

if __name__ == "__main__":
    scraper = FuelScraper()
    scraper.run_daily_update()
