import requests
import folium

ORS_API_KEY = 'YOUR_OPENROUTESERVICE_API_KEY'

def get_transit_route(origin, destination):
    """
    Fetches a route between two coordinates using OpenRouteService API.
    :param origin: tuple of (latitude, longitude) for the start point
    :param destination: tuple of (latitude, longitude) for the end point
    :return: The response data with the route information
    """
  
    ors_url = 'https://api.openrouteservice.org/v2/directions/driving-car'
    headers = {
        'Authorization': ORS_API_KEY,
    }
    params = {
        'start': f"{origin[1]},{origin[0]}",
        'end': f"{destination[1]},{destination[0]}"
    }

    response = requests.get(ors_url, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching directions: {response.status_code}")
        return None

def plot_route_on_map(route_data, origin, destination):
    """
    Plots the route on a map using Folium.
    :param route_data: Route information returned from OpenRouteService API
    :param origin: tuple of (latitude, longitude) for the start point
    :param destination: tuple of (latitude, longitude) for the end point
    """
    
    m = folium.Map(location=origin, zoom_start=13)
    
    folium.Marker(origin, popup="Origin").add_to(m)
    folium.Marker(destination, popup="Destination")
                  
    if 'routes' in route_data and route_data['routes']:
        route_geometry = route_data['routes'][0]['geometry']['coordinates']
        
        route_coords = [(coord[1], coord[0]) for coord in route_geometry]
        
        folium.PolyLine(route_coords, color="blue", weight=5).add_to(m)
    
    m.save("transit_route_map.html")
    print("Map saved to 'transit_route_map.html'.")

origin_coords = (38.89511, -77.03637)  
destination_coords = (38.8895, -77.0501)

route_data = get_transit_route(origin_coords, destination_coords)

if route_data:
    plot_route_on_map(route_data, origin_coords, destination_coords)