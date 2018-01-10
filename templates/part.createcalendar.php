
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
<li class="new-entity-container" ng-class="{'editing': addingCal}">

	<a class="new-entity icon-add" ng-click="openNewCalendarForm()" id="new-calendar-button">
		<?php p($l->t('New Calendar')); ?>
	</a>

	<div class="app-navigation-entry-edit calendarlist-fieldset add-new hide">
		<form ng-submit="create(newCalendarInputVal)">
			<input class="app-navigation-input"
				   type="text"
				   ng-model="newCalendarInputVal"
				   autofocus
				   placeholder="<?php p($l->t('Name')); ?>"
				   ng-disabled="addingCalRequest" />
			<span class="add-new-is-processing icon-loading-small"
				ng-class="{'hidden': !addingCalRequest}"></span>
			<input type="button" value=""
				   class="icon-close"
				   ng-click="dismissNewCalendar()"
				   ng-disabled="addingCalRequest" />
			<input type="submit" value=""
				   class="icon-checkmark accept-button new-accept-button"
				   id="submitnewCalendar"
				   oc-click-slide-toggle="{
				   		selector: '.add-new',
						hideOnFocusLost: false,
						cssClass: 'closed'
					}"
				   ng-disabled="addingCalRequest" />
		</form>
	</div>
</li>
