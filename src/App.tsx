import {Map, MapLayerMouseEvent, NavigationControl} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import {useCallback, useEffect, useState} from 'react';
import {Protocol} from 'pmtiles';
import layers from 'protomaps-themes-base';

const TILES_URL = 'northside.pmtiles';

const buildingsLayer = {
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
  const [mapStyle, setMapStyle] = useState<any>();
  const [viewState, setViewState] = useState({
    longitude: 152.988942,
    latitude: -27.409726,
    zoom: 14,
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
    // console.log(defaultLayers);

    const customMapStyle = {
      version: 8,
      // glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
      glyphs: 'fonts/{fontstack}/{range}.pbf',
      sources: {
        'pmtiles': {
          type: 'vector',
          url: `pmtiles://${TILES_URL}`,
        },
      },
      attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      layers:
        [
          ...defaultLayers,
          buildingsLayer,
        ],
    };

    setMapStyle(customMapStyle);

    setInteractiveLayerIds(['buildings']);

    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  return (
    <>
      <Map
        {...viewState}
        styleDiffing
        pitch={45}

        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
        interactiveLayerIds={interactiveLayerIds}

        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapLib={maplibregl}
        style={{width: '100vw', height: '100vh'}}
        attributionControl={true}
      >
        <NavigationControl/>
      </Map>
    </>
  );
}

export default App;
