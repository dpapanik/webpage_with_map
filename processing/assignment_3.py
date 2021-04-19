import pandas as pd
import numpy as np
from geopy import distance
from geopy.geocoders import Nominatim
import zipfile
import os
import requests
from io import BytesIO
import time
import json
from shapely.geometry import shape, Point


def get_data():
    '''Get 2021 and concat to local csv'''
    final_df = pd.DataFrame()
    for i in range(1, 4, 1):
        if i < 10:
            date = "0" + str(i)
        else:
            date = str(i)
        url = "https://s3.amazonaws.com/capitalbikeshare-data/2021" + \
            date + "-capitalbikeshare-tripdata.zip"
        response = requests.get(url)
        with zipfile.ZipFile(BytesIO(response.content)) as z:
            csv = "2021" + date + "-capitalbikeshare-tripdata.csv"
            with z.open(csv) as f:
                df = pd.read_csv(f)
        final_df = pd.concat([final_df, df], axis=0)

    final_df.to_csv("data/tmp/2021.csv")


def get_coordinates(s):
    '''Add 2 new columns to the dataframe with lat/lng of the start station'''
    geolocater = Nominatim(user_agent="DC_Bikeshare")
    addr = s['Start station']
    location = geolocater.geocode(addr)
    try:
        s['start_lat'] = location.latitude
        s['start_lng'] = location.longitude
    except AttributeError:
        s['start_lat'] = np.nan
        s['start_lng'] = np.nan
    return s



get_data()

df = pd.read_csv("./data/tmp/2021.csv")
df.dropna()
df.end_station_id.isnull().sum()
df = df.head(100)

df = df.apply(get_coordinates, axis=1)
df.head()

with open('data/land_use_boundary.geojson') as f:
    js = json.load(f)
