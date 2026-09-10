import os
import requests
from bs4 import BeautifulSoup
import urllib3
import time
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class AMISScraper:
    def __init__(self):
        self.base_url = "http://www.amis.pk/ViewPrices.aspx"
        self.session = requests.Session()
        
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None
            
        self.city_map = {1: 'Lahore', 2: 'Faisalabad', 3: 'Gujranwala', 4: 'Okara', 5: 'Sargodha', 6: 'Rawalpindi', 7: 'Multan', 8: 'RahimYarKhan', 9: 'Bhalwal', 10: 'Sahiwal', 11: 'Vehari', 12: 'Burewala', 13: 'Layyah', 14: 'Gujrat', 15: 'BahawalPur', 16: 'TTSingh', 17: 'Patoki', 18: 'ArifWala', 19: 'Jaranwala', 20: 'PakPattan', 21: 'Lodhran', 22: 'Chistian', 23: 'GujarKhan', 24: 'Mailsi', 25: 'Kahrorpacca', 26: 'Chichawatni', 27: 'DunyaPur', 28: 'DGKHAN', 29: 'Daska', 30: 'Kamalia', 31: 'PirMahal', 32: 'Jahanian', 33: 'AhmadPurEast', 34: 'JamPur', 35: 'Sialkot', 36: 'Narowal', 37: 'Chakwal', 38: 'Jhelum', 39: 'Mianwali', 40: 'RajanPur', 41: 'Jhang', 42: 'KotAdu', 43: 'RenalaKhurd', 44: 'Nankana', 45: 'ChackJhumra', 46: 'Summandri', 47: 'Tandlianwala', 48: 'Mamunkanjan', 49: 'Sheikhupura', 50: 'Chiniot', 51: 'Shorkot', 52: 'Kalurkot', 53: 'Fortabas', 54: 'TALAGANG', 55: 'Abdulhakim', 56: 'Sanglahill', 57: 'Hasanabdal', 58: 'Hafizabad', 59: 'Khudian', 60: 'Sambrial', 61: 'Shakargarh', 62: 'Hazro', 63: 'Sraialamgir', 64: 'Pinanwal', 65: 'Jauharabad', 66: 'Taunsasharif', 67: 'kotmoman'}

    def get_prices_for_city(self, city_id: int, date_str: str):
        url = f"{self.base_url}?searchType=1&commodityId={city_id}"
        
        try:
            response = self.session.get(url, verify=False, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            viewstate = soup.find("input", {"name": "__VIEWSTATE"})
            viewstategen = soup.find("input", {"name": "__VIEWSTATEGENERATOR"})
            
            if not viewstate or not viewstategen:
                return []

            payload = {
                "__VIEWSTATE": viewstate["value"],
                "__VIEWSTATEGENERATOR": viewstategen["value"],
                "ctl00$cphPage$DateTextBox": date_str,
                "ctl00$cphPage$ReminderButton": "Show prices"
            }
            
            for checkbox in soup.find_all("input", type="checkbox"):
                payload[checkbox["name"]] = checkbox["value"]

            post_response = self.session.post(url, data=payload, verify=False, timeout=15)
            post_soup = BeautifulSoup(post_response.content, 'html.parser')
            
            tables = post_soup.find_all("table")
            if len(tables) > 4:
                return self._parse_table(tables[4], city_id, date_str)
        except Exception as e:
            print(f"Error scraping city {city_id} on {date_str}: {e}")
            
        return []

    def _parse_table(self, table, city_id, date_str):
        data = []
        rows = table.find_all("tr")
        city_name = self.city_map.get(city_id, f"City_{city_id}")
        
        m, d, y = date_str.split('/')
        postgres_date = f"{y}-{m}-{d}"
        
        for row in rows:
            cols = row.find_all(["th", "td"])
            cols_text = [c.text.strip() for c in cols]
            
            if not cols_text or "Graph" in cols_text[0] or "Dated" in cols_text[0]:
                continue
                
            if len(cols_text) == 1:
                continue
                
            if len(cols_text) == 6:
                commodity_name = cols_text[0].split('\xa0')[-1]
                min_price = cols_text[2].replace(',', '')
                max_price = cols_text[3].replace(',', '')
                fqp = cols_text[4].replace(',', '')
                quantity = cols_text[5]
                
                if fqp != '-':
                    data.append({
                        "commodity": commodity_name,
                        "city": city_name,
                        "date": postgres_date,
                        "min_price": float(min_price) if min_price.replace('.', '', 1).isdigit() else None,
                        "max_price": float(max_price) if max_price.replace('.', '', 1).isdigit() else None,
                        "fqp": float(fqp) if fqp.replace('.', '', 1).isdigit() else None,
                        "arrival_quantity": quantity
                    })
                    
        return data

    def save_to_supabase(self, records):
        if not self.supabase or not records:
            return
            
        try:
            self.supabase.table('prices').upsert(records, on_conflict="commodity,city,date").execute()
        except Exception as e:
            print(f"Error saving to Supabase: {e}")

def scrape_date_range(start_date_str, end_date_str):
    scraper = AMISScraper()
    start_date = datetime.strptime(start_date_str, "%m/%d/%Y")
    end_date = datetime.strptime(end_date_str, "%m/%d/%Y")
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%m/%d/%Y")
        print(f"--- Scraping for Date: {date_str} ---")
        
        daily_records = []
        for city_id in scraper.city_map.keys():
            # print(f"Scraping {scraper.city_map[city_id]}...")
            results = scraper.get_prices_for_city(city_id, date_str)
            if results:
                daily_records.extend(results)
            time.sleep(0.5) # Be polite to AMIS servers
            
        if daily_records:
            print(f"Found {len(daily_records)} total records for {date_str}. Saving to DB...")
            scraper.save_to_supabase(daily_records)
        else:
            print(f"No records found for {date_str}.")
            
        current_date += timedelta(days=1)

if __name__ == "__main__":
    import sys
    # If run with an argument "daily", it scrapes today's date
    if len(sys.argv) > 1 and sys.argv[1] == "daily":
        today_str = datetime.now().strftime("%m/%d/%Y")
        scrape_date_range(today_str, today_str)
    else:
        # Default behavior: Scrape Sept 1 to Sept 8
        scrape_date_range("09/01/2026", "09/08/2026")
