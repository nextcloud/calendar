
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
<li class="new-entity-container" ng-class="{editing: $scope.addingCal}">

	<a class="new-entity icon-add" ng-click="$scope.addingCal = true" id="new-calendar-button">
		<?php p($l->t('New Calendar')); ?>	
	</a>

	<div class="app-navigation-entry-edit calendarlist-fieldset add-new hide">
		<form ng-submit="create(newCalendarInputVal,selected)">
			<input class="app-navigation-input" type="text" ng-model="newCalendarInputVal" autofocus placeholder="<?php p($l->t('Name')); ?>"/>
			<input type="submit" value=""
				   class="primary icon-checkmark-white accept-button new-accept-button"
				   id="submitnewCalendar"
				   oc-click-slide-toggle="{
				   		selector: '.add-new',
						hideOnFocusLost: false,
						cssClass: 'closed'
					}">
			<input type="button" value="" class="icon-close" ng-click="$scope.addingCal = false" />
		</form>
		<colorpicker class="colorpicker" selected="selected"></colorpicker>
	</div>
</li>
