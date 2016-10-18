<div>
	<form class="events" ng-submit="save()">
		<fieldset class="events--fieldset" ng-disabled="readOnly">
			<input
					class="events--input h2"
					ng-model="properties.summary.value"
					placeholder="<?php p($l->t('Title of the Event'));?>"
					name="title" type="text"
					autofocus="autofocus"
			/>
			<select
					ng-model="calendar"
					ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"
					ng-show="showCalendarSelection()"></select>
		</fieldset>

		<fieldset class="event-time events--fieldset" ng-disabled="readOnly">
			<div class="event-time-interior pull-left">
				<span><?php p($l->t('starts')); ?></span>
				<ocdatetimepicker ng-model="properties.dtstart.value" disabletime="properties.allDay"></ocdatetimepicker>
				<span ng-show="edittimezone">{{ properties.dtstart.parameters.zone | timezoneFilter }}</span>
			</div>
			<div class="event-time-interior pull-right">
				<span><?php p($l->t('ends')); ?></span>
				<ocdatetimepicker ng-model="properties.dtend.value" disabletime="properties.allDay"></ocdatetimepicker>
				<span ng-show="edittimezone">{{ properties.dtend.parameters.zone | timezoneFilter }}</span>
			</div>
			<div class="clear-both"></div>
			<div class="events--checkbox pull-left">
				<input type="checkbox" name="alldayeventcheckbox"
					   ng-model="properties.allDay"
					   class="checkbox"
					   id="alldayeventcheckbox" class="event-checkbox"
					   ng-change="toggledAllDay()" />
				<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
			</div>
		</fieldset>

		<fieldset class="events--fieldset pull-left" ng-show="!readOnly">
			<button ng-click="delete()" ng-show="!is_new" class="events--button button btn delete" type="button">
				<?php p($l->t('Delete')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn" type="button">
				<?php p($l->t('Cancel')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-show="!readOnly">
			<button ng-click="proceed()" class="events--button button btn" type="button">
				<?php p($l->t('More ...')); ?>
			</button>
			<button
				class="events--button button btn primary"
				ng-show="is_new"
				type="submit">
				<?php p($l->t('Create')); ?>
			</button>
			<button
				class="evens--button button btn primary"
				ng-show="!is_new"
				type="submit">
				<?php p($l->t('Update')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-show="readOnly">
			<button ng-click="proceed()" class="events--button button btn" type="button">
				<?php p($l->t('More ...')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn" type="button">
				<?php p($l->t('Close')); ?>
			</button>
		</fieldset>
	</form>
</div>
