describe('The hookModel factory', function () {
	'use strict';

	var hook;

	beforeEach(function() {
		module('Calendar');

		inject(function(_Hook_) {
			hook = _Hook_;
		});
	});

	it ('should do call only callbacks for the given identifier', function() {
		var h = hook({}),
			dummy = {};

		dummy.test_0_callback_0 = jasmine.createSpy();
		dummy.test_0_callback_1 = jasmine.createSpy();
		dummy.test_1_callback_0 = jasmine.createSpy();
		
		h.register(0, function(nv, ov) {
			dummy.test_0_callback_0(nv, ov);
		});
		h.register(0, function(nv, ov) {
			dummy.test_0_callback_1(nv, ov);
		});

		h.register(1, function() {
			dummy.test_1_callback_0();
		});

		h.emit(0, 123, 456);

		expect(dummy.test_0_callback_0).toHaveBeenCalledWith(123, 456);
		expect(dummy.test_0_callback_1).toHaveBeenCalledWith(123, 456);
		expect(dummy.test_1_callback_0).not.toHaveBeenCalled();
	});

	it ('should not error when identifier is unknown', function() {
		var h = hook({});

		h.emit(42, 1337, 7331);
	});
});
