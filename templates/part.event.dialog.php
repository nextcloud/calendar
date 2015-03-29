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
	ng-init="advancedoptions = true; alldayeventcheckbox=true; customreminderarea=false;">



	<fieldset class="event-fieldset">
		<input
			class="event-input"
			ng-model="properties.summary.value"
			placeholder="<?php p($l->t('Title of the Event'));?>"
			name="title" type="text"
			autofocus="autofocus"
		/>
	</fieldset>



	<fieldset class="event-fieldset">
		<span class="calendarCheckbox" style="background: {{ properties.calcolor }}"></span>
		<select class="event-select event-select-calendardropdown" name="calendardropdown"
			ng-model="calendardropdown"
			ng-change="addtocalendar(calendardropdown.id)"
			ng-options="calendar.displayname for calendar in calendarListSelect | calendareventFilter">
		</select>
	</fieldset>



	<fieldset class="event-fieldset">
		<input ng-model="properties.location.value" type="text" class="event-input"
			placeholder="<?php p($l->t('Events Location'));?>" name="location"
			typeahead="location for location in getLocation($viewValue)"
			autocomplete="off" />
	</fieldset>



	<fieldset class="event-time event-fieldset">
		<div class="event-time-interior">
			<input type="text" class="event-input" name="from" id="from" ng-model="fromdatemodel" placeholder="<?php p($l->t('from'));?>" />
			<input type="time" class="event-input" name="fromtime" id="fromtime" ng-model="fromtimemodel" ng-disabled="alldayeventcheckbox;" />
		</div>
		<div class="event-time-interior">
			<input type="text" class="event-input" name="to" id="to" ng-model="todatemodel" placeholder="<?php p($l->t('to'));?>" />
			<input type="time" class="event-input" name="totime" id="totime" ng-model="totimemodel" ng-disabled="alldayeventcheckbox;" />
		</div>
		<div class="event-time-interior event-time-interior-buttonarea">
		<!-- TODO: Remove inline styles as soon as Reminders and Alarms are done -->
			<button class="button event-button">
				<span class="fa fa-clock-o fa-1x"></span>
			</button>
			<button class="button event-button">
				<span class="fa fa-refresh fa-1x"></span>
			</button>
		</div>
		<div class="event-time-interior event-time-interior-allday">
			<input type="checkbox" name="alldayeventcheckbox"
				ng-model="properties.allDay"
				id="alldayeventcheckbox" class="event-checkbox" />
			<label for="alldayeventcheckbox"><?php p($l->t('All day'))?></label>
		</div>
	</fieldset>



	<fieldset ng-click="togglereminderarea = !togglereminderarea; selectedReminderId = null;" class="event-fieldset event-fieldset-heading">
		<h3><?php p($l->t('Reminders')); ?></h3>
		<ul class="event-fieldset-list event-fieldset-interior-remainderslist" ng-show="!togglereminderarea">
			<li ng-repeat="alarm in properties.alarms|limitTo:3">
				<span>{{alarm | simpleReminderDescription}}</span>
			</li>
			<li ng-show="properties.alarms.length > 3">...</li>
		</ul>
	</fieldset>

	<fieldset class="event-fieldset event-fieldset-reminder" ng-show="togglereminderarea">
		<ul class="event-fieldset-list event-fieldset-interior-remainderslist">
			<li ng-repeat="alarm in properties.alarms">
				<!-- simple overview -->
				<div ng-show="alarm.id != selectedReminderId" ng-click="editReminder(alarm.id)">
					<span>{{alarm | simpleReminderDescription}}</span>
					<span ng-show="!isEditingReminderSupported(alarm.id)">(<?php p($l->t('not editable')); ?>)</span>
					<button class="event-button event-delete-button" ng-click="deleteReminder(alarm.id)">
						<i class="fa fa-1x fa-times"></i>
					</button>
				</div>
				<!-- edit reminder -->
				<div ng-show="alarm.id == selectedReminderId" class="event-fieldset-reminder-editor">
					<!-- simple reminder settings - should fit >95% if all cases -->
					<div class="event-fieldset-interior event-fieldset-interior-reminder">
						<label class="event-label bold"><?php p($l->t('Reminder')); ?></label>
						<button class="event-button event-delete-button" ng-click="selectedReminderId = null">
							<i class="fa fa-1x fa-angle-up"></i>
						</button>
						<select class="event-select event-select-reminder"
							ng-model="alarm.editor.reminderSelectValue"
							ng-change="updateReminderSelectValue(alarm)">
							<option ng-repeat="reminder in reminderSelect" ng-selected="{{reminder.trigger == alarm.editor.reminderSelectValue}}" value="{{reminder.trigger}}">{{reminder.displayname}}</option>
						</select>
						<select class="event-select event-select-reminder"
								ng-model="alarm.action.value">
							<option ng-repeat="reminder in reminderTypeSelect" ng-selected="{{reminder.type == alarm.action.value}}" value="{{reminder.type}}">{{reminder.displayname}}</option>
						</select>
					</div>
					<!-- advanced reminder settings - offer everything described in the standard -->
					<div class="event-fieldset-interior" ng-show="alarm.editor.reminderSelectValue == 'custom'">
						<div class="event-fieldset-custom-interior">
							<!-- relative input -->
							<div class="relative-container custom-container">
								<input type="radio" name="relativeorabsolute"
									   id="relativereminderradio" class="event-radio"
									   value="relative" ng-model="alarm.editor.triggerType"
									   ng-change="updateReminderRelative(alarm)" />
								<label for="relativereminderradio"><?php p($l->t('Relative')); ?></label>
								<select class="event-select event-select-reminder"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.trigger.related"
										ng-change="updateReminderRelative(alarm)">
									<option ng-repeat="reminder in startendreminderSelect" ng-selected="{{reminder.type == alarm.trigger.related}}" value="{{reminder.type}}">{{reminder.displayname}}</option>
								</select>
								<select class="event-select event-select-reminder"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.editor.triggerBeforeAfter"
										ng-change="updateReminderRelative(alarm)">
									<option ng-repeat="reminder in timepositionreminderSelect" ng-selected="{{reminder.factor == alarm.editor.triggerBeforeAfter}}" value="{{reminder.factor}}">{{reminder.displayname}}</option>
								</select>
								<select class="event-select event-select-reminder"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.editor.triggerTimeUnit"
										ng-change="updateReminderRelative(alarm)">
									<option ng-repeat="reminder in timeUnitReminderSelect" ng-selected="{{reminder.factor == alarm.editor.triggerTimeUnit}}" value="{{reminder.factor}}">{{reminder.displayname}}</option>
								</select>
								<input class="event-input" type="number" ng-model="alarm.editor.triggerValue" ng-disabled="alarm.editor.triggerType != 'relative'" ng-change="updateReminderRelative(alarm)" />
							</div>
							<!-- absolute input -->
							<div class="absolute-container custom-container">
								<input type="radio" name="relativeorabsolute"
									   id="absolutereminderradio" class="event-radio"
									   value="absolute" ng-model="alarm.editor.triggerType"
									   ng-change="updateReminderAbsolute(alarm)" />
								<label for="absolutereminderradio"><?php p($l->t('Absolute')); ?></label>
								<input type="time" class="event-input"
									   name="absolutremindertime" id="absolutremindertime"
									   ng-model="alarm.editor.absDate" ng-disabled="alarm.editor.triggerType != 'absolute'"
									   ng-change="updateReminderAbsolute(alarm)" />
								<input type="text" name="absolutreminderdate"
									   id="absolutreminderdate" class="event-input"
									   ng-model="alarm.editor.absTime" ng-disabled="alarm.editor.triggerType != 'absolute'"
									   placeholder="<?php p($l->t('Date'));?>"
									   ng-change="updateReminderAbsolute(alarm)" />
							</div>
							<!-- repeat settings -->
							<div class="custom-container repeat-container">
								<input type="checkbox" ng-model="alarm.editor.repeat" id="repeatabsolutereminder" class="event-checkbox" />
								<label for="repeatabsolutereminder"><?php p($l->t('Repeat')); ?></label>
								<input class="event-input" type="number" ng-model="alarm.editor.repeatNTimes" ng-disabled="alarm.editor.repeat == false" />
								<span><?php p($l->t('times every')); ?></span>
								<input class="event-input" type="number" ng-model="alarm.editor.repeatNValue" ng-disabled="alarm.editor.repeat == false" />
								<select class="event-select event-select-reminder"
										ng-model="alarm.editor.repeatTimeUnit"
										ng-disabled="alarm.editor.repeat == false">
									<option ng-repeat="reminder in timeUnitReminderSelect" ng-selected="{{reminder.factor == alarm.editor.repeatTimeUnit}}" value="{{reminder.factor}}">{{reminder.displayname}}</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</li>
		</ul>
		<div class="event-fieldset-interior">
			<button id="addreminders" ng-click="addReminder()" class="btn event-button button">
				<?php p($l->t('Add')); ?>
			</button>
		</div>
	</fieldset>


	<fieldset ng-click="toggleattendeearea = !toggleattendeearea" class="event-fieldset event-fieldset-heading">
		<h3><?php p($l->t('Attendees')); ?></h3>
	</fieldset>



	<fieldset class="event-fieldset event-fieldset-attendee" ng-show="toggleattendeearea">
		<div class="event-fieldset-interior">
			<label class="event-label bold"><?php p($l->t('Name/Email')); ?></label>
			<input type="text" class="event-input event-attendees-name" ng-model="nameofattendee"
				placeholder="<?php p($l->t('Name/Email'))?>" name="nameofattendee" />
		</div>
		<div class="event-fieldset-interior">
			<button id="addmoreattendees" ng-click="addmoreattendees()" class="btn event-button button">
				<?php p($l->t('Add')); ?>
			</button>
		</div>
		<div class="event-fieldset-interior">
			<ul id="listofattendees">
				<li ng-repeat="attendee in properties.attendees">
					<span class="action notsurecontainer">
						<span class="checkedicon attendeenotsure"><i class="fa-question fa"></i></span>
					</span>
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
		</div>
		
	</fieldset>


	<fieldset ng-click="toggleotherarea = !toggleotherarea" class="event-fieldset event-fieldset-heading">
		<h3><?php p($l->t('Others')); ?></h3>
	</fieldset>


	<fieldset ng-show="toggleotherarea">
		<input ng-model="properties.categories" type="text" class="event-input"
			placeholder="<?php p($l->t('Separate Categories with comma'));?>" name="categories" />
		<textarea ng-model="properties.description" type="text" class="event-input event-textarea"
			placeholder="<?php p($l->t('Description'));?>" name="description">
		</textarea>
	</fieldset>

	
	<fieldset class="event-fieldset event-fieldset-update">
		<button ng-click="update()" class="event-button button btn primary">
			<?php p($l->t('Update')); ?>
		</button>
	</fieldset>
</div>
