var fs = require('fs')
var path = require('path')
var Datastore = require('nedb')
var extend = require('extend')
var Base = require('./Base')
var util = require('util')
//var ProjectModel = require('./ProjectModel')


function Project(projectPath) {
	// use project model to store mock data definition, etc
	this.path = projectPath
	this.db = new Datastore({ filename: path.join(projectPath, 'DEV-INF', 'project.db'), autoload: true })
	this.updateMiddleware()
}

util.inherits(Project, Base)

extend(Project.prototype, {
	getMocks: function(callback) {
		this.db.find({type: 'modk'}, callback)
	},
	saveMock: function(mockData, callback) {
		this.db.update({type: 'mock'}, mockData, callback)
		this.updateMiddleware()
	},
	updateMiddleware: function() {
		var router = this.middleware = express.Router()
		router.use(require('../middleware/ssi')(this.path))
	},
	getMiddleware: function() {
		// middleware might change, so we need to call it on every request
		return this.middleware
	}
})


Project.isValid = function(projectPath) {
	try {

	} catch (e) {

	}
}