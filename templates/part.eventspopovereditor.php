<div>
	<form class="events">

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
					ng-init="calendar = oldCalendar || calendars[0]"
					ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"></select>
		</fieldset>

		<fieldset class="event-time events--fieldset" ng-disabled="readOnly">
			<div class="event-time-interior pull-left">
				<span><?php p($l->t('From')); ?></span>
				<input type="text" name="from" id="from" ng-model="fromdatemodel" class="events--date" placeholder="<?php p($l->t('from'));?>" />
				<input type="text" name="fromtime" id="fromtime" ng-model="fromtimemodel" class="events--time" ng-disabled="properties.allDay" />
			</div>
			<div class="event-time-interior pull-right">
				<span><?php p($l->t('To')); ?></span>
				<input type="text" name="to" id="to" ng-model="todatemodel" class="events--date" placeholder="<?php p($l->t('to'));?>" />
				<input type="text" name="totime" id="totime" ng-model="totimemodel" class="events--time" ng-disabled="properties.allDay" />
			</div>
			<div class="events--checkbox pull-left">
				<input type="checkbox" name="alldayeventcheckbox"
					   ng-model="properties.allDay"
					   id="alldayeventcheckbox" class="event-checkbox" />
				<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
			</div>
		</fieldset>

		<fieldset class="events--fieldset" ng-disabled="readOnly">
			<textarea ng-model="properties.location.value" type="text" class="events--input"
				   placeholder="<?php p($l->t('Events Location'));?>" name="location"></textarea>
		</fieldset>

		<fieldset class="events--fieldset pull-left" ng-show="!readOnly">
			<button ng-click="delete()" ng-show="!is_new" class="events--button button btn delete">
				<?php p($l->t('Delete')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn">
				<?php p($l->t('Cancel')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-show="!readOnly">
			<button ng-click="close('proceed')" class="events--button button btn">
				<?php p($l->t('More ...')); ?>
			</button>
			<button
				class="events--button button btn primary"
				ng-click="close('save')"
				ng-show="is_new">
				<?php p($l->t('Create')); ?>
			</button>
			<button
				class="evens--button button btn primary"
				ng-click="close('save')"
				ng-show="!is_new">
				<?php p($l->t('Update')); ?>
			</button>
		</fieldset>

		<fieldset class="events--fieldset pull-right" ng-show="readOnly">
			<button ng-click="close('proceed')" class="events--button button btn">
				<?php p($l->t('More ...')); ?>
			</button>
			<button ng-click="cancel()" class="events--button button btn">
				<?php p($l->t('Close')); ?>
			</button>
		</fieldset>
	</form>
</div>