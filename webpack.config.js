const path = require('path'),
    HTMLWebpackPlugin = require('html-webpack-plugin'),
    {CleanWebpackPlugin} = require('clean-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
    ImageminWebp = require('imagemin-webp'),
    NodemonPlugin = require('nodemon-webpack-plugin'),
    autoprefixer = require('autoprefixer'),
    TerserPlugin = require('terser-webpack-plugin');

const paths = {
    src: path.resolve(__dirname, 'src'),
    app: path.resolve(__dirname, 'app')
}
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
const filenameImg = () => isDev ? '[path][name][ext]' : '[path][name].[contenthash][ext]';

const optimization = () => {
    const configObj = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if (isProd) {
        configObj.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin()
        ];
    }

    return configObj;
};

const plugins = () => {
    const mainPlugins = [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `./css/${filename('css')}`
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: paths.src + '/assets/',
                    to: paths.app + '/assets',
                }
            ]
        }),
        new HTMLWebpackPlugin({
            template: paths.src + '/index.html/',
            filename: 'index.html',
            minify: {
                collapseWhitespace: isProd,
            }
        },),
        new HTMLWebpackPlugin({
            template: paths.src + '/contacts.html/',
            filename: 'contacts.html',
            minify: {
                collapseWhitespace: isProd,
            }
        },),
        new NodemonPlugin({
            script: 'webpack.config.prod.js',
            watch: './src/images/',
            delay: '6000',
            ext: 'jpg,png',
            verbose: false,
        })
    ]
    if (isProd) {
        mainPlugins.push(
            new ImageMinimizerPlugin({
                    minimizerOptions: {
                        // Lossless optimization with custom option
                        // Feel free to experiment with options for better result for you
                        plugins: [
                            ['gifsicle', {interlaced: true}],
                            ['mozjpeg', {quality: 70,}],
                            ['pngquant', {quality: [0.3, 0.5]}],
                        ],
                    },

                },
            ),
        )
    }
    return mainPlugins;
}

module.exports = {
    context: paths.src,
    mode: 'development',
    entry: './js/main.js',
    output: {
        filename: `./js/${filename('js')}`,
        path: paths.app,
        publicPath: "",
    },
    devServer: {
        historyApiFallback: true,
        contentBase: paths.app,
        open: true,
        compress: true,
        hot: true,
        port: 3000,
        disableHostCheck: true,
    },
    optimization: optimization(),
    plugins: plugins(),
    devtool: isProd ? false : 'source-map',
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev
                    },
                },
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            },
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer({
                                        overrideBrowserslist: ['ie >= 8', 'last 4 version']
                                    })
                                ],
                                sourceMap: true
                            }
                        }
                    },
                    'sass-loader'
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(jpe?g|png|gif|svg|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: filenameImg(),
                }
            },
            {
                test: /\.woff2$/,
                type: "asset/resource",
                generator: {
                    filename: '[path][name][ext]'
                }
            }

        ]
    }
}