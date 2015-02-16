
var matcher = require('../../lib/projectMatcher')
var express = require('express')
var Project = require('../../lib/Project')
var socketio = require("socket.io")
var path = require('path'),
	child_process = require('child_process')



var app = express()
app.use(matcher)

exports.startServer = function(port, callback) {
	var httpServer = app.listen(port) 
	httpServer.on('error', handle)
	httpServer.on('listen', function() { handle() })

	function handle(e) {
		if(!e) {
			var io = socketio.listen(httpServer, {
				"log level": 1
			})
			io.sockets.on("connection", function(socket) {
				socket.emit("ok")
			})

			require('../../lib/Watcher').sockets = io.sockets
			callback()
		} else {
			callback(e)
		}
	}

	
}


exports.getLoadedProject = function() {
	return matcher.installedProject
}

exports.getProjectById = function(id) {
	return matcher.installedProject[id]
}

exports.queryLoadedResult = function() {
	var html = '<ul>'
	var projects = exports.getLoadedProject()
	projects.forEach(function(p) {
		html += '<li>' + p.path + '</li>'
	})
	html += '</ul>'
	return html
}

var idCounter = 1
exports.loadProject = function(projPath) {
	var project = Project.get(projPath)
	var projbase = path.basename(projPath)
	var id = /[^\u0000-\u00FF]/.test(projbase) ? idCounter++ : projbase.toLowerCase()
	if(!!~projbase.indexOf('.') || matcher.installedProject[id]) {
		id = idCounter++
	}
	matcher.installedProject[id] = project
	project.id = id
	matcher.setDefault(id)
	return project
}

exports.unloadProject = function(id) {
	var project = matcher.installedProject[id]
	if(project) {
		project.close()
		delete matcher.installedProject[id]
	}
}

exports.saveWpConfig = function(project, wpconf) {
	project.projectConfig.webpack.test = wpconf
	project.saveProjConfig()
}