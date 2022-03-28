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
    public fog: any;
    public fogParticle: any;
    public delta: number;
    public elapsedTime: number = 0;
    public clock: Clock;
    public fogMaterial: any;
    public pane: Pane;

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
        const vertices = [];
        let height = 0.015, width = 1, depth = 1;
        let x, y, z;
        let fogPointPosition = new Vector3( 0, 0, 0);

        for ( let i = 0; i < 100; i ++ ) {

            let x = Math.random() * width;
            let y = Math.random() * height;
            let z = Math.random() * depth;

            let distanceX = Math.abs( fogPointPosition.x - x );
            let distanceY = Math.abs( fogPointPosition.y - y );
            let distanceZ = Math.abs( fogPointPosition.z - z );

            if ( distanceX > width / 2.5 - Math.random() - 0.5 ) {

                distanceX -= Math.random() - 0.5;

            }

            if ( distanceY > height / 2.5 - Math.random() - 0.5 ) {

                distanceY -= Math.random() - 0.5;

            }

            if ( distanceZ > depth / 2.5 - Math.random() - 0.5 ) {

                distanceZ -= Math.random() - 0.5;

            }

            vertices.push( distanceX, distanceY, distanceZ );

        }

        const countOfVertices = 20;
        let vertex, size = [], uv, planePosition = [], rotation = [], scale = [], transforms4 = [];
        const transformRow1 = [];
        const transformRow2 = [];
        const transformRow3 = [];
        const transformRow4 = [];

        for ( let i = 0; i < countOfVertices; i ++ ) {

            let x = Math.random(); //- 0.5;
            let y = Math.random(); //- 0.5;
            let z = Math.random(); //- 0.5;

            let scaleX = 1;
            let scaleY = 1;
            let scaleZ = 1;

            let rotationX = Math.random() / ( Math.random() - 0.5 ); // Math.random();
            let rotationY = Math.random() / ( Math.random() - 0.5 ); //c / ( Math.random() * 5 );
            let rotationZ = 0; //Math.random();

            const matrix = new Matrix4().compose( new Vector3( x, y, z ), new Quaternion().setFromEuler( new Euler( rotationX, rotationY, rotationZ ) ), new Vector3( scaleX, scaleY, scaleZ ) ).toArray();

            transformRow1.push( matrix[0], matrix[1], matrix[2], matrix[3] );
            transformRow2.push( matrix[4], matrix[5], matrix[6], matrix[7] );
            transformRow3.push( matrix[8], matrix[9], matrix[10], matrix[11] );
            transformRow4.push( matrix[12], matrix[13], matrix[14], matrix[15] );

            size[ i ] = Math.random() * 0.01;

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
        let foginstanceBuffGeom = new InstancedBufferGeometry();

        foginstanceBuffGeom.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
        foginstanceBuffGeom.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

        foginstanceBuffGeom.setAttribute( 'size', new InstancedBufferAttribute( new Float32Array( size ), 1 ) );

        foginstanceBuffGeom.setAttribute( 'transformRow1', new InstancedBufferAttribute( new Float32Array( transformRow1 ), 4 ) );
        foginstanceBuffGeom.setAttribute( 'transformRow2', new InstancedBufferAttribute( new Float32Array( transformRow2 ), 4 ) );
        foginstanceBuffGeom.setAttribute( 'transformRow3', new InstancedBufferAttribute( new Float32Array( transformRow3 ), 4 ) );
        foginstanceBuffGeom.setAttribute( 'transformRow4', new InstancedBufferAttribute( new Float32Array( transformRow4 ), 4 ) );

        const fogInstance = new Mesh( foginstanceBuffGeom, this.fogMaterial );
        this.scene.add( fogInstance );

        //

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

    public debugFog () : any {

        this.pane = new Pane();
        const Fog = this.pane.addFolder({
            title: 'AmountOfSprites',
        });

        

    };

    private resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

    };

    public fogAnimation ( elapsedTime : number ) : void {

        const numOfFrames = 16;
        const frameDuration = 500;

        const currentFrameId = Math.floor( elapsedTime % ( numOfFrames * frameDuration ) / frameDuration );
        const nextFrameId = ( currentFrameId === 15 ? 0 : currentFrameId + 1 );

        this.fogMaterial.uniforms.uvOffsets.value.y = Math.floor( currentFrameId / 4 ) * 0.25;
        this.fogMaterial.uniforms.uvOffsets.value.x = currentFrameId % 4 * 0.25;

        this.fogMaterial.uniforms.uvOffsets.value.w = Math.floor( nextFrameId / 4 ) * 0.25;
        this.fogMaterial.uniforms.uvOffsets.value.z = nextFrameId % 4 * 0.25;

        this.fogMaterial.uniforms.uFragmentTime.value = ( elapsedTime % frameDuration ) / frameDuration;

    };

    public tick = () : void => {

        window.requestAnimationFrame( this.tick );

        this.delta = this.clock.getDelta() * 1000;
        this.elapsedTime += this.delta;

        this.fogAnimation( this.elapsedTime );

        this.fogMaterial.uniforms.uTime.value = this.elapsedTime;

        //

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );

    };

}

export default new Fog();
