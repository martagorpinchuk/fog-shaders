import { Clock, Color, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneBufferGeometry, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FogGfx } from "./Fog";
import { Pane } from "tweakpane";

//

export class FogScene {

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
    public raycaster: Raycaster;
    public pointer: Vector2;
    public fogMovement: Boolean = true;
    public attenuationTime: number;
    public intersects: Vector3;

    public permanentX: number;
    public permanentZ: number;

    public fog: FogGfx;
    public animation: Animation;

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
        let planeGeometry = new PlaneBufferGeometry( 3000, 3000, 1, 1 );
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
        let props = {

            numberOfSprites: 16,
            height: 1,
            width: 1,
            depth: 1,
            outerColor: '#ff0000',
            innerColor: '#FFCE00',
            newPosition: new Vector3( 0, 0.5, 0 )

        }
        this.fog = new FogGfx( new Color().setHex( + props.outerColor.replace( '#', '0x' ) ).getHex(), props.numberOfSprites, props.height, props.width, props.depth );
        this.animation = new Animation();
        this.scene.add( this.fog.wrapper );

        props.newPosition = this.fog.newPosition;

        // debug fog
        this.pane = new Pane();

        this.pane.element.parentElement.style['width'] = '330px';

        const fogParam = this.pane.addFolder( {
            title: 'Fog',
        } );
        const fogSize = this.pane.addFolder( {
            title: 'Size',
        } );
        const fogAnimation = this.pane.addFolder( {
            title: 'Animation',
        } );

        this.mouseMoveFog( 'click' );

        fogParam.addInput( props, 'outerColor', { view: 'color', alpha: true, label: 'outer color' } ).on( 'change', ( ev ) => {

            this.fog.outerColor =  ev.value;

        } );
        fogParam.addInput( props, 'innerColor', { view: 'color', alpha: true, label: 'inner color' } ).on( 'change', ( ev ) => {

            this.fog.innerColor = ev.value;

        } );
        fogAnimation.addInput(  this.fog, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' } ).on( 'change', ( ev ) => {

            this.fog.frameDuration = ev.value;

        } );
        fogSize.addInput( this.fog, 'height', { min: 0, max: 5, step: 0.01, label: 'size X' } ).on( 'change', ( ev ) => {

            this.fog.height = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogSize.addInput( this.fog, 'width', { min: 0, max: 5, step: 0.01, label: 'size Y' } ).on( 'change', ( ev ) => {

            this.fog.width = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogSize.addInput( this.fog, 'depth', { min: 0, max: 5, step: 0.01, label: 'size Z' } ).on( 'change', ( ev ) => {

            this.fog.depth = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogParam.addInput( this.fog, 'density', { min: 3, max: 1000, step: 1, label: 'density' } ).on( 'change', ( ev ) => {

            this.fog.density = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition )

        } );
        fogAnimation.addInput( this.fog, 'speedSizeChange', { min: 0, max: 0.5, step: 0.001, label: 'growth speed' } ).on( 'change', ( ev ) => {

            this.fog.speedSizeChange = ev.value;

        } );
        fogSize.addInput( this.fog, 'coordEpearingParticle', { min: 0, max: 1, step: 0.001, label: 'circle of appearance' } ).on( 'change', ( ev ) => {

            this.fog.coordEpearingParticle = ev.value;

        } );
        fogAnimation.addInput( this.fog, 'opacityCoef', { min: 0, max: 0.03, step: 0.001, label: 'fade' } ).on( 'change', ( ev ) => {

            this.fog.opacityCoef = ev.value;

        } );
        fogParam.addInput( this.fog, 'cubeVisibility', { label: 'bounding box' } ).on( 'change', ( ev ) => {

            if ( ! ev.value ) {

                this.fog.wrapper.remove( this.fog.cube );

            }
            if ( ev.value ) {

                this.fog.wrapper.add( this.fog.cube );

            }

        } );
        fogParam.addInput( this, 'fogMovement', { label: 'mouse follow' } ).on( 'change', ( ev ) => {

            if ( ev.value ) {

                let movementProp = 'mousemove';
                this.canvas.removeEventListener( 'click', this.addRaycasterPointer );
                this.mouseMoveFog( movementProp );

            } else {

                let movementProp = 'click';
                this.canvas.removeEventListener( 'mousemove', this.addRaycasterPointer );
                this.mouseMoveFog( movementProp );

            }

        } );
        fogParam.addInput( this.fog.material.uniforms.uOpacity, 'value', { min: 0, max: 0.9, step: 0.001, label: 'opacity' } );
        fogSize.addInput( this.fog.externalForce, 'x', { min: -20, max: 20, step: 0.1, label: 'external force X' } ).on( 'change', ( ev ) => {

            this.fog.externalForce.x = ev.value;

        } );
        fogSize.addInput( this.fog.externalForce, 'y', { min: -20, max: 20, step: 0.1, label: 'external force Y' } ).on( 'change', ( ev ) => {

            this.fog.externalForce.y = ev.value;

        } );
        fogSize.addInput( this.fog.externalForce, 'z', { min: -20, max: 20, step: 0.1, label: 'external force Z' } ).on( 'change', ( ev ) => {

            this.fog.externalForce.z = ev.value;

        } );

        //

        this.tick();

    };

    private addRaycasterPointer = ( event ) : void => {

        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera( this.pointer, this.camera );

    };

    public mouseMoveFog ( movementProp ) : void {

        // Raycaster
        this.raycaster = new Raycaster();
        this.pointer = new Vector2();

        this.canvas.addEventListener( movementProp, this.addRaycasterPointer )

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

        //

        this.intersects = this.raycaster.intersectObject( this.plane )[ 0 ].point;

        this.fog.soursePosition.set( this.intersects.x, 0.5, this.intersects.z );
        this.fog.cube.position.set( this.intersects.x, 0.5, this.intersects.z );

        this.fog.update( this.delta, this.intersects, this.fog.externalForce );

        //

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
