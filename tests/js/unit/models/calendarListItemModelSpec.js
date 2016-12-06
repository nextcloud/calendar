describe('The calendarListItem factory', function () {
	'use strict';

	var CalendarListItem, Calendar, WebCal;

	beforeEach(module('Calendar', function($provide) {
		Calendar = {};
		Calendar.isCalendar = jasmine.createSpy().and.returnValue(true);

		WebCal = {};
		WebCal.isCalendar = jasmine.createSpy().and.returnValue(true);

		$provide.value('Calendar', Calendar);
		$provide.value('WebCal', WebCal);
		$provide.value('isSharingAPI', null);
	}));

	beforeEach(inject(function(_CalendarListItem_) {
		CalendarListItem = _CalendarListItem_;
	}));

	it('should have certain exposed properties', function() {
		var item = CalendarListItem({});

		expect(item._isACalendarListItemObject).toEqual(true);
		expect(item.color).toEqual('');
		expect(item.displayname).toEqual('');
		expect(item.order).toEqual(0);
		expect(item.selectedSharee).toEqual('');
	});

	it('should return an object when it\'s a calendar', function() {
		expect(CalendarListItem({})).toEqual(jasmine.any(Object));
	});

	it('should return null when it\'s not a calendar', function() {
		Calendar.isCalendar = jasmine.createSpy().and.returnValue(false);

		expect(CalendarListItem({})).toEqual(null);
	});

	it('should expose the calendar object', function() {
		var calendar = {};
		var item = CalendarListItem(calendar);

		expect(item.calendar).toEqual(calendar);
	});

	it('should be able to show and hide the caldav url', function() {
		var item = CalendarListItem({});

		//default is expected to be false
		expect(item.displayCalDAVUrl()).toBe(false);

		item.showCalDAVUrl();
		expect(item.displayCalDAVUrl()).toBe(true);

		item.hideCalDAVUrl();
		expect(item.displayCalDAVUrl()).toBe(false);
	});

	it('should be able to show and hide editing of shares', function() {
		var item = CalendarListItem({});

		//default is expected to be false
		expect(item.isEditingShares()).toBe(false);

		item.toggleEditingShares();
		expect(item.isEditingShares()).toBe(true);

		item.toggleEditingShares();
		expect(item.isEditingShares()).toBe(false);
	});

	it('should be able to open and cancel the editor', function() {
		var props = {
			color: '#ffffff',
			displayname: 'test_42'
		};
		var item = CalendarListItem(props);

		//editor is expected to be closed by default
		expect(item.isEditing()).toBe(false);
		expect(item.color).toEqual('');
		expect(item.displayname).toEqual('');
		
		//open the editor
		item.openEditor();

		expect(item.isEditing()).toBe(true);
		expect(item.color).toEqual('#ffffff');
		expect(item.displayname).toEqual('test_42');

		//change values in editor
		item.color = '#000000';
		item.displayname = 'another displayname';

		//cancel editing
		item.cancelEditor();

		expect(item.isEditing()).toBe(false);
		expect(item.color).toEqual('');
		expect(item.displayname).toEqual('');
		expect(props.color).toEqual('#ffffff');
		expect(props.displayname).toEqual('test_42');
	});

	it('should be able to open the editor and save changes', function() {
		var props = {
			color: '#ffffff',
			displayname: 'test_42'
		};
		var item = CalendarListItem(props);

		//editor is expected to be closed by default
		expect(item.isEditing()).toBe(false);
		expect(item.color).toEqual('');
		expect(item.displayname).toEqual('');

		//open the editor
		item.openEditor();

		expect(item.isEditing()).toBe(true);
		expect(item.color).toEqual('#ffffff');
		expect(item.displayname).toEqual('test_42');

		//change values in editor
		item.color = '#000000';
		item.displayname = 'another displayname';

		//save changes
		item.saveEditor();

		expect(item.isEditing()).toBe(false);
		expect(item.color).toEqual('');
		expect(item.displayname).toEqual('');
		expect(props.color).toEqual('#000000');
		expect(props.displayname).toEqual('another displayname');
	});

	it('should correctly decide whether to show actions', function() {
		var item = CalendarListItem({});

		expect(item.displayActions()).toBe(true);

		item.openEditor();
		expect(item.displayActions()).toBe(false);
		item.cancelEditor();

		expect(item.displayActions()).toBe(true);
	});

	it('should correctly decide whether to show the color indicator given that the calendar is rendering', function() {
		var calendar = {};
		calendar.isRendering = jasmine.createSpy().and.returnValue(true);

		var item = CalendarListItem(calendar);

		expect(item.displayColorIndicator()).toBe(false);

		item.openEditor();
		expect(item.displayColorIndicator()).toBe(false);
		item.cancelEditor();

		expect(item.displayColorIndicator()).toBe(false);
	});
	it('should correctly decide whether to show the color indicator given that the calendar is not rendering', function() {
		var calendar = {};
		calendar.isRendering = jasmine.createSpy().and.returnValue(false);

		var item = CalendarListItem(calendar);

		expect(item.displayColorIndicator()).toBe(true);

		item.openEditor();
		expect(item.displayColorIndicator()).toBe(false);
		item.cancelEditor();

		expect(item.displayColorIndicator()).toBe(true);
	});

	it('should correctly decide whether to show the spinner given that the calendar is rendering', function() {
		var calendar = {};
		calendar.isRendering = jasmine.createSpy().and.returnValue(true);

		var item = CalendarListItem(calendar);

		expect(item.displaySpinner()).toBe(true);

		item.openEditor();
		expect(item.displaySpinner()).toBe(false);
		item.cancelEditor();

		expect(item.displaySpinner()).toBe(true);
	});

	it('should correctly decide whether to show the spinner given that the calendar is not rendering', function() {
		var calendar = {};
		calendar.isRendering = jasmine.createSpy().and.returnValue(false);

		var item = CalendarListItem(calendar);

		expect(item.displaySpinner()).toBe(false);

		item.openEditor();
		expect(item.displaySpinner()).toBe(false);
		item.cancelEditor();

		expect(item.displaySpinner()).toBe(false);
	});

	it('should correctly detect whether it\'s a CalendarItemList object', function() {
		expect(CalendarListItem.isCalendarListItem({})).toBe(false);
		expect(CalendarListItem.isCalendarListItem(true)).toBe(false);
		expect(CalendarListItem.isCalendarListItem(false)).toBe(false);
		expect(CalendarListItem.isCalendarListItem(123)).toBe(false);
		expect(CalendarListItem.isCalendarListItem('asd')).toBe(false);

		expect(CalendarListItem.isCalendarListItem({
			_isACalendarListItemObject: true
		})).toBe(true);

		var item = CalendarListItem({});
		expect(CalendarListItem.isCalendarListItem(item)).toBe(true);
	});
});

describe('The calendarListItem factory - sharingAPI enabled', function () {
	'use strict';

	let CalendarListItem, Calendar;

	beforeEach(module('Calendar', function($provide) {
		Calendar = {};

		Calendar.isCalendar = jasmine.createSpy().and.returnValue(true);
		$provide.value('Calendar', Calendar);
		$provide.value('isSharingAPI', true);
	}));

	beforeEach(inject(function(_CalendarListItem_) {
		CalendarListItem = _CalendarListItem_;
	}));

	it ('should correctly determine whether to display the sharing api - 1', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(false);
	});

	it ('should correctly determine whether to display the sharing api - 2', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 3', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(false);
	});

	it ('should correctly determine whether to display the sharing api - 4', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 5', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 6', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 7', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 8', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});
});

describe('The calendarListItem factory - sharingAPI disabled', function () {
	'use strict';

	let CalendarListItem, Calendar;

	beforeEach(module('Calendar', function($provide) {
		Calendar = {};

		Calendar.isCalendar = jasmine.createSpy().and.returnValue(true);
		$provide.value('Calendar', Calendar);
		$provide.value('isSharingAPI', false);
	}));

	beforeEach(inject(function(_CalendarListItem_) {
		CalendarListItem = _CalendarListItem_;
	}));

	it ('should correctly determine whether to display the sharing api - 1', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(false);
	});

	it ('should correctly determine whether to display the sharing api - 2', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 3', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(false);
	});

	it ('should correctly determine whether to display the sharing api - 4', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(false);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 5', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(false);
	});

	it ('should correctly determine whether to display the sharing api - 6', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(false);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 7', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(false);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});

	it ('should correctly determine whether to display the sharing api - 8', () => {
		const calendar = {};
		calendar.isShareable = jasmine.createSpy().and.returnValue(true);
		calendar.isShared = jasmine.createSpy().and.returnValue(true);
		calendar.isPublishable = jasmine.createSpy().and.returnValue(true);

		const calendarListItem = CalendarListItem(calendar);
		expect(calendarListItem.showSharingIcon()).toEqual(true);
	});
});

