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
?>

<?php

	\OCP\Util::addScript('calendar', '../3rdparty/js/timezones/jstz');
	\OCP\Util::addScript('calendar', '../3rdparty/js/jquery-ui/jquery-ui');
	\OCP\Util::addScript('calendar', '../3rdparty/js/fullcalendar/fullcalendar');
	\OCP\Util::addScript('calendar', '../3rdparty/js/icaljs/ical');

	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-animate');
	\OCP\Util::addScript('calendar', '../3rdparty/js/restangular/restangular');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-route');

	\OCP\Util::addScript('calendar', '../3rdparty/js/angular-ui/angular-ui');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular-ui/angular-ui-calendar');
	\OCP\Util::addScript('calendar', '../3rdparty/js/colorpicker/colorpicker');
	\OCP\Util::addScript('calendar', '../3rdparty/js/appframework/app');

	\OCP\Util::addScript('calendar', 'public/app');


	\OCP\Util::addStyle('calendar', 'calendar');
	\OCP\Util::addStyle('calendar', 'part.datepicker');
	\OCP\Util::addStyle('calendar', 'part.calendarlist');
	\OCP\Util::addStyle('calendar', 'part.settings');
	\OCP\Util::addStyle('calendar', 'part.events.dialog');

	\OCP\Util::addStyle('calendar', '../3rdparty/css/fullcalendar/fullcalendar');
	\OCP\Util::addStyle('calendar', '../3rdparty/css/colorpicker/colorpicker');
	\OCP\Util::addStyle('calendar', '../3rdparty/css/bootstrap/bootstrap');	

?>

<div ng-app="Calendar" ng-controller="AppController">

	<script type="text/ng-template" id="calendar.html">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</script>
	<script type="text/ng-template" id="event.dialog.html">
		<?php print_unescaped($this->inc('part.event.dialog')); ?>
	</script>

	<!-- The Left Calendar Navigation -->
	<div id="app-navigation" ng-controller="NavController">

		<div ng-controller="DatePickerController">
			<?php print_unescaped($this->inc('part.datepicker')); ?>
		</div>
		<ul ng-controller="CalendarListController">
			<?php print_unescaped($this->inc('part.addnew')); ?>
			<?php print_unescaped($this->inc('part.calendarlist')); ?>
		</ul>

		<div id="app-settings" ng-controller="SettingsController">
			<?php print_unescaped($this->inc('part.settings')); ?>
		</div>
	</div>

	<!-- The Calendar on the right -->
	<div id="app-content" ng-view></div>
</div>
