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

<fieldset class="event-fieldset event-fieldset-attendee">
	<div class="event-fieldset-interior">
		<label class="label"><?php p($l->t('Name')); ?></label>
		<input type="text" class="pull-left" ng-model="nameofattendee"
			placeholder="<?php p($l->t('Name'))?>" name="nameofattendee" autocomplete="off" />
		<button id="addmoreattendees" ng-click="addmoreattendees(nameofattendee)" class="btn event-button button">
			<?php p($l->t('Add')); ?>
		</button>
	</div>

	<div class="event-fieldset-interior">
		<ul id="listofattendees">
			<li class="pull-left" ng-class="{ active: attendeeoptions }" ng-repeat="attendee in properties.attendee">
				<div ng-model="attendeeoptions" ng-click="attendeeoptions=!attendeeoptions">
					<span class="bold">{{ attendee.value }}</span>
					<button class="event-button event-delete-button pull-right icon-close" ng-click="deleteAttendee(attendee.value)">
					</button>
				</div>
				<div class="attendeeoptions" ng-show="attendeeoptions">
					<label class="label" for="attendeecutype_{{$id}}"><?php p($l->t('Type')); ?>:</label>
					<select class="event-select pull-left"
						ng-model="attendee.parameters.cutype"
						ng-selected="attendee.parameters.cutype"
						ng-options="cutstat.val as cutstat.displayname for cutstat in cutstats"
						id="attendeecutype_{{$id}}">
					</select>
					<div class="attendeeopt pull-right">
						<input
							type="checkbox" class="attendeecheckbox event-checkbox"
							ng-checked="attendee.parameters.role == 'OPT-PARTICIPANT'"
							ng-click="attendee.parameters.role == 'OPT-PARTICIPANT' ? attendee.parameters.role = 'REQ-PARTICIPANT' : attendee.parameters.role = 'OPT-PARTICIPANT'"
							id="attendeeopt_{{$id}}"/>
						<label class="label optionallabel" for="attendeeopt_{{$id}}"><?php p($l->t('Optional')); ?></label>

						<input type="checkbox" class="attendeecheckbox event-checkbox"
							ng-checked="attendee.parameters.role == 'NON-PARTICIPANT'"
							ng-click="attendee.parameters.role == 'NON-PARTICIPANT' ? attendee.parameters.role = 'REQ-PARTICIPANT' : attendee.parameters.role = 'NON-PARTICIPANT'"
							id="attendeeno_{{$id}}"/>
						<label class="label" for="attendeeno_{{$id}}"><?php p($l->t('Does not attend'))?></label>
					</div>
				</div>
			</li>
		</ul>
	</div>

</fieldset>
