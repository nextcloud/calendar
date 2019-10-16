<?php
/**
 * @copyright Copyright (c) 2018 Bjoern Schiessle <bjoern@schiessle.org>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar;

use OCP\Federation\Exceptions\ActionNotSupportedException;
use OCP\Federation\ICloudFederationProvider;
use OCP\Federation\ICloudFederationShare;

class CloudFederationProviderCalendar implements ICloudFederationProvider {

	/**
	 * get the name of the share type, handled by this provider
	 *
	 * @return string
	 *
	 * @since 14.0.0
	 */
	public function getShareType() {
		return 'calendar';
	}

	/**
	 * share received from another server
	 *
	 * @param ICloudFederationShare $share
	 * @return string provider specific unique ID of the share
	 *
	 * @throws \OCP\Federation\Exceptions\ProviderCouldNotAddShareException
	 *
	 * @since 14.0.0
	 */
	public function shareReceived(ICloudFederationShare $share) {
		// TODO: Implement shareReceived() method.
		// Here we should to the same as we do if the user add a new calendar
		// subscription in the user interface
		// We might consider to first create a notification to ask the user whether
		// they want to accept the share or not
		//
		// Additionally we should store it in a db table so that we have information
		// like the shared secret, the provider id, etc in case we exchange notifications
		// also in the user interface it might be nice to show some additional information like
		// from whom the share comes from
	}

	/**
	 * notification received from another server
	 *
	 * @param string $notificationType (e.g SHARE_ACCEPTED)
	 * @param string $providerId share ID
	 * @param array $notification provider specific notification
	 * @return array $data send back to sender
	 *
	 * @throws ActionNotSupportedException
	 *
	 * @since 14.0.0
	 */
	public function notificationReceived($notificationType, $providerId, array $notification) {
		// TODO: Implement notificationReceived() method.
		// let's start with a small subset of notification, I think at least a unshare
		// notification from the owner would be nice
		throw new ActionNotSupportedException($notificationType);
		return [];
	}

	/**
	 * get the supported share types, e.g. "user", "group", etc.
	 *
	 * @return array
	 *
	 * @since 14.0.0
	 */
	public function getSupportedShareTypes() {
		return ['user'];
	}
}
