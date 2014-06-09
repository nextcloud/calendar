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
		<input type="text" id="newevent" ng-model="neweventModel" class="input" />
		<label><?php p($l->t('Calendar')); ?></label>
		<!-- Fetch list of calendars here -->
		<select></select>
		<input type="checkbox" ng-model="alldaycheck" />
		<label><?php p($l->t('from')); ?></label>
		<!-- datepicker with input here -->
		<label><?php p($l->t('to')); ?></label>
		<!-- datepicker with input here -->
		<label><?php p($l->t('All day event')); ?></label>
		<button class="primary" value="Advanced Options" ng-toggle="advanced"><?php p($l->t('Advanced Options')); ?></button>

		<!-- Initially hidden div -->
		<div>
			<input type="text" ng-model="location" placeholder="<?php p($l->t('Location')); ?>" />
			<input type="text" ng-model="categories" placeholder="<?php p($l->t('Categories')); ?>" />
			<textarea placeholder="<?php p($l->t('Description')); ?>" ng-model="description"></textarea>
		</div>
		<button class="primary" value="create" ng-click="create()"><?php p($l->t('Create an event')); ?></button>
	</div>
</div>