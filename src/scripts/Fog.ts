import { DoubleSide, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from "three";
import { FogMaterial } from './shaders/Fog.Shader';

//

export class FogGfx {

    public numberOfSprites: number = 10;
    public height: number = 1;
    public width: number = 1;
    public depth: number = 1;
    public material: FogMaterial;
    public geometry: InstancedBufferGeometry;
    public mesh: Mesh;
    public frameDuration: number = 300;
    public size: number;
    public density: number = 3;

    private _frameDuration: number;

    //

    constructor ( numberOfSprites: number, height: number, widthwidthwidth: number, depth: number  ) {

        this.height = height;
        this.width = widthwidthwidth;
        this.depth = depth;
        this.numberOfSprites = numberOfSprites;

        // create fog
        this.material = new FogMaterial();
        this.material.side = DoubleSide;

        this.generate( this.density, this.height, this.width, this.depth );

    };

    public generate ( density: number, height: number, width: number, depth: number ) : void {

        let parent: Object3D;

        if ( this.mesh ) {

            this.geometry.dispose();
            parent = this.mesh.parent;
            this.mesh.parent.remove( this.mesh );

        }

        this.height = height;
        this.width = width;
        this.depth = depth;
        let fogPointPosition = new Vector3( 0, 0, 0 );

        this.numberOfSprites = density * height * width * depth;

        let vertex, size = [], uv, offsetFrame = [];
        const transformRow1 = [];
        const transformRow2 = [];
        const transformRow3 = [];
        const transformRow4 = [];

        for ( let i = 0; i < this.numberOfSprites; i ++ ) {

            let x = ( Math.random() - 0.5 ) * width;
            let y = Math.random() * height;
            let z = ( Math.random() - 0.5 ) * depth;

            let distanceX = fogPointPosition.x - x;
            let distanceY = y - fogPointPosition.y;
            let distanceZ = fogPointPosition.z - z;

            if ( Math.abs( distanceX ) > width / 2.5 - Math.random() - 0.5 ) {

                distanceX -= Math.random() - 0.5;

            }

            if ( Math.abs( distanceY ) > height / 2.5 - Math.random() - 0.5 ) {

                distanceY -= Math.random() - 0.5;

            }

            if ( Math.abs( distanceZ ) > depth / 2.5 - Math.random() - 0.5 ) {

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

        this.geometry = new InstancedBufferGeometry();

        this.geometry.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
        this.geometry.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

        this.geometry.setAttribute( 'transformRow1', new InstancedBufferAttribute( new Float32Array( transformRow1 ), 4 ) );
        this.geometry.setAttribute( 'transformRow2', new InstancedBufferAttribute( new Float32Array( transformRow2 ), 4 ) );
        this.geometry.setAttribute( 'transformRow3', new InstancedBufferAttribute( new Float32Array( transformRow3 ), 4 ) );
        this.geometry.setAttribute( 'transformRow4', new InstancedBufferAttribute( new Float32Array( transformRow4 ), 4 ) );
        this.geometry.setAttribute( 'offsetFrame', new InstancedBufferAttribute( new Float32Array( offsetFrame ), 1 ) )

        this.mesh = new Mesh( this.geometry, this.material );
        this.mesh.position.set( 0, 0.5, 0 );

        if ( parent ) {

            parent.add( this.mesh );

        }

    };

    public update ( elapsedTime?: number ) : void {

        this.material.uniforms.uFragmentTime.value = ( elapsedTime % this.frameDuration ) / this.frameDuration;

    };

    //

    public get getFrameDuration () {

        return this._frameDuration;

    };

    public set setFrameDuration ( frameDuration: number ) {

        this.material.uniforms.uFrameDuration.value = frameDuration;
        this._frameDuration = this.material.uniforms.uFrameDuration.value;

        this.update();

    };

}
