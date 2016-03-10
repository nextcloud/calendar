<?php
/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
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

<div class="advanced--fieldset">
	<ul class="advanced--fieldset-reminderlist">
		<li class="advanced--list pull-left" ng-repeat="alarm in properties.alarm" ng-class="{ active : reminderoptions }">
			<div class="advanced--toggler" ng-model="reminderoptions" ng-click="triggerEdit(alarm)">
				<span class="pull-left margin-class">{{alarm | simpleReminderDescription}}</span>
				<button class="advanced--button__icon pull-right icon-close" ng-click="remove(alarm.group)">
				</button>
			</div>
			<div class="reminderoptions pull-left full-width" ng-show="alarm.editor.editing">
				<div class="event-fieldset-alarm-editor">
					<!-- simple reminder settings - should fit >95% if all cases -->
					<div class="advanced--fieldset-interior">
						<div class="pull-left pull-half">
							<span><?php p($l->t('Time')); ?></span>
							<select class="advanced--select advanced--select__reminder"
									ng-model="alarm.editor.reminderSelectValue"
									ng-change="updateReminderSelectValue(alarm)"
									ng-options="reminder.trigger as reminder.displayname for reminder in reminderSelect">
							</select>
						</div>
						<div class="pull-right pull-half">
							<span><?php p($l->t('Type')); ?></span>
							<select class="advanced--select advanced--select__reminder"
									ng-model="alarm.action.value">
								<option ng-repeat="reminder in reminderTypeSelect"
										ng-selected="{{reminder.type == alarm.action.value}}"
										value="{{reminder.type}}">{{reminder.displayname}}</option>
							</select>
						</div>
						<div class="clear-both"></div>
					</div>
					<div class="advanced--fieldset-interior" ng-show="alarm.editor.reminderSelectValue == 'custom'">
						<div class="event-fieldset-custom-interior">
							<!-- Select between relative and absolute -->
							<div class="relative-container custom-container">
								<input type="radio" name="relativeorabsolute_{{$id}}"
									   id="relativereminderradio_{{$id}}" class="event-radio"
									   value="relative" ng-model="alarm.editor.triggerType"
									   ng-change="updateReminderRelative(alarm)" />
								<label for="relativereminderradio_{{$id}}"><?php p($l->t('Relative')); ?></label>
								<input type="radio" name="relativeorabsolute_{{$id}}"
									   id="absolutereminderradio_{{$id}}" class="event-radio"
									   value="absolute" ng-model="alarm.editor.triggerType"
									   ng-change="updateReminderAbsolute(alarm)" />
								<label for="absolutereminderradio_{{$id}}"><?php p($l->t('Absolute')); ?></label>
							</div>
							<div class="clear-both"></div>
							<!-- Relative input -->
							<div class="custom-container-options" ng-show="alarm.editor.triggerType === 'relative'">
								<input id="relativealarm_{{$id}}" class="event-input relativealarm pull-quarter" type="number"
									   ng-model="alarm.editor.triggerValue"
									   ng-disabled="alarm.editor.triggerType != 'relative'"
									   ng-change="updateReminderRelative(alarm)"
								/>
								<select class="event-select event-select-reminder pull-quarter"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.editor.triggerTimeUnit"
										ng-change="updateReminderRelative(alarm)">
									<option ng-repeat="reminder in timeUnitReminderSelect"
											ng-selected="{{reminder.factor == alarm.editor.triggerTimeUnit}}"
											value="{{reminder.factor}}">{{reminder.displayname}}</option>
								</select>
								<select class="event-select event-select-reminder pull-quarter"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.editor.triggerBeforeAfter"
										ng-change="updateReminderRelative(alarm)"
										ng-options="reminder.factor as reminder.displayname for reminder in timePositionReminderSelect">
								</select>
								<select class="event-select event-select-reminder pull-quarter"
										ng-disabled="alarm.editor.triggerType != 'relative'"
										ng-model="alarm.trigger.related"
										ng-change="updateReminderRelative(alarm)">
									<option ng-repeat="reminder in startEndReminderSelect"
											ng-selected="{{reminder.type == alarm.trigger.related}}"
											value="{{reminder.type}}">{{reminder.displayname}}</option>
								</select>
							</div>
							<!-- absolute input -->
							<div class="custom-container-options" ng-show="alarm.editor.triggerType === 'absolute'">
								<ocdatetimepicker ng-model="alarm.editor.absMoment"></ocdatetimepicker>
							</div>
							<!-- repeat settings -->
							<!--
							<div class="custom-container repeat-container">
								<input type="checkbox" class="event-checkbox"
									   id="repeatabsolutereminder_{{$id}}"
									   ng-model="alarm.editor.repeat"
									   ng-change="updateReminderRepeat(alarm)" />
								<label for="repeatabsolutereminder_{{$id}}"><?php p($l->t('Repeat')); ?></label>
							</div>
							<div class="custom-container-options" ng-show="alarm.editor.repeat == true">
								<input class="event-input pull-quarter" type="number"
									   ng-model="alarm.editor.repeatNTimes"
									   ng-disabled="alarm.editor.repeat == false"
									   ng-change="updateReminderRepeat(alarm)" />
								<span class="pull-quarter inline"><?php p($l->t('times every')); ?></span>
								<input class="event-input pull-quarter" type="number"
									   ng-model="alarm.editor.repeatNValue"
									   ng-disabled="alarm.editor.repeat == false"
									   ng-change="updateReminderRepeat(alarm)" />
								<select class="event-select event-select-reminder pull-quarter"
										ng-model="alarm.editor.repeatTimeUnit"
										ng-disabled="alarm.editor.repeat == false"
										ng-change="updateReminderRepeat(alarm)">
									<option ng-repeat="reminder in timeUnitReminderSelect"
											ng-selected="{{reminder.factor == alarm.editor.repeatTimeUnit}}"
											value="{{reminder.factor}}">{{reminder.displayname}}</option>
								</select>
							</div>
							-->
						</div>
					</div>
				</div>
			</div>
		</li>
	</ul>
</div>
<div class="event-fieldset-interior">
	<button id="addreminders" ng-click="add()" class="btn event-button button">
		<?php p($l->t('Add')); ?>
	</button>
</div>
