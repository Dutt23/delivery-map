import { useRef, useEffect, useState } from 'react'
import * as tt from '@tomtom-international/web-sdk-maps'
import * as ttapi from '@tomtom-international/web-sdk-services'
import './App.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css'


const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({})
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);

  const setLocation = () => {
    console.log(navigator.geolocation)
    navigator.geolocation.getCurrentPosition(position => {
      setLatitude(position.coords.latitude)
      setLongitude(position.coords.longitude)
    }, (err) => {
      console.log("ERRO")
      console.log(err)
    })
  }

  const addMarker = (map) => {
    const element = document.createElement('div')
    element.className = 'marker'
    const popupOffSet = {
      bottom: [0, -25]
    }
    const popUp = new tt.Popup({
      offset: popupOffSet
    }).setHTML("This is you")
    const marker = new tt.Marker({
      draggable: true,
      element: element,
    }).setLngLat([longitude, latitude]).addTo(map)

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat()
      setLongitude(lngLat.lng)
      setLatitude(lngLat.lat)
    })
    marker.setPopup(popUp).togglePopup()
  }

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  const addDeliveryMarker = (lngLat, map) => {
    console.log(lngLat)
    const element = document.createElement('div')
    element.className = 'marker-delivery'
    new tt.Marker({
      element: element
    }).setLngLat(lngLat).addTo(map)
  }

  const drawRoute = (geoJson, map) =>{
    if(map.getLayer('route')){
      map.removeLayer('route')
      map.removeSource('route')
    }

    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint :{
        'line-color': '#4a90e2',
        'line-width': 6
      }
    })
  }

  useEffect(async () => {
    const destinations = []
    

    if (!longitude || !latitude)
      await setLocation()

      const origin = {
        lng: longitude,
        lat: latitude,
      }
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficFlow: true,
        trafficIncidents: true
      },
      center: [longitude, latitude],
      zoom: 14
    });
    setMap(map)

    addMarker(map)

   const sortedDestinations = (locations) => {
    const pointsForDestinations = locations.map((destination) => {
      return convertToPoints(destination)
    })
    const callParameters = {
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      destinations: pointsForDestinations,
      origins: [convertToPoints(origin)],
    }
      return new Promise((resolve, reject) => {
        console.log(callParameters)
        ttapi.services.matrixRouting(callParameters).then((matrixApiResults) => {
          const results = matrixApiResults.matrix[0]
          const resultsArray = results.map((result, index) => {
            return {
              location: locations[index],
              drivingTime: result.response.routeSummary.travelTimeInSeconds
            }
          })
          resultsArray.sort((a, b) => {
            return a.dirvingtime - b.drivingtime
          })
          const sortedLocations = resultsArray.map((result) => {
            return result.location
          })
          resolve(sortedLocations);
        })
      })

    }

    const recalculateRoutes = () =>{
      sortedDestinations(destinations).then((sorted) => {
        sorted.unshift(origin)
        ttapi.services.calculateRoute({
          key: process.env.REACT_APP_TOM_TOM_API_KEY,
          locations: sorted
        }).then((routeData) =>{
          const geoJson = routeData.toGeoJson()
          drawRoute(geoJson, map)
        })
      })
    }

    map.on('click', (e) => {
      destinations.push(e.lngLat)
      addDeliveryMarker(e.lngLat, map)
      recalculateRoutes()
    })
    return () => map.remove()
  }, [longitude, latitude])
  return (
    <div>
      {map && <div className="app">
        <div ref={mapElement} className="map"></div>
        <div className="searchBar">
          <h1>Where to ?</h1>
          <input
            id="longitude"
            type="text"
            className="longitude"
            placeholder="Put in longitude"
            onChange={(e) => {
              setLongitude(e.target.value)
            }}
          />
          <input
            id="latitude"
            type="text"
            className="latitude"
            placeholder="Put in latitude"
            onChange={(e) => {
              setLatitude(e.target.value)
            }}
          />
        </div>
      </div>}
    </div>
  );
}

export default App;
