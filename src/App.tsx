import {Map, NavigationControl} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import {useEffect, useState} from 'react';
import {Protocol} from 'pmtiles';

const TILES_URL = 'northside.pmtiles';
import MAP_STYLE from './map-style-basic-v8.json';

function App() {
  const [mapStyle, setMapStyle] = useState();
  const [viewState, setViewState] = useState({
    longitude: 152.988942,
    latitude: -27.409726,
    zoom: 14,
  });

  useEffect(() => {
    let protocol = new Protocol();

    maplibregl.addProtocol('pmtiles', protocol.tile);

    const defaultMapStyle: any = MAP_STYLE;
    const customMapStyle = {
      sources: {
        pmtiles: {
          type: 'vector',
          url: `pmtiles://${TILES_URL}`,
        },
      },
      ...defaultMapStyle,
    };

    setMapStyle(customMapStyle);

    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  return (
    <>
      <Map
        {...viewState}
        styleDiffing
        onMove={evt => setViewState(evt.viewState)}
        onBoxZoomEnd={(e) => {
          console.log(e.target.getBounds().getNorthEast());
        }}
        mapStyle={mapStyle}
      >
        <NavigationControl/>
      </Map>
    </>
  );
}

export default App;
