<div>
	<form class="events" ng-submit="save()">
		<fieldset class="events--fieldset" ng-disabled="readOnly">
			<textarea
					rows="1"
					class="events--input h2 events--textarea"
					ng-model="properties.summary.value"
					placeholder="<?php p($l->t('Title of the Event editor.popover'));?>"
					name="title" type="text"
					autofocus="autofocus"
					tabindex="100"
			></textarea>
			<select
					ng-model="calendar"
					ng-change="selectedCalendarChanged()"
					ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"
					ng-show="showCalendarSelection()"
					tabindex="101"></select>
		</fieldset>

		<fieldset class="event-time events--fieldset" ng-disabled="readOnly">
			<div class="event-time-interior pull-left">
				<span><?php p($l->t('Starts')); ?></span>
				<ocdatetimepicker ng-model="properties.dtstart.value" disabletime="properties.allDay" datetabindex="103" timetabindex="104" readonly="readOnly"></ocdatetimepicker>
				<span ng-show="edittimezone">{{ properties.dtstart.parameters.zone | timezoneFilter }}</span>
			</div>
			<div class="event-time-interior pull-right">
				<span><?php p($l->t('Ends')); ?></span>
				<ocdatetimepicker ng-model="properties.dtend.value" disabletime="properties.allDay" datetabindex="105" timetabindex="106" readonly="readOnly"></ocdatetimepicker>
				<span ng-show="edittimezone">{{ properties.dtend.parameters.zone | timezoneFilter }}</span>
			</div>
			<div class="clear-both"></div>
			<div class="events--checkbox pull-left">
				<input type="checkbox" name="alldayeventcheckbox"
					   ng-model="properties.allDay"
					   class="checkbox"
					   id="alldayeventcheckbox" class="event-checkbox"
						tabindex="102" />
				<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
			</div>
		</fieldset>

		<fieldset class="events--fieldset pull-left" ng-if="!readOnly">
			<button ng-click="delete()" ng-if="!is_new" class="events--button button btn delete" type="button" tabindex="110">
				<?php p($l->t('Delete')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn" type="button" tabindex="111">
				<?php p($l->t('Cancel')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-if="!readOnly">
			<button ng-click="proceed()" class="events--button button btn" type="button" tabindex="120">
				<?php p($l->t('More ...')); ?>
			</button>
			<button
				class="events--button button btn primary"
				ng-if="is_new"
				type="submit"
				tabindex="121">
				<?php p($l->t('Create')); ?>
			</button>
			<button
				class="evens--button button btn primary"
				ng-if="!is_new"
				type="submit"
				tabindex="122">
				<?php p($l->t('Update')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-if="readOnly">
			<button ng-click="proceed()" class="events--button button btn" type="button" tabindex="130">
				<?php p($l->t('More ...')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn" type="button" tabindex="131">
				<?php p($l->t('Close')); ?>
			</button>
		</fieldset>
	</form>
</div>
