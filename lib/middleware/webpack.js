// user contentBase option to set dev server's root

// option may vary depend on serving live or build to dist
var path = require('path')
var webpack = require('webpack')
//var projectPath = process.cwd()
var Server = require('webpack-dev-server/lib/Server')
var _ = require('lodash')
var webpackConfigGen = require('../webpackConfigGen')


module.exports = function(opt, project) {

	var config = webpackConfigGen(opt, project)
	var compiler = webpack(config)
	var server = new Server(compiler, config)
	server.compiler = compiler
	// server.middleware.close() to unwatch

	return server
	// TODO: grab out live compiler watch files, dynamicaly add to my own watch

}

