// user contentBase option to set dev server's root

// option may vary depend on serving live or build to dist
var path = require('path')
var webpack = require('webpack')
var projectPath = process.cwd()

var bowerRoot = path.join(projectPath, 'bower_components');
var nodeRoot = path.join(projectPath, 'node_modules');
var customRoot = path.join(projectPath, 'custom_modules');

module.exports = function(opt) {
	var projectPath = opt.projectPath
	
}

var srvWpOpt = {
	contentBase: 'number or url: redir to port, or url, object: proxy config obj, string: filepath for url',
	context: projectPath,
	publicPath: '/', //webpack server generate bundle to
	entry: {  // entry should read from config
		bundle: './main.js' 
	},
	output: {
		path: '<project path + dist>', // build output = path + publicPath's path
		filename: '[name].js',
		chunkFilename: '[id].chunk.js',
		publicPath: '/' // match above
	},
	amd: { jQuery: true },
	resolve: {
		root: [customRoot, nodeRoot, bowerRoot],
		alias: {},
		extensions: ['', '.js', '.coffee', '.html', '.css', '.scss']
	},
	plugins: [
		new webpack.ResolverPlugin([
		  new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"]),
		  new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
		]),
		//new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"common", /* filename= */"common.js")
		// define plugin
		/*
			new webpack.DefinePlugin({
			  MANAGER_API_PREFIX: JSON.stringify('http://manage.jxlsxy.com'),
			  FUNDING_API_PREFIX: JSON.stringify('http://funding.jxlsxy.com')
			}),
		*/
		//new webpack.optimize.UglifyJsPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.tmpl$/,
				loader: 'mustache'
			},
			// exports loader ..
			/*{
			  test: /zepto\.js/,
			  loader: 'exports?Zepto'
			}*/
		]
	},
	/* additional for server
	hot: null,
	historyApiFallback: false
	*/
	/* additional for middleware
	stats: {} // compile stat output to console option?
	noinfo:
	quiet:
	lazy: // it should be lazy, watcher trigger by me
	*/
}