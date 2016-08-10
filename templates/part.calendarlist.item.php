<?php
/**
 * Calendar App
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
<span class="calendarCheckbox"
	  ng-click="triggerEnable(item)"
	  ng-show="item.displayColorIndicator()"
	  ng-style="{ background : item.calendar.enabled == true ? item.calendar.color : 'transparent' }">
</span>
<span class="icon-loading-small pull-left"
	  ng-show="item.displaySpinner()">
</span>
<a class="action permanent"
   ng-class="{'calendar-list-cut-name': item.calendar.isShared()}"
   href="#"
   ng-click="triggerEnable(item)"
   ng-show="!item.isEditing()"
   title="{{ item.calendar.displayname }}">
	<span class="icon icon-error"
		  ng-if="item.calendar.hasWarnings()"
		  title="<?php p($l->t('Some events in this calendar are broken. Please check the JS console for more info.')); ?>">
		&nbsp;&nbsp;&nbsp;&nbsp;
	</span>
	{{ item.calendar.displayname }}
</a>
<span class="utils"
	  ng-show="item.displayActions()">
	<span class="action"
		  ng-class="{'withitems': item.calendar.isShared()}">
		<span
			class="calendarlist-icon share permanent"
			ng-class="{'icon-shared': item.calendar.isShared(), 'icon-share': !item.calendar.isShared()}"
			ng-click="item.toggleEditingShares()"
			ng-if="item.calendar.isShareable()"
			title="<?php p($l->t('Share Calendar')) ?>">
		</span>
		<!-- Add a label if the calendar has shares -->
		<span
			class="calendarlist-icon shared"
			ng-if="item.calendar.isShared() && item.calendar.isShareable()"
			ng-click="item.toggleEditingShares()">
				<?php p($l->t('Shared'))?>
		</span>
	</span>
	<span class="action">
		<span class="icon-more"
			  href="#"
			  on-toggle-show="#more-actions-{{ $id }}"
			  title="<?php p($l->t('More')); ?>">
		</span>
	</span>
</span>

<div id="more-actions-{{ $id }}"
	 class="app-navigation-entry-menu hidden">
	<ul>
		<li ng-show="item.calendar.arePropertiesWritable()">
			<button	ng-click="item.openEditor()">
				<span class="icon-rename svg"></span>
				<span><?php p($l->t('Edit')); ?></span>
			</button>
		</li>
		<li ng-show="item.calendar.eventsAccessibleViaCalDAV()">
			<button	ng-click="item.showCalDAVUrl()">
				<span class="icon-public svg"></span>
				<span><?php p($l->t('Link')); ?></span>
			</button>
		</li>
		<li>
			<button	ng-click="download(item)">
				<span class="icon-download svg"></span>
				<span><?php p($l->t('Download')); ?></span>
			</button>
		</li>
		<li>
			<button	ng-click="remove(item)">
				<span class="icon-delete svg"></span>
				<span><?php p($l->t('Delete')); ?></span>
			</button>
		</li>
	</ul>
</div>

<fieldset class="editfieldset"
		  ng-show="item.isEditing()">
	<form ng-submit="performUpdate(item)">
		<input class="app-navigation-input"
			   ng-model="item.displayname"
			   type="text"/>
		<colorpicker class="colorpicker"
					 selected="item.color">
		</colorpicker>
		<div class="buttongroups">
			<button class="primary icon-checkmark-white accept-button">
			</button>
			<button type="button" class="btn close-button icon-close"
					ng-click="item.cancelEditor()">
			</button>
		</div>
	</form>
</fieldset>
<fieldset class="editfieldset"
		  ng-show="item.displayCalDAVUrl()">
	<input class="input-with-button-on-right-side"
		   ng-value="item.calendar.caldav"
		   readonly
		   type="text"/>
	<button class="btn icon-close button-next-to-input"
			ng-click="item.hideCalDAVUrl()">
	</button>
</fieldset>
<div class="calendarShares"
	 ng-show="item.isEditingShares()">
	<i class="glyphicon glyphicon-refresh refresh-shares"
	   ng-show="loadingSharees">
	</i>
	<input class="shareeInput"
		   ng-model="item.selectedSharee"
		   placeholder="<?php p($l->t('Share with users or groups')); ?>"
		   type="text"
		   typeahead-on-select="onSelectSharee($item, $model, $label, item.calendar)"
		   typeahead-loading="loadingSharees"
		   uib-typeahead="sharee.display for sharee in findSharee($viewValue, item.calendar)">
	<ul class="calendar-share-list">
		<li class="calendar-share-item"
			ng-repeat="userShare in item.calendar.shares.users">
			{{ userShare.displayname }} -
			<input id="checkbox_sharedWithUser_{{ $parent.$index }}_{{ $id }}"
				   name="editable"
				   ng-change="updateExistingUserShare(item.calendar, userShare.id, userShare.writable)"
				   ng-model="userShare.writable"
				   type="checkbox"
				   value="edit">
			<label for="checkbox_sharedWithUser_{{ $parent.$index }}_{{ $id }}">
				<?php p($l->t('can edit')); ?>
			</label>
			<span class="utils hide">
				<span class="action">
					<span class="icon-delete"
						  href="#"
						  id="calendarlist-icon delete"
						  ng-click="unshareFromUser(item.calendar, userShare.id)"
						  title="<?php p($l->t('Delete')); ?>">
					</span>
				</span>
			</span>
		</li>
		<li class="calendar-share-item"
			ng-repeat="groupShare in item.calendar.shares.groups">
			{{ groupShare.displayname }} (<?php p($l->t('group')); ?>) -
			<input id="checkbox_sharedWithGroup_{{ $parent.$index }}_{{ $id }}"
				   name="editable"
				   ng-change="updateExistingGroupShare(item.calendar, groupShare.id, groupShare.writable)"
				   ng-model="groupShare.writable"
				   type="checkbox"
				   value="edit">
			<label for="checkbox_sharedWithGroup_{{ $parent.$index }}_{{ $id }}">
				<?php p($l->t('can edit')); ?>
			</label>
			<span class="utils hide">
				<span class="action">
					<span class="icon-delete"
						  href="#"
						  id="calendarlist-icon delete"
						  ng-click="unshareFromGroup(item.calendar, groupShare.id)"
						  title="<?php p($l->t('Delete')); ?>">
					</span>
				</span>
			</span>
		</li>
	</ul>
</div>
