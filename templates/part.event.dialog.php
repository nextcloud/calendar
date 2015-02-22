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
	ng-init="advancedoptions = true; alldayeventcheckbox=true;">



	<fieldset class="event-fieldset">
		<input
			class="event-input"
			ng-model="properties.title" ng-maxlength="100" 
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
		<input ng-model="properties.location" type="text" class="event-input"
			placeholder="<?php p($l->t('Events Location'));?>" name="location"
			typeahead="location for location in getLocation($viewValue)"
			autocomplete="off" />
	</fieldset>



	<fieldset class="event-time event-fieldset">
		<div class="event-time-interior">
			<input type="text" class="event-input" value="<?php p($_['startdate']);?>" name="from" id="from" ng-model="fromdatemodel" placeholder="<?php p($l->t('from'));?>" />
			<input type="time" class="event-input" value="<?php p($_['starttime']);?>" name="fromtime" id="fromtime" ng-model="fromtimemodel" ng-disabled="alldayeventcheckbox;" />
		</div>
		<div class="event-time-interior">
			<input type="text" class="event-input" value="<?php p($_['enddate']);?>" name="to" id="to" ng-model="todatemodel" placeholder="<?php p($l->t('to'));?>" />
			<input type="time" class="event-input" value="<?php p($_['endtime']);?>" name="totime" id="totime" ng-model="totimemodel" ng-disabled="alldayeventcheckbox;" />
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
				ng-model="alldayeventcheckbox"
				id="alldayeventcheckbox" class="event-checkbox" />
			<label for="alldayeventcheckbox"><?php p($l->t('All day'))?></label>
		</div>
	</fieldset>



	<fieldset ng-click="togglereminderarea = !togglereminderarea" class="event-fieldset event-fieldset-heading">
		<h3><?php p($l->t('Reminders')); ?></h3>
	</fieldset>
	
	

	<fieldset class="event-fieldset event-fieldset-reminder" ng-show="togglereminderarea">
		<div class="event-fieldset-interior event-fieldset-interior-reminder">
			<label class="event-label bold"><?php p($l->t('Reminder')); ?></label>
			<select class="event-select event-select-reminder"
				ng-model="selectedreminder"
				ng-selected="selectedreminder"
				ng-change="changereminder(selectedreminder)"
				ng-options="reminder.displayname for reminder in reminderSelect">
			</select>
		</div>
		<div class="event-fieldset-interior">
			<div class="event-fieldset-interior-remainders" ng-show="booyah">
				<input type="email" ng-model="reminderemail" placeholder="<?php p($l->t('Email id')); ?>" />
			</div>
		</div>

		<div class="event-fieldset-interior">
			<ul class="event-fieldset-list event-fieldset-interior-remainderslist">
				<li ng-repeat="alarm in properties.alarms">
					<span>{{ alarm.TRIGGER.value.displayname }}</span>
				</li>
			</ul>
		</div>
		<div class="event-fieldset-interior">	
			<button class="button event-button" ng-click="addmorereminders()">
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
