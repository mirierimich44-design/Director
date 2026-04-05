import React from 'react';
import { Composition } from 'remotion';
import { AnimationComponent } from './AnimationComponent';
import { MapTestComposition } from './MapTestComposition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Animation"
                component={AnimationComponent}
                durationInFrames={450}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="MapTest"
                component={MapTestComposition}
                durationInFrames={180}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
