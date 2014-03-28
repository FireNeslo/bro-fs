'use strict';

describe('Service: virtualFs', function () {

  // load the service's module
  beforeEach(module('broFsApp'));

  // instantiate service
  var virtualFs;
  beforeEach(inject(function (_virtualFs_) {
    virtualFs = _virtualFs_;
  }));

  it('should do something', function () {
    expect(!!virtualFs).toBe(true);
  });

});
