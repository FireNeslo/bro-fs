angular.module('broFsApp')
  .controller('MainCtrl', function ($scope, FilerFs,VirtualFs) {
		Q.spawn(function* () {
			var fs, files, text;
			window.fs = fs = new VirtualFs() || new FilerFs({
				persistent: false,
				size: 1024 * 1024
			});

			yield fs.save('panel.html',
			'<div class="panel panel-default">\n' +
			' <div class="panel-heading">\n' +
			'   <h3 class="panel-title">Panel title</h3>\n' +
			' </div>\n' +
			' <div class="panel-body">Panel content</div>\n' +
			'</div>');

			yield fs.save('hello.json', JSON.stringify({
				"hello" : "world",
				'fs' : fs
			}));

			files = yield fs.ls('.');
			text = yield Q.all(files.map(function(f) {
				return fs.load(f);
			}));

			console.log(text);
		});
  });
