<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar;

interface IBackendCollection extends ICollection {

	/**
	 * get a backend by a subscription type it supports
	 * @param string $type
	 * @return IBackend
	 */
	public function bySubscriptionType($type);


	/**
	 * @param string $backendName
	 * @return IBackend
	 */
	public function find($backendName);


	/**
	 * @param string $userId
	 * @return array
	 */
	public function getPrivateUris($userId);


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Cache
	 */
	public function getCache();


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Scanner
	 */
	public function getScanner();


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Updater
	 */
	public function getUpdater();


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Watcher
	 */
	public function getWatcher();
}