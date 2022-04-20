import FogScene from './Fog';
import Water from './Water';
import Compustion from './Сombustion';

const Express = require('express');

const app = new Express();


//

// app.use( ( req, res, next ) => {

//     //...

// });

// app.get( '/fog', ( req, res ) => {

//     return new FogScene();

// });

// app.get( '/', (req, res) => res.send('/ worked') );

// app.get( '/fog', new FogScene() );
// app.get( '/water', Water );

import { Router } from 'express';

const routes = Router();

// routes.get('/fog', () => FogScene);
// routes.get('/water', () => Water);
// routes.get('/combustion', () => Compustion);

// app.use( '/docs/', Express.static('docs') );
// app.use( '/examples/', Express.static('examples') );

app.listen( 8111 );
