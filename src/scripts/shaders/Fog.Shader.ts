import { Color, ShaderMaterial, TextureLoader, Vector2, Vector3, Vector4 } from "three";
// import FogScene from '../index';

let randomnum = Math.random();
const textureLoader = new TextureLoader();
const fogTexture = textureLoader.load( 'resources/textures/fog1.png' );
const noise = textureLoader.load( 'resources/textures/tNoise.png' );

export class FogMaterial extends ShaderMaterial {

    constructor() {

        super();

        this.vertexShader = `
            attribute vec4 transformRow1;
            attribute vec4 transformRow2;
            attribute vec4 transformRow3;
            attribute vec4 transformRow4;
            attribute float offsetFrame;
            attribute float size;
            attribute vec3 velocity;
            attribute float opacityDecrease;

            varying vec2 vUv;
            varying float vOffsetFrame;
            varying float vCurrentFrameId;
            varying float vNextFrameId;
            varying float vOpacityDecrease;
            varying float vOpacity;
            varying vec3 vPosition;

            uniform float uRandomNum;
            uniform sampler2D uNoise;
            uniform float uTime;
            uniform float uFrameDuration;
            uniform float uOpacity;

            void main() {

                float numOfFrames = 16.0;

                float currentFrameId = mod( floor( mod( uTime + offsetFrame, numOfFrames * uFrameDuration ) / uFrameDuration ), numOfFrames );

                float nextFrameId;
                if ( currentFrameId == numOfFrames - 1.0 ) {

                    nextFrameId = 0.0;

                } else {

                    nextFrameId = currentFrameId + 1.0;

                }

                mat4 transforms = mat4(
                    transformRow1,
                    transformRow2,
                    transformRow3,
                    transformRow4
                );

                gl_Position = projectionMatrix * ( modelViewMatrix * transforms * vec4(0.0, 0.0, 0.0, 1.0) + vec4( position * size, 1.0 ) );

                vUv = uv;
                vOffsetFrame = offsetFrame;
                vNextFrameId = nextFrameId;
                vCurrentFrameId  = currentFrameId;
                vOpacityDecrease = opacityDecrease;
                vOpacity = uOpacity;
                vPosition = transformRow4.xyz;

            }
        `;

        this.depthWrite = false;
        this.transparent = true;
        // this.wireframe = true;

        this.fragmentShader = `
            varying vec2 vUv;
            varying float vOffsetFrame;
            varying float vCurrentFrameId;
            varying float vNextFrameId;
            varying float vOpacityDecrease;
            varying float vOpacity;
            varying vec3 vPosition;

            uniform sampler2D uPointTexture;
            uniform float alphaTest;
            uniform vec3 uColor;
            uniform float uTime;
            uniform float uFrameDuration;
            uniform vec3 uInnerColor;

            void main() {

                gl_FragColor = vec4( uColor, 0.04 );

                //

                vec4 offsets;

                offsets.y = floor( vCurrentFrameId / 4.0 ) * 0.25;
                offsets.x = mod( vCurrentFrameId, 4.0 ) * 0.25;

                offsets.w = floor( vNextFrameId / 4.0 ) * 0.25;
                offsets.z = mod( vNextFrameId, 4.0 ) * 0.25;

                //

                vec4 texture1 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + offsets.x, vUv.y * 0.25 + offsets.y ) );
                vec4 texture2 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + offsets.z, vUv.y * 0.25 + offsets.w ) );

                float fragmentTime = mod( uTime + vOffsetFrame, uFrameDuration ) / uFrameDuration;

                gl_FragColor = mix( texture1, texture2, fragmentTime );
                vec3 finalColor = uColor;

                finalColor = mix( uColor, uInnerColor, step( 0.3, vOpacityDecrease ) * vOpacityDecrease );

                gl_FragColor *= vec4( finalColor, vOpacityDecrease * vOpacity );

                if ( gl_FragColor.a < alphaTest ) discard;

            }
        `;

        this.uniforms = {
            uRandomNum: { value: randomnum },
            uPointTexture: { value: fogTexture },
            uNoise: { value: noise },
            alphaTest: { value: 0.0001 },
            uColor: { value: new Color( 0x1A75FF ) },
            uTime: { value: 0.0 },
            uTimeX: { value: 0.0 },
            uTimeY: { value: 0.0 },
            uFrameDuration: { value: 16.0 },
            uOpacity: { value: 0.9 },
            uInnerColor: { value: new Color( 0xFFCE00 ) }
        };

    }

}
