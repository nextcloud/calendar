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
<div id="scollable" class="settings-fieldset-interior public-left-side" ng-repeat="item in calendarListItems">
	<div class="avatardiv" data-user="{{ item.calendar.owner }}" data-size="96" avatar></div>
	<h3 class="action permanent displayname" ng-cloak>
		<?php print_unescaped($l->t('%s shared the calendar <strong>%s</strong> with you', ['{{ item.getOwnerName() }}', '{{ item.getPublicDisplayname() }}'])); ?>
	</h3>
	<div class="icon-loading-small"
		  ng-show="item.displaySpinner()" ng-cloak>
	</div>
</div>
<?php if(!$_['isEmbedded']): ?>
<div id="app-settings">
	<div id="app-settings-header">
		<button name="app settings"
			class="settings-button icon-embed"
			data-apps-slide-toggle="#app-settings-content">
			<?php p($l->t('Embed')); ?>
		</button>
	</div>

	<div id="app-settings-content" ng-repeat="item in calendarListItems">
		<fieldset class="settings-fieldset">
			<ul class="settings-fieldset-interior">
				<li class="settings-fieldset-interior-item">
					<label><?php p($l->t('Iframe to integrate')); ?></label>
			    <textarea class="integration-code"
			      type="text"
			      ng-value="integration(item)"
			      placeholder="<?php p($l->t('Publish URL')); ?>">
			    </textarea>
				</li>
			</ul>
		</fieldset>
	</div>
</div>
<?php endif; ?>
