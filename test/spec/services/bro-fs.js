'use strict';

describe('Service: broFs', function () {

  // load the service's module
  beforeEach(module('broFsApp'));

  // instantiate service
  var broFs;
  beforeEach(inject(function (_broFs_) {
    broFs = _broFs_;
  }));

  it('should do something', function () {
    expect(!!broFs).toBe(true);
  });

});
