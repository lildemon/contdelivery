// ContFis: Fis ContDelivery counterpart

// TODO: Read staging dir from argv, and get fis config json, create fis instance, run release to output dir

var fis = require('fis');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

//fis.cli.name = 'hello';
//fis.cli.info = fis.util.readJSON(__dirname + '/package.json');


fis.config.merge({
	modules: {
		parser: {
			shtml: 'ssi',
			sass: 'sass',
			scss: 'sass',
			coffee: 'coffee-script',
			md: 'marked'
		},
		postpackager: 'simple'
	},
	roadmap: {
		ext: {
			sass: 'css',
			scss: 'css',
			shtml: 'html',
			coffee: 'js',
			md: 'html'
		},
		path: [{
			reg: '**.css',
			useSprite: true
		}]
	},
	//项目排除掉_xxx.scss，这些属于框架文件，不用关心
	// 同上，去掉_xxx.shtml
	project: {
		exclude: ['**/_*.scss', '**/_*.shtml']
	},
	settings: {
		postpackager: {
			// https://github.com/hefangshi/fis-postpackager-simple
			simple: {
				//开始autoCombine可以将零散资源进行自动打包
				autoCombine: true,
				//开启autoReflow使得在关闭autoCombine的情况下，依然会优化脚本与样式资源引用位置
				autoReflow: true,
				output: "packed/auto_combine_${hash}"
			}
		},
		spriter: {
			// https://github.com/fex-team/fis-spriter-csssprites
			csssprites: {
				margin: 20,
				layout: 'matrix'
			}
		},
		parser: {
			sass: {
				// 加入文件查找目录
    			include_paths: []
			}
		}
	},
	pack: {
		// TODO: pass custom pack
	}
})


// 开启release --pack
fis.cli.run([
	'node',
	'fis',
	'release',
	'--root', path.resolve(argv.root),
	'--dest', path.resolve(argv.dest),
	'--pack',
	'-o'
])

