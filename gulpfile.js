var gulp    = require('gulp')
	, bower   = require('gulp-bower-files')
	, replace = require('gulp-replace')
	, concat  = require('gulp-concat')
	, inject  = require('gulp-inject')
	, assets  = require('gulp-assets')
	, reload  = require('gulp-livereload')
	, changed = require('gulp-changed')
	, queue   = require('streamqueue')
	, config   =  {
		app :  {
			root : 'app',
			scripts : 'scripts',
			styles : 'styles'
		},
		dist :  {
			root : 'www',
			scripts : 'scripts',
			styles : 'styles',
			main : {
				js : 'app.js',
				css: 'main.css'
			}
		}
	};
function app(place, file) {
	var app   = config.app;
	return (place ? (app.root + '/' + app[place]) : app.root) + (file ? ('/' + file) : '');
}
function dist(place,file) {
	var dist  = config.dist;
	return (place ? (dist.root + '/' + dist[place]) : dist.root) + (file ? ('/' + file) : '');
}

gulp.task('default',['install','build']);
gulp.task('build',['copy','scripts','styles'], function() {
	return gulp
	.src(dist('', 'index.html'))
	.pipe(inject(gulp.src([
		dist('scripts',config.dist.main.js),
		dist('styles',config.dist.main.css)
	]),{
		ignorePath : dist(),
		addRootSlash : false
	}))
	.pipe(gulp.dest(dist()))
});

gulp.task('install', function() {
	return queue({ objectMode: true },
		bower(), gulp.src([
		app('scripts' , 'app.js'),
		app('scripts' , '**/*.js'),
		app('styles'  , '**/*.css')
	]))
	.pipe(inject(app('','index.html'), {
		ignorePath : app(),
		addRootSlash : false
	}))
	.pipe(gulp.dest(app()))
});

gulp.task('scripts', function() {
	return gulp.src(app('','index.html'))
	.pipe(assets.js())
	.pipe(concat(config.dist.main.js))
	.pipe(gulp.dest(dist('scripts')));
});

gulp.task('styles', function() {
	return gulp.src(app('','index.html'))
	.pipe(assets.css())
	.pipe(concat(config.dist.main.css))
	.pipe(gulp.dest(dist('styles')));
});

gulp.task('copy', function() {
	return gulp.src(app('','index.html'))
	.pipe(replace(/<!--debug([^>]*)-->([\s\S]*)<!--\/debug-->(.*)\n/g, ''))
	.pipe(gulp.dest(dist()))
});
var server,
		updated = [];
function reloadFiles() {
	var path;
	while(path = updated.pop()) {
		server.changed(path);
	}
};
gulp.task('watch-scripts', ['scripts'],reloadFiles);
gulp.task('watch-styles', ['styles'],reloadFiles);
gulp.task('watch-bower', ['install','build'],reloadFiles);
gulp.task('watch', function() {
	server = reload();
	gulp.watch('bower.json', ['watch-bower'])
	.on('change', function(file) {
		console.log('change: %s', process.cwd() + '/' + app('','index.html'));
		updated.push(process.cwd() + '/' + app('','index.html'));
	});
	gulp.watch(app('scripts', '**/*.js'), ['watch-scripts'])
	.on('change', function(file) {
		console.log('change: %o', file);
		updated.push(file.path);
	});
	gulp.watch(app('styles', '**/*.css'), ['watch-styles'])
	.on('change', function(file) {
		console.log('change: %o', file);
		updated.push(file.path);
	});
});