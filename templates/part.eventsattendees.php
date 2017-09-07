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
<div class="advanced--fieldset" ng-hide="emailAddress === ''">
	<input type="text" class="advanced--input attendeename" ng-model="nameofattendee"
		placeholder="<?php p($l->t('Email address of attendee'))?>" name="nameofattendee" autocomplete="off"
		uib-typeahead="contact as contact.displayname for contact in search($viewValue)" typeahead-show-hint="true" typeahead-min-length="3"
		   typeahead-on-select="selectFromTypeahead($item)" />
	<button id="addmoreattendees" ng-click="add(nameofattendee)" class="btn event-button button" type="button">
		<?php p($l->t('Add')); ?>
	</button>
</div>
<div class="advanced--fieldset" ng-show="emailAddress === ''">
	<span><?php p($l->t('Please add your email address in the personal settings in order to add attendees.')); ?></span>
</div>

<div class="advanced--fieldset">
	<ul class="advanced--fieldset-attendeelist">
		<li class="pull-left" ng-class="{ active: attendeeoptions }" ng-repeat="attendee in properties.attendee | attendeeNotOrganizerFilter: $scope.emailAddress">
			<div class="advanced--toggler" ng-model="attendeeoptions" ng-click="attendeeoptions=!attendeeoptions">
				<span class="bold pull-left">{{ attendee | attendeeFilter }}</span>
				<button class="event-button event-delete-button icon-close pull-right" ng-click="remove(attendee)" type="button">
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
					<label class="label" for="attendeeno_{{$id}}"><?php p($l->t('Does not attend')); ?></label>
				</div>
				<div class="display-inline-block full-width">
					<label class="label" for="attendeelang_{{$id}"><?php p($l->t('Language')); ?>:</label>
					<select class="event-select pull-left"
						ng-model="attendee.parameters.lang"
						ng-selected="attendee.parameters.lang"
						id="attendeelang_{{$id}}">

						<option value="<?php p($_['activelanguage']['code']); ?>">
							<?php p($_['activelanguage']['name']); ?>
						</option>
						<?php foreach($_['commonlanguages'] as $language): ?>
						<option value="<?php p($language['code']); ?>">
							<?php p($language['name']); ?>
						</option>
						<?php endforeach; ?>
						<optgroup label="––––––––––"></optgroup>
						<?php foreach($_['languages'] as $language): ?>
						<option value="<?php p($language['code']); ?>">
							<?php p($language['name']); ?>
						</option>
						<?php endforeach; ?>
					</select>
				</div>
			</div>
		</li>
	</ul>
</div>
