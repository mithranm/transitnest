import pandas as pd
import os

def load_data_from_csv():
    # Get the directory of the current script (pandas_loader.py)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the path to the testdata directory
    testdata_dir = os.path.join(current_dir, 'testdata')

    # Read the metro CSV file
    metro_path = os.path.join(testdata_dir, 'metro.csv')
    df = pd.read_csv(metro_path)

    # Select only the columns up to and including WEB_URL
    columns_to_keep = ['X', 'Y', 'NAME', 'ADDRESS', 'LINE', 'TRAININFO_URL', 'WEB_URL']
    METRO_DATAFRAME = df[columns_to_keep]
    
    # Read the property CSV file
    property_path = os.path.join(testdata_dir, 'property.csv')
    PROPERTY_DATAFRAME = pd.read_csv(property_path)
    
    # Read the zip CSV file
    zip_path = os.path.join(testdata_dir, 'zip.csv')
    ZIP_DATAFRAME = pd.read_csv(zip_path)
    
    return METRO_DATAFRAME, PROPERTY_DATAFRAME, ZIP_DATAFRAME