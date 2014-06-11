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
<div ng-controller="EventsModalController">
	<div id="event" title="<?php p($l->t("View an event"));?>">
		<ul>
			<li><a href="#tabs-1"><?php p($l->t('Eventinfo')); ?></a></li>
			<li><a href="#tabs-2"><?php p($l->t('Repeating')); ?></a></li>
		</ul>
		<input type="text" id="event-title" ng-model="summary" class="input" placeholder="<?php p($l->t('Title of the Event')); ?>" />
		<div id="event-time">
			<div id="event-time-from">
				<label><?php p($l->t('from')); ?></label>
				<input ng-model="dtstart" type="text" />
				<input type="time" value="00:15" name="fromtime" id="fromtime" class="hasTimepicker" ng-disabled="alldaycheck">
			</div>
			<div id="event-time-to">
				<label><?php p($l->t('to')); ?></label>
				<input ng-model="dtend" type="text" />
				<input type="time" value="00:15" name="totime" id="totime" class="hasTimepicker" ng-model="totime" ng-disabled="alldaycheck">
			</div>
		</div>
		<div id="event-allday">
			<input type="checkbox" ng-model="alldaycheck" />
			<label><?php p($l->t('All day event')); ?></label>
		</div>
		<select>
			<option ng-repeat="calendar in calendars">
				{{ calendar.displayname }}
			</option>
		</select>

		<button class="primary" value="Advanced Options" ng-click="advanced = !advanced"><?php p($l->t('Advanced Options')); ?></button>

		<!-- Initially hidden div -->
		<div ng-show="advanced" id="advanced_options">
			<input type="text" id="event-location" ng-model="location" placeholder="<?php p($l->t('Location')); ?>" />
			<input type="text" id="category" ng-model="categories" placeholder="<?php p($l->t('Categories')); ?>" />
			<textarea id="description" placeholder="<?php p($l->t('Description')); ?>" ng-model="description"></textarea>
		</div>
		<button class="primary" value="create" ng-click="create()"><?php p($l->t('Create an event')); ?></button>
	</div>
</div>