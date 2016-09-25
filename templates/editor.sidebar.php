<div id="app-sidebar" class="advanced">
	<form ng-submit="save()">
		<div class="sidebar-top">
			<div class="advanced--container">
				<fieldset class="advanced--fieldset" ng-disabled="readOnly">
					<input
							class="advanced--input h2"
							ng-model="properties.summary.value"
							placeholder="<?php p($l->t('Title of the Event'));?>"
							name="title" type="text"
							autofocus="autofocus"/>
					<select
							ng-model="calendar"
							ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"
							ng-show="showCalendarSelection()"></select>
				</fieldset>

				<fieldset class="advanced--fieldset start-end-container" ng-disabled="readOnly">
					<div class="event-time-interior pull-left pull-half">
						<span><?php p($l->t('starts')); ?></span>
						<ocdatetimepicker ng-model="properties.dtstart.value" disabletime="properties.allDay"></ocdatetimepicker>
						<select ng-options="timezone.value as timezone.displayname | timezoneWithoutContinentFilter group by timezone.group for timezone in timezones" ng-model="properties.dtstart.parameters.zone" ng-show="edittimezone || readOnly" ng-disabled="properties.allDay"
								ng-change="loadTimezone(properties.dtstart.parameters.zone)" class="timezone-select"></select>
					</div>
					<div class="event-time-interior pull-right pull-half">
						<span><?php p($l->t('ends')); ?></span>
						<ocdatetimepicker ng-model="properties.dtend.value" disabletime="properties.allDay"></ocdatetimepicker>
						<select ng-options="timezone.value as timezone.displayname | timezoneWithoutContinentFilter group by timezone.group for timezone in timezones" ng-model="properties.dtend.parameters.zone" ng-show="edittimezone || readOnly" ng-disabled="properties.allDay"
							ng-change="loadTimezone(properties.dtend.parameters.zone)" class="timezone-select"></select>
					</div>
					<div class="advanced--checkbox pull-left pull-half">
						<input type="checkbox" name="alldayeventcheckbox"
							   ng-model="properties.allDay"
							   id="alldayeventcheckbox" class="event-checkbox"
							   ng-change="toggledAllDay()"/>
						<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
					</div>
					<div class="pull-right pull-half timezone-container">
						<button class="button btn-default btn-timezone" ng-click="edittimezone = !edittimezone" ng-show="!readOnly" type="button">
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

				<fieldset class="advanced--fieldset" ng-disabled="readOnly">
					<div ng-include="currentTab"></div>
				</fieldset>

				<fieldset ng-show="eventsdetailsview" class="advanced--fieldset" ng-disabled="readOnly">
					<textarea ng-model="properties.location.value" type="text" class="advanced--input"
							  placeholder="<?php p($l->t('Location'));?>" name="location"
							  uib-typeahead="location.name for location in searchLocation($viewValue)" typeahead-show-hint="true" typeahead-min-length="3"
							  typeahead-on-select="selectLocationFromTypeahead($item)"
							  autocomplete="off" ></textarea>
					<textarea ng-model="properties.description.value" type="text" class="advanced--input advanced--textarea"
							  placeholder="<?php p($l->t('Description'));?>" name="description"></textarea>
					<select id="statusSelector"
							ng-options="status.type as status.displayname for status in statusSelect"
							ng-init="setStatusToDefault()"
							ng-model="properties.status.value"
							title="<?php p($l->t('Event status')); ?>"></select>
					<?php if ($_['supportsClass']): ?>
						<select id="classSelector"
								ng-options="class.type as class.displayname for class in classSelect"
								ng-init="setClassToDefault()"
								ng-model="properties.class.value"
								title="<?php p($l->t('Visibility when sharing')); ?>"></select>
					<?php endif; ?>
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
			<div class="advanced--button-area" ng-show="!readOnly">
				<fieldset>
					<button
						class="events--button button btn delete btn-half pull-left"
						ng-click="delete()"
						ng-show="!is_new"
						type="button">
						<?php p($l->t('Delete')); ?>
					</button>
					<button
						class="evens--button button btn btn-half pull-right"
						ng-click="cancel()"
						ng-show="!is_new"
						type="button">
						<?php p($l->t('Cancel')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="cancel()"
						ng-show="is_new"
						type="button">
						<?php p($l->t('Cancel')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="export()"
						ng-show="!is_new"
						type="button">
						<?php p($l->t('Export')); ?>
					</button>
					<button
						class="events--button button btn primary btn-full"
						ng-show="is_new"
						type="submit">
						<?php p($l->t('Create')); ?>
					</button>
					<button
						class="evens--button button btn primary btn-full"
						ng-show="!is_new"
						type="submit">
						<?php p($l->t('Update')); ?>
					</button>
				</fieldset>
			</div>

			<div class="advanced--button-area" ng-show="readOnly">
				<fieldset>
					<button
						class="evens--button button btn btn-full"
						ng-click="export()"
						ng-show="accessibleViaCalDAV"
						type="button">
						<?php p($l->t('Export')); ?>
					</button>
					<button
						class="evens--button button btn btn-full"
						ng-click="cancel()"
						type="button">
						<?php p($l->t('Close')); ?>
					</button>
				</fieldset>
			</div>
		</div>
	</form>
</div>
