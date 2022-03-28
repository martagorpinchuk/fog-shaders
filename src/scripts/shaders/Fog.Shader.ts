import { Color, ShaderMaterial, TextureLoader, Vector2, Vector4 } from "three";
import Fog from '../index';

let randomnum = Math.random();
const textureLoader = new TextureLoader();
const fogTexture = textureLoader.load( 'resources/textures/fog1.png' );
const noise = textureLoader.load( 'resources/textures/tNoise.png' );

export class FogMaterial extends ShaderMaterial {

    constructor() {

        super();

        this.vertexShader = `
            attribute float size;

            attribute vec4 transformRow1;
            attribute vec4 transformRow2;
            attribute vec4 transformRow3;
            attribute vec4 transformRow4;

            varying vec2 vUv;

            uniform float uRandomNum;
            uniform sampler2D uNoise;
            uniform float uTime;

            void main() {


				// gl_PointSize = size * ( 300.0 / -mvPosition.z );

                mat4 transforms = mat4(
                    transformRow1,
                    transformRow2,
                    transformRow3,
                    transformRow4
                );

                mat3 invViewRot = inverse( mat3( modelViewMatrix ) );

                // gl_Position = projectionMatrix * modelViewMatrix * transforms * vec4( pos, 1.0 );

                gl_Position = projectionMatrix * ( modelViewMatrix * transforms * vec4(0.0, 0.0, 0.0, 1.0) + vec4( position, 1.0 ) );

                vUv = uv;

            }
        `;

        this.depthWrite = false;
        this.transparent = true;

        this.fragmentShader = `
            // #define PI 3.1415926538

            varying vec2 vUv;

            uniform sampler2D uPointTexture;
            uniform float alphaTest;
            uniform vec3 uColor;
            uniform float uTime;
            uniform vec4 uvOffsets;
            uniform float uFragmentTime;

            void main() {

                gl_FragColor = vec4( uColor, 1.0 );

                // gl_FragColor = gl_FragColor * texture2D( uPointTexture, vec2( gl_PointCoord.x * 0.25 + uvOffset.x, gl_PointCoord.y * 0.25 + uvOffset.y ) );

                vec4 texture1 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + uvOffsets.x, vUv.y * 0.25 + uvOffsets.y ) );
                vec4 texture2 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + uvOffsets.z, vUv.y * 0.25 + uvOffsets.w ) );

                // gl_FragColor = ( uFragmentTime * texture1 + texture2 * ( 1.0 - uFragmentTime ) );
                gl_FragColor = mix( texture1, texture2, uFragmentTime );

                if ( gl_FragColor.a < alphaTest ) discard;

            }
        `;

        this.uniforms = {
            uRandomNum: { value: randomnum },
            uPointTexture: { value: fogTexture },
            uNoise: { value: noise },
            alphaTest: { value: 0.0001 },
            uColor: { value: new Color( 0xffffff ) },
            uTime: { value: 0.0 },
            uTimeX: { value: 0.0 },
            uTimeY: { value: 0.0 },
            // uvOffset: { value: new Vector2() },
            uvOffsets: { value: new Vector4() },
            uFragmentTime: { value: 0.0 }
        };

    }

}
