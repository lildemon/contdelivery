var Project = require('../lib/Project')

var projPath = "E:\\BDYUN\\TM\\webdev"

var app = require('express')()

var p = new Project(projPath)

p.updateWpConfig({key:'avl'})

app.use(p.getMiddleware())

app.listen(8835)