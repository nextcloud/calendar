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
<ul class="settings-fieldset-interior public-left-side" ng-repeat="item in calendarListItems" >
		<li class="settings-fieldset-interior-item">
			<div ng-style="{background : item.calendar.color}" class="public-calendar-name">
				{{ item.calendar.displayname }}
			</div>
		<li class="settings-fieldset-interior-item">
			<div class="davbuttons">
				<div class="btn-group">
					<button class="button first" ng-model="$parent.publicdav" uib-btn-radio="'CalDAV'">CalDAV</button>
					<button class="button last" ng-model="$parent.publicdav" uib-btn-radio="'WebDAV'">WebDAV</button>
				</div>
			</div>
			<label>{{ $parent.publicdavdesc }}</label>
			<input
				class="public-linkinput"
				type="text"
				ng-model="$parent.publicdavurl"
				placeholder="<?php p($l->t('Publish URL')); ?>">
		</li>
        <li>
			<span class="icon-download svg public-ics-download"
					ng-click="download(item)">
					<?php p($l->t('Download')); ?>
			</span>
        </li>
        <li class="settings-fieldset-interior-item">
        	<label><?php p($l->t('Iframe to integrate')); ?></label>
        	<textarea class="integration-code"
            	type="text"
            	ng-value="integration(item)"
            	placeholder="<?php p($l->t('Publish URL')); ?>">
            </textarea>
        </li>
    </ul>
