import {
  AttributionControl,
  GeolocateControl,
  Map,
  MapLayerMouseEvent, MapProvider,
  MapStyle,
  NavigationControl, useMap, ViewState,
} from 'react-map-gl/maplibre';
import maplibregl, {LayerSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import {useCallback, useEffect, useState} from 'react';
import {PMTiles, Protocol} from 'pmtiles';
import layers from 'protomaps-themes-base';

const ENABLE_3D = false;
const LOCAL_URL = 'pmtiles://queensland.pmtiles';
const SERVER_URL = `http://localhost:3000/toledo`;
const SERVER_CATALOG_URL = `http://localhost:3000/catalog`;
// http://localhost:3000/catalog

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

function MapRotator() {
  const {current} = useMap();

  const rotateCamera = (timestamp: number) => {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    current?.rotateTo((timestamp / 150) % 360, {duration: 0});

    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  };

  current?.on('load', () => {
    if (ENABLE_3D)
      rotateCamera(0);
  });

  return (<></>);
}

function App() {
  const [mapStyle, setMapStyle] = useState<MapStyle>();
  const [viewState, setViewState] = useState<Partial<ViewState>>();

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
          url: SERVER_URL,
          // attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: [
        ...defaultLayers,
        // buildingsLayer,
      ],
    };

    setMapStyle(customMapStyle);
    setInteractiveLayerIds(['buildings']);
    fetch(SERVER_URL)
      .then((response) => response.json())
      .then((response) => {
        // setViewState({
        //   longitude: 152.988942,
        //   latitude: -27.409726,
        //   zoom: 15,
        // })
        setViewState({
          longitude: response.center[0],
          latitude: response.center[1],
          zoom: response.maxzoom - 3,
        });
      });


    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);


  return (
    <MapProvider>
      <Map
        {...viewState}
        styleDiffing
        pitch={ENABLE_3D ? 45 : 0}

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
        <MapRotator/>
      </Map>

    </MapProvider>
  );
}

export default App;
