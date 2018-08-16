<?php
/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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


<fieldset class="event-fieldset">
  <input
    class="event-input h2"
    ng-model="properties.summary.value"
    placeholder="<?php p($l->t('Title of the Event'));?>"
    name="title" type="text"
    autofocus="autofocus"
  />
</fieldset>

<fieldset class="event-calendarselector">
  <select
    ng-model="calendar"
    ng-init="calendar = oldCalendar || calendars[0]"
    ng-options="c as c.displayname for c in calendars | orderBy:['order'] | calendarSelectorFilter: oldCalendar"></select>
</fieldset>

<fieldset class="event-time event-fieldset">
  <div class="event-time-interior pull-left">
    <input type="text" name="from" id="from" ng-model="fromdatemodel" placeholder="<?php p($l->t('from'));?>" />
    <input type="text" name="fromtime" id="fromtime" ng-model="fromtimemodel" ng-disabled="properties.allDay" />
  </div>
  <div class="event-time-interior pull-right">
    <input type="text" name="to" id="to" ng-model="todatemodel" placeholder="<?php p($l->t('to'));?>" />
    <input type="text" name="totime" id="totime" ng-model="totimemodel" ng-disabled="properties.allDay" />
  </div>
  <div class="event-time-interior event-time-interior-allday pull-left">
    <input type="checkbox" name="alldayeventcheckbox"
      ng-model="properties.allDay"
      id="alldayeventcheckbox" class="event-checkbox" />
    <label for="alldayeventcheckbox"><?php p($l->t('All day Event'))?></label>
  </div>
</fieldset>

<fieldset class="event-fieldset">
  <input ng-model="properties.location.value" type="text" class="event-input"
    placeholder="<?php p($l->t('Location'));?>" name="location"
    uib-typeahead="location for location in getLocation($viewValue)"
    autocomplete="off" />
</fieldset>
