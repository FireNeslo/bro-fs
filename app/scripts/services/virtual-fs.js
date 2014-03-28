'use strict';

angular.module('broFsApp')
  .factory('VirtualFs', function (BroFileSystem) {
		var mime = new Mimer();
		var r = path.resolve.bind(path);
		function VirtualDirectory() {}
		function VirtualFile(f) {
			this.name = f.name;
			this.type = f.type || mime.get(f.name);
			this.data = f.data ? new Blob([f.data], {type: this.type}) : undefined;
		}
		VirtualDirectory.prototype.toArray = function() {
			var files = [];
			angular.forEach(this, function(file) {
				var data = file.data||new Blob();
				data.name = file.name;

				files.push(data);
			});
			return files;
		};
    function VirtualFs() {
	    this.$virtual = new VirtualDirectory();
	    this.cwd = '/';
    };
		function find(cwd, p, $virtual) {
			return r(cwd,p).split('/')
			.reduce(function(pos, part) {
				if(part) {
					return pos[part];
				} else {
					return pos;
				}
			}, $virtual);
		}
		VirtualFs.prototype = new BroFileSystem();
		angular.extend(VirtualFs.prototype, {
			ls : function(p) {
				p || (p='');
				var filelist = find(this.cwd, p, this.$virtual);
				if(filelist instanceof VirtualDirectory) {
					return Q.resolve(filelist.toArray());
				} else {
					return Q.reject(new Error(r(this.cwd,p) +' is not a directory'));
				}
			},
			cd : function(p) {
				this.cwd = r(this.cwd, p);
				return Q.resolve(this);
			},
			create : function(f) {
				var root = this.$virtual,
						filepath = r(this.cwd, f),
						filename = path.basename(filepath),
						dir = filepath.substring(0, filepath.lastIndexOf('/'));
				if(f.split('/').length>2) {
					return this.mkdir(dir, false).then(function() {
						var filedir = find(dir,'',root);
						filedir[filename] = new VirtualFile({
							name : filename
						});
					})
				} else {
					return Q.resolve(root[filename] = new VirtualFile({
						name : filename
					}))
				}

			},
			mkdir : function(dir, err) {
				var parts = dir.split('/'),
						here = find(this.cwd, '', this.$virtual),
						defer = Q.defer();
				var res = parts.reduce(function(here, dir) {
					if (here instanceof Error){
						return here;
					} else if(here[dir] && err) {
						return new Error('Directory already exists: '+dir);
					} else {
						return here[dir] || (here[dir] = new VirtualDirectory());
					}
				}, here);
				if(!(res instanceof  Error)) {
					return Q.resolve(res);
				} else {
					return Q.reject(rs);
				}
			},
			rm : function(f) {
				var filepath = r(this.cwd, f),
						dir = filepath.substring(0, filepath.lastIndexOf('/')),
						here = find(dir, '', this.$virtual);
				return Q.resolve(delete here[path.basename(filepath)]);
			},
			cp : function(src, f) {
				var file = find(this.cwd, src, this.$virtual),
						filepath = r(this.cwd, f),
						dirname = filepath.substring(0, filepath.lastIndexOf('/')),
						dir = find(dirname, '', this.$virtual);
				dir[path.basename(src)] = file;
				return Q.resolve(this);
			},
			open : function(src) {
				if(typeof src !== 'string') {
					return Q.resolve(src);
				}
				var file = find(this.cwd, src, this.$virtual);
				var data = file.data||new Blob();
				data.name = file.name;
				return Q.resolve(data);
			},
			write : function(filename, options) {
				var self = this;
				return this.create(filename).then(function(file) {
					file.data = new Blob([options.data], {
						type : (options && options.type) || mime.get(filename),
					});
					return self;
				})
			}
		});
		return VirtualFs;
  });
