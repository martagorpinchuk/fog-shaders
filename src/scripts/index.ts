import { Clock, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, Scene, WebGLRenderer } from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FogGfx } from "./Fog";
import { Pane } from "tweakpane";


//

class FogScene {

    public camera: PerspectiveCamera;
    public plane: Mesh;
    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;
    public delta: number;
    public elapsedTime: number = 0;
    public clock: Clock;
    public pane: Pane;

    public fog: FogGfx;

    private sizes = {
        width: 0,
        height: 0
    };

    constructor() {

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
        let planeGeometry = new PlaneBufferGeometry( 3, 3, 1, 1 );
        let planeMaterial = new MeshBasicMaterial( { color: '#e6a67a' } );
        this.plane = new Mesh( planeGeometry, planeMaterial );
        this.plane.rotation.x -= Math.PI / 2;
        this.scene.add( this.plane );

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2 ) );

        // Resize
        window.addEventListener( 'resize', this.resize() );

        this.clock = new Clock();

        // Fog
        this.fog = new FogGfx( 16, 1, 1, 1 );
        this.scene.add( this.fog.mesh );

        // debug fog
        const props = { color: '0x1A75FF' };

        this.pane = new Pane();
        const fogParam = this.pane.addFolder( {
            title: 'Fog',
        } );

        fogParam.addInput( props, 'color', { view: 'color', alpha: true, label: 'uColor' } ).on( 'change', () => {

            this.fog.material.uniforms.uColor.value.setHex( parseInt( props.color.replace( '#', '0x' ) ) );

        } );
        fogParam.addInput(  this.fog, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' } ).on( 'change', ( ev ) => {

            this.fog.frameDuration = ev.value;

        } );
        fogParam.addInput( this.fog, 'height', { min: 0, max: 5, step: 0.01, label: 'fogHeight' } ).on( 'change', ( ev ) => {

            this.fog.height = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth );

        } );
        fogParam.addInput( this.fog, 'width', { min: 0, max: 5, step: 0.01, label: 'fogWidth' } ).on( 'change', ( ev ) => {

            this.fog.width = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth );

        } );
        fogParam.addInput( this.fog, 'depth', { min: 0, max: 5, step: 0.01, label: 'fogDepth' } ).on( 'change', ( ev ) => {

            this.fog.depth = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth );

        } );
        fogParam.addInput( this.fog, 'density', { min: 3, max: 20, step: 1, label: 'density' } ).on( 'change', ( ev ) => {

            this.fog.density = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth )

        } );
        fogParam.addInput( this.fog, 'speedSizeChange', { min: 0, max: 0.05, step: 0.001, label: 'speedSizeChange' } ).on( 'change', ( ev ) => {

            this.fog.speedSizeChange = ev.value;

        } );
        fogParam.addInput( this.fog, 'coordEpearingParticle', { min: 0, max: 1, step: 0.001, label: 'coordEpearingParticle' } ).on( 'change', ( ev ) => {

            this.fog.coordEpearingParticle = ev.value;

        } );


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

    public tick = () : void => {

        window.requestAnimationFrame( this.tick );

        this.delta = this.clock.getDelta() * 1000;
        this.elapsedTime += this.delta;

        this.fog.update( this.delta );

        this.fog.material.uniforms.uTime.value = this.elapsedTime;

        //

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );

    };

}

export default new FogScene();
