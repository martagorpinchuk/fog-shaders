import { BufferAttribute, BufferGeometry, Camera, Clock, Color, DoubleSide, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Points, PointsMaterial, Quaternion, Renderer, Scene, ShaderMaterial, Vector3, WebGLRenderer } from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FogMaterial } from './shaders/Fog.Shader';
import { Pane } from 'tweakpane';


//

class Fog {

    public camera: PerspectiveCamera;
    public plane: Mesh;
    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;
    public fogInstance: any;
    public fogParticle: any;
    public delta: number;
    public elapsedTime: number = 0;
    public clock: Clock;
    public fogMaterial: any;
    public pane: Pane;
    public numberOfSprites: number = 10;
    public foginstanceBuffGeom: InstancedBufferGeometry;
    public frameDuration: number = 500;
    public fogHeight: number = 0.015;
    public fogWidth: number = 1;
    public fogDepth: number = 1;

    private sizes = {
        width: 0,
        height: 0
    };

    constructor() {

        console.log('constructor halllllo');

        this.init();

    };

    public init() : void {

        // Canvas
        this.canvas = document.querySelector( 'canvas.webglView' ) as HTMLCanvasElement;

        // Scene
        this.scene = new Scene();
        this.scene.background = new Color( '#c7c1b7' );

        // Sizes
        this.sizes.width = window.innerWidth,
        this.sizes.height = window.innerHeight;

        // Camera
        this.camera = new PerspectiveCamera( 45, this.sizes.width / this.sizes.height, 0.1, 100 );
        this.camera.position.set( 3, 4, 2 );
        this.scene.add( this.camera );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;

        // Plane
        let planeGeometry = new PlaneBufferGeometry( 3, 3, 1, 1);
        let planeMaterial = new MeshBasicMaterial({ color: '#e6a67a' });
        this.plane = new Mesh( planeGeometry, planeMaterial );
        this.plane.rotation.x -= Math.PI / 2;
        this.scene.add( this.plane );

        // Fog
        this.createFog( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        // Renderer
        this.renderer = new WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );

        // Resize
        window.addEventListener( 'resize', this.resize() );

        this.clock = new Clock();

        this.debugFog();

        this.tick();

    };

    public createFog( numberOfSprites : number, fogHeight : number, fogWidth : number, fogDepth : number ) : void {

        const vertices = [];
        this.fogHeight = fogHeight;
        this.fogWidth = fogWidth;
        this.fogDepth = fogDepth;
        let fogPointPosition = new Vector3( 0, 0, 0 );

        this.numberOfSprites = numberOfSprites;
        let vertex, size = [], uv, index = [], offsetFrame = [];
        const transformRow1 = [];
        const transformRow2 = [];
        const transformRow3 = [];
        const transformRow4 = [];

        for ( let i = 0; i < this.numberOfSprites; i ++ ) {

            let x = ( Math.random() - 0.5 ) * fogWidth;
            let y = Math.random() * fogHeight;
            let z = ( Math.random() - 0.5 ) * fogDepth;

            let distanceX = fogPointPosition.x - x;
            let distanceY = y - fogPointPosition.y;
            let distanceZ = fogPointPosition.z - z;

            if ( Math.abs( distanceX ) > this.fogWidth / 2.5 - Math.random() - 0.5 ) {

                distanceX -= Math.random() - 0.5;

            }
            if ( Math.abs( distanceY ) > this.fogHeight / 2.5 - Math.random() - 0.5 ) {

                distanceY -= Math.random() - 0.5;

            }

            if ( Math.abs( distanceZ ) > this.fogDepth / 2.5 - Math.random() - 0.5 ) {

                distanceZ -= Math.random() - 0.5;

            }

            let scaleX = 1;
            let scaleY = 1;
            let scaleZ = 1;

            let rotationX = Math.random() / ( Math.random() - 0.5 );
            let rotationY = Math.random() / ( Math.random() - 0.5 );
            let rotationZ = 0;

            const matrix = new Matrix4().compose( new Vector3( distanceX, distanceY, distanceZ ), new Quaternion().setFromEuler( new Euler( rotationX, rotationY, rotationZ ) ), new Vector3( scaleX, scaleY, scaleZ ) ).toArray();

            transformRow1.push( matrix[0], matrix[1], matrix[2], matrix[3] );
            transformRow2.push( matrix[4], matrix[5], matrix[6], matrix[7] );
            transformRow3.push( matrix[8], matrix[9], matrix[10], matrix[11] );
            transformRow4.push( matrix[12], matrix[13], matrix[14], matrix[15] );

            size[ i ] = Math.random() * 0.01;

            offsetFrame.push( Math.floor( Math.random() * 50 * 16 ) );

        }

        vertex = [

            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,

            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0

        ];

        uv = [

            0, 0,
            1, 0,
            1, 1,

            1, 1,
            0, 1,
            0, 0

        ];

        this.fogMaterial = new FogMaterial();
        this.fogMaterial.side = DoubleSide;
        this.foginstanceBuffGeom = new InstancedBufferGeometry();

        this.foginstanceBuffGeom.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
        this.foginstanceBuffGeom.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

        this.foginstanceBuffGeom.setAttribute( 'size', new InstancedBufferAttribute( new Float32Array( size ), 1 ) );

        this.foginstanceBuffGeom.setAttribute( 'transformRow1', new InstancedBufferAttribute( new Float32Array( transformRow1 ), 4 ) );
        this.foginstanceBuffGeom.setAttribute( 'transformRow2', new InstancedBufferAttribute( new Float32Array( transformRow2 ), 4 ) );
        this.foginstanceBuffGeom.setAttribute( 'transformRow3', new InstancedBufferAttribute( new Float32Array( transformRow3 ), 4 ) );
        this.foginstanceBuffGeom.setAttribute( 'transformRow4', new InstancedBufferAttribute( new Float32Array( transformRow4 ), 4 ) );
        this.foginstanceBuffGeom.setAttribute( 'offsetFrame', new InstancedBufferAttribute( new Float32Array( offsetFrame ), 1 ) )

        this.fogInstance = new Mesh( this.foginstanceBuffGeom, this.fogMaterial );
        this.fogInstance.position.set( 0, 0.5, 0 );
        this.scene.add( this.fogInstance );

    };

    public debugFog () : any {

        const props = { color: '0x1A75FF' };

        this.pane = new Pane();
        const fog = this.pane.addFolder({
            title: 'Fog',
        });

        fog.addInput( this, 'numberOfSprites', { min: 0, max: 300, step: 1 } ).on( 'change', ( ev ) => {

            this.foginstanceBuffGeom.dispose();
            this.fogMaterial.dispose();
            this.scene.remove( this.fogInstance );

            this.numberOfSprites = ev.value;

            this.createFog( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        });
        fog.addInput( props, 'color', { view: 'color', alpha: true, label: 'uColor' } ).on( 'change', () => {

            this.fogMaterial.uniforms.uColor.value.setHex( parseInt( props.color.replace( '#', '0x' ) ) );

        });
        fog.addInput(  this, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' } ).on( 'change', ( ev ) => {

            this.fogAnimation( ev.value );

        } );
        fog.addInput( this.fogMaterial.uniforms.uOpacity, 'value', { min: 0, max: 1, step: 0.01, label: 'uOpacity' } ).on( 'change', ( ev ) => {

            this.fogMaterial.uniforms.uOpacity.value = ev.value;

        });

        fog.addInput( this, 'fogHeight', { min: 0, max: 5, step: 0.01, label: 'fogHeight' } ).on( 'change', ( ev ) => {

            this.foginstanceBuffGeom.dispose();
            this.fogMaterial.dispose();
            this.scene.remove( this.fogInstance );

            this.fogHeight = ev.value;

            this.createFog( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );
        fog.addInput( this, 'fogWidth', { min: 0, max: 5, step: 0.01, label: 'fogWidth' } ).on( 'change', ( ev ) => {

            this.foginstanceBuffGeom.dispose();
            this.fogMaterial.dispose();
            this.scene.remove( this.fogInstance );

            this.fogWidth = ev.value;

            this.createFog( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );
        fog.addInput( this, 'fogDepth', { min: 0, max: 5, step: 0.01, label: 'fogDepth' } ).on( 'change', ( ev ) => {

            this.foginstanceBuffGeom.dispose();
            this.fogMaterial.dispose();
            this.scene.remove( this.fogInstance );

            this.fogDepth = ev.value;

            this.createFog( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );

    };

    private resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

    };

    public fogAnimation ( frameDuration : number, elapsedTime? : number ) : void {

        this.fogMaterial.uniforms.uFrameDuration.value = frameDuration;

        this.fogMaterial.uniforms.uFragmentTime.value = ( elapsedTime % this.frameDuration ) / this.frameDuration;

    };

    public tick = () : void => {

        window.requestAnimationFrame( this.tick );

        this.delta = this.clock.getDelta() * 1000;
        this.elapsedTime += this.delta;

        this.fogAnimation( this.frameDuration, this.elapsedTime );

        this.fogMaterial.uniforms.uTime.value = this.elapsedTime;

        //

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );

    };

}

const FogObject = new Fog();
export default FogObject;

// @ts-ignore
window.fog = FogObject;