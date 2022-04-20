import { Color, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";


export class CombustionGfx {

    constructor () {

        this.init();

    };

    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public camera: PerspectiveCamera;
    public cube: Mesh;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;

    private sizes = {
        width: 0,
        height: 0
    };

    public init () : void {

        // Canvas
        this.canvas = document.querySelector( 'canvas.webglView' ) as HTMLCanvasElement;

        // Scene
        this.scene = new Scene();
        this.scene.background = new Color( '#c7c1b7' );

        // Camera
        this.camera = new PerspectiveCamera( 45, this.sizes.width / this.sizes.height, 0.1, 100 );
        this.camera.position.set( 1, 2, 2 );
        this.scene.add( this.camera );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );

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

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );


    };

};

export default new CombustionGfx();