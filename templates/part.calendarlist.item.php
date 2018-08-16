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
<span class="calendarCheckbox app-navigation-entry-bullet"
	  ng-click="triggerEnable(item)"
	  ng-if="item.displayColorIndicator() && !item.calendar.hasWarnings()"
	  ng-style="{ 'background-color' : item.calendar.enabled == true ? item.calendar.color : 'transparent' }">
</span>
<a class="action permanent"
   ng-class="{'icon-error': item.calendar.hasWarnings()}"
   href="#"
   ng-click="triggerEnable(item)"
   title="{{ item.calendar.hasWarnings() ? warningLabel : item.calendar.displayname }}">
	{{ item.calendar.displayname }}
</span>
</a>
<div class="app-navigation-entry-utils"
	 ng-show="item.displayActions()">
	<ul ng-class="{'withitems': item.calendar.isShared() || item.calendar.isPublished() }">
		<li class="app-navigation-entry-utils-menu-button calendarlist-icon share permanent"
			ng-click="item.toggleEditingShares()"
			ng-if="item.showSharingIcon()"
			role="button">
			<button ng-class="{
				'icon-shared shared-style': item.calendar.isShared() && !item.calendar.isPublished(),
				'icon-public': item.calendar.isPublished(),
				'icon-shared': !item.calendar.isShared() && !item.calendar.isPublished()}"
				title="{{item.calendar.isShared() && item.calendar.isShareable() || item.calendar.isPublished() ? sharedLabel : shareLabel}}">
			</button>
		</li>
		<li class="app-navigation-entry-utils-menu-button"
			href="#"
			title="<?php p($l->t('More')); ?>"
			role="button"><button on-toggle-show="#more-actions-{{ $id }}"></button></li>
	</ul>
</div>

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
		<li ng-show="item.isWebCal()">
			<button	ng-click="item.showWebCalUrl()">
				<span class="icon-link svg"></span>
				<span><?php p($l->t('iCal link')); ?></span>
			</button>
		</li>
		<li>
			<button	ng-click="download(item)">
				<span class="icon-download svg"></span>
				<span><?php p($l->t('Download')); ?></span>
			</button>
		</li>
		<li confirmation="remove(item)"></li>
	</ul>
</div>
<div class="app-navigation-entry-edit"
	 ng-if="item.isEditing()">
	<form ng-submit="performUpdate(item)">
		<input type="text" ng-model="item.displayname">
		<input type="button" value="" class="btn close-button icon-close" ng-click="item.cancelEditor()">
		<input type="submit" value="" class="icon-checkmark accept-button">
	</form>
	<colorpicker class="colorpicker"
				 selected="item.color">
	</colorpicker>
</div>
<div class="app-navigation-entry-edit"
	 ng-if="item.displayCalDAVUrl()">
	<form ng-submit="performUpdate(item)">
		<input ng-value="item.calendar.caldav"
			   readonly
			   type="text"/>
		<input type="button" value="" class="n icon-close button-next-to-input" ng-click="item.hideCalDAVUrl()">
	</form>
</div>
<div class="app-navigation-entry-edit"
	 ng-if="item.displayWebCalUrl()">
	<form ng-submit="performUpdate(item)">
		<input ng-value="item.calendar.storedUrl"
			   readonly
			   type="text"/>
		<input type="button" value="" class="n icon-close button-next-to-input" ng-click="item.hideWebCalUrl()">
	</form>
</div>

<div class="calendarShares"
	 ng-show="item.isEditingShares()">
	<i class="glyphicon glyphicon-refresh refresh-shares"
	   ng-show="loadingSharees">
	</i>
	<input class="shareeInput"
		   ng-if="isSharingAPI"
		   ng-model="item.selectedSharee"
		   placeholder="<?php p($l->t('Share with users or groups')); ?>"
		   type="text"
		   typeahead-on-select="onSelectSharee($item, $model, $label, item)"
		   typeahead-loading="loadingSharees"
		   typeahead-template-url="customShareMatchTemplate.html"
		   uib-typeahead="sharee.display for sharee in findSharee($viewValue, item.calendar)">
	<ul class="calendar-share-list">
		<li class="calendar-share-item"
			ng-repeat="userShare in item.calendar.shares.users"
			title="{{ userShare.displayname }}">
			{{ userShare.displayname }} -
			<span>
				<input id="checkbox_sharedWithUser_{{ $parent.$index }}_{{ $id }}"
					   name="editable"
					   class="checkbox"
					   ng-change="updateExistingUserShare(item.calendar, userShare.id, userShare.displayname, userShare.writable)"
					   ng-model="userShare.writable"
					   type="checkbox"
					   value="edit">
				<label for="checkbox_sharedWithUser_{{ $parent.$index }}_{{ $id }}">
					<?php p($l->t('can edit')); ?>
				</label>
			</span>
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
			ng-repeat="groupShare in item.calendar.shares.groups"
			title="{{ groupShare.displayname }} (<?php p($l->t('group')); ?>)">
			{{ groupShare.displayname }} (<?php p($l->t('group')); ?>) -
			<span>
				<input id="checkbox_sharedWithGroup_{{ $parent.$index }}_{{ $id }}"
					   name="editable"
					   class="checkbox"
					   ng-change="updateExistingGroupShare(item.calendar, groupShare.id, groupShare.displayname, groupShare.writable)"
					   ng-model="groupShare.writable"
					   type="checkbox"
					   value="edit">
				<label for="checkbox_sharedWithGroup_{{ $parent.$index }}_{{ $id }}">
					<?php p($l->t('can edit')); ?>
				</label>
			</span>
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
	<div class="publishing" ng-if="item.calendar.isPublishable() && canSharePublicLink">
		<input type="checkbox" name="publish"
			   class="checkbox"
			   id="checkbox_publish_calendar_{{ $index }}"
			   ng-model="item.calendar.published" value="edit"
			   ng-change="togglePublish(item)">
		<label for="checkbox_publish_calendar_{{ $index }}">
			<?php p($l->t('Share link')); ?>
		</label>
		<div ng-show="item.calendar.published">
			<span><?php p($l->t('Public access')); ?></span>
			<span class="icon-public pull-right svg publication-tools"
				  target="_blank"
				  ng-href="item.publicSharingURL"
				  ng-click="goPublic(item)"></span>
			<span class="icon-mail pull-right svg publication-tools"
				  target="_blank"
				  ng-click="item.toggleSendingMail()"></span>
		</div>
		<form ng-submit="sendMail(item)" ng-show="item.isSendingMail() && item.calendar.published">
			<input class="mailerInput"
				   ng-model="item.email"
				   placeholder="<?php p($l->t('Email link to person')); ?>"
				   type="text">
			<button type="submit"><?php p($l->t('Send')); ?></button>
		</form>
	</div>
</div>
