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
?>

<div class="togglebuttons">
	<div class="btn-group">
		<button class="button first" ng-value="agendaDay" ng-model="selectedView" uib-btn-radio="'agendaDay'"><?php p($l->t('Day')); ?></button>
		<button class="button middle" ng-value="agendaWeek" ng-model="selectedView" uib-btn-radio="'agendaWeek'"><?php p($l->t('Week')); ?></button>
		<button class="button last" ng-value="month" ng-model="selectedView" uib-btn-radio="'month'"><?php p($l->t('Month')); ?></button>
	</div>
	<button class="button today" ng-click="today()"><?php p($l->t('Today')); ?></button>
</div>
