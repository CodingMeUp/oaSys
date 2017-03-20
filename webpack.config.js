var join = require("path").join;
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');

var node_modules = path.resolve(__dirname, 'node_modules');
var pathToHandsontable = path.resolve(node_modules, 'handsontable');
var pathToHandsontableJs = path.resolve(pathToHandsontable, 'dist/handsontable.full.js');
var pathToHandsontableCss = path.resolve(pathToHandsontable, 'dist/handsontable.full.min.css');

/*
 * 基于不同模式，区分配置
 * */
var configs = {
    "devserver": {
        "path": './public/client_static',
        "publicPath": '/client_static/'
    },
    "development": {
        "path": './public/client_static',
        "publicPath": '/client_static/'
    },
    "test": {
        "path": './public/client_static',
        "publicPath": '/client_static/'
    },
    "production": {
        "path": './public/client_static',
        "publicPath": '/client_static/'
    }
};

/*
 * 构建之前是否清除之前构建的内容。
 * */
var clean = false;
if (process.env.CLEAN == 'true') {
    clean = true;
}
/*
* 获取不同的环境配置
* */
var cfg = configs.development;
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
switch (env) {
    case 'development':
    {
        cfg = configs.development;
        break;
    }
    case 'testing':
    {
        cfg = configs.test;
        break;
    }
    case 'production':
    {
        cfg = configs.production;
        break;
    }
    case 'devserver':
    {
        cfg = configs.devserver;
        break;
    }
}
/*
 * 定义entry
 * 如果项目结构命名有良好的约定，是否考虑使用代码自动生成entry？
 * */
var _entry = {
    //"index": ["./src/home/home.jsx", "./src/home/home-content.jsx"],//会合并成一个index.js
    "index": './client/src/entry/index.jsx',  // Router . framework 
    //"karma-mocha-test":'./karma-bundle.js'   // karma  + mocha + require
};

/*
 * 构建之前，先清除之前构建的内容
 * 注：这样有个问题，执行 webpack-dev-server 的时候会删除对应的构建内容，并且没有再生成。
 * */
if (clean) {
    var child_process = require('child_process');
    var targetDir = join(__dirname, cfg.path);
    //var shell = 'rm -rf ' + targetDir + '&& mkdir ' + targetDir + "&& cp index.html "+ targetDir;
    var shell = 'rm -rf ' + targetDir;
    child_process.exec(shell, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

/*
 * babel参数
 * */
var babelQuery = {
    presets: ['es2015', 'react', 'stage-1'],
    plugins: ['add-module-exports', 'typecheck', 'antd']
};

/*
 * webpack配置
 * */
module.exports = {
    /*
     * 指定node_modules目录, 如果项目中存在多个node_modules时,这个很重要.
     * import js或者jsx文件时，可以忽略后缀名
     * */
    resolve: {
        modulesDirectories: ['node_modules', (0, join)(__dirname, './node_modules')],
        extensions: ['', '.js', '.jsx'],
        alias: {
            'handsontable': pathToHandsontableJs,
            'handsontable.css': pathToHandsontableCss
        }
    },
    resolveLoader: {
        modulesDirectories: ['node_modules', (0, join)(__dirname, './node_modules')]
    },
    /*
     * 入口文件配置
     * */
    entry: _entry,
    /*
     * 输出配置
     * path：构建之后的文件存放目录
     * publicPath：js或css等文件，浏览器访问时路径
     * filename：构建之后的文件名
     * */
    output: {
        path: join(__dirname, cfg.path),
        publicPath: cfg.publicPath,
        filename: "[name].js",
        chunkFilename: "[name].js",
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: babelQuery
            }, {
                test: /\.jsx$/,
                loader: 'babel',
                query: babelQuery
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css?sourceMap&-restructuring!' + 'postcss-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css?sourceMap!' + 'postcss-loader!' + 'less?{"sourceMap":true,"modifyVars":{}}')
            },
            {
                test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
                loader: 'url?limit=10000'
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&minetype=application/font-woff'
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&minetype=application/font-woff'
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&minetype=application/octet-stream'
            }, {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'}, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&minetype=image/svg+xml'
            }
        ],
        noParse: [pathToHandsontableJs, pathToHandsontableCss]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"'+ env +'"'
            }
        }),
        /*
         * 公共文件配置
         * */
        new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        /*
         * css单独打包成一个css文件
         * 比如entry.js引入了多个less，最终会都打到一个xxx.css中。
         * */
        new ExtractTextPlugin("[name].css", {
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        /*
         * 这样写法 fetch就可以全局使用了，各个不用单独import
         * */
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
};
