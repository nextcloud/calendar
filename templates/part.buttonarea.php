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
<?php if(!$_['isPublic']): ?>
<div class="togglebuttons">
	<button class="button first" ng-value="agendaDay" ng-model="selectedView" uib-btn-radio="'agendaDay'"><?php p($l->t('Day')); ?></button>
	<button class="button middle" ng-value="agendaWeek" ng-model="selectedView" uib-btn-radio="'agendaWeek'"><?php p($l->t('Week')); ?></button>
	<button class="button last" ng-value="month" ng-model="selectedView" uib-btn-radio="'month'"><?php p($l->t('Month')); ?></button>
</div>
<div class="togglebuttons">
	<button class="button today" ng-click="today()"><?php p($l->t('Today')); ?></button>
</div>
<div ng-controller = "ModalDemoCtrl as $ctrl" class="togglebuttons">
	 <button class="button today" ng-click="$ctrl.open()"><?php p($l->t('Time Reporting')); ?></button>
</div>

 <!-- ng-keydown="keypress($event)" -->
<script type="text/ng-template" id="myModalContent.html">

    <div>
	    <div class="modal-header">
	        <h3 class="modal-title" id="modal-title">I'm a modal placeholder!</h3>
	    </div>
	    <form class="events">
			<fieldset class="events--fieldset" ng-disabled="readOnly">
				<span><?php p($l->t('Select all layers')); ?></span>
				<select
						ng-model = "$ctrl.data.selectedLayers"
						ng-options = "layer.displayname for layer in $ctrl.layers"
						tabindex="101"
						multiple></select>

			</fieldset>
			<!-- ng-model="properties.dtstart.value" -->
			<fieldset class="event-time events--fieldset" ng-disabled="readOnly">
				<div class="event-time-interior pull-left">
					<span><?php p($l->t('Starts')); ?></span>
					<ocdatetimepicker ng-model = "$ctrl.data.start" disabletime="properties.allDay" datetabindex="103" timetabindex="104" readonly="readOnly"></ocdatetimepicker>
					<span ng-show="edittimezone">{{ properties.dtstart.parameters.zone | timezoneFilter }}</span>
				</div>
				<div class="event-time-interior pull-right">
					<span><?php p($l->t('Ends')); ?></span>
					<ocdatetimepicker ng-model = "$ctrl.data.end" disabletime="properties.allDay" datetabindex="105" timetabindex="106" readonly="readOnly"></ocdatetimepicker>
					<span ng-show="edittimezone">{{ properties.dtend.parameters.zone | timezoneFilter }}</span>
				</div>
				<div class="clear-both"></div>

			</fieldset>

			<fieldset class="events--fieldset pull-left" ng-if="!readOnly">
				<div>
					<button ng-click="$ctrl.cancel()" class="events--button button btn" type="button" tabindex="111">
						<?php p($l->t('Cancel')); ?>
					</button>
				</div>
			</fieldset>
			<fieldset class="events--fieldset pull-right" ng-if="!readOnly">
				<div>
					<button
						class="events--button button btn primary"
						ng-click="$ctrl.ok()"
						type="button"
						tabindex="121">
						<?php p($l->t('Create')); ?>
					</button>
				</div>
			</fieldset>
		</form>
		<div class="modal-footer">
	        <h2 align = "center" class="modal-title" id="modal-title">Select all calendar layers and time window to summarize report.</h3>
	    </div>
	</div>
</script>
<script type="text/ng-template" id="OTOModalContent.html">

    <div>
	    <div class="modal-header">
	        <h3 class="modal-title" id="modal-title">I'm a modal placeholder!</h3>
	    </div>
	    <form class="events">
			<fieldset class="events--fieldset" ng-disabled="readOnly">
				<span><?php p($l->t('Destination Layer')); ?></span>
				<select
						ng-model = "$ctrl.data.destLayer"
						ng-options = "layer.displayname for layer in $ctrl.layers"
						tabindex="101"
						></select>

			</fieldset>



			<fieldset class="events--fieldset pull-left" ng-if="!readOnly">
				<div>
					<button ng-click="$ctrl.cancel()" class="events--button button btn" type="button" tabindex="111">
						<?php p($l->t('Cancel')); ?>
					</button>
				</div>
			</fieldset>
			<fieldset class="events--fieldset pull-right" ng-if="!readOnly">
				<div>
					<button
						class="events--button button btn primary"
						ng-click="$ctrl.ok()"
						type="button"
						tabindex="121">
						<?php p($l->t('Create')); ?>
					</button>
				</div>
			</fieldset>
		</form>
		<div class="modal-footer">
	        <h2 align = "center" class="modal-title" id="modal-title">Select a destination layer for meeting confirmation.</h3>
	    </div>
	</div>
</script>
<?php endif; ?>
