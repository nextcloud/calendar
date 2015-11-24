<?php
/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
$styles = [
	'../js/vendor/fullcalendar/dist/fullcalendar',
	'../js/vendor/jquery-timepicker/jquery.ui.timepicker',
	'../../../core/css/multiselect',
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
	'vendor/jquery-file-upload/js/jquery.fileupload',
	'vendor/jquery-timepicker/jquery.ui.timepicker',
	'vendor/ical/ical',
	'vendor/jstzdetect/jstz.min',
	'vendor/fullcalendar/dist/fullcalendar.min',
	'vendor/angular/angular.min',
	'vendor/restangular/dist/restangular.min',
	'vendor/angular-route/angular-route.min',
	'vendor/angular-ui/angular-ui',
	'vendor/angular-ui/angular-ui-calendar',
	'vendor/angular-ui/angular-ui-sortable',
	'../../../core/js/multiselect',
	'public/app'
];

foreach ($scripts as $script) {
	script('calendar', $script);
}
?>
<div class="app" ng-app="Calendar" ng-controller="AppController">

	<script type="text/ng-template" id="calendar.html">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</script>
	<!-- The Left Calendar Navigation -->
	<div id="app-navigation">

		<div ng-controller="DatePickerController" id="datepickercontainer">
			<?php print_unescaped($this->inc('part.datepicker')); ?>
			<?php print_unescaped($this->inc('part.buttonarea')); ?>
		</div>
		<div ng-controller="CalendarListController">
			<div id="scrollable">
				<?php print_unescaped($this->inc('part.createcalendar')); ?>
				<?php print_unescaped($this->inc('part.calendarlist')); ?>
				<div id="spacer"></div><!-- Creates space between Subscriptionlist and Calendarlist.-->
				<div ng-controller="SubscriptionController">
					<?php print_unescaped($this->inc('part.createsubscription')); ?>
				</div>
				<?php print_unescaped($this->inc('part.subscriptionlist')); ?>
			</div>

			<div id="app-settings" ng-controller="SettingsController">
				<?php print_unescaped($this->inc('part.settings')); ?>
			</div>
		</div>
	</div>

	<!-- The Calendar on the right -->
	<div id="app-content">
		<div id="app-content-container" ng-view></div>
	</div>

	<!-- The Event Editor -->
	<div ng-controller="EventsModalController" class="hide">
		<?php print_unescaped($this->inc('part.event.dialog')); ?>
	</div>
</div>
