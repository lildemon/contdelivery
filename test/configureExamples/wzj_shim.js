module.exports = function(webpack) {
	return {
		resolve: {
			alias: {
				'jquery': 'vendor/jquery.min.js',
				'knockout': 'vendor/knockout.js',
				'jquery.ui/sortable': 'vendor/jquery-ui.js'
			}
		},
		plugins: [
			new webpack.ProvidePlugin({
			    $: "jquery",
			    jQuery: "jquery",
			    "windows.jQuery": "jquery",
			    'ko': 'knockout'
			})
		],
		loaders: [
			{
				test: /jquery\.min\.js$/,
				loader: 'exports?jQuery'
			}
		]
	}
}