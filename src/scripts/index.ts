import { Clock, Color, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneBufferGeometry, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from "three";
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
    public raycaster: Raycaster;
    public pointer: Vector2;
    public fogMovement: Boolean = true;
    public attenuationTime: number;
    public intersects: Vector3;

    public permanentX: number;
    public permanentZ: number;

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
            color: '#ff0000',
            newPosition: new Vector3( 0, 0.5, 0 )

        }
        this.fog = new FogGfx( new Color().setHex( + props.color.replace( '#', '0x' ) ).getHex(), props.numberOfSprites, props.height, props.width, props.depth );
        this.scene.add( this.fog.wrapper );

        props.newPosition = this.fog.newPosition;

        // debug fog
        this.pane = new Pane();
        const fogParam = this.pane.addFolder( {
            title: 'Fog',
        } );

        this.mouseMoveFog( 'mousemove' );

        fogParam.addInput( props, 'color', { view: 'color', alpha: true, label: 'uColor' } ).on( 'change', ( ev ) => {

            this.fog.color =  ev.value;

        } );
        fogParam.addInput(  this.fog, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' } ).on( 'change', ( ev ) => {

            this.fog.frameDuration = ev.value;

        } );
        fogParam.addInput( this.fog, 'height', { min: 0, max: 5, step: 0.01, label: 'fogHeight' } ).on( 'change', ( ev ) => {

            this.fog.height = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogParam.addInput( this.fog, 'width', { min: 0, max: 5, step: 0.01, label: 'fogWidth' } ).on( 'change', ( ev ) => {

            this.fog.width = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogParam.addInput( this.fog, 'depth', { min: 0, max: 5, step: 0.01, label: 'fogDepth' } ).on( 'change', ( ev ) => {

            this.fog.depth = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition );

        } );
        fogParam.addInput( this.fog, 'density', { min: 3, max: 1000, step: 1, label: 'density' } ).on( 'change', ( ev ) => {

            this.fog.density = ev.value;
            this.fog.generate( this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition )

        } );
        fogParam.addInput( this.fog, 'speedSizeChange', { min: 0, max: 0.05, step: 0.001, label: 'speedSizeChange' } ).on( 'change', ( ev ) => {

            this.fog.speedSizeChange = ev.value;

        } );
        fogParam.addInput( this.fog, 'coordEpearingParticle', { min: 0, max: 1, step: 0.001, label: 'coordEpearingParticle' } ).on( 'change', ( ev ) => {

            this.fog.coordEpearingParticle = ev.value;

        } );
        fogParam.addInput( this.fog, 'opacityCoef', { min: 0, max: 0.03, step: 0.001, label: 'opacity' } ).on( 'change', ( ev ) => {

            this.fog.opacityCoef = ev.value;

        } );
        fogParam.addInput( this.fog, 'cubeVisibility' ).on( 'change', ( ev ) => {

            if ( ! ev.value ) {

                this.fog.wrapper.remove( this.fog.cube );

            }
            if ( ev.value ) {

                this.fog.wrapper.add( this.fog.cube );

            }

        } );
        fogParam.addInput( this, 'fogMovement' ).on( 'change', ( ev ) => {

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

        //

        this.tick();

    };

    private addRaycasterPointer = ( event ) : void => {

        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera( this.pointer, this.camera );

        // this.fogInertion();

    };

    // public fogInertion() {

    //     this.attenuationTime = this.elapsedTime;
    //     // this.addRaycasterPointer;

    //     this.raycaster.setFromCamera( this.pointer, this.camera );
    //     const intersects = this.raycaster.intersectObject( this.plane );

    //     let newPosX = intersects[0].point.x;
    //     let newPosZ = intersects[0].point.z;

    //     this.fog.soursePosition.set( newPosX, 0.5, newPosZ );
    //     this.fog.cube.position.set( intersects[0].point.x, 0.5, intersects[0].point.z );

    // };

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

        // nice try
        // this.attenuationTime = this.elapsedTime;
        // const intersects = this.raycaster.intersectObject( this.plane );

        this.intersects = this.raycaster.intersectObject( this.plane )[ 0 ].point;

        this.fog.soursePosition.set( this.intersects.x, 0.5, this.intersects.z );
        this.fog.cube.position.set( this.intersects.x, 0.5, this.intersects.z );

        this.fog.update( this.delta, this.intersects );

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
