import { Color, ShaderMaterial } from "three";

//

export class WaterMaterial extends ShaderMaterial {

    constructor () {

        super();

        this.vertexShader = `
        #include <packing>

        varying vec2 vUv;
        varying vec4 vPos;
        varying vec3 vPosFoam;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;

        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main() {

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

            vPos = gl_Position.xyzw;

            vUv = uv;

            vPosFoam = position;

        }

        `,
        this.transparent = true;
        this.fragmentShader = `
        #include <packing>
        #define PI 3.1415926538;

        varying vec2 vUv;
        varying float vDepth;
        varying vec4 vPos;
        varying vec3 vPosFoam;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform vec3 uColor;
        uniform vec3 uFoamColor1;
        uniform vec3 uFoamColor2;
        uniform vec3 uFoamColor3;
        uniform float uTime;

        //	Classic Perlin 2D Noise
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float getPerlinNoise2d(vec2 P)
        {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;
            vec4 i = permute(permute(ix) + iy);
            vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
            vec4 gy = abs(gx) - 0.5;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;
            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);
            vec4 norm = 1.79284291400159 - 0.85373472095314 *
            vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;
            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));
            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
        }

        float convertDepth ( float depth ) {

            float viewZ = perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

        }

        float readDepth( sampler2D depthSampler, vec2 coord ) {

            float fragCoordZ = texture2D( depthSampler, coord ).x;
            return convertDepth( fragCoordZ );

        }

        void main() {

            vec2 centeredUv = vUv - 0.5;
            float distanceToCenter = length( centeredUv );

            //

            vec2 vViewportCoord = vPos.xy;
            vViewportCoord /= vPos.w;
            vViewportCoord = vViewportCoord * 0.5 + 0.5;

            float depth = readDepth( tDepth, vViewportCoord );

            // vec3 color = uFoamColor1;

            float waterDepth = ( depth - convertDepth( gl_FragCoord.z ) );

            float perlinNoise = getPerlinNoise2d( centeredUv * 203.0 + uTime / 20.0 );
            vec3 color = uColor;
            float foamDiff = min( ( waterDepth * 700.0 ) / 1.2, 1.0 );
            // float foam = clamp( sin( foamDiff * 5.0 * 3.1415 ), 0.0, 1.0 );
            float foam = 1.0 - step( foamDiff - clamp( sin( ( foamDiff + sin( uTime / 30.0 ) ) * 9.0 * 3.1415 ), 0.0, 1.0 ) * ( 1.0 - foamDiff ), perlinNoise );

            // foam += perlinNoise;

            // color = mix( uColor, ( foamNoise + 1.7 ) / 3.0 * uColor, foamDiff );
            // color = mix( ( foamNoise + 1.7 ) * uFoamColor1, uColor, foamDiff );

            color = mix( uFoamColor2, uColor, foamDiff );
            // color = step( foamDiff, uFoamColor1 );

            gl_FragColor.rgb = vec3( color );
            gl_FragColor.a = mix( foam, 0.8, foamDiff + 1.5 );

        }
        `
        this.uniforms = {
            cameraNear: { value: 0 },
            cameraFar: { value: 0 },
            tDiffuse: { value: null },
            tDepth: { value: null },
            uColor: { value: new Color( 0x8eb4e6 ) },
            uFoamColor1: { value: new Color( 0xc2e3ff ) },
            uFoamColor2: { value: new Color( 0xe6f6ff ) },
            uFoamColor3: { value: new Color( 0x000001 ) },
            uTime: { value: 0 }
        };

    }

};
