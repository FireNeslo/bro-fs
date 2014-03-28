'use strict';

angular.module('broFsApp')
  .factory('FilerFs', function (BroFileSystem) {
		var methods = BroFileSystem.methods
			, toArray = Function.call.bind(Array.prototype.slice);
		function FilerFs(options) {
			var defer = Q.defer();
      this.filer = new Filer();
			this.ready = defer.promise;
			this.filer.init(
				options,
				defer.resolve,
				defer.reject
			);
		}
		function QApply(fn) {
			return function() {
				var defer = Q.defer(),
						filer = this.filer,
						args = toArray(arguments).concat([
							defer.resolve,
							defer.reject
						]);
				return this.ready.then(function(fs) {
					filer[fn].apply(this, args);
					return defer.promise;
				});
			}
		}
		FilerFs.prototype = new BroFileSystem();
		methods.forEach(function(fn) {
			FilerFs.prototype[fn] = QApply(fn);
		});
		return FilerFs;
  });
