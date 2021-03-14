import pandas as pd
import numpy as np
from geopy import distance
import zipfile
import os
import requests
from io import BytesIO

import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
import seaborn as sns
sns.set()


url = "https://s3.amazonaws.com/capitalbikeshare-data/202102-capitalbikeshare-tripdata.zip"
response = requests.get(url)
with zipfile.ZipFile(BytesIO(response.content)) as z:
    with z.open("202102-capitalbikeshare-tripdata.csv") as f:
        df = pd.read_csv(f)

# Grab week data (2/21-2/27)
df["started_at"] = pd.to_datetime(df["started_at"])
start_date = pd.to_datetime('2/21/2021 0:00')
end_date = pd.to_datetime('2/27/2021 23:59')
week = df[df["started_at"].between(start_date, end_date)]

# Drop Nulls
week = week.dropna()
#df.apply(lambda x: distance.distance((x["start_lat"], x["start_lng"]), x["end_lat"], x["end_lng"]), axis=1)

# Group all stations together to find clusters
# https://levelup.gitconnected.com/clustering-gps-co-ordinates-forming-regions-4f50caa7e4a1

start_stations = week[["start_station_id", "start_lat", "start_lng"]]
start_stations = start_stations.rename(
    columns={"start_station_id": "id", "start_lat": "lat", "start_lng": "lng"})

end_stations = week[["end_station_id", "end_lat", "end_lng"]]
end_stations = end_stations.rename(
    columns={"end_station_id": "id", "end_lat": "lat", "end_lng": "lng"})

stations = pd.concat([start_stations, end_stations], axis=0)

kmeans = KMeans(n_clusters = 10, init ='k-means++')
kmeans.fit(stations[stations.columns[1:3]]) # Compute k-means clustering.
stations['cluster_label'] = kmeans.fit_predict(stations[stations.columns[1:3]])
centers = kmeans.cluster_centers_ # Coordinates of cluster centers.
labels = kmeans.predict(stations[stations.columns[1:3]]) # Labels of each point

# Plot to visualize
#plot = stations.plot.scatter(x = 'lat', y = 'lng', c=labels, s=50, cmap='viridis')
#plt.scatter(centers[:, 0], centers[:, 1], c='black', s=200, alpha=0.5)
#plot.figure.savefig("10_cluster.png")

# Add labels to start and end station IDs
unique_stations = stations.drop_duplicates(subset='id', keep="first")[['id', 'cluster_label']]
week = week.merge(unique_stations, left_on='start_station_id', right_on='id', how='left').drop('id', axis=1).rename({'cluster_label' : 'start_cluster'}, axis=1)
week = week.merge(unique_stations, left_on='end_station_id', right_on='id', how='left').drop('id', axis=1).rename({'cluster_label' : 'end_cluster'}, axis=1)
# Calculate Total Time for Histogram
week["ended_at"] = pd.to_datetime(week["ended_at"])
week['total_time'] = week['ended_at'] - week['started_at']
week['total_time'] = week['total_time'].dt.total_seconds().div(60).astype(int)
# Calculate Total Distance for Histogram
week['total_distance'] = week.apply(lambda x: distance.distance((x["start_lat"], x["start_lng"]), (x["end_lat"], x["end_lng"])), axis=1)
week['total_distance'] = week['total_distance'].apply(lambda x: x.km)

# Drop is ride is less than 2 mins and less than 100m (.1km)
drop_index = week[(week['total_time'] < 2) & (week['total_distance'] < .01)].index
week = week.drop(drop_index)

# Define Matrix Function
def create_matrix(clusters, df):

    '''
    Each row is a group (Cluster Label)
    Row to column (0,1) -> from cluster 0 to cluster 1.  (2,1) -> from cluster 2 to cluster 1
    Square Matrix in the end
    '''
    matrix = np.zeros(shape=(len(clusters), len(clusters)))
    for i in clusters:
        for j in clusters:
            matrix[i][j] = df[(df['start_cluster'] == i) & (df['end_cluster'] == j)].shape[0]
    

    return (matrix)


# Morning Commute (6-10am)
morning_commute = week[(week["started_at"].apply(lambda x: pd.to_datetime(x).hour) > 6) & (week["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 10)]
morning_commute = morning_commute[(morning_commute['started_at'].apply(lambda x: pd.to_datetime(x).day) > 21) & (morning_commute['started_at'].apply(lambda x: pd.to_datetime(x).day) < 27)]
morning_commute_matrix = create_matrix(clusters = sorted(unique_stations.cluster_label.unique()), df = morning_commute)
matrix_df = pd.DataFrame(morning_commute_matrix)
matrix_df.to_csv('data/morning_commute_matrix.csv', index=False, header=False)
morning_commute.to_csv('data/morning_commute.csv', index=False, header= True)

# Evening Commute (5-8pm) (5:00pm - 7:59pm)
evening_commute = week[(week["started_at"].apply(lambda x: pd.to_datetime(x).hour) > 17) & (week["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 20)]
evening_commute = evening_commute[(evening_commute['started_at'].apply(lambda x: pd.to_datetime(x).day) > 21) & (evening_commute['started_at'].apply(lambda x: pd.to_datetime(x).day) < 27)]
evening_commute_matrix = create_matrix(clusters = sorted(unique_stations.cluster_label.unique()), df = evening_commute)
matrix_df = pd.DataFrame(evening_commute_matrix)
matrix_df.to_csv('data/evening_commute_matrix.csv', index=False, header=False)
evening_commute.to_csv('data/evening_commute.csv', index=False, header= True)

# After Work Travel (8pm-2am) (8:00pm - 1:59am)
after_work = week[(week["started_at"].apply(lambda x: pd.to_datetime(x).hour) > 20) & (week["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 2)]
after_work = after_work[(after_work['started_at'].apply(lambda x: pd.to_datetime(x).day) > 21) & (after_work['started_at'].apply(lambda x: pd.to_datetime(x).day) < 27)]
#Handle 12-2am Sat
sat = week[(week["started_at"].apply(lambda x: pd.to_datetime(x).hour) >= 0) & (week["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 2) & (week['started_at'].apply(lambda x: pd.to_datetime(x).day) == 27)]
after_work = after_work.append(sat)
after_work_matrix = create_matrix(clusters = sorted(unique_stations.cluster_label.unique()), df = after_work)
matrix_df = pd.DataFrame(after_work_matrix)
matrix_df.to_csv('data/after_work_matrix.csv', index=False, header=False)
after_work.to_csv('data/after_work.csv', index=False, header= True)

# Weekend Category
weekend = week[(week['started_at'].apply(lambda x: pd.to_datetime(x).day) == 21) | (week['started_at'].apply(lambda x: pd.to_datetime(x).day) == 27)]
weekend_matrix = create_matrix(clusters = sorted(unique_stations.cluster_label.unique()), df = weekend)
matrix_df = pd.DataFrame(weekend_matrix)
matrix_df.to_csv('data/weekend_matrix.csv', index=False, header=False)
weekend.to_csv('data/weekend.csv', index=False, header= True)

# Format Histogram Data
time_matrix = np.zeros((24,2))
for i in range(0,24):
    rides = week[(week['started_at'].apply(lambda x: pd.to_datetime(x).hour) == i)]
    time = rides['total_time'].sum()
    time_matrix[i] = [i, time]
df = pd.DataFrame(time_matrix)
df = df.rename(columns = {0:'group', 1:'value'})
df.to_csv('../data/time_matrix.csv', index=False, header=True)

distance_matrix = np.zeros((24,2))
for i in range(0,24):
    rides = week[(week['started_at'].apply(lambda x: pd.to_datetime(x).hour) == i)]
    distance = rides['total_distance'].sum()
    distance_matrix[i] = [i, distance]
    
df = pd.DataFrame(distance_matrix)
df = df.rename(columns = {0:'group', 1:'value'})
df.to_csv('../data/distance_matrix.csv', index=False, header=True)

# Write week datafile
week.to_csv('../data/week_feb_21.csv')