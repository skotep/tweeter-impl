var path = require('path')

module.exports = {
    entry: "./src/main.jsx",
    output: { path: path.resolve(__dirname, 'static'), filename: "bundle.js" },
    watch: true,
    debug: true,
    devtool: 'source-map',
    stats: { colors: true },
    module: {
        loaders: [{
            test: /.jsx?$/,
            loader: 'babel-loader',
            include: path.resolve(__dirname, 'src'),
            query: {
                presets: ['es2015', 'react']
            }
        }]
    }
}

          
