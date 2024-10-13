import pandas as pd
from typing import Dict
from pandas_loader import load_data_from_csv
import math
import googlemaps
from datetime import datetime, timedelta
import random
from tqdm import tqdm
import os
from dotenv import load_dotenv

load_dotenv()

def generate_random_color():
  """Generates a random hex color code."""

  r = random.randint(0, 255)
  g = random.randint(0, 255)
  b = random.randint(0, 255)

  return f"#{r:02x}{g:02x}{b:02x}"


gmaps = googlemaps.Client(key=os.environ["MAP_API_KEY"])

METRO_DATAFRAME, PROPERTY_DATAFRAME, ZIP_DATAFRAME = load_data_from_csv()
# METRO COLUMNS
# X,Y,NAME,ADDRESS
# PROPERTY COLUMNS
# address,rental_price,latitude,longitude
# ZIP COLUMNS
# ZIP,City,State,CountyName,RentPrice,LAT,LNG
def haversine(coord1, coord2):
    # Radius of the Earth in miles
    R = 3958.8
    
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c  # Distance in miles
    return distance

distances = []
closest_station = []
closest_station_addr = []

for i in range(len(ZIP_DATAFRAME)):
    zip_lat = ZIP_DATAFRAME.iloc[i, 5]
    zip_long = ZIP_DATAFRAME.iloc[i, 6]
    min_dist = 100000
    min_station = None
    min_station_addr = None

    for j in range(len(METRO_DATAFRAME)):
        metro_lat = METRO_DATAFRAME.iloc[j, 1]
        metro_long = METRO_DATAFRAME.iloc[j, 0]

        dist = haversine((zip_lat, zip_long), (metro_lat, metro_long))
        if dist < min_dist:
            min_dist = dist
            min_station = METRO_DATAFRAME.iloc[j, 2]
            min_station_addr = METRO_DATAFRAME.iloc[j, 3]

    distances.append(min_dist)
    closest_station.append(min_station)
    closest_station_addr.append(min_station_addr)

ZIP_DATAFRAME['closest_metro_distances'] = distances
ZIP_DATAFRAME['closest_station'] = closest_station
ZIP_DATAFRAME['closest_station_addr'] = closest_station_addr

def run_search_algorithm(budget: int,
    dist_from_public_transport: int,
    work_zipcode: int) -> Dict:
    """
    Returns truncated property dataframe
    """
    zip_df = ZIP_DATAFRAME
    zip_df = zip_df[zip_df['RentPrice'] < budget]
    zip_df = zip_df[zip_df['closest_metro_distances'] < dist_from_public_transport]

    commute_time = datetime.now()
    while not 2 < commute_time.day < 5:
        commute_time = commute_time + timedelta(days=1)

    while commute_time.hour != 8:
        commute_time = commute_time + timedelta(hours=1)


    polylines = []
    travel_dist = []
    durations = []
    duration_text = []

    for i in range(len(zip_df)):
        start_addr = zip_df['ZIP'].iloc[i]
        end_addr = work_zipcode
        try:
            direction = gmaps.directions(origin=f'{start_addr}', destination=f'{end_addr}', mode='transit', departure_time=commute_time)[0]
        except:
            zip_df = pd.DataFrame(zip_df.columns).to_json(orient='records')
            return ''
        polyline, distance, duration = (direction['overview_polyline']['points'], direction['legs'][0]['distance']['text'], direction['legs'][0]['duration'])
        polylines.append(polyline)
        travel_dist.append(distance)
        durations.append(duration['value'])
        duration_text.append(duration['text'])
    
    zip_df['polyline'] = polylines
    zip_df['travel_dist'] = travel_dist
    zip_df['duration'] = durations
    zip_df['duration_text'] = duration_text

    zip_df = zip_df.sort_values(by='duration')

    colors = []

    for i in range(len(zip_df)):
        colors.append(generate_random_color())

    zip_df['color'] = colors

    return zip_df.to_json(orient='records')
    
def get_property_dataframe_json():
    return ZIP_DATAFRAME.to_json(orient='records')