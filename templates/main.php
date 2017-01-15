<?php
/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

 /* OpenGraph */
if($_['isPublic']) {
	OCP\Util::addHeader('meta', ['property' => "og:title", 'content' => $theme->getName() . ' - ' . $theme->getSlogan()]);
	OCP\Util::addHeader('meta', ['property' => "og:site_name", 'content' => $theme->getName()]);
	OCP\Util::addHeader('meta', ['property' => "og:url", 'content' => $_['shareURL']]);
	OCP\Util::addHeader('meta', ['property' => "og:type", 'content' => "object"]);
	OCP\Util::addHeader('meta', ['property' => "og:image", 'content' => $_['previewImage']]);
}
$styles = [
	'../js/vendor/fullcalendar/dist/fullcalendar',
	'../js/vendor/jquery-timepicker/jquery.ui.timepicker',
	'public/app.min'
];

foreach ($styles as $style) {
	style('calendar', $style);
}

$scripts = [
	'vendor/jquery-timepicker/jquery.ui.timepicker',
	'vendor/ical.js/build/ical',
	'vendor/jstzdetect/jstz',
	'vendor/angular/angular',
	'vendor/angular-bootstrap/ui-bootstrap',
	'vendor/angular-bootstrap/ui-bootstrap-tpls',
	'vendor/fullcalendar/dist/fullcalendar',
	'vendor/fullcalendar/dist/locale-all',
	'vendor/davclient.js/lib/client',
	'vendor/hsl_rgb_converter/converter',
	'public/app.min'
];

foreach ($scripts as $script) {
	script('calendar', $script);
}
?>
<div class="app" ng-app="Calendar" ng-controller="CalController">

	<!-- The Left Calendar Navigation -->
	<div id="app-navigation">

		<div ng-controller="DatePickerController" id="datepickercontainer" ng-class="{active: visibility}">
			<?php print_unescaped($this->inc('part.datepicker')); ?>
			<?php print_unescaped($this->inc('part.buttonarea')); ?>
			<div class="clear-both"></div>
		</div>

		<?php if(!$_['isPublic']): ?>
		<div ng-controller="CalendarListController" id="calendarlistcontainer" ng-cloak>
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
		<?php else: ?>
		<div ng-controller="CalendarListController" id="publicinformationscontainer">
			<?php print_unescaped($this->inc('part.publicinformations')); ?>
		</div>
		<?php endif; ?>
	</div>

	<!-- The Calendar on the right -->
	<div id="app-content">
		<?php print_unescaped($this->inc('part.fullcalendar')); ?>
	</div>

	<div id="popover-container"></div>
	<?php if(!$_['isPublic']): ?>
	<div id="importpopover-container"></div>
	<?php endif; ?>

	<script type="text/ng-template" id="eventspopovereditor.html">
		<?php print_unescaped($this->inc('editor.popover')); ?>
	</script>

	<script type="text/ng-template" id="eventssidebareditor.html">
		<?php print_unescaped($this->inc('editor.sidebar')); ?>
	</script>

	<?php if(!$_['isPublic']): ?>
	<script type="text/ng-template" id="import.html">
		<?php print_unescaped($this->inc('part.import.dialog')); ?>
	</script>
	<?php endif; ?>
</div>
