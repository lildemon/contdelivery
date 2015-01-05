var app = require('express')()
var ssi = require('../lib/middleware/ssi')

app.use(ssi('E:\\BDYUN\\TM\\花满园\\garden.flower.mobile.webdev\\wwwroot').middleware)

app.listen(8823)