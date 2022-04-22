import { BoxBufferGeometry, Clock, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, WebGLRenderer } from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { СombustionMaterial } from './shaders/Сombustion.Shader';


export class CombustionGfx {

    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public camera: PerspectiveCamera;
    public cube: Mesh;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;
    public cubeMaterial: СombustionMaterial;
    public cubeGeometry: BoxBufferGeometry;
    public clock: Clock;
    public delta: number = 0;
    public elapsedTime: number = 0;

    private sizes = {
        width: 0,
        height: 0
    };

    constructor () {

        this.init();
        console.log('combustion');

    };

    public init () : void {

        // Canvas
        this.canvas = document.querySelector( 'canvas.webglView' ) as HTMLCanvasElement;

        // Scene
        this.scene = new Scene();
        this.scene.background = new Color( '#c7c1b7' );

        // Camera
        this.camera = new PerspectiveCamera( 45, this.sizes.width / this.sizes.height, 0.1, 100 );
        this.camera.position.set( 3, 6, 6 );
        this.scene.add( this.camera );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );

        // Plane
        let planeGeometry = new PlaneBufferGeometry( 3000, 3000, 1, 1 );
        let planeMaterial = new MeshBasicMaterial( { color: '#e6a67a' } );
        let plane = new Mesh( planeGeometry, planeMaterial );
        plane.rotation.x -= Math.PI / 2;
        this.scene.add( plane );

        // Cube
        this.cubeMaterial = new СombustionMaterial();
        this.cubeGeometry = new BoxBufferGeometry( 1, 1, 1);
        this.cube = new Mesh( this.cubeGeometry, this.cubeMaterial );
        this.cube.position.set( 0, 0.5, 0 );
        this.scene.add( this.cube );

        this.clock = new Clock();

        //

        this.tick();

    };

    private resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

    };

    public tick = () => {

        window.requestAnimationFrame( this.tick );

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        this.delta = this.clock.getDelta() * 1000;
        this.elapsedTime += this.delta;

        this.cubeMaterial.uniforms.uTime.value = this.elapsedTime / 10 / 1000;

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );


    };

};

export default new CombustionGfx();