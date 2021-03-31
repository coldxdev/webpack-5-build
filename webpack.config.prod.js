const imagemin = require( "imagemin" )
const webp = require( "imagemin-webp" )
const jpeg = require('imagemin-mozjpeg')
const png = require('imagemin-pngquant')


imagemin( ['src/images/*.{jpg,png}'], {
    destination: 'src/images',
    plugins: [
        webp( { quality: 60 } ),
    ]
} )
