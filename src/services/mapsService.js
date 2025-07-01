class MapsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    this.isLoaded = false;
    this.google = null;
  }

  // Initialize Google Maps API
  async initializeGoogleMaps() {
    if (this.isLoaded) return this.google;

    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.google = window.google;
        this.isLoaded = true;
        resolve(this.google);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        this.google = window.google;
        this.isLoaded = true;
        resolve(this.google);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    try {
      await this.initializeGoogleMaps();
      
      const geocoder = new this.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
              formatted_address: results[0].formatted_address,
              place_id: results[0].place_id,
              address_components: results[0].address_components
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  // Get current user location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(lat, lng) {
    try {
      await this.initializeGoogleMaps();
      
      const geocoder = new this.google.maps.Geocoder();
      const latlng = new this.google.maps.LatLng(lat, lng);
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve({
              formatted_address: results[0].formatted_address,
              address_components: results[0].address_components,
              place_id: results[0].place_id
            });
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  // Calculate distance between two points
  async calculateDistance(origin, destination, mode = 'DRIVING') {
    try {
      await this.initializeGoogleMaps();
      
      const service = new this.google.maps.DistanceMatrixService();
      
      return new Promise((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [origin],
          destinations: [destination],
          travelMode: this.google.maps.TravelMode[mode],
          unitSystem: this.google.maps.UnitSystem.METRIC
        }, (response, status) => {
          if (status === 'OK') {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance,
                duration: element.duration,
                status: element.status
              });
            } else {
              reject(new Error(`Distance calculation failed: ${element.status}`));
            }
          } else {
            reject(new Error(`Distance Matrix API failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  // Get directions between multiple waypoints
  async getDirections(origin, destination, waypoints = [], optimizeWaypoints = true) {
    try {
      await this.initializeGoogleMaps();
      
      const directionsService = new this.google.maps.DirectionsService();
      
      const waypointData = waypoints.map(point => ({
        location: point,
        stopover: true
      }));
      
      return new Promise((resolve, reject) => {
        directionsService.route({
          origin,
          destination,
          waypoints: waypointData,
          optimizeWaypoints,
          travelMode: this.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  // Optimize route for multiple company visits
  async optimizeItineraryRoute(companies, startLocation = null) {
    try {
      if (companies.length === 0) {
        throw new Error('No companies provided for route optimization');
      }

      // Get coordinates for all companies
      const companyLocations = await Promise.all(
        companies.map(async (company) => {
          try {
            const geocoded = await this.geocodeAddress(company.address);
            return {
              ...company,
              coordinates: {
                lat: geocoded.lat,
                lng: geocoded.lng
              },
              formatted_address: geocoded.formatted_address
            };
          } catch (error) {
            console.warn(`Could not geocode address for ${company.name}:`, error);
            return {
              ...company,
              coordinates: null,
              geocodeError: error.message
            };
          }
        })
      );

      // Filter out companies without valid coordinates
      const validCompanies = companyLocations.filter(c => c.coordinates);

      if (validCompanies.length === 0) {
        throw new Error('No companies could be geocoded');
      }

      // Use start location or first company as origin
      const origin = startLocation || validCompanies[0].coordinates;
      
      // Create waypoints from company locations
      const waypoints = validCompanies.slice(1).map(company => company.coordinates);
      
      // Get optimized route
      const directions = await this.getDirections(
        origin,
        validCompanies[validCompanies.length - 1].coordinates,
        waypoints,
        true
      );

      // Map the optimized order back to companies
      const optimizedOrder = [validCompanies[0]]; // Origin company
      
      if (directions.routes[0].waypoint_order) {
        directions.routes[0].waypoint_order.forEach(index => {
          optimizedOrder.push(validCompanies[index + 1]);
        });
      }

      return {
        optimizedCompanies: optimizedOrder,
        directions,
        totalDistance: this.calculateTotalDistance(directions),
        totalDuration: this.calculateTotalDuration(directions),
        invalidCompanies: companyLocations.filter(c => !c.coordinates)
      };

    } catch (error) {
      console.error('Error optimizing itinerary route:', error);
      throw error;
    }
  }

  // Calculate total distance from directions result
  calculateTotalDistance(directions) {
    let totalDistance = 0;
    directions.routes[0].legs.forEach(leg => {
      totalDistance += leg.distance.value;
    });
    return {
      text: `${(totalDistance / 1000).toFixed(1)} km`,
      value: totalDistance
    };
  }

  // Calculate total duration from directions result
  calculateTotalDuration(directions) {
    let totalDuration = 0;
    directions.routes[0].legs.forEach(leg => {
      totalDuration += leg.duration.value;
    });
    return {
      text: `${Math.round(totalDuration / 60)} minutes`,
      value: totalDuration
    };
  }

  // Search for places near a location
  async searchNearbyPlaces(location, type = 'restaurant', radius = 5000) {
    try {
      await this.initializeGoogleMaps();
      
      const service = new this.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      return new Promise((resolve, reject) => {
        service.nearbySearch({
          location: new this.google.maps.LatLng(location.lat, location.lng),
          radius,
          type
        }, (results, status) => {
          if (status === this.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results.map(place => ({
              place_id: place.place_id,
              name: place.name,
              vicinity: place.vicinity,
              rating: place.rating,
              price_level: place.price_level,
              types: place.types,
              geometry: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              photos: place.photos?.map(photo => photo.getUrl()) || []
            })));
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error searching nearby places:', error);
      throw error;
    }
  }

  // Get place details
  async getPlaceDetails(placeId) {
    try {
      await this.initializeGoogleMaps();
      
      const service = new this.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      return new Promise((resolve, reject) => {
        service.getDetails({
          placeId,
          fields: [
            'name', 'formatted_address', 'geometry', 'rating',
            'formatted_phone_number', 'website', 'opening_hours',
            'reviews', 'photos', 'price_level', 'types'
          ]
        }, (place, status) => {
          if (status === this.google.maps.places.PlacesServiceStatus.OK) {
            resolve({
              place_id: placeId,
              name: place.name,
              formatted_address: place.formatted_address,
              geometry: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              rating: place.rating,
              phone: place.formatted_phone_number,
              website: place.website,
              opening_hours: place.opening_hours,
              reviews: place.reviews,
              photos: place.photos?.map(photo => photo.getUrl()) || [],
              price_level: place.price_level,
              types: place.types
            });
          } else {
            reject(new Error(`Place details request failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  // Find hotels near companies
  async findNearbyHotels(companies, radius = 10000) {
    try {
      const hotelSearches = companies.map(async (company) => {
        if (!company.coordinates) return [];
        
        const hotels = await this.searchNearbyPlaces(
          company.coordinates,
          'lodging',
          radius
        );
        
        return hotels.map(hotel => ({
          ...hotel,
          nearCompany: company.name,
          distanceFromCompany: this.calculateStraightLineDistance(
            company.coordinates,
            hotel.geometry
          )
        }));
      });

      const allHotels = await Promise.all(hotelSearches);
      return allHotels.flat();
    } catch (error) {
      console.error('Error finding nearby hotels:', error);
      throw error;
    }
  }

  // Calculate straight-line distance between two points
  calculateStraightLineDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Create a map instance
  async createMap(container, options = {}) {
    try {
      await this.initializeGoogleMaps();
      
      const defaultOptions = {
        zoom: 10,
        center: { lat: 39.9042, lng: 116.4074 }, // Beijing default
        mapTypeId: this.google.maps.MapTypeId.ROADMAP
      };

      return new this.google.maps.Map(container, {
        ...defaultOptions,
        ...options
      });
    } catch (error) {
      console.error('Error creating map:', error);
      throw error;
    }
  }

  // Add markers to a map
  addMarkersToMap(map, locations, options = {}) {
    const markers = [];
    
    locations.forEach((location, index) => {
      const marker = new this.google.maps.Marker({
        position: location.coordinates || location,
        map,
        title: location.name || `Location ${index + 1}`,
        ...options
      });

      if (location.infoWindow) {
        const infoWindow = new this.google.maps.InfoWindow({
          content: location.infoWindow
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      markers.push(marker);
    });

    return markers;
  }
}

export default new MapsService(); 