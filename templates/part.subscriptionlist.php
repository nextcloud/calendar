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
<li ng-if="is.loading" class="icon-loading-small"><a></a></li>
<li ng-repeat="item in calendarListItems | orderBy: item.calendar.order | subscriptionListFilter"
	class="app-navigation-list-item"
	ng-class="{
		active: item.calendar.enabled,
		'icon-loading-small': item.displaySpinner(),
		editing: item.isEditing() || item.displayCalDAVUrl || item.displayWebCalUrl
	}">
	<?php print_unescaped($this->inc('part.calendarlist.item')); ?>
</li>
