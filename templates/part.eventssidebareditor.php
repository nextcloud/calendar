<div id="app-sidebar" class="advanced">
	<div class="advanced--container">
		<fieldset class="advanced--fieldset">
			<input
					class="advanced--input h2"
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

		<fieldset class="advanced--fieldset">
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
			<div class="advanced--checkbox pull-left">
				<input type="checkbox" name="alldayeventcheckbox"
					   ng-model="properties.allDay"
					   id="alldayeventcheckbox" class="event-checkbox" />
				<label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
			</div>
		</fieldset>

		<ul class="tabHeaders">
			<li class="tabHeader" ng-repeat="tab in tabs"
				ng-click="tabopener(tab.value)" ng-class="{selected: tab.value == selected}">
				<a href="#">{{tab.title}}</a>
			</li>
		</ul>

		<fieldset class="advanced--fieldset">
			<div ng-include="currentTab"></div>
		</fieldset>

		<fieldset ng-show="eventsattendeeview" class="advanced--fieldset">
			<?php print_unescaped($this->inc('part.eventsattendees')); ?>
		</fieldset>

		<fieldset ng-show="eventsalarmview" class="advanced--fieldset">
			<?php print_unescaped($this->inc('part.eventsalarms')); ?>
		</fieldset>
	</div>
</div>