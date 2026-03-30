import React from 'react';
import { Composition } from 'remotion';
import { AnimationComponent } from './AnimationComponent';

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
        </>
    );
};
