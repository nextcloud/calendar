<div id="app-sidebar" class="advanced">
	<form ng-submit="save()">
		<div class="sidebar-top" ng-class="{'new': is_new}">
			<div class="advanced--container">
				<fieldset class="advanced--fieldset" ng-disabled="readOnly">
					<textarea
							class="advanced--input h2 advanced--textarea"
							ng-model="properties.summary.value"
							placeholder="<?php p($l->t('Title of the Event'));?>"
							name="title" type="text"
							rows="1"
							autofocus="autofocus"
							tabindex="200"></textarea>
					<select
							ng-model="calendar"
							ng-change="selectedCalendarChanged()"
							ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"
							ng-show="showCalendarSelection()"
							tabindex="201"></select>
				</fieldset>

				<fieldset class="advanced--fieldset start-end-container" ng-disabled="readOnly">
					<div class="event-time-interior pull-left">
						<span><?php p($l->t('Starts')); ?></span>
						<ocdatetimepicker ng-model="properties.dtstart.value" disabletime="properties.allDay" datetabindex="203" timetabindex="204" readonly="readOnly"></ocdatetimepicker>
						<select ng-options="timezone.value as timezone.displayname | timezoneWithoutContinentFilter group by timezone.group for timezone in timezones" ng-model="properties.dtstart.parameters.zone" ng-show="edittimezone || readOnly" ng-disabled="properties.allDay"
								ng-change="loadTimezone(properties.dtstart.parameters.zone)" class="timezone-select" tabindex="205"></select>
					</div>
					<div class="event-time-interior pull-right">
						<span><?php p($l->t('Ends')); ?></span>
						<ocdatetimepicker ng-model="properties.dtend.value" disabletime="properties.allDay" datetabindex="206" timetabindex="207" readonly="readOnly"></ocdatetimepicker>
						<select ng-options="timezone.value as timezone.displayname | timezoneWithoutContinentFilter group by timezone.group for timezone in timezones" ng-model="properties.dtend.parameters.zone" ng-show="edittimezone || readOnly" ng-disabled="properties.allDay"
							ng-change="loadTimezone(properties.dtend.parameters.zone)" class="timezone-select" tabindex="208"></select>
					</div>
					<div class="advanced--checkbox pull-left pull-half">
						<input type="checkbox" name="alldayeventcheckbox"
							   class="checkbox"
							   ng-model="properties.allDay"
							   id="alldayeventcheckbox" class="event-checkbox"
								tabindex="202"/>
						<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
					</div>
					<div class="pull-right pull-half timezone-container">
						<button class="button btn-default btn-timezone" ng-click="edittimezone = !edittimezone" ng-show="!readOnly" type="button" tabindex="209">
							<span class="icon-timezone"></span>
						</button>
					</div>
				</fieldset>

				<ul class="tabHeaders">
					<li class="tabHeader" ng-repeat="tab in tabs"
						ng-click="tabopener(tab.value)" ng-class="{selected: tab.value == selected}">
						<a href="#">{{tab.title}}</a>
					</li>
				</ul>

				<div class="clear-both"></div>

				<fieldset class="advanced--fieldset" ng-disabled="readOnly">
					<div ng-include="currentTab"></div>
				</fieldset>

				<fieldset ng-show="eventsdetailsview" class="advanced--fieldset" ng-disabled="readOnly">
					<textarea ng-model="properties.location.value" type="text" class="advanced--input advanced--textarea" rows="1"
							  placeholder="<?php p($l->t('Location'));?>" name="location"
							  uib-typeahead="location.name for location in searchLocation($viewValue)" typeahead-show-hint="true" typeahead-min-length="3"
							  typeahead-on-select="selectLocationFromTypeahead($item)"
							  autocomplete="off" tabindex="210"></textarea>
					<textarea ng-model="properties.description.value" type="text" class="advanced--input advanced--textarea" rows="1"
							  placeholder="<?php p($l->t('Description'));?>" name="description" tabindex="210"></textarea>
					<select id="statusSelector"
							ng-options="status.type as status.displayname for status in statusSelect"
							ng-init="setStatusToDefault()"
							ng-model="properties.status.value"
							title="<?php p($l->t('Event status')); ?>" tabindex="210"></select>
					<select id="classSelector"
							ng-options="class.type as class.displayname for class in classSelect"
							ng-init="setClassToDefault()"
							ng-model="properties.class.value"
							title="<?php p($l->t('Visibility when sharing')); ?>" tabindex="210"></select>
				</fieldset>

				<fieldset ng-show="eventsattendeeview" class="advanced--fieldset" ng-disabled="readOnly" ng-controller="AttendeeController">
					<?php print_unescaped($this->inc('part.eventsattendees')); ?>
				</fieldset>

				<fieldset ng-show="eventsalarmview" class="advanced--fieldset" ng-disabled="readOnly" ng-controller="VAlarmController">
					<?php print_unescaped($this->inc('part.eventsalarms')); ?>
				</fieldset>

				<fieldset ng-show="eventsrepeatview" class="advanced--fieldset" ng-disabled="readOnly" ng-controller="RecurrenceController">
					<?php print_unescaped($this->inc('part.eventsrepeat')); ?>
				</fieldset>
			</div>
		</div>
		<div class="sidebar-bottom">
			<div class="advanced--button-area" ng-if="!readOnly">
				<fieldset>
					<button
						class="events--button button btn delete btn-half pull-left"
						ng-click="delete()"
						ng-if="!is_new"
						type="button"
						tabindex="280">
						<?php p($l->t('Delete')); ?>
					</button>
					<button
						class="evens--button button btn btn-half pull-right"
						ng-click="cancel()"
						ng-if="!is_new"
						type="button"
						tabindex="281">
						<?php p($l->t('Cancel')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="cancel()"
						ng-if="is_new"
						type="button"
						tabindex="282">
						<?php p($l->t('Cancel')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="export()"
						ng-if="!is_new"
						type="button"
						tabindex="283">
						<?php p($l->t('Export')); ?>
					</button>
					<button
						class="events--button button btn primary btn-full"
						ng-if="is_new"
						type="submit"
						tabindex="284">
						<?php p($l->t('Create')); ?>
					</button>
					<button
						class="evens--button button btn primary btn-full"
						ng-if="!is_new"
						type="submit"
						tabindex="285">
						<?php p($l->t('Update')); ?>
					</button>
				</fieldset>
			</div>

			<div class="advanced--button-area" ng-if="readOnly">
				<fieldset>
					<button
						class="evens--button button btn btn-full"
						ng-click="export()"
						ng-if="accessibleViaCalDAV"
						type="button"
						tabindex="290">
						<?php p($l->t('Export')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="cancel()"
						type="button"
						tabindex="291">
						<?php p($l->t('Close')); ?>
					</button>
				</fieldset>
			</div>
		</div>
	</form>
</div>
