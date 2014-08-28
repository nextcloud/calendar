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
		<input ng-model="properties.title" ng-maxlength="100" type="text" id="event-title"
			placeholder="<?php p($l->t('Title of the Event'));?>" name="title" autofocus="autofocus" />
	</fieldset>
	<fieldset>
		<span class="calendarCheckbox" style="background: {{ properties.calcolor }}"></span>
		<select id="calendardropdown" name="calendardropdown"
					ng-model="calendardropdown"
					ng-change="addtocalendar(calendardropdown.id)"
					ng-options="calendar.displayname for calendar in calendarListSelect | calendareventFilter"></select>
	</fieldset>
	<fieldset>
		<input ng-model="properties.location" type="text" id="event-location"
			placeholder="<?php p($l->t('Events Location'));?>" name="location"
			typeahead="location for location in getLocation($viewValue)"
			autocomplete="off" />
	</fieldset>
	<fieldset>
		<!--<table>
			<thead></thead>
			<tbody>
				<tr>
					<td>
						<label class="bold" for="alldayeventcheckbox"><?php p($l->t('All day')); ?></label>
					</td>
					<td>
						<input type="checkbox" ng-model="alldayeventcheckbox" name="alldayeventcheckbox" id="alldayeventcheckbox" />
					</td>
				</tr>
				<tr>
					<td>
						<label class="bold"><?php p($l->t('from')); ?></label>
					</td>
					<td>
						<timepicker id="fromdaytimepicker" style="width:100px;"
							ng-model="fromdaymodel" 
							ng-change="changedfromday()"
							hour-step="1"
							minute-step="15"
							show-meridian="false">
						</timepicker>
						<input type="time" ng-model="fromtimemodel" />
					</td>					
				</tr>
				<tr>
					<td>
						<label class="bold"><?php p($l->t('to')); ?></label>
					</td>
					<td>
						<timepicker id="todaytimepicker" ng-model="todaymodel" 
							ng-change="changedtoday()"
							hour-step="1"
							minute-step="15"
							show-meridian="false">
						</timepicker>
						<input type="time" ng-mode="totimemodel" />
					</td>					
				</tr>
			</tbody>
		</table>-->
		<div class="remindercontainer">
			<label class="bold"><?php p($l->t('Reminder')); ?></label>
			<select class="reminderselect"
				ng-model="selectedreminder"
				ng-selected="selectedreminder"
				ng-change="changereminder(selectedreminder)"
				ng-options="reminder.displayname for reminder in reminderSelect">
		</select>
		<div class="remindercontainer" ng-show="booyah">
			<input type="email" ng-model="reminderemail" placeholder="<?php p($l->t('Email id')); ?>" />
		</div>
		
		<ul id="listofreminders">
			<li ng-repeat="alarm in properties.alarms">
				<span>{{ alarm.TRIGGER.value.displayname }}</span>
			</li>
		</ul>
		<button id="addmorereminders" ng-click="addmorereminders()" class="btn">
			<?php p($l->t('Add')); ?>
		</button>
		</div>
	</fieldset>
	<fieldset>
		<input ng-model="properties.categories" type="text" id="event-categories"
			placeholder="<?php p($l->t('Separate Categories with comma'));?>" name="categories" />
	</fieldset>
	<fieldset>
		<textarea ng-model="properties.description" type="text" id="event-description"
			placeholder="<?php p($l->t('Description'));?>" name="description">
		</textarea>
	</fieldset>
	<fieldset>
		<h3><?php p($l->t('Attendees')); ?></h3>
		<div id="attendeearea">
			<label class="bold"><?php p($l->t('Name/Email')); ?></label>
			<input type="text" class="event-attendees-name" ng-model="nameofattendee"
				placeholder="<?php p($l->t('Name/Email'))?>" name="nameofattendee" />
		</div>
		<button id="addmoreattendees" ng-click="addmoreattendees()" class="btn">
			<?php p($l->t('Add')); ?>
		</button>
		<ul id="listofattendees">
			<li ng-repeat="attendee in properties.attendees">
			<span class="action notsurecontainer">
				<span class="checkedicon attendeenotsure"><?php p($l->t('?')); ?></span>
			</span>
			<!--<span class="action presentcontainer">
				<span class="icon-checkmark attendeepresent checkedicon"></span>Gives Color for attending or not attending
			</span>-->
			<!-- <span class="action absentcontainer">
				<span class="icon-close attendeepresent checkedicon"></span> Gives color for not attending guests.
			</span>-->
				<div ng-click="attendeeoptions = !attendeeoptions" class="attendeecontainer">
					<span>{{ attendee.value }}</span>
						<span class="icon-triangle-s attendeeopener"></span>
				</div>
				<ul ng-show="attendeeoptions" class="attendeeoptions">
					<li>
						<div>
							<span><?php p($l->t('Type')); ?></span>
							<select class="cutstatselect"
								ng-model="selectedstat"
								ng-selected="selectedstat"
								ng-change="changestat(selectedstat,attendee.value)"
								ng-options="cutstat.displayname for cutstat in cutstats">
							</select>
						</div>
					</li>
					<li>
						<div>
							<span><?php p($l->t('Optional')); ?></span>
							<input 
								type="checkbox" class="attendeecheckbox"
								value="<?php p($l->t('Optional')); ?>" 
								ng-checked="attendornot=='optional'" ng-click="attendornot='optional'" />
						</div>
					</li>
					<li>
						<span><?php p($l->t('Does not attend'))?></span>
						<input type="checkbox" class="attendeecheckbox" 
						value="<?php p($l->t('Does not attend')); ?>" 
						ng-checked="attendornot=='no'" ng-click="attendornot='no'" />
					</li>
					<!-- List of Emails a person has. -->
					<li>
						<span></span>
					</li>
				</ul>
			</li>
		</ul>
	</fieldset>
	<fieldset>
		<h3><?php p($l->t('Reminders')); ?></h3>
		
	</fieldset>
	<fieldset>
		<button id="eventupdatebutton" ng-click="update()" class="btn primary">
			<?php p($l->t('Update')); ?>
		</button>
	</fieldset>
</div>
