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
<div class="advanced--fieldset" ng-hide="didUserSetupEmail()">
	<span><?php p($l->t('Please add your email address in the personal settings in order to add attendees.')); ?></span>
</div>

<div class="advanced--fieldset emptycontent noattendees" ng-show="didUserSetupEmail() && isAttendeeListEmpty()">
	<div class="icon-contacts-dark"></div>
	<h3><?php p($l->t('There are no attendees.')); ?></h3>
</div>

<div class="advanced--fieldset">
	<ul class="advanced--fieldset-attendeelist">
		<li class="pull-left" ng-class="{ active: attendeeoptions }" ng-repeat="attendee in properties.attendee | attendeeNotOrganizerFilter: $scope.emailAddress">
			<div class="avatardiv" data-seed="{{ attendee.value }}" data-text="{{ attendee | attendeeFilter }}" data-size="32" placeholder></div>
			<div class="advanced--toggler" ng-model="attendeeoptions"">
				<span class="bold pull-left">{{ attendee | attendeeFilter }}</span>
			</div>
			<span class="attendeeOptionsGroup">
				<a href="#">
					<span class="icon-more" on-toggle-show="#attendee-more-actions-{{ $id }}"></span>
				</a>
				<div id="attendee-more-actions-{{ $id }}"
					 class="popovermenu bubble hidden menu" ng-click="$event.stopPropagation();">
					<ul>
						<li>
							<span class="menuitem">
								<select class="event-select pull-left"
										ng-model="attendee.parameters.cutype"
										ng-selected="attendee.parameters.cutype"
										ng-options="cutstat.val as cutstat.displayname for cutstat in cutstats"
										id="attendeecutype_{{$id}}"></select>
							</span>
						</li>
						<li>
							<span class="menuitem">
								<input type="checkbox" name="attendeecheckbox" class="checkbox"
									   ng-checked="attendee.parameters.role == 'OPT-PARTICIPANT'"
									   ng-click="attendee.parameters.role == 'OPT-PARTICIPANT' ? attendee.parameters.role = 'REQ-PARTICIPANT' : attendee.parameters.role = 'OPT-PARTICIPANT'"
									   id="attendeeopt_{{$id}}"/>
								<label class="optionallabel" for="attendeeopt_{{$id}}"><?php p($l->t('Optional'));?></label>
							</span>
						</li>
						<li>
							<span class="menuitem">
								<input type="checkbox" name="attendeecheckbox" class="checkbox"
									   ng-checked="attendee.parameters.role == 'NON-PARTICIPANT'"
									   ng-click="attendee.parameters.role == 'NON-PARTICIPANT' ? attendee.parameters.role = 'REQ-PARTICIPANT' : attendee.parameters.role = 'NON-PARTICIPANT'"
									   id="attendeeno_{{$id}}"/>
								<label class="optionallabel" for="attendeeno_{{$id}}"><?php p($l->t('Not attending'));?></label>
							</span>
						</li>
						<li>
							<span class="menuitem" ng-click="remove(attendee)">
								<span class="icon-delete svg"></span>
								<span><?php p($l->t('Remove')); ?></span>
							</span>
						</li>
					</ul>
				</div>
			</span>
		</li>
	</ul>
</div>

<div class="advanced--fieldset new-attendee-form" ng-show="didUserSetupEmail()">
	<input type="text" class="advanced--input attendeename" ng-model="nameofattendee"
		   ng-keyup="$event.keyCode == 13 && add(nameofattendee)"
		   placeholder="<?php p($l->t('Email address of attendee'))?>"
		   name="nameofattendee" autocomplete="off"
		   uib-typeahead="contact as contact.displayname for contact in search($viewValue)"
		   typeahead-show-hint="true" typeahead-min-length="3"
		   typeahead-on-select="selectFromTypeahead($item)"
		   typeahead-template-url="customAttendeeSearchTemplate.html"/>
	<button id="addmoreattendees" ng-click="add(nameofattendee)" class="btn event-button button icon-add" type="button"></button>
</div>
