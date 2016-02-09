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

<div id="importdialog" class="dialog" title="<?php p($l->t("Import Calendars")); ?>">
	<table class="table">
		<tbody>
		<tr ng-repeat="file in files" ng-show="!file.done">
			<td class="name">
				<span>{{ file.name }}</span>
			</td>
			<td class="calendartype">
					<span
						ng-show="file.state === 0">
						<?php p($l->t('Analyzing calendar')); ?>
					</span>
				<div
					ng-show="file.state === 1">
						<span
							class="svg icon-error"
							ng-show="file.incompatibleObjectsWarning"
							title="<?php p($l->t('The file contains objects incompatible with the selected calendar')); ?>">
							&nbsp;&nbsp;
						</span>
					<select
						class="settings-select"
						ng-change="changeCalendar(file)"
						ng-model="file.calendar"
						ng-show="file.state === 1">
						<option
							ng-repeat="calendar in calendars | calendarFilter | orderBy:['order']"
							value="{{ calendar.url }}">
							{{ calendar.displayname }}
						</option>
						<option
							value="new">
							<?php p($l->t('New calendar')); ?>
						</option>
					</select>
				</div>
					<span
						ng-show="file.state === 2">
						<?php p($l->t('Import scheduled')); ?>
					</span>
				<uib-progressbar
					ng-show="file.state === 3"
					animate="false"
					value="file.progress"
					max="file.progressToReach">
					&nbsp;
				</uib-progressbar>
				<div
					ng-show="file.state === 4">
						<span>
							{{ file | importErrorFilter }}
						</span>
				</div>
			</td>
			<td class="buttongroup">
				<div class="pull-right" ng-show="file.state === 1">
					<button
						class="primary btn icon-checkmark-white"
						ng-click="import(file)">
					</button>
					<button
						class="btn icon-close"
						ng-click="file.done = true">
					</button>
				</div>
			</td>
		</tr>
		</tbody>
	</table>
</div>
