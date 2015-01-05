
function Base() {

}

Base.prototype.match = function(vdomain) {
	// 检查该project跟某个虚拟域名是否匹配
	if(!this.vdomains || !this.vdomains.length) {
		return false
	}
	return !!~this.vdomains.indexOf(vdomain)
}

Base.prototype.getMiddleware = function() {
	return this.middleware.bind(this)
}