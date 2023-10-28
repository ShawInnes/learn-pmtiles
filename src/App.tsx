import {
  AttributionControl,
  GeolocateControl, Layer,
  Map,
  MapLayerMouseEvent, MapProvider,
  MapStyle,
  NavigationControl, Source, ViewState,
} from 'react-map-gl/maplibre';
import maplibregl, {LayerSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

//@ts-ignore
import {point, lineString, featureCollection} from '@turf/turf';
//@ts-ignore
import FitParser from 'fit-file-parser';

import {useCallback, useEffect, useState} from 'react';
import {Protocol} from 'pmtiles';
import layers from 'protomaps-themes-base';
import {NavbarMinimal} from './components/Navbar.tsx';
import {AppShell, Burger, Group, Text, rem, useMantineColorScheme} from '@mantine/core';
import {useDisclosure, useViewportSize} from '@mantine/hooks';
import {Dropzone, FileWithPath} from '@mantine/dropzone';
import {IconThumbDown, IconThumbUp} from '@tabler/icons-react';
import {FeatureCollection} from 'geojson';
import MapRotator from './components/MapRotator.tsx';

const NAVBAR_WIDTH = 60;
const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 40;

const ENABLE_3D = true;
const LOCAL_URL = 'pmtiles://toledo.pmtiles';
// const SERVER_URL = `http://localhost:3000/toledo`;
// const SERVER_CATALOG_URL = `http://localhost:3000/catalog`;

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
  const [mapStyle, setMapStyle] = useState<MapStyle>();
  const [viewState, setViewState] = useState<Partial<ViewState>>();
  const {height, width} = useViewportSize();

  const [cursor, setCursor] = useState<string>('auto');
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>(['nonexist']);
  const [opened, {toggle}] = useDisclosure();

  const {colorScheme} = useMantineColorScheme();

  const [geoJson, setGeoJson] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

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

    setInteractiveLayerIds(['gps']);

    // setViewState({
    //   longitude: 152.988942,
    //   latitude: -27.409726,
    //   zoom: 15,
    // })

    // fetch(SERVER_URL)
    //   .then((response) => response.json())
    //   .then((response) => {
    //     // setViewState({
    //     //   longitude: response.center[0],
    //     //   latitude: response.center[1],
    //     //   zoom: response.maxzoom - 2,
    //     // });
    //   });

    setViewState({
      longitude: -4.024145,
      latitude: 39.858045,
      zoom: 14.3,
    });

    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  useEffect(() => {
    const defaultLayerStyles = layers('pmtiles', colorScheme);

    const customMapStyle: MapStyle = {
      version: 8,
      glyphs: 'fonts/{fontstack}/{range}.pbf',
      sources: {
        'pmtiles': {
          type: 'vector',
          url: LOCAL_URL,
          // attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: [
        ...defaultLayerStyles,
         buildingsLayer,
      ],
    };

    setMapStyle(customMapStyle);
  }, [colorScheme]);

  const onDrop = async (files: FileWithPath[]) => {
    const fitParser = new FitParser();

    for (const file of files) {
      const content = await file.arrayBuffer();
      fitParser.parse(content, function (error: any, data: any) {
        if (error) {
          console.warn(error);
        } else {
          const points = data.records
            .filter((p: any) => p.position_lat && p.position_long)
            .map((p: any) => ([p.position_long, p.position_lat, p.enhanced_altitude]));

          const lineStringFeature = lineString(points, {name: file.name});
          const pointFeatures = points.map((p: any) => point(p, {altitude: p[2]}));
          const collection = featureCollection([lineStringFeature, ...pointFeatures]);

          setGeoJson(collection);
        }
      });
    }
  };

  return (
    <MapProvider>
      <AppShell
        header={{height: HEADER_HEIGHT}}
        navbar={{width: NAVBAR_WIDTH, breakpoint: 'sm', collapsed: {mobile: !opened}}}
        footer={{height: FOOTER_HEIGHT}}
        padding={0}
      >
        <AppShell.Header>
          <Group px="md" py="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm"/>
            {/*<CoordinatesDisplay/>*/}
          </Group>
        </AppShell.Header>
        <AppShell.Navbar>
          <NavbarMinimal/>
        </AppShell.Navbar>
        <AppShell.Main>
          <Map
            id="default"
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

            style={{
              width: rem(width - NAVBAR_WIDTH),
              height: rem(height - HEADER_HEIGHT - FOOTER_HEIGHT),
            }}

            attributionControl={false}
          >
            <Source id="garmin" type="geojson" data={geoJson}>
              <Layer
                id="route"
                source="garmin"
                type={'line'}
                paint={{
                  'line-color': '#b02ff1',
                  'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 3,
                    19, 10,
                  ],
                }}/>

              <Layer
                type={'circle'}
                id="gps"
                paint={{
                  'circle-color': '#f9b0fc',
                  'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    10, 1,
                    14, 2,
                    17, 3,
                    19, 5,
                  ],
                }}/>
            </Source>
            <GeolocateControl position="top-left"/>
            <NavigationControl/>
            <AttributionControl position="bottom-right" compact={false}/>
            <MapRotator enabled={false}/>
          </Map>
          <AppShell.Footer>
            <Dropzone onDrop={onDrop} style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Dropzone.Accept>
                <IconThumbUp/>
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconThumbDown/>
              </Dropzone.Reject>
              <Dropzone.Idle>
                <Text size="sm" inline>
                  Drag FIT files here or click to select files
                </Text>
              </Dropzone.Idle>
            </Dropzone>
          </AppShell.Footer>
        </AppShell.Main>
      </AppShell>
    </MapProvider>
  );
}

export default App;
