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

<div id="event" title="<?php p($l->t("View an event"));?>">
	<tabset>
		<tab heading="<?php p($l->t('Eventinfo')); ?>">
			<input type="text" id="event-title" ng-model="summary" class="input" placeholder="<?php p($l->t('Title of the Event')); ?>" />
			<div id="event-time">
				<div id="event-time-from">
					<label><?php p($l->t('from')); ?></label>
					<input ng-model="dtstart" type="text" />
					<input type="time" value="00:15" name="fromtime" id="fromtime" class="hasTimepicker" ng-disabled="alldaycheck">
					<select ng-disabled="alldaycheck" ng-init="currenttz=timezone">
						<option ng-repeat="timezone in timezones" value="{{ timezone }}">{{ timezone }}</option>
					</select>
				</div>
				<div id="event-time-to">
					<label><?php p($l->t('to')); ?></label>
					<input ng-model="dtend" type="text" />
					<input type="time" value="00:15" name="totime" id="totime" class="hasTimepicker" ng-model="totime" ng-disabled="alldaycheck">
					<select ng-disabled="alldaycheck" ng-init="currenttz=timezone">
						<option ng-repeat="timezone in timezones" value="{{ timezone }}">{{ timezone }}</option>
					</select>
				</div>
			</div>
			<div id="event-allday">
				<input type="checkbox" ng-model="alldaycheck" ng-click="toggletimezones" />
				<label><?php p($l->t('All day event')); ?></label>
			</div>
			<select>
				<option ng-repeat="calendar in calendars">
					{{ calendar.displayname }}
				</option>
			</select>

			<button class="primary" value="<?php p($l->t('Advanced Options')); ?>" ng-click="advanced = !advanced"><?php p($l->t('Advanced Options')); ?></button>

			<!-- Initially hidden div -->
			<div ng-show="advanced" id="advanced_options">
				<input type="text" id="event-location" ng-model="location" placeholder="<?php p($l->t('Location')); ?>" />
				<input type="text" id="category" ng-model="categories" placeholder="<?php p($l->t('Categories')); ?>" />
				<textarea id="description" placeholder="<?php p($l->t('Description')); ?>" ng-model="description"></textarea>
			</div>
		</tab>
		<tab heading="<?php p($l->t('Repeating')); ?>">
			<label><?php p($l->t('Repeat'))?></label>
			<select>
				<option ng-repeat="repeatevent in repeatevents">{{ repeatevent.title }}</option>
			</select>
			<button class="primary" value="<?php p($l->t('Advanced Options')); ?>" ng-click="advanced_repeating = !advanced_repeating"><?php p($l->t('Advanced Options')); ?></button>
			<div id="advanced_repeating" ng-show="advanced_repeating">
				<label><?php p($l->t('Interval')); ?></label>
				<input type="number" min="1" size="4" max="1000" value="1" name="interval" />
				<label><?php p($l->t('End')); ?></label>
				<select>
					<option ng-repeat="endinterval in endintervals">{{ endinterval.title }}</option>
				</select>
			</div>
		</tab>
	</tabset>
	<button class="primary" value="create" ng-click="create()" id="createventbutton"><?php p($l->t('Create an event')); ?></button>
</div>
