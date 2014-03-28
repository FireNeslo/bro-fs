'use strict';

describe('Service: FileSystemInterface', function () {

  // load the service's module
  beforeEach(module('broFsApp'));

  // instantiate service
  var FileSystemInterface;
  beforeEach(inject(function (_FileSystemInterface_) {
    FileSystemInterface = _FileSystemInterface_;
  }));

  it('should do something', function () {
    expect(!!FileSystemInterface).toBe(true);
  });

});
