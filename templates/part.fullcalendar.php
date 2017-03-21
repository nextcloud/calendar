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
<div
	class="calendar"
	data-appVersion="<?php p($_['appVersion']); ?>"
	data-defaultColor="<?php p($_['defaultColor']); ?>"
	data-initialView="<?php p($_['initialView']); ?>"
	data-emailAddress="<?php p($_['emailAddress']); ?>"
	data-firstRun="<?php p($_['firstRun']); ?>"
	data-skipPopover="<?php p($_['skipPopover']); ?>"
	data-weekNumbers="<?php p($_['weekNumbers']); ?>"
	data-webCalWorkaround="<?php p($_['webCalWorkaround']); ?>"
	data-isPublic="<?php p($_['isPublic'] ? '1' : '0'); ?>"
	data-publicSharingToken="<?php p($_['token']); ?>"
	fc
	id="fullcalendar">
</div>
