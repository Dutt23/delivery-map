import './App.css';
import {useRef, useEffect, useState} from 'react'
import * as tt from '@tomtom-international/web-sdk-maps'

const  App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({})
  const [longitude, setLongitude] = useState(-0.1278);
  const [latitude, setLatitude] = useState(51.5074);

  const setLocation = () =>{
  console.log(navigator.geolocation)
  navigator.geolocation.getCurrentPosition( position  =>{
      setLatitude(position.coords.latitude)
      setLongitude(position.coords.longitude)
    }, (err) => {
      console.log("ERRO")
      console.log(err)
    })
  }
  useEffect(() => {
    setLocation()
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility:{
        trafficFlow: true,
        trafficIncidents: true
      },
      center: [longitude, latitude],
      zoom:14
  });
  setMap(map)
  return () => map.remove()
  }, [longitude, latitude])
  return (
    <div className="App">
      <div ref={mapElement} className = "map"></div>
      <div className="searchBar">
        <h1>Where to ?</h1>
        <input
        id= "longitude"
        type = "text"
        className = "longitude"
        placeHolder = "Put in longitude"
        onChange={(e) =>{
          setLongitude(e.target.value)
        }}
        />
        <input
        id= "latitude"
        type = "text"
        className = "latitude"
        placeHolder = "Put in latitude"
        onChange={(e) =>{
          setLatitude(e.target.value)
        }}
        />
      </div>
    </div>
  );
}

export default App;
