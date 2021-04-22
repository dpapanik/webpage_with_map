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


def distance_time_matrix(df):
    '''Create distance and time matricies with 2 groups of members and non-members'''

    # Calculate Total Distance for Histogram
    df['total_distance'] = df.apply(lambda x: distance.distance(
        (x["start_lat"], x["start_lng"]), (x["end_lat"], x["end_lng"])), axis=1)
    df['total_distance'] = df['total_distance'].apply(lambda x: x.km)

    # Calculate Total Time for Histogram
    df["ended_at"] = pd.to_datetime(df["ended_at"])
    df['total_time'] = df['ended_at'] - df['started_at']
    df['total_time'] = df['total_time'].dt.total_seconds().div(60).astype(int)

    # Drop is ride is less than 2 mins and less than 100m (.1km)
    drop_index = df[(df['total_time'] < 2) & (
        df['total_distance'] < .01)].index
    df = df.drop(drop_index)

    # Split Members and Nonmembers
    df_mem = df[df['member_casual'] == 'member']
    df_casual = df[df['member_casual'] == 'casual']

    # Format Histogram
    distance_matrix = np.zeros((24, 3))
    time_matrix = np.zeros((24, 3))
    for i in range(0, 24):
        # Members
        rides_mem = df_mem[(df_mem['started_at'].apply(
            lambda x: pd.to_datetime(x).hour) == i)]
        distance_mem = rides_mem['total_distance'].sum()
        time_mem = rides_mem['total_time'].sum()

        # Casual
        rides_casual = df_casual[(df_casual['started_at'].apply(
            lambda x: pd.to_datetime(x).hour) == i)]
        distance_casual = rides_casual['total_distance'].sum()
        time_casual = rides_casual['total_time'].sum()

        # Append to matrix
        distance_matrix[i] = [i, distance_mem, distance_casual]
        time_matrix[i] = [i, time_mem, time_casual]

    # Create DataFrames
    distance_df = pd.DataFrame(distance_matrix)
    distance_df = distance_df.rename(
        columns={0: 'group', 1: 'Member', 2: 'Casual'})
    distance_df['group'] = distance_df.group.astype(int)

    time_df = pd.DataFrame(time_matrix)
    time_df = time_df.rename(columns={0: 'group', 1: 'Member', 2: 'Casual'})
    time_df['group'] = time_df.group.astype(int)

    return(distance_df, time_df)


def seperate_member(df):
    '''Take in full dataset and return 2 df split between members and casual'''
    df_mem = df[df['member_casual'] == 'member']
    df_casual = df[df['member_casual'] == 'casual']

    return df_mem, df_casual


def seperate_commute(df):
    '''
    Take in full dataset and return 2 dataframes split between monring & evening commute
    Morning Commute (6-10am)
    Evening Commute (5-8pm) (5:00pm - 7:59pm)
    '''
    morning_commute = df[(df["started_at"].apply(lambda x: pd.to_datetime(x).hour) > 6) & (
        df["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 10)]

    evening_commute = df[(df["started_at"].apply(lambda x: pd.to_datetime(
        x).hour) > 17) & (df["started_at"].apply(lambda x: pd.to_datetime(x).hour) < 20)]

    return morning_commute, evening_commute


def geojson_check(land_json, point):
    '''
    input land_json: Dict created from a JSON.load(geojson)
    input point: Point object of lat, lng
    Output: 
    '''
    for feature in land_json['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(point):
            # Return Zoning Value
            return feature['properties']['Zoning']


def check_outside_dc(lat, lng):
    '''TODO: Check Start and End and check to see if either is not DC.  Return early to save API calls if not DC'''
    geolocator = Nominatim(user_agent="DC_Bikeshare")
    location = geolocator.reverse(str(lat) + "," + str(lng))
    return(location.raw['address']['state'])


def create_matrix(clusters, df):
    '''
    Each row is a group (Cluster Label)
    Row to column (0,1) -> from cluster 0 to cluster 1.  (2,1) -> from cluster 2 to cluster 1
    Square Matrix in the end
    '''
    matrix = np.zeros(shape=(len(clusters), len(clusters)))
    i = 0
    for i_cluster in clusters:
        j = 0
        for j_cluster in clusters:
            matrix[i][j] = df[(df['start_land_cluster'] == i_cluster) &
                              (df['end_land_cluster'] == j_cluster)].shape[0]
            j = j + 1
        i = i + 1

    return (matrix)


if __name__ == "__main__":

    # Read in data, drop nulls, fix format
    df_2021 = pd.read_csv("./data/tmp/2021.csv")
    df_2021 = df_2021.dropna()
    df_2021['started_at'] = pd.to_datetime(df_2021.started_at)

    # Create time & distance dfs for the first question
    distance_df, time_df = distance_time_matrix(df_2021)
    distance_df.to_csv('./data/assignment_3/distance_matrix.csv',
                       index=False, header=True)
    time_df.to_csv('./data/assignment_3/time_matrix.csv',
                   index=False, header=True)

    # Create seperate dfs of commute types for the 2nd question heat maps
    morning, evening = seperate_commute(df_2021)
    morning.to_csv('data/assignment_3/morning_heat.csv')
    evening.to_csv('data/assignment_3/evening_heat.csv')

    # Add Land Use Clusters for Question # 3
    with open('data/assignment_3/land_use_boundary.geojson') as f:
        js = json.load(f)

        # Start Land Use
        df_2021['start_land_cluster'] = df_2021.apply(
            lambda x: geojson_check(land_json=js, point=Point(x['start_lng'], x['start_lat'])), axis=1)

        # End Land Use
        df_2021['end_land_cluster'] = df_2021.apply(
            lambda x: geojson_check(land_json=js, point=Point(x['end_lng'], x['end_lat'])), axis=1)

        # Add Zone for Null Land Use
        df_2021['start_land_cluster'] = df_2021.start_land_cluster.fillna(
            'Open_Air')
        df_2021['end_land_cluster'] = df_2021.end_land_cluster.fillna(
            'Open_Air')

    # Drop Non DC Trips
    tmpdf = df_2021.head(100)
    tmpdf['dc_only'] = tmpdf.apply(lambda x: check_outside_dc(
        x['start_lat'], x['start_lng']), axis=1)

    # Create Member and Casual Clusters for Question #3
    legend = pd.DataFrame(sorted(df_2021.start_land_cluster.unique()))

    member_cluster = create_matrix(clusters=sorted(df_2021.start_land_cluster.unique()),
                                   df=df_2021[df_2021['member_casual'] == 'member'])
    member_cluster_df = pd.DataFrame(member_cluster)
    member_cluster_df.to_csv(
        'data/assignment_3/member_cluster_matrix.csv', index=False, header=False)

    casual_cluster = create_matrix(clusters=sorted(df_2021.start_land_cluster.unique()),
                                   df=df_2021[df_2021['member_casual'] == 'casual'])
    casual_cluster_df = pd.DataFrame(casual_cluster)
    casual_cluster_df.to_csv(
        'data/assignment_3/casual_cluster_matrix.csv', index=False, header=False)
