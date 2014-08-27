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
	\OCP\Util::addScript('calendar', '../3rdparty/js/fileupload/jquery.fileupload');
	//\OCP\Util::addScript('calendar', '../3rdparty/js/recurrencejs/jquery.recurrenceinput');
	\OCP\Util::addScript('calendar', '../3rdparty/js/timezones/jstz');
	\OCP\Util::addScript('calendar', '../3rdparty/js/momentjs/moment.min');
	\OCP\Util::addScript('calendar', '../3rdparty/js/fullcalendar/fullcalendar');
	\OCP\Util::addScript('calendar', '../3rdparty/js/icaljs/ical');

	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-animate');
	\OCP\Util::addScript('calendar', '../3rdparty/js/restangular/restangular');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-route');

	\OCP\Util::addScript('calendar', '../3rdparty/js/angular-ui/angular-ui');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular-ui/angular-ui-calendar');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular-ui/angular-ui-sortable');
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

?>

<div ng-app="Calendar">

	<script type="text/ng-template" id="calendar.html">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</script>

	<!-- The Left Calendar Navigation -->
	<div id="app-navigation">

		<div ng-controller="DatePickerController" id="datepickercontainer">
			<?php print_unescaped($this->inc('part.datepicker')); ?>
			<?php print_unescaped($this->inc('part.buttonarea')); ?>
		</div>
		<div id="scrollable">
			<div ng-controller="CalendarListController">
				<?php print_unescaped($this->inc('part.createcalendar')); ?>
				<?php print_unescaped($this->inc('part.calendarlist')); ?>
			</div>
			<div id="spacer"></div><!-- Creates space between Subscriptionlist and Calendarlist.-->
			<div ng-controller="SubscriptionController">
				<?php print_unescaped($this->inc('part.createsubscription')); ?>
				<?php print_unescaped($this->inc('part.subscriptionlist')); ?>
			</div>
		</div>

		<div id="app-settings" ng-controller="SettingsController">
			<?php print_unescaped($this->inc('part.settings')); ?>
		</div>
	</div>

	<!-- The Calendar on the right -->
	<div id="app-content" ng-view></div>

	<!-- The Event Editor -->
	<div ng-controller="EventsModalController" id="dialoghider">
		<?php print_unescaped($this->inc('part.event.dialog')); ?>
	</div>
</div>
