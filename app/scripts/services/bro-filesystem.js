angular.module('broFsApp')
  .factory('BroFileSystem', function () {
		var mime = new Mimer();
		var URL = window.URL || window.webkitURL;
		function readAs(file, type) {
			var reader = new FileReader(),
					alias = {
						'text'        : 'readAsText',
						'string'      : 'readAsText',
						'url'         : 'readAsDataURL',
						'data'        : 'readAsDataURL',
						'dataurl'     : 'readAsDataURL',
						'data-url'    : 'readAsDataURL',
						'binary'      : 'readAsBinaryString',
						'b64'         : 'readAsBinaryString',
						'base64'         : 'readAsBinaryString',
						'arraybuffer' : 'readAsArrayBuffer',
						'buffer' : 'readAsArrayBuffer'
					},
					defer = Q.defer(),
					dtype = alias[type.toLowerCase()];
			reader.onload = defer.resolve;
			reader.onerror = defer.reject;
			reader[dtype](file);
			return defer.promise.then(function(e) {
				return e.target.result;
			});
		}
		function load(opts, read) {
			var promise,
					file = opts.file,
					type = opts.mimeType,
					format = opts.output;
			if(/^text(.*)/i.test(type) || type == 'application/json') {
				promise = read(file,format||'text');
			} else if(
					/^image(.*)/i.test(type)        ||
					/^video(.*)/i.test(type)        ||
					/^audio(.*)/i.test(type)
				) {
				promise = Q.resolve(URL.createObjectURL(file));
			} else if(/^application(.*)/i.test(type)) {
				promise = read(file, format||'buffer');
			} else {
				if(format) {
					promise = read(file, format||'text');
				} else {
					promise = Q.resolve(URL.createObjectURL(file));
				}
			}
			return promise.then(function(data) {
				switch (type) {
					case 'image/gif':
					case 'image/jpeg':
					case 'image/png':
						var img = new Image();
						img.src = data;
						return img;
					case 'video/mp4':
					case 'video/ogg':
						var vid = document.createElement('video');
						vid.src = data;
						return vid;
					case 'audio/mpeg':
					case 'audio/ogg':
					case 'audio/wav':
						var aud = document.createElement('audio');
						aud.src = data;
						return aud;
					case 'application/json':
						return JSON.parse(data);
					case 'text/html':
						var html = document.createDocumentFragment(),
							div = document.createElement('div');
						div.innerHTML = data;
						for (var i = 0; i < div.childNodes.length; i++) {
							var node = div.childNodes[i];
							html.appendChild(node);
						}
						return html;
					default:
						return data;
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
		FileSystem.prototype.$$loader = {};
		FileSystem.prototype.loader = function(opts) {
			var loader = this.$$loader[opts.mimeType];
			if(loader) {
				return loader(opts, readAs, mime);
			} else {
				return load(opts, readAs, mime);
			}
		};
		FileSystem.prototype.registerLoader = function(type, fn) {
			this.$$loader[type] = fn;
		};
		FileSystem.prototype.load = function(file, options, type) {
			var self = this,
					opts = {
						mimeType : mime.get(file.name || file),
					};
			if(typeof options === 'string') {
				if(options.indexOf('/') > -1) {
					opts.mimeType = options;
					if(type) {
						opts.output = type;
					}
				} else {
					opts.output = options
				}
			} else if(options) {
				angular.extend(opts,options);
			}

			return this.open(file).then(function(file) {
				opts.file = file;
				return self.loader(opts);
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