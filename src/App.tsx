import {
  AttributionControl,
  GeolocateControl,
  Map,
  MapLayerMouseEvent,
  MapStyle,
  NavigationControl,
} from 'react-map-gl/maplibre';
import maplibregl, {LayerSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import {useCallback, useEffect, useRef, useState} from 'react';
import {Protocol} from 'pmtiles';
import layers from 'protomaps-themes-base';

const ENABLE_3D = false;
const TILES_URL = 'queensland.pmtiles';

const buildingsLayer: LayerSpecification = {
  'id': '3d-buildings',
  'source': 'pmtiles',
  'source-layer': 'buildings',
  'type': 'fill-extrusion',
  'minzoom': 15,
  'paint': {
    'fill-extrusion-color': [
      'interpolate',
      ['linear'],
      ['coalesce', ['get', 'height'], 5], 0, 'lightgray', 200, 'royalblue', 400, 'lightblue',
    ],
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      16,
      ['coalesce', ['get', 'height'], 5],
    ],
    'fill-extrusion-base': ['case',
      ['>=', ['get', 'zoom'], 16],
      0, 0,
    ],
  },
};

function App() {
  const mapRef = useRef<any>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>();
  const [viewState, setViewState] = useState({
    longitude: 152.988942,
    latitude: -27.409726,
    zoom: 15,
  });

  const [cursor, setCursor] = useState<string>('auto');
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>(['nonexist']);

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features && event.features[0];

    if (feature) {
      console.log(feature.properties);
    }
  }, []);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

  useEffect(() => {
    let protocol = new Protocol();

    maplibregl.addProtocol('pmtiles', protocol.tile);

    const defaultLayers = layers('pmtiles', 'light');

    const customMapStyle: MapStyle = {
      version: 8,
      glyphs: 'fonts/{fontstack}/{range}.pbf',
      sources: {
        'pmtiles': {
          type: 'vector',
          url: `http://localhost:3000/brisbane`,
          // attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: [
        ...defaultLayers,
        // buildingsLayer
      ],
    };

    setMapStyle(customMapStyle);

    setInteractiveLayerIds(['buildings']);

    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  const rotateCamera = (timestamp: number) => {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    mapRef?.current?.rotateTo((timestamp / 100) % 360, {duration: 0});

    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  };

  const onLoad = () => {
    // rotateCamera(0);
  };


  return (
    <>
      <Map
        {...viewState}
        ref={mapRef}
        styleDiffing
        pitch={ENABLE_3D ? 45 : 0}

        onLoad={onLoad}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
        interactiveLayerIds={interactiveLayerIds}

        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        style={{width: '100vw', height: '100vh'}}
        attributionControl={false}
      >
        <GeolocateControl position="top-left"/>
        <NavigationControl/>
        <AttributionControl position="bottom-right" compact={false}/>
      </Map>
    </>
  );
}

export default App;
