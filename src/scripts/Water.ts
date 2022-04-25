import { BoxGeometry, Clock, Color, DepthFormat, DepthTexture, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PerspectiveCamera, PlaneGeometry, PointLight, RGBFormat, Scene, ShaderMaterial, UnsignedShortType, WebGLRenderer, WebGLRenderTarget } from "three";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WaterMaterial } from "./shaders/Water.Shader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Pane } from 'tweakpane';

//

export class Water {

    public scene: Scene;
    public canvas: HTMLCanvasElement;
    public camera: PerspectiveCamera;
    public cube: Mesh;
    public plane: Mesh;
    public mapControls: MapControls;
    public renderer: WebGLRenderer;
    public effectComposer: EffectComposer;
    public loader: GLTFLoader;
    public target: WebGLRenderTarget;
    public postMaterial: ShaderMaterial;
    public postScene: Scene;
    public postCamera: OrthographicCamera;
    public clock: Clock;
    public delta: number;
    public elapsedTime: number = 0;

    public waterMesh: Mesh;
    public waterMaterial: WaterMaterial;

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
        this.camera = new PerspectiveCamera( 45, this.sizes.width / this.sizes.height, 0.1, 100 );
        this.camera.position.set( 1, 2, 2 );
        this.scene.add( this.camera );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;

        // Light
        const light = new PointLight( 0xe9f7ec, 1, 100 );
        light.position.set( 5, 5, 5 );
        this.scene.add( light );

        // Plane
        this.loadPlane();

        // Water
        let waterGeom = new PlaneGeometry( 1.9, 1.9 );
        this.waterMaterial = new WaterMaterial();
        this.waterMesh = new Mesh( waterGeom, this.waterMaterial );
        this.waterMesh.rotation.x = - Math.PI / 2;
        this.waterMesh.position.set( 0, - 0.05, 0 );
        this.scene.add( this.waterMesh );

        // Real water depth

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

        this.scene.add( new Mesh( new BoxGeometry( 0.2, 0.2, 0.2 ), new MeshBasicMaterial({ color: 0xebb734 }) ) );

        // Create a render target with depth texture
		this.setupRenderTarget();

        // Resize
        window.addEventListener( 'resize', this.resize() );

        // Debug
        let props = { waterColor: '#8eb4e6' };

        const waterTwp = new Pane( { title: "Water" } );
        waterTwp.addInput( props, 'waterColor', { view: 'color', alpha: true, label: 'inner color' } ).on( 'change', ( ev ) => {

            this.waterMaterial.uniforms.uColor.value.setHex( parseInt( ev.value.replace( '#', '0x' ) ) )

        } );

        this.clock = new Clock();

        //

        this.tick();

    };

    public findingDepth () : void {

        // Setup post processing stage
        this.postCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        this.postMaterial = new ShaderMaterial( {
            vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
            fragmentShader: `
            #include <packing>

            varying vec2 vUv;
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
                //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
                float depth = readDepth( tDepth, vUv );

                gl_FragColor.rgb = 1.0 - vec3( pow( depth, 0.2 ) );
                gl_FragColor.a = 1.0;
            }
            `,
            uniforms: {
                cameraNear: { value: this.camera.near },
                cameraFar: { value: this.camera.far },
                tDiffuse: { value: null },
                tDepth: { value: null }
            }
        } );
        const postPlane = new PlaneGeometry( 2, 2 );
        const postQuad = new Mesh( postPlane, this.postMaterial );

        this.postScene = new Scene();
        this.postScene.add( postQuad );

    };

    public loadPlane () : void {

        // Loading tree
        this.loader = new GLTFLoader();
        this.loader.load(

            'resources/models/plane.gltf',
            ( gltf ) => {

                gltf.scene.children[0].scale
                this.scene.add( gltf.scene.children[0] );

            }

        )

    };

    public setupRenderTarget () : void {

        if ( this.target ) this.target.dispose();

        //

        this.target = new WebGLRenderTarget( window.innerWidth,  window.innerHeight );
        this.target.texture.format = RGBFormat;
        this.target.texture.minFilter = NearestFilter;
        this.target.texture.magFilter = NearestFilter;
        this.target.texture.generateMipmaps = false;
        this.target.stencilBuffer = false;
        this.target.depthBuffer = true;
        this.target.depthTexture = new DepthTexture( window.innerWidth, window.innerHeight );
        this.target.depthTexture.type = UnsignedShortType;
        this.target.depthTexture.format = DepthFormat;

    };

    public resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        const dpr = this.renderer.getPixelRatio();
        this.target.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
        this.renderer.setSize( this.sizes.width, this.sizes.height );

    };

    public tick = () : void => {

        window.requestAnimationFrame( this.tick );

        this.delta = this.clock.getDelta() * 1000;
        this.elapsedTime += this.delta;

        //

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        // render scene into target
        this.waterMesh.visible = false;
        this.renderer.setRenderTarget( this.target );
        this.renderer.render( this.scene, this.camera );

        this.mapControls.update();

        this.renderer.setRenderTarget( null );

        this.waterMesh.visible = true;
        this.waterMaterial.uniforms.tDepth.value = this.target.depthTexture;
        this.waterMaterial.uniforms.cameraNear.value = this.camera.near;
        this.waterMaterial.uniforms.cameraFar.value = this.camera.far;

        // this.waterMaterial.uniforms.uTime.value = Math.abs( Math.sin( this.elapsedTime / 1068 ) ) + 1;
        this.waterMaterial.uniforms.uTime.value = Math.sin( this.elapsedTime / 1068 ) + 2; //1068

        // this.postMaterial.uniforms.tDepth.value = this.target.depthTexture;
        // this.postMaterial.uniforms.cameraNear.value = this.camera.near;
        // this.postMaterial.uniforms.cameraFar.value = this.camera.far;

		this.renderer.render( this.scene, this.camera );

        // this.renderer.render( this.postScene, this.postCamera );
        // this.effectComposer.render();

    };

};

export default new Water();