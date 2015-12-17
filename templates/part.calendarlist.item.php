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
<span class="calendarCheckbox" ng-show="!calendar.loading && !calendar.list.edit" ng-style="{ background : calendar.enabled == true ? '{{ calendar.color }}' : 'transparent' }"></span>
<span class="loading pull-left" ng-show="calendar.loading && !calendar.list.edit">
	<i class="fa fa-spinner fa-spin"></i>
</span>
<a href="#/" ng-click="triggerEnable(calendar)" data-id="{{ calendar.id }}" ng-show="!calendar.list.edit">
	{{ calendar.displayname }}
</a>
<span class="utils hide" ng-if="!calendar.list.locked" ng-show="!calendar.list.edit">
	<span class="action">
		<span
			ng-if="calendar.cruds.share"
			class="calendarlist-icon share icon-share permanent"
			data-item-type="calendar" data-item="{{ calendar.id }}"
			data-possible-permissions="{{ calendar.cruds.code }}"
			title="<?php p($l->t('Share Calendar')) ?>">
		</span>
	</span>
	<span class="action">
		<span
			id="calendarlist-icon download"
			title="Download"
			class="icon-download"
			ng-click="download(calendar)">
		</span>
	</span>
	<span class="action">
		<span id="calendarlist-icon edit"
			  data-id="{{ calendar.uri }}"
			  title="Edit"
			  class="icon-rename"
			  ng-click="prepareUpdate(calendar)">
		</span>
	</span>
	<span class="action">
		<span href="#"
			  id="calendarlist-icon delete"
			  data-id="{{ calendar.uri }}"
			  title="Delete"
			  class="icon-delete"
			  ng-click="remove(calendar)">
		</span>
	</span>
</span>
<fieldset ng-show="calendar.list.edit" class="editfieldset">
	<input class="app-navigation-input" type="text" ng-model="calendar.displayname" data-id="{{ calendar.id }}" />
	<colorpicker class="colorpicker" selected="calendar.color"></colorpicker>
	<div class="buttongroups">
		<button ng-click="performUpdate(calendar)" id="updateCalendar" class="primary icon-checkmark-white accept-button"></button>
		<button id="chooseCalendar-close" class="btn close-button icon-close" ng-click="cancelUpdate(calendar)">
		</button>
	</div>
</fieldset>
