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

<div id="events"
	title="<?php p($l->t("Edit event")); ?>"
	open="{{dialogOpen}}"
	ok-button="OK"
	ok-callback="handleOk"
	cancel-button="Cancel"
	cancel-callback="handleCancel">
	<form id-"event_form">
		<ul>
			<li>
				<a href="#tabs-1"><?php p($l->t('Eventinfo')); ?></a>
			</li>
			<li>
				<a href="#tabs-2"><?php p($l->t('Repeating')); ?></a>
				</li>
			</li>
		</ul>

		<div id="#tabs-1" class="events-container">
			<?php print_unescaped($this->inc('part.eventsrepeat')); ?>
		</div>

		<div class="events-container">
			<fieldset class="event-fieldset pull-left">
				<button ng-click="delete()" class="event-button button btn">
					<?php p($l->t('Delete Event')); ?>
				</button>
			</fieldset>


			<fieldset class="event-fieldset pull-right">
				<button ng-click="update()" class="event-button button btn primary">
					<?php p($l->t('Save Event')); ?>
				</button>
			</fieldset>
		</div>
	</form>
</div>
