import pandas as pd
import random

# Create lists with sample data for each column
addresses = ['123 Main St', '456 Elm St', '789 Oak Ave', '321 Pine Rd', '654 Maple Ln']
latitudes = [40.7128, 34.0522, 41.8781, 37.7749, 39.9526]
longitudes = [-74.0060, -118.2437, -87.6298, -122.4194, -75.1652]
rental_prices = [1500, 2000, 1800, 2500, 1700]
proximity_transit = [0.5, 2.1, 0.3, 1.7, 3.0]  # in miles

def load_data_from_csv():
    print("stub")
    df = pd.DataFrame({
    'address': addresses,
    'latitude': latitudes,
    'longitude': longitudes,
    'rental_price': rental_prices,
    'proximity_transit': proximity_transit
})
    return df