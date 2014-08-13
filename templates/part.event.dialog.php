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

<div id="events" title="<?php p($l->t("View an event"));?>"          
	open="{{dialogOpen}}" 
	ok-button="OK"
	ok-callback="handleOk"
	cancel-button="Cancel"
	cancel-callback="handleCancel"
	ng-init="advancedoptions = true;">
	<fieldset>
		<label class="bold"><?php p($l->t('Title')); ?></label>
		<input ng-model="properties.title" ng-maxlength="100" type="text" id="event-title"
			placeholder="<?php p($l->t('Title of the Event'));?>" name="title" autofocus="autofocus" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Location')); ?></label>
		<input ng-model="properties.location" type="text" id="event-location"
			placeholder="<?php p($l->t('Events Location'));?>" name="location" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Categories')); ?></label>
		<input ng-model="properties.categories" type="text" id="event-categories"
			placeholder="<?php p($l->t('Separate Categories with comma'));?>" name="categories" />
	</fieldset>
	<fieldset>
		<label class="bold"><?php p($l->t('Description')); ?></label>
		<input ng-model="properties.description" type="text" id="event-description"
			placeholder="<?php p($l->t('Description'));?>" name="description" />
	</fieldset>
	<fieldset>
		<h3><?php p($l->t('Attendees')); ?></h3>
		<div id="attendeearea">
			<label class="bold"><?php p($l->t('Name/Email')); ?></label>
			<input type="text" class="event-attendees-name" ng-model="nameofattendee"
				placeholder="<?php p($l->t('Name/Email'))?>" name="nameofattendee" />
		</div>
		<ul id="listofattendees">
			<li ng-repeat="attendee in properties.attendees">
				<span></span><!-- Gives Color for attending or not attending -->
				<div ng-click="attendeeoptions = !attendeeoptions">{{ attendee.value }}</div>
				<ul ng-show="attendeeoptions" class="attendeeoptions">
					<li>
						<div>
							<span><?php p($l->t('Type')); ?></span>
							<select class="cutstatselect"
								ng-model="selectedstat"
								ng-selected="selectedstat"
								ng-options="cutstat.displayname for cutstat in cutstats">
							</select>
						</div>
					</li>
					<li>
						<span><?php p($l->t('Optional')); ?></span>
					</li>
					<li>
						<span><?php p($l->t('Does not attend'))?></span>
					</li>
					<!-- List of Emails a person has. -->
					<li>
						<span></span>
					</li>
				</ul>
			</li>
		</ul>
		<button id="addmoreattendees" ng-click="addmoreattendees()" class="btn">
			<?php p($l->t('Add')); ?>
		</button>
	</fieldset>
	<fieldset>
		<button id="eventupdatebutton" ng-click="update()" class="btn primary">
			<?php p($l->t('Update')); ?>
		</button>
	</fieldset>
</div>
