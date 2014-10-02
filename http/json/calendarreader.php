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
namespace OCA\Calendar\Http\JSON;

use OCP\Calendar\IBackendCollection;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IEntity;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\Http\SimpleJSONReader;
use OCA\Calendar\Utility\JSONUtility;

class JSONCalendarReader extends SimpleJSONReader {

	/**
	 * Collection of initialized backends
	 * @var \OCP\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * BusinessLayer for managing timezones
	 * @var \OCA\Calendar\BusinessLayer\TimezoneBusinessLayer
	 */
	protected $timezones;


	/**
	 * id of current user
	 * @var string
	 */
	protected $userId;


	/**
	 * @param resource $handle
	 * @param string $userId
	 * @param IBackendCollection $backends
	 * @param TimezoneMapper $timezones
	 *
	 * TODO - use TimezoneBusinessLayer instead of TimezoneMapper
	 */
	public function __construct($handle, $userId, IBackendCollection $backends,
								TimezoneMapper $timezones) {
		parent::__construct($handle, '\\OCA\\Calendar\\Db\\Calendar');

		$this->userId = $userId;
		$this->backends = $backends;
		$this->timezones = $timezones;
	}


	/**
	 * parse a json calendar
	 * @param IEntity &$entity
	 * @param string $key
	 * @param mixed $value
	 */
	protected function setProperty(IEntity &$entity, $key, $value) {
		if (!($entity instanceof ICalendar)) {
			return;
		}

		$setter = 'set' . ucfirst($key);
		switch($key) {
			case 'color':
			case 'description':
			case 'displayname':
				$entity->$setter(strval($value));
				break;

			case 'uri':
				$entity->setPublicUri(strval($value));
				break;

			case 'order':
				$entity->$setter(intval($value));
				break;

			case 'enabled':
				$entity->$setter((bool) $value); //boolval is PHP >= 5.5 only
				break;

			case 'components':
				$value = JSONUtility::parseComponents($value);
				$entity->$setter($value);
				break;

			case 'timezone':
				$timezoneObject = $this->parseTimezone($value);
				$entity->$setter($timezoneObject);
				break;

			case 'backend':
				$backendObject = $this->parseBackend($value);
				$entity->$setter($backendObject);
				break;

			//blacklist:
			case 'url':
			case 'caldav':
			case 'cruds':
			case 'ctag':
			case 'user':
			case 'owner':
				break;

			default:
				break;
		}
	}


	/**
	 * @param string $tzId
	 * @return \OCA\Calendar\Db\Timezone|null
	 */
	private function parseTimezone($tzId) {
		try {
			return $this->timezones->find($tzId, $this->userId);
		} catch(BusinessLayerException $ex) {
			return null;
		}
	}


	/**
	 * @param $backendId
	 * @return \OCA\Calendar\Db\Backend|null
	 */
	private function parseBackend($backendId) {
		foreach($this->backends as $backend) {
			/** @var \OCP\Calendar\IBackend $backend */
			if ($backend->getId() === $backendId) {
				return $backend;
			}
		}

		return null;
	}
}