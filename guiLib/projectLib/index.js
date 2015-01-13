
var matcher = require('../../lib/projectMatcher')
var express = require('express')
var Project = require('../../lib/Project')
var socketio = require("socket.io")
var path = require('path'),
	child_process = require('child_process')


var app = express()
app.use(matcher)

exports.startServer = function(port) {
	var httpServer = app.listen(port) 

	var io = socketio.listen(httpServer, {
		"log level": 1
	})
	io.sockets.on("connection", function(socket) {
		socket.emit("ok")
	})

	require('../../lib/Watcher').sockets = io.sockets
}


exports.getLoadedProject = function() {
	return matcher.installedProject
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
exports.loadProject = function(path) {
	var project = Project.get(path)
	var id = idCounter++
	matcher.installedProject[id] = project
	project.id = id
	return project
}