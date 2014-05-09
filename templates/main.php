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

<!-- TODO: Add all Angular, Bootstrap and Custom URLs to this file.-->

<?php
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-animate');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-resource');
	\OCP\Util::addScript('calendar', '../3rdparty/js/angular/angular-route');
	\OCP\Util::addScript('calendar', '../3rdparty/js/appframework/app');
	\OCP\Util::addScript('calendar', 'public/app');


	\OCP\Util::addStyle('calendar', 'calendar');

?>

<div ng-app="Calendar" ng-controller="AppController">

	<!-- The Left Calendar Navigation -->
	<div id="app-navigation" ng-controller="NavController">
		
		<ul>
			<?php print_unescaped($this->inc('part.switcher')); ?>
			<?php print_unescaped($this->inc('part.datepicker')); ?>
			<?php print_unescaped($this->inc('part.addnew')); ?>
			<?php print_unescaped($this->inc('part.calendarlist')); ?>
		</ul>

		<div id="app-settings" ng-controller="SettingsController">
			<?php print_unescaped($this->inc('part.settings')); ?>
		</div>
	</div>

	<!-- The Calendar on the right -->
	<div id="app-content" ng-controller="CalController">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</div>
</div>