angular.module('broFsApp')
  .controller('MainCtrl', function ($scope, FilerFs,VirtualFs) {
		Q.spawn(function* () {
			var fs, files, text;
			window.fs = fs = new VirtualFs() || new FilerFs({
				persistent: false,
				size: 1024 * 1024
			});

			yield fs.save('index.html', '<h1>hello world!</h1>');
			yield fs.save('hello.json', JSON.stringify({
				"hello" : "world"
			}));

			files = yield fs.ls('.');
			text = yield Q.all(files.map(function(f) {
				return fs.load(f);
			}));

			console.log(text);
		});
  });
