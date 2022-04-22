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

        void main() {

            vec2 newUv = vUv;
            vec2 displUV = texture2D( uNoise, vUv ).xy + uTime / 5.0;

            float col = pow( clamp( mix( 0.5, texture2D( uNoise, newUv + displUV ).x, 2.0 ), 0.0, 1.0 ), 20.0 ); // 40

            // Clipping
            float cutoff = 0.2;
            float test = col - cutoff;
            // clip( gl_FragColor.a - cutoff );
            // if( 0.0 > test ) discard;

            //

            vec4 rampCol = texture2D( uNoise, vec2( col, 0.0 ) );
            vec4 finalCol = vec4( vec3( rampCol ), 1.0 ) + vec4( step( test, 0.5 ) * smoothstep( 0.001, 0.1, 0.02 ) );

            float n = 1.0 - texture2D( uNoise, newUv + displUV ).r;
            float opacity = 1.0 - smoothstep( 1.0 - uTime / 0.8, 1.0 - uTime / 1.0, n );
            vec3 color = uColor * max( 1.0, 5.0 * smoothstep( 1.0 - uTime / 0.8, 1.0 - uTime / 1.0, n ) );

            gl_FragColor.rgb = color; // vec3( col ) + uColor;
            gl_FragColor.a = opacity; // test;

            float nn = texture2D( uNoise, newUv + displUV ).r;
            gl_FragColor.rgb = vec3( uColor ) * max( 1.0, 2.0 * smoothstep( 1.0 - uTime / 0.7, 1.0 - uTime / 1.0, nn ) );
            gl_FragColor.a = 1.0 - smoothstep( 1.0 - uTime / 0.8, 1.0 - uTime / 1.0, nn );

        }
        `,
        this.uniforms = {

            uTime: { value: 0.0 },
            uNoise: { value: uNoise },
            uColor: { value: new Color( 0x8eb4e6 ) },

        }

    }

 };