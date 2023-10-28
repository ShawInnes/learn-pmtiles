import * as React from 'react';
import {useMap} from 'react-map-gl/maplibre';
import {Text} from '@mantine/core';

const CoordinatesDisplay: React.FC = () => {
  const {default: defaultMap} = useMap();

  return (
    <>
      <Text>Coordinates: {defaultMap?.getCenter().toString()}, Zoom: {defaultMap?.getZoom().toString()}</Text>
    </>
  );
};

export default CoordinatesDisplay;