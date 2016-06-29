<?php


$styles = [
	'../js/vendor/fullcalendar/dist/fullcalendar',
	'../js/vendor/jquery-timepicker/jquery.ui.timepicker',
	'globals',
	'calendar',
	'calendarlist',
	'datepicker',
	'eventdialog',
	'settings'
];

foreach ($styles as $style) {
	style('calendar', $style);
}

$scripts = [
	'vendor/jquery-timepicker/jquery.ui.timepicker',
	'vendor/ical.js/build/ical',
	'vendor/jstzdetect/jstz.min',
	'vendor/angular/angular',
	'vendor/angular-route/angular-route',
	'vendor/angular-bootstrap/ui-bootstrap.min',
	'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
	'vendor/angular-ui-calendar/src/calendar',
	'vendor/fullcalendar/dist/fullcalendar',
	'vendor/fullcalendar/dist/lang-all',
	'vendor/davclient.js/lib/client',
	'public/app'
];

foreach ($scripts as $script) {
	script('calendar', $script);
}
?>
<div class="app" ng-app="Calendar" ng-controller="CalController">

	<!-- The Left Calendar Navigation -->
	<div id="app-navigation">

		<div ng-controller="DatePickerController" id="datepickercontainer">
			<?php print_unescaped($this->inc('part.datepicker')); ?>
			<?php print_unescaped($this->inc('part.buttonarea')); ?>
		</div>

		<div ng-controller="CalendarListController" id="publicinformationscontainer">
			<?php print_unescaped($this->inc('part.publicinformations')); ?>
		</div>
	</div>


	<!-- The Calendar on the right -->
	<div id="app-content">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</div>

	<div id="popover-container"></div>

	<script type="text/ng-template" id="eventspopovereditor.html">
		<?php print_unescaped($this->inc('editor.popover')); ?>
	</script>

	<script type="text/ng-template" id="eventssidebareditor.html">
		<?php print_unescaped($this->inc('editor.sidebar')); ?>
	</script>

</div>
