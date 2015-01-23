var vms = {
	"virtual-directory": (function() {
		var $vm = avalon.define({
			$id: "virtual-directory",
			dirs: [],
			newDir: function() {
				$vm.dirs.push({
					name: '',
					dirstr: ''
				})
			}
		})
		return $vm
	})() 
}

avalon.scan()