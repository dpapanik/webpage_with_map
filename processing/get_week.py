import pandas as pd
from geopy import distance
import os

os.chdir("/home/eric/git/webpage_with_map/processing")
df = pd.read_csv("../data/202101-capitalbikeshare-tripdata.csv")

# Clean Data
# Remove extra long distances
df = df.dropna()
#df.apply(lambda x: distance.distance((x["start_lat"], x["start_lng"]), x["end_lat"], x["end_lng"]), axis=1)


df["started_at"] = pd.to_datetime(df["started_at"])

start_date = pd.to_datetime('1/04/2021 0:00')
end_date = pd.to_datetime('1/04/2021 23:59')
jan_1 = df[df["started_at"].between(start_date, end_date)]
jan_1 = jan_1.sort_values('started_at')

jan_1.to_csv("../data/jan_4_2021.csv")
