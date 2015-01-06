var app = require('express')()

var wpMiddleware = require('../lib/middleware/webpack')

var server = wpMiddleware({
	projectPath: 'E:\\BDYUN\\TM\\webpackProj'
})


app.use(server.app)

app.listen(8991)