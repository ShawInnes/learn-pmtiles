import * as React from 'react';
import {useMap} from 'react-map-gl/maplibre';
import {useEffect} from 'react';

type MapRotatorProps = {
  enabled?: boolean
};

const MapRotator: React.FC<MapRotatorProps> = (props: MapRotatorProps) => {
  const {enabled} = props;
  const {current} = useMap();

  useEffect(() => {
    if (current?.loaded() && enabled) {
      rotateCamera(0);
    } else if (current?.loaded() && !enabled) {
      console.log('stop anim');
    }
  }, [enabled]);

  const rotateCamera = (timestamp: number) => {
    if (enabled === false)
      return;

    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    current?.rotateTo((timestamp / 100) % 360, {duration: 0});

    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  };

  return (<></>);
};

export default MapRotator;