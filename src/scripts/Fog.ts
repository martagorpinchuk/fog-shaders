import { BoxGeometry, DoubleSide, Euler, Float32BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3 } from "three";
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
    public size: number;
    public density: number = 15;
    public velocity: Array<number> = [];
    public positions: Array<number> = [];
    public rotationX: number;
    public rotationY: number;
    public rotationZ: number;
    public randomPos: number = (Math.random() - 0.5) * 2;
    public speedSizeChange: number = 0.029;
    public coordEpearingParticle: number = 0.3;
    public opacityCoef: number = 0.00999;
    public cube: Mesh;
    public wrapper: Object3D = new Object3D();
    public newPosition: Vector3 = new Vector3( 0, 0.5, 0 );
    public soursePosition: Vector3 = new Vector3( 0, 0.5, 0 );
    public cubeVisibility: Boolean = true;

    private _frameDuration: number = 300;
    private _color: number;

    //

    constructor ( color: number, numberOfSprites: number, height: number, width: number, depth: number ) {

        this.height = height;
        this.width = width;
        this.depth = depth;
        this.numberOfSprites = numberOfSprites;

        // create fog
        this.material = new FogMaterial();
        this.material.side = DoubleSide;

        this.material.uniforms.uColor.value.setHex( color );

        this.material.uniforms.uFrameDuration.value = this._frameDuration;

        this.generate( this.density, this.height, this.width, this.depth, this.newPosition );

    };

    public generate ( density: number, height: number, width: number, depth: number, newPosition: Vector3 ) : void {

        const boxGeometry = new BoxGeometry( 1, 1, 1 );
        const boxMaterial = new MeshBasicMaterial( { color: 0x00ff00 } );
        boxMaterial.wireframe = true;

        // this.cubeVisibility = true;

        if ( ! this.cube ) {

            this.cube = new Mesh( boxGeometry, boxMaterial );
            this.wrapper.add( this.cube );

        }

        if ( this.mesh ) {

            this.geometry.dispose();
            boxGeometry.dispose();

            this.wrapper.remove( this.mesh );

        }

        this.newPosition.x = newPosition.x;
        this.newPosition.y = newPosition.y;
        this.newPosition.z = newPosition.z;

        this.height = height;
        this.width = width;
        this.depth = depth;
        let fogPointPosition = new Vector3( 0, 0, 0 );

        this.numberOfSprites = density * height * width * depth;

        let size = [], uv, offsetFrame = [], sizeIncrease = [], opacityDecrease = [];
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

            const rotationX = 0;
            const rotationY = 0;
            const rotationZ = 0;

            let transformMatrix = new Matrix4().compose( new Vector3( distanceX, distanceY, distanceZ ), new Quaternion().setFromEuler( new Euler( rotationX, rotationY, rotationZ ) ), new Vector3( scaleX, scaleY, scaleZ ) ).toArray();

            transformRow1.push( transformMatrix[0], transformMatrix[1], transformMatrix[2], transformMatrix[3] );
            transformRow2.push( transformMatrix[4], transformMatrix[5], transformMatrix[6], transformMatrix[7] );
            transformRow3.push( transformMatrix[8], transformMatrix[9], transformMatrix[10], transformMatrix[11] );
            transformRow4.push( transformMatrix[12], transformMatrix[13], transformMatrix[14], transformMatrix[15] );

            size.push( Math.random() );
            sizeIncrease.push( Math.random() * 0.02 );
            opacityDecrease.push( Math.random() );
            this.velocity.push( ( Math.random() - 0.5 ) * 2 / 100, ( Math.random() - 0.5 ) * 2 / 100, ( Math.random() - 0.5 ) * 2 / 100 );

            offsetFrame.push( Math.floor( Math.random() * 50 * 16 ) );

        }

        this.positions = [

            - 1.0, - 1.0,  0.0,
              1.0, - 1.0,  0.0,
              1.0,   1.0,  0.0,

              1.0,   1.0,  0.0,
            - 1.0,   1.0,  0.0,
            - 1.0, - 1.0,  0.0

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

        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.positions, 3 ) );
        this.geometry.setAttribute( 'uv', new Float32BufferAttribute( uv, 2 ) );

        this.geometry.setAttribute( 'transformRow1', new InstancedBufferAttribute( new Float32Array( transformRow1 ), 4 ) );
        this.geometry.setAttribute( 'transformRow2', new InstancedBufferAttribute( new Float32Array( transformRow2 ), 4 ) );
        this.geometry.setAttribute( 'transformRow3', new InstancedBufferAttribute( new Float32Array( transformRow3 ), 4 ) );
        this.geometry.setAttribute( 'transformRow4', new InstancedBufferAttribute( new Float32Array( transformRow4 ), 4 ) );
        this.geometry.setAttribute( 'offsetFrame', new InstancedBufferAttribute( new Float32Array( offsetFrame ), 1 ) );
        this.geometry.setAttribute( 'velocity', new InstancedBufferAttribute( new Float32Array( this.velocity ), 3 ) );
        this.geometry.setAttribute( 'opacityDecrease', new InstancedBufferAttribute( new Float32Array( opacityDecrease ), 1 ) );
        this.geometry.setAttribute( 'size', new InstancedBufferAttribute( new Float32Array( size ), 1 ) );

        this.mesh = new Mesh( this.geometry, this.material );
        this.cube.position.set( height, width, depth );

        this.wrapper.add( this.mesh );

    };

    public update ( delta: number ) : void {

        for ( let i = 0; i < this.numberOfSprites; i ++ ) {

            const newSize = this.geometry.attributes.size.getX( i ) + this.speedSizeChange;
            this.geometry.attributes.size.setX( i, newSize );

            let velosityX = this.geometry.attributes.velocity.getX( i );
            let velosityY = this.geometry.attributes.velocity.getY( i );
            let velosityZ = this.geometry.attributes.velocity.getZ( i );

            let newPosX = this.geometry.attributes.transformRow4.getX( i );
            let newPosY = this.geometry.attributes.transformRow4.getY( i );
            let newPosZ = this.geometry.attributes.transformRow4.getZ( i );

            newPosX += velosityX;
            newPosY += velosityY;
            newPosZ += velosityZ;

            const newOpacity = this.geometry.attributes.opacityDecrease.getX( i ) - this.opacityCoef;
            this.geometry.attributes.opacityDecrease.setX( i, newOpacity );

            if ( newOpacity <= 0.1 ) {

                newPosX = ( Math.random() - 0.5 ) * this.coordEpearingParticle + this.soursePosition.x;
                newPosY = ( Math.random() - 0.5 ) * this.coordEpearingParticle + this.soursePosition.y;
                newPosZ = ( Math.random() - 0.5 ) * this.coordEpearingParticle + this.soursePosition.z;
                this.geometry.attributes.size.setX( i, 0 );
                this.geometry.attributes.opacityDecrease.setX( i, 1 );

            }

            this.geometry.attributes.transformRow4.setX( i, newPosX );
            this.geometry.attributes.transformRow4.setY( i, newPosY );
            this.geometry.attributes.transformRow4.setZ( i, newPosZ );

        }

        this.geometry.attributes.opacityDecrease.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.transformRow4.needsUpdate = true;

    };

    //

    public get frameDuration () {

        return this._frameDuration;

    };

    public set frameDuration ( frameDuration: number ) {

        this.material.uniforms.uFrameDuration.value = frameDuration;
        this._frameDuration = this.material.uniforms.uFrameDuration.value;

    };

    public get color () {

        return this._color;

    };

    public set color ( color: any ) {

        this._color = color;

        if ( typeof color === 'string' ) {

            this.material.uniforms.uColor.value.setHex( parseInt( color.replace( '#', '0x' ) ) )

        } else {

            this.material.uniforms.uColor.value.setHex( color );

        }

    }

}
