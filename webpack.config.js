const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
      bundle :  './src/app.js',
      settingsBundle :  './src/settings/index.js',
    },
    output: { 
        path: __dirname,
        filename: '[name].js' 
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: [/node_modules/, /renderer.js/],
                query: {
                    presets: ['stage-1','es2015', 'react']
                }
            }
        ]
    }
};

// module.exports = {
//     entry: './src/settings/index.js',
//     output: { path: __dirname, filename: './settingsBundle.js' },
//     module: {
//         loaders: [
//             {
//                 test: /.jsx?$/,
//                 loader: 'babel-loader',
//                 exclude: [/node_modules/, /renderer.js/],
//                 query: {
//                     presets: ['stage-1','es2015', 'react']
//                 }
//             }
//         ]
//     }
// };

// module.exports = {
//         entry: './src/app.js',
//         output: { path: __dirname, filename: './bundle.js' },
//         module: {
//         loaders: [
//             {
//                     test: /.jsx?$/,
//                 loader: 'babel-loader',
//                 exclude: [/node_modules/, /renderer.js/],
//                 query: {
//                     presets: ['stage-1','es2015', 'react']
//                 }
//             }
//         ]
//     }
// };

