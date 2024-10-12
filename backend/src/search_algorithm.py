import pandas
from typing import Dict
from pandas_loader import load_data_from_csv

METRO_DATAFRAME, PROPERTY_DATAFRAME, ZIP_DATAFRAME = load_data_from_csv()
# METRO COLUMNS
# X,Y,NAME,ADDRESS
# PROPERTY COLUMNS
# address,rental_price,latitude,longitude
# ZIP COLUMNS
# ZIP,City,State,CountyName,RentPrice,LAT,LNG
def run_search_algorithm(budget: int,
    dist_from_public_transport: int,
    work_zipcode: int) -> Dict:
    """
    
    """
    return {}
    
def get_property_dataframe_json():
    return PROPERTY_DATAFRAME.to_json(orient='records')