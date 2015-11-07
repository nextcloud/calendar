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

<fieldset ng-click="togglereminderarea = !togglereminderarea; selectedReminderId = null;" class="event-fieldset">
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
				<div ng-show="alarm.id != selectedReminderId" ng-click="editReminder(alarm.id)" class="event-fieldset-interior-reminderlist-single">
					<h4>{{alarm | simpleReminderDescription}}</h4>
					<span ng-show="!isEditingReminderSupported(alarm.id)">(<?php p($l->t('not editable')); ?>)</span>
					<span class="event-button event-delete-button" ng-click="deleteReminder(alarm.id)">
						<i class="fa fa-1x fa-times"></i>
					</span>
				</div>
				<!-- edit reminder -->
				<div ng-show="alarm.id == selectedReminderId" class="event-fieldset-reminder-editor">
					<!-- simple reminder settings - should fit >95% if all cases -->
					<div class="event-fieldset-interior event-fieldset-interior-reminder">
						<label class="event-label bold"><?php p($l->t('Reminder')); ?></label>
						<span class="event-button event-delete-button" ng-click="selectedReminderId = null">
							<i class="fa fa-1x fa-sort-up"></i>
						</span>
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