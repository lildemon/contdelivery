// user contentBase option to set dev server's root

// option may vary depend on serving live or build to dist
var path = require('path')
var webpack = require('webpack')
//var projectPath = process.cwd()
var Server = require('webpack-dev-server/lib/Server')


module.exports = function(opt) {

	var projectPath = opt.projectPath
	var wwwPath = opt.wwwPath //path.resolve(projectPath, 'wwwroot')
	var publicPath = '/packed/'

	var bowerRoot = path.join(projectPath, 'bower_components')
	var nodeRoot = path.join(projectPath, 'node_modules')
	var customRoot = path.join(projectPath, 'custom_modules')

	var srvWpOpt = {
		contentBase: wwwPath, // 'number or url: redir to port, or url, object: proxy config obj, string: filepath for url',
		context: wwwPath,
		publicPath: publicPath, //webpack server generate bundle to
		entry: {  // entry should read from config
			// TODO: inline mode to add webpack-dev-server/client lib to entry
			bundle: './main.js' 
		},
		output: {
			path: path.join(projectPath, 'packed'), // build output = path + publicPath's path
			filename: '[name].js',
			chunkFilename: '[id].chunk.js',
			publicPath: publicPath // match above
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
			function() {
				this.plugin('done', function(stats) {
					var jsonStats = stats.toJson({
						chunkModules: true,
						//exclude: <regex>
					})
					jsonStats.publicPath = publicPath
					require('fs').writeFileSync(path.join(projectPath, 'DEV-INF', 'stats.json'), JSON.stringify(jsonStats))
				})
			}
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
				{
					test: /\.cjsx$/,
					loader: 'coffee-jsx-loader'
				},
				{ test: /\.coffee$/, loader: "coffee-loader" },
				{ test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" }
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
		
		*/
		//lazy: true // it should be lazy, watcher trigger by me
	}

	var compiler = webpack(srvWpOpt)
	var server = new Server(compiler, srvWpOpt)
	server.compiler = compiler
	// server.middleware.close() to unwatch

	return server
	// TODO: grab out live compiler watch files, dynamicaly add to my own watch

}

