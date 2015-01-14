var fs = require('fs')
var path = require('path')
var Datastore = require('nedb')
var extend = require('extend')
var Base = require('./Base')
var util = require('util')
var ssiMiddleware = require('./middleware/ssi')
var sassMiddleware = require('./middleware/sass')
var webpackMiddleware = require('./middleware/webpack')
var express = require('express')
var Watcher = require('./Watcher')
var webpack = require('webpack')
var webpackConfigGen = require('./webpackConfigGen')
// var livepool...
//var ProjectModel = require('./ProjectModel')

module.exports = Project

function Project(projectPath) {
	// use project model to store mock data definition, etc
	this.path = projectPath
	this.workingDirName = 'wwwroot'
	this.infDirName = 'DEV-INF'
	this.db = new Datastore({ filename: path.join(projectPath, this.infDirName, 'project.db'), autoload: true })
	this.watcher = new Watcher(this)
	this.updateMiddleware()
	//this.initVDomains()	
}

var projectCache = {}

Project.get = function(path) {
	if(projectCache[path]) {
		return projectCache[path]
	} else {
		var project = new Project(path)
		projectCache[path] = project
		return project
	}
}

util.inherits(Project, Base)

extend(Project.prototype, {
	/*getMocks: function(callback) {
		// TODO: save to this.mocks or init this.mocks
		this.db.findOne({type: 'mock'}, callback)
	},
	saveMock: function(mockData, callback) {
		this.db.update({type: 'mock'}, mockData, {upsert: true}, callback)
		this.updateMiddleware()
	},*/
	getProjConfig: function(callback) {
		var self = this
		this.db.findOne({type: 'config'}, function(err, doc) {
			if(!doc) {
				// INITIAL CONFIG
				self.projectConfig = {
					type: 'config',
					webpack: {
						entry: {}
					}
				}
			} else {
				self.projectConfig = doc
			}
			self.projectConfig.projectPath = self.path
			self.projectConfig.wwwPath = path.join(self.path, self.workingDirName)
			//self.saveProjConfig()
			callback(self.projectConfig)
		})
	},
	saveProjConfig: function(callback) {
		if(!callback) {
			callback = function(){}
		}
		this.saveData({type: 'config'}, this.projectConfig, callback)
	},
	updateWpConfig: function(wpconf) {
		this.projectConfig.webpack = wpconf
		this.saveProjConfig()
	},
	installWebpack: function(router) {
		var self = this
		this.getProjConfig(function(config) {
			var wpserver = webpackMiddleware(config.webpack, self)
			self._activeWPMiddleware = wpserver.middleware
			self._activeCompiler = wpserver.compiler
			self.watcher.bindCompiler(self._activeCompiler)
			router.use(wpserver.app)
		})
		
	},
	compileWebpack: function(callback) {
		var self = this
		this.getProjConfig(function(config) {
			var config = webpackConfigGen(config.webpack, self)
			webpack(config, callback)
		})
	},
	loadProjectRoute: function(router) {
		var self = this,
			loadingFile = ''
		try {
			fs.readdirSync(path.join(this.path, this.infDirName, 'routes')).forEach(function(file) {
				if(file.substr(file.lastIndexOf('.') + 1) !== 'js') {
					return
				}
				loadingFile = file
				require(path.join(self.path, self.infDirName, 'routes', file))(router)
			})
		} catch (e) {
			console.log('Loading Project Router failed: ' + loadingFile)
			console.log(e)
		}
	},
	saveData: function(query, data, callback) {
		this.db.update(query, data, {upsert: true}, callback)
	},
	initVDomains: function() {
		var self = this
		this.db.findOne({type: 'vdomain'}, function(err, doc) {
			if(!doc) {
				self.vdomains = []
				self.saveData({type: 'vdomain'}, {vdomains: self.vdomains})
			} else {
				self.vdomains = doc.vdomains
			}
		})
	},
	updateMiddleware: function() {
		if(this.middleware) {
			// close existing webpack watchers
			this._activeWPMiddleware.close()
		}
		var router = this.middleware = express.Router()
		this.loadProjectRoute(router)
		router.use(ssiMiddleware(path.join(this.path, this.workingDirName)).middleware)
		router.use(sassMiddleware(path.join(this.path, this.workingDirName)).middleware)
		this.installWebpack(router)
		//this.installMock(router)
		//this.installPool(router)
	},
	getMiddleware: function() {
		// middleware might change, so we need to call it on every request
		return this.middleware
	},
	initWatcher: function() {
		// TODO: unified file watcher
		// 新建watcher， 跑一次compile获取filedependency，或者直接监控webroot， 一有变化根据变化的文件来判断是需要怎么通知？

	},
	initDir: function() {
		// TODO: use grunt-init task to create new proj dir
	},
	close: function() {
		this._activeWPMiddleware.close()
		this.watcher.close()
		delete projectCache[this.path]
	}
})


Project.isValid = function(projectPath) {
	return fs.existsSync(projectPath)
}