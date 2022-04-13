import { BoxGeometry, Color, ConeGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneBufferGeometry, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js';

export class Postprocessing {

    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public camera: PerspectiveCamera;
    public cube: Mesh;
    public plane: Mesh;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;
    public effectComposer: EffectComposer;

    private sizes = {
        width: 0,
        height: 0
    };

    constructor () {

        this.init();

    };

    public init () : void {

        // Canvas
        this.canvas = document.querySelector( 'canvas.webglView' ) as HTMLCanvasElement;

        // Scene
        this.scene = new Scene();
        this.scene.background = new Color( '#c7c1b7' );

        // Camera
        this.camera = new PerspectiveCamera( 45, this.sizes.width / this.sizes.height, 0.1, 1000 );
        this.camera.position.set( 7, 21, 2 );
        this.scene.add( this.camera );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;

        // Plane
        let planeGeometry = new PlaneBufferGeometry( 30, 30, 1, 1 );
        let planeMaterial = new MeshBasicMaterial( { color: '#f2da9d' } );
        this.plane = new Mesh( planeGeometry, planeMaterial );
        this.plane.rotation.x -= Math.PI / 2;
        this.scene.add( this.plane );

        // Cube
        let cubeGeometry = new BoxGeometry( 1, 1, 1 );
        let cubeMaterial = new MeshBasicMaterial( { color: '#fcba03' } );
        let cube = new Mesh( cubeGeometry, cubeMaterial );
        cube.position.set( 0, 0.5, 0 );
        this.scene.add( cube );

        // cone
        const geometry = new ConeGeometry( 1.5, 2, 6 );
        const material = new MeshBasicMaterial( { color: '#db8e76' } );
        const cone = new Mesh( geometry, material );
        cone.position.set( -2, 0.5, 3 );
        this.scene.add( cone );

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

        // Postprocessing
        this.effectComposer = new EffectComposer( this.renderer );
		this.effectComposer.addPass( new RenderPass( this.scene, this.camera ) );

        const effect1 = new ShaderPass( DotScreenShader );
		// effect1.uniforms[ 'scale' ].value = 5;
		// this.effectComposer.addPass( effect1 );
        const effect2 = new ShaderPass( RGBShiftShader );
		effect2.uniforms[ 'amount' ].value = 0.015;
		this.effectComposer.addPass( effect2 );

        // Resize
        window.addEventListener( 'resize', this.resize() );

        //

        this.tick();

    };

    public resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.effectComposer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

    };

    public tick = () : void => {

        window.requestAnimationFrame( this.tick );

        //

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        this.mapControls.update();
        // this.renderer.render( this.scene, this.camera );
        this.effectComposer.render();

    };

};

export default new Postprocessing();