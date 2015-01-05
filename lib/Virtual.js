var Datastore = require('nedb'), 
	path = require('path'), 
	db = new Datastore({ filename: path.join(window.require('nw.gui').App.dataPath, 'virtual.db'), autoload: true });
var extend = require('extend')
var util = require('util')
var express = require('express')
var Base = require('./Base')


function Virtual(doc) {
	this.doc = doc
}

util.inherits(Virtual, Base)

extend(Virtual.prototype, {
	getMiddleware: function() {
		if(!this.middleware) {
			var router = this.middleware = express.Router()
			// router is like mini app that handle (next) property
			router.use(require('../middleware/ssi')())
		}
	},
	save: function(callback) {
		var self = this
		db.update({_id: this.doc._id}, this.doc, {upsert: true}, function(err, num, newDoc) {
			self.doc = newDoc
			callback && callback(err, num, newDoc)
		})
	}
})

Virtual.all = function(callback) {
	db.find({}, function(err, docs) {
		if(err) {
			// TODO: debug library
			callback(err)
		}
		var result = docs.map(function(doc) {
			return new Virtual(doc)
		})
		callback(null, result)
	})
}

Virtual.add = function(data, callback) {
	db.insert(data, function(err, newDoc) {
		if(err) {
			callback(err)
		} else {
			callback(null, new Virtual(newDoc))
		}
	})
}

Virtual.new = function(callback) {
	var newDoc =  {
		"definition": { },
		"mocks": [],
		"livepool": {},
		"vdomains": []
	}
	Virtual.add(newDoc, function(err, virtual) {
		if(err) {
			callback(err)
		} else {
			callback(null, virtual)
		}
	})
}


// virtual project only provide definitions
/*
{
	"random-id-123": { // same property as 'project' key in project db
		"definition": { 

		},
		"mocks": [

		],
		"livepool": {

		},
		"vdomains": [

		]
	}
}
*/