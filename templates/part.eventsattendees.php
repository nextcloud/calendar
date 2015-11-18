<?php
/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
		<button id="addmoreattendees" ng-click="addmoreattendees()" class="btn event-button button">
			<?php p($l->t('Add')); ?>
		</button>
	</div>

	<div class="event-fieldset-interior">
		<ul id="listofattendees">
			<li class="active pull-left">
				<span class="bold">Raghu</span>
				<div class="attendeeoptions">
					<label class="label"><?php p($l->t('Type')); ?></label>
					<select class="event-select pull-left"
						ng-model="selectedstat"
						ng-selected="selectedstat"
						ng-change="changestat(selectedstat,attendee.value)"
						ng-options="cutstat.displayname for cutstat in cutstats">
					</select>
					<div class="attendeeopt pull-right">
						<input 
							type="checkbox" class="attendeecheckbox event-checkbox"
							value="<?php p($l->t('Optional')); ?>" 
							ng-checked="attendornot=='optional'" ng-click="attendornot='optional'" />
						<label class="label optionallabel"><?php p($l->t('Optional')); ?></label>

						<input type="checkbox" class="attendeecheckbox event-checkbox" 
							value="<?php p($l->t('Does not attend')); ?>" 
							ng-checked="attendornot=='no'" ng-click="attendornot='no'" />
						<label class="label"><?php p($l->t('Does not attend'))?></label>
					</div>
				</div>
			</li>
			<li class="pull-left">
				<span class="bold">Georg</span>
			</li>
		</ul>
	</div>

</fieldset>
