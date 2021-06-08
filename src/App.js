import { useRef, useEffect, useState } from 'react'
import * as tt from '@tomtom-international/web-sdk-maps'
import './App.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css'


const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({})
  const [longitude, setLongitude] = useState(-0.1278);
  const [latitude, setLatitude] = useState(51.5074);

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
  useEffect(() => {
    if (!longitude || !latitude)
      setLocation()
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
    const element = document.createElement('div')
    element.className = 'marker'

    const addMarker = () => {
      const marker = new tt.Marker({
        draggable: true,
        element: element,
      }).setLngLat([longitude, latitude]).addTo(map)

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        setLongitude(lngLat.lng)
        setLatitude(lngLat.lat)
      })
    }

    addMarker()

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
            placeHolder="Put in latitude"
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
