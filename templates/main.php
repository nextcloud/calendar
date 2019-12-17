<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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
script('calendar', 'calendar');
style('calendar', 'calendar');
?>

<input type="hidden" id="config-app-version" value="<?php p($_['app_version']); ?>">
<input type="hidden" id="config-first-run" value="<?php p($_['first_run'] ? 'true' : 'false'); ?>">
<input type="hidden" id="config-initial-view" value="<?php p($_['initial_view']); ?>">
<input type="hidden" id="config-show-weekends" value="<?php p($_['show_weekends'] ? 'true' : 'false'); ?>">
<input type="hidden" id="config-show-week-numbers" value="<?php p($_['show_week_numbers'] ? 'true' : 'false'); ?>">
<input type="hidden" id="config-skip-popover" value="<?php p($_['skip_popover'] ? 'true' : 'false'); ?>">
<input type="hidden" id="config-talk-enabled" value="<?php p($_['talk_enabled'] ? 'true' : 'false'); ?>">
<input type="hidden" id="config-timezone" value="<?php p($_['timezone']); ?>">
