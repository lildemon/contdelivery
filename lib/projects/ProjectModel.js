var Datastore = require('nedb')

module.exports = function ProjectModel(dbfile) {
	this.db = new Datastore({ filename: dbfile, autoload: true })
}

ProjectModel.prototype.getProjectData = function(callback) {
	var self = this
	this.db.findOne({_id: "project"}, function(err, doc) {
		if(!doc) {
			self.db.insert({
				"_id": "project",
				"mocks": [],
				"vdomains": [],
				"livepool": {}
			}, function(err, newDoc) {
				if(err) {
					callback(err)
					return
				}
				callback(null, newDoc)
			})
		} else {
			callback(null, doc)
		}
	})
}

/*{ // db
	"project": { // same as virtual db entry
		"definition": { 

		},
		"mocks": [

		],
		"livepool": {

		},
		"vdomains": [

		]
	},

	"compile": {
		"plugins": []
	},

	"dist": {
		"publicDomains" : [],
		"imageDomains" : []
	}
	
}*/