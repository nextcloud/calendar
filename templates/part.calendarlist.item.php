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
<span class="calendarCheckbox" ng-show="!calendar.list.loading && !calendar.list.edit" ng-style="{ background : calendar.enabled == true ? calendar.color : 'transparent' }"></span>
<span class="loading pull-left" ng-show="calendar.list.loading && !calendar.list.edit">
	<i class="fa fa-spinner fa-spin"></i>
</span>
<a href="#/" ng-click="triggerEnable(calendar)" data-id="{{ calendar.id }}" ng-show="!calendar.list.edit">
	{{ calendar.displayname }}
</a>
<span class="utils hide" ng-if="!calendar.list.locked" ng-show="!calendar.list.edit">
	<span class="action">
		<span
			ng-if="calendar.shareable"
			class="calendarlist-icon share icon-share permanent"
			data-item-type="calendar" data-item="{{ calendar.id }}"
			title="<?php p($l->t('Share Calendar')) ?>"
			ng-click="toggleSharesEditor(calendar)">
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
		<button id="chooseCalendar-close" class="btn close-button icon-close" ng-click="cancelUpdate(calendar)"></button>
	</div>
</fieldset>
<div ng-show="calendar.list.editingShares" class="calendarShares">
	<i ng-show="loadingSharees" class="glyphicon glyphicon-refresh"></i>
	<input
		type="text"
		class="shareeInput"
		uib-typeahead="sharee.display for sharee in findSharee($viewValue, calendar)"
		typeahead-on-select="onSelectSharee($item, $model, $label, calendar)"
		typeahead-loading="loadingSharees"
		ng-model="calendar.selectedSharee"
		placeholder="Share with users or groups">
	<ul class="calendar-share-list">
		<li ng-repeat="userShare in calendar.sharedWith.users" class="calendar-share-item">
			{{ userShare.displayname }} -
			<input type="checkbox" name="editable"
				   id="checkbox_sharedWithUser_{{calendar.tmpId}}_{{$id}}"
				   ng-model="userShare.writable" value="edit"
				   ng-change="updateExistingUserShare(calendar, userShare.id, userShare.writable)">
			<label for="checkbox_sharedWithUser_{{calendar.tmpId}}_{{$id}}"> can edit</label>
			<span class="utils hide">
				<span class="action">
					<span href="#"
						  id="calendarlist-icon delete"
						  data-id="{{ calendar.uri }}"
						  title="Delete"
						  class="icon-delete"
						  ng-click="unshareFromUser(calendar, userShare.id)">
					</span>
				</span>
			</span>
		</li>
		<li ng-repeat="groupShare in calendar.sharedWith.groups" class="calendar-share-item">
			{{ groupShare.displayname }} (<?php p($l->t('group')); ?>) -
			<input type="checkbox" name="editable"
				   id="checkbox_sharedWithGroup_{{calendar.tmpId}}_{{$id}}"
				   ng-model="groupShare.writable" value="edit"
				   ng-change="updateExistingGroupShare(calendar, groupShare.id, groupShare.writable)">
			<label for="checkbox_sharedWithGroup_{{calendar.tmpId}}_{{$id}}"> can edit</label>
			<span class="utils hide">
				<span class="action">
					<span href="#"
						  id="calendarlist-icon delete"
						  data-id="{{ calendar.uri }}"
						  title="Delete"
						  class="icon-delete"
						  ng-click="unshareFromGroup(calendar, groupShare.id)">
					</span>
				</span>
			</span>
		</li>
	</ul>
</div>
