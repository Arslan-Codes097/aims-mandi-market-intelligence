import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from intelligence import MarketIntelligence

def run_tests():
    intel = MarketIntelligence()
    
    print("=========================================")
    print("RUNNING INTELLIGENCE EDGE CASE TESTS")
    print("=========================================\n")
    
    # ---------------------------------------------------------
    # TEST 1: The "Ghost Commodity" (Missing Data)
    # ---------------------------------------------------------
    print("TEST 1: Querying a commodity that doesn't exist (Dragonfruit)")
    trend = intel.get_trend("Dragonfruit", "Lahore")
    print(f"Trend Result: {trend['direction']} (Change: {trend['pct_change']}%)")
    assert trend['direction'] == 'stable', "Ghost commodity should return stable"
    print("TEST 1 PASSED: Gracefully handled missing trend data.\n")

    # ---------------------------------------------------------
    # TEST 2: Arbitrage on a widely available commodity
    # ---------------------------------------------------------
    print("TEST 2: Finding Arbitrage for 'Potato Fresh'")
    arb = intel.get_arbitrage("Potato Fresh", date_str="2026-09-08", distance_km=150.0)
    print(f"Best Buy: {arb['best_buy_city']} | Best Sell: {arb['best_sell_city']} | Gross: {arb['gross_margin']} | Travel Cost: {arb['travel_cost']} | NET: {arb['net_margin']}")
    assert arb['best_buy_city'] is not None, "Should find a buy city for Potato Fresh"
    print("TEST 2 PASSED: Successfully calculated arbitrage spread.\n")
    
    # ---------------------------------------------------------
    # TEST 3: Arbitrage on a date with NO DATA (e.g. future date)
    # ---------------------------------------------------------
    print("TEST 3: Finding Arbitrage on a Sunday or Future Date (2030-01-01)")
    arb_future = intel.get_arbitrage("Potato Fresh", date_str="2030-01-01")
    print(f"Result: {arb_future}")
    assert arb_future['best_buy_city'] is None, "Should return None for missing dates"
    print("TEST 3 PASSED: Gracefully handled days where markets are closed.\n")

    # ---------------------------------------------------------
    # TEST 4: Anomaly Detection on Stable Crop (Wheat)
    # ---------------------------------------------------------
    print("TEST 4: Anomaly Detection for Wheat in Lahore")
    anomaly = intel.get_anomaly("Wheat", "Lahore", date_str="2026-09-08")
    print(f"Price: {anomaly['actual_price']} | Expected Range: {anomaly['expected_range']} | Is Anomaly: {anomaly['is_anomaly']}")
    print("TEST 4 PASSED: Successfully calculated Z-Score bounds.\n")
    
    # ---------------------------------------------------------
    # TEST 5: Full Advisory on volatile crop (Onion)
    # ---------------------------------------------------------
    print("TEST 5: Full Advisory generation for Onion in Faisalabad")
    adv = intel.get_advisory("Onion", "Faisalabad")
    print(f"Recommendation: {adv['recommendation'].upper()}")
    print(f"Reasoning: {adv['reasoning']}")
    assert 'recommendation' in adv, "Advisory must return a recommendation"
    print("TEST 5 PASSED: Smart advisory logic executed successfully.\n")

    print("ALL EDGE CASE TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
