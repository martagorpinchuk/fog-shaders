import { Color, ShaderMaterial, TextureLoader } from "three";

//

// perlin noise texture
export let uNoise = new TextureLoader().load( 'resources/textures/tNoise.png' );

export class СombustionMaterial extends ShaderMaterial {

    constructor () {

        super();

        this.transparent = true;

        this.vertexShader = `
        varying vec2 vUv;

        void main() {

            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

            vUv = uv;

        }
        `,

        this.fragmentShader = `
        varying vec2 vUv;

        uniform sampler2D uNoise;
        uniform float uTime;
        uniform vec3 uColor;
        uniform sampler2D tDiffuse;

        void main() {

            vec2 newUv = vUv;
            vec2 displUV = texture2D( uNoise, vUv ).xy + uTime / 5.0;
            vec4 potatoTexture = texture2D( tDiffuse, vUv );

            float col = pow( clamp( mix( 0.5, texture2D( uNoise, newUv + displUV ).x, 2.0 ), 0.0, 1.0 ), 20.0 );

            float nn = texture2D( uNoise, newUv / 15.0 + displUV ).r;
            gl_FragColor.rgb = vec3( max( 1.0, 24.0 * smoothstep( 1.0 - uTime / 0.7, 1.0 - uTime / 1.0, nn ) ) ) * potatoTexture.rgb;
            gl_FragColor.a = 1.0 - smoothstep( 1.0 - uTime / 0.8, 1.0 - uTime / 1.0, nn );

        }
        `,
        this.uniforms = {

            uTime:      { value: 0.0 },
            uNoise:     { value: uNoise },
            uColor:     { value: new Color( 0xff0000 ) },
            tDiffuse:   { value: null }
        }

    }

 };