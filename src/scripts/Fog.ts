import { DoubleSide, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from "three";
import { FogMaterial } from './shaders/Fog.Shader';
import { Pane } from "tweakpane";

//

export class FogGfx {

    public numberOfSprites: number = 10;
    public fogHeight: number = 0.015;
    public fogWidth: number = 1;
    public fogDepth: number = 1;
    public material: FogMaterial;
    public meshBuffGeom: InstancedBufferGeometry;
    public mesh: Mesh;
    public pane: Pane;
    public frameDuration: number = 500;

    //

    constructor ( numberOfSprites: number, fogHeight: number, fogWidth: number, fogDepth: number  ) {

        this.fogHeight = fogHeight;
        this.fogWidth = fogWidth;
        this.fogDepth = fogDepth;
        this.numberOfSprites = numberOfSprites;

        // create fog
        this.material = new FogMaterial();
        this.material.side = DoubleSide;

        this.generate( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        // debug fog
        const props = { color: '0x1A75FF' };

        this.pane = new Pane();
        const fog = this.pane.addFolder( {
            title: 'Fog',
        } );

        fog.addInput( this, 'numberOfSprites', { min: 0, max: 300, step: 1 } ).on( 'change', ( ev ) => {

            this.numberOfSprites = ev.value;
            this.generate( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );
        fog.addInput( props, 'color', { view: 'color', alpha: true, label: 'uColor' } ).on( 'change', () => {

            this.material.uniforms.uColor.value.setHex( parseInt( props.color.replace( '#', '0x' ) ) );

        } );
        fog.addInput(  this, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' } ).on( 'change', ( ev ) => {

            this.fogAnimation( ev.value );

        } );
        fog.addInput( this.material.uniforms.uOpacity, 'value', { min: 0, max: 1, step: 0.01, label: 'uOpacity' } ).on( 'change', ( ev ) => {

            this.material.uniforms.uOpacity.value = ev.value;

        } );
        fog.addInput( this, 'fogHeight', { min: 0, max: 5, step: 0.01, label: 'fogHeight' } ).on( 'change', ( ev ) => {

            this.fogHeight = ev.value;
            this.generate( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );
        fog.addInput( this, 'fogWidth', { min: 0, max: 5, step: 0.01, label: 'fogWidth' } ).on( 'change', ( ev ) => {

            this.fogWidth = ev.value;
            this.generate( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );
        fog.addInput( this, 'fogDepth', { min: 0, max: 5, step: 0.01, label: 'fogDepth' } ).on( 'change', ( ev ) => {

            this.fogDepth = ev.value;
            this.generate( this.numberOfSprites, this.fogHeight, this.fogWidth, this.fogDepth );

        } );

    };

    private generate ( numberOfSprites: number, fogHeight: number, fogWidth: number, fogDepth: number ) : void {

        let parent: Object3D;

        if ( this.mesh ) {

            this.meshBuffGeom.dispose();
            parent = this.mesh.parent;
            this.mesh.parent.remove( this.mesh );

        }

        this.fogHeight = fogHeight;
        this.fogWidth = fogWidth;
        this.fogDepth = fogDepth;
        let fogPointPosition = new Vector3( 0, 0, 0 );

        let vertex, size = [], uv, offsetFrame = [];
        const transformRow1 = [];
        const transformRow2 = [];
        const transformRow3 = [];
        const transformRow4 = [];

        for ( let i = 0; i < numberOfSprites; i ++ ) {

            let x = ( Math.random() - 0.5 ) * fogWidth;
            let y = Math.random() * fogHeight;
            let z = ( Math.random() - 0.5 ) * fogDepth;

            let distanceX = fogPointPosition.x - x;
            let distanceY = y - fogPointPosition.y;
            let distanceZ = fogPointPosition.z - z;

            if ( Math.abs( distanceX ) > fogWidth / 2.5 - Math.random() - 0.5 ) {

                distanceX -= Math.random() - 0.5;

            }

            if ( Math.abs( distanceY ) > fogHeight / 2.5 - Math.random() - 0.5 ) {

                distanceY -= Math.random() - 0.5;

            }

            if ( Math.abs( distanceZ ) > fogDepth / 2.5 - Math.random() - 0.5 ) {

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

        this.meshBuffGeom = new InstancedBufferGeometry();

        this.meshBuffGeom.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
        this.meshBuffGeom.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

        this.meshBuffGeom.setAttribute( 'transformRow1', new InstancedBufferAttribute( new Float32Array( transformRow1 ), 4 ) );
        this.meshBuffGeom.setAttribute( 'transformRow2', new InstancedBufferAttribute( new Float32Array( transformRow2 ), 4 ) );
        this.meshBuffGeom.setAttribute( 'transformRow3', new InstancedBufferAttribute( new Float32Array( transformRow3 ), 4 ) );
        this.meshBuffGeom.setAttribute( 'transformRow4', new InstancedBufferAttribute( new Float32Array( transformRow4 ), 4 ) );
        this.meshBuffGeom.setAttribute( 'offsetFrame', new InstancedBufferAttribute( new Float32Array( offsetFrame ), 1 ) )

        this.mesh = new Mesh( this.meshBuffGeom, this.material );
        this.mesh.position.set( 0, 0.5, 0 );

        if ( parent ) {

            parent.add( this.mesh );

        }

    };

    public fogAnimation ( frameDuration : number, elapsedTime? : number ) : void {

        this.material.uniforms.uFrameDuration.value = frameDuration;

        this.material.uniforms.uFragmentTime.value = ( elapsedTime % this.frameDuration ) / this.frameDuration;

    };

}
