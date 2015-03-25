
var path = require('path')
var _ = require('lodash')
var webpack = require('webpack')

module.exports = function(opt, project) {
	var projectPath = project.path
	var wwwPath = path.join(project.path, project.workingDirName) //path.resolve(projectPath, 'wwwroot')
	var packDirName = opt.packDirName || 'packed'
	
	// TODO: when in development, domain's http part should delete
	var publicPath = (opt.domain ? opt.domain : '') + '/'+packDirName+'/'

	var bowerRoot = path.join(projectPath, 'bower_components')
	var nodeRoot = path.join(projectPath, 'node_modules')
	var customRoot = path.join(projectPath, 'custom_modules')
	var contdevModules = path.join(path.dirname(process.execPath), 'node_modules')

	var srvWpOpt = {
		contentBase: wwwPath, // 'number or url: redir to port, or url, object: proxy config obj, string: filepath for url',
		context: wwwPath,
		publicPath: publicPath, //webpack server generate bundle to
		entry: {  // entry should read from config
			// TODO: inline mode to add webpack-dev-server/client lib to entry
			//bundle: './main.js' 
		},
		output: {
			path: path.join(wwwPath, packDirName), // build output = path + publicPath's path
			filename: '[name].js',
			chunkFilename: opt.hash ? '[id].[chunkhash].chunk.js' : '[id].chunk.js',
			publicPath: publicPath, // match above
			pathinfo: !webpack.PRODUCTION
		},
		amd: { jQuery: true },
		resolve: {
			root: [customRoot, nodeRoot, bowerRoot, contdevModules],
			alias: {},
			extensions: ['', '.coffee', '.js', '.jsx', '.cjsx', '.html', '.css', '.scss']
		},
		plugins: [
			new webpack.ResolverPlugin([
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"]),
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
			]),
			new webpack.DefinePlugin({
				PRODUCTION: !!webpack.PRODUCTION
			})
			/*function() {
				this.plugin('done', function(stats) {
					var jsonStats = stats.toJson({
						chunkModules: true,
						//exclude: <regex>
					})
					jsonStats.publicPath = publicPath
					require('fs').writeFileSync(path.join(projectPath, 'DEV-INF', 'stats.json'), JSON.stringify(jsonStats))
				})
			}*/
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
				{
					test: /\.jsx$/,
					loader: 'jsx-loader'
				},
				{ test: /\.coffee$/, loader: "coffee-loader" },
				{ test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" },
				{ test: /\.png$/, loader: "file-loader" },
				{ test: /\.jpg$/, loader: "file-loader" }
				// exports loader ..
				/*{
					test: /zepto\.js/,
					loader: 'exports?Zepto'
				}*/
			]
		},
		resolveLoader: {
			root: contdevModules
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
		//devtool: webpack.PRODUCTION ? null : "#inline-source-map"
		devtool: webpack.PRODUCTION ? null : '#source-map'
	}

	_.extend(srvWpOpt.entry, opt.entry)
	if(opt.common) {
		srvWpOpt.plugins.push(new webpack.optimize.CommonsChunkPlugin(/* chunkName= */opt.common, /* filename= */opt.common + '.js'))
	}

	try {
		var confPath = path.join(projectPath, 'webpack.config.js')
		delete global.require.cache[confPath]
		var wpConfigFn = require(confPath)
		var wpConfig = wpConfigFn(webpack)
		if(wpConfig) {
			_.merge(srvWpOpt, wpConfig)
		}
	} catch (e) {
		console.log('Load project\'s webpack.config.js failed: \n' + e)
	}

	//console.log('Merged config: ' + JSON.stringify(srvWpOpt))

	return srvWpOpt
}