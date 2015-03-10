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
namespace OCA\Calendar\Db;

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Backend\TemporarilyNotAvailableException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;

class CalendarFactory extends EntityFactory {

	/**
	 * @var \OCA\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	protected $timezones;


	/**
	 * @param IBackendCollection $backends
	 * @param TimezoneMapper $timezones
	 */
	function __construct(IBackendCollection $backends, TimezoneMapper $timezones) {
		$this->backends = $backends;
		$this->timezones = $timezones;
	}


	/**
	 * @param array $data
	 * @param int $format
	 * @return \OCP\AppFramework\Db\Entity|static
	 * @throws CorruptDataException
	 * @throws TemporarilyNotAvailableException
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 */
	public function createEntity(array $data, $format=self::FORMAT_PARAM) {
		if (!is_array($data) || empty($data)) {
			//TODO - add ex msg
			throw new CorruptDataException('CalendarManager-data is empty');
		}

		$backend = $this->backends->find($data['backend']);
		if (!($backend instanceof IBackend)) {
			throw new TemporarilyNotAvailableException(
				'Unknown backend'
			);
		}

		//replace backend with IBackend
		$data['backend'] = $backend;

		if ($data['timezone']) {
			//replace timezone with ITimezone
			try {
				$timezone = $this->timezones->find($data['timezone'], $data['user_id']);
				$row['timezone'] = $timezone;
			} catch (DoesNotExistException $ex) {
				unset($data['timezone']);
			}
		}

		unset($data['last_properties_update']);
		unset($data['last_object_update']);



		if ($format === self::FORMAT_PARAM) {
			return Calendar::fromParams($data);
		} elseif ($format === self::FORMAT_ROW) {
			return Calendar::fromRow($data);
		} else {
			//TODO - add ex msg
			throw new CorruptDataException();
		}
	}
}