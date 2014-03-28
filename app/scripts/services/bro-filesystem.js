angular.module('broFsApp')
  .factory('BroFileSystem', function () {
		var mime = new Mimer();
		function load(file, type) {
			var reader = new FileReader(),
				defer = Q.defer();
			reader.onload = defer.resolve;
			reader.onerror = defer.reject;

			if(/^text(.*)/i.test(type) || type == 'application/json') {
				reader.readAsText(file);
			} else if(
				/^image(.*)/i.test(type) ||
					/^video(.*)/i.test(type) ||
					/^audio(.*)/i.test(type)
				) {
				reader.readAsDataURL(file);
			} else {
				reader.readAsText(file);
			}
			return defer.promise.then(function(e) {
				switch (type) {
					case 'image/gif':
					case 'image/jpeg':
					case 'image/png':
						var img = new Image();
						img.src = e.target.result;
						return img;
					case 'video/mp4':
					case 'video/ogg':
						var vid = document.createElement('video');
						vid.src = e.target.result;
						return vid;
					case 'audio/mpeg':
					case 'audio/ogg':
					case 'audio/wav':
						var aud = document.createElement('audio');
						aud.src = e.target.result;
						return vid;
					case 'application/json':
						return JSON.parse(e.target.result);
					case 'text/html':
						var html = document.createDocumentFragment(),
							div = document.createElement('div');
						div.innerHTML = e.target.result;
						for (var i = 0; i < div.childNodes.length; i++) {
							var node = div.childNodes[i];
							html.appendChild(node);
						}
						return html;
					default:
						return e.target.result;
						break;
				}
			});
		}
    function FileSystem() {};
		FileSystem.methods = ['ls', 'df', 'cd','create', 'mkdir','rm','cp', 'mv','open','write'];
		FileSystem.methods.forEach(function(fn) {
			FileSystem.prototype[fn] = function() {
				return Q.reject(new Error(fn + ' is not implemented.'));
			};
		});
		FileSystem.prototype.$$loader = {
			'application/json'  : load,
			'audio/mpeg'        : load,
			'audio/ogg'         : load,
			'audio/wav'         : load,
			'image/gif'         : load,
			'image/jpeg'        : load,
			'image/png'         : load,
			'text/html'         : load,
			'text/plain'        : load,
			'video/mp4'         : load,
			'video/ogg'         : load
		};
		FileSystem.prototype.loader = function(mimetype, file) {
			var loader = this.$$loader[mimetype];
			if(loader) {
				return loader(file, mimetype);
			}
			throw new Error('unknown datatype');
		};
		FileSystem.prototype.registerLoader = function(type, fn) {
			this.$$loader[type] = fn;
		};
		FileSystem.prototype.load = function(file, type) {
			var self = this;
			return this.open(file).then(function(file) {
				type = type || mime.get(file.name);
				return self.loader(type, file);
			})
		};
		FileSystem.prototype.save = function(path, data, options) {
			var self = this;
			options = angular.extend({
				type : mime.get(path),
				data : data
			}, options);
			return this.write(path, options);
		};
		return FileSystem;
  });
