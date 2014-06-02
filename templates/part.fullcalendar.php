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
<div ng-controller="CalController">
	<div class="btn-group">
		<button class="button" id="onedayview_radio" ng-click="changeView('agendaDay', calendar)"><?php p($l->t('Day')); ?></button>
		<button class="button" id="oneweekview_radio" ng-click="changeView('agendaWeek', calendar)"><?php p($l->t('Week')); ?></button>
		<button class="button" id="onemonthview_radio" ng-click="changeView('month', calendar)"><?php p($l->t('Month')); ?></button>
	</div>
	<div ui-calendar="uiConfig.calendar" class="calendar" ng-model="eventSources" calendar="calendar"></div>
</div>
