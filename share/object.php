<?php
/**
* ownCloud
*
* @author Bart Visscher
* @copyright 2012 Bart Visscher <bartv@thisnet.nl>
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
*/
namespace OCA\Calendar\Share;

use OCA\Calendar\BusinessLayer;
use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\IBackend;

use OCP\Files\Folder;
use OCP\IL10N;
use OCP\ILogger;
use OCP\Share_Backend_File_Dependent;

class Object implements Share_Backend_File_Dependent {

	/**
	 * @var BusinessLayer\CalendarManager
	 */
	private $calendars;


	/**
	 * @var \closure
	 */
	private $objects;


	/**
	 * @var CalendarFactory
	 */
	private $factory;


	/**
	 * @var ILogger
	 */
	private $logger;


	/**
	 * @var IBackend
	 */
	private $sharingBackend;


	/**
	 * @var Folder
	 */
	private $userFolder;


	/**
	 * @param BusinessLayer\CalendarManager $calendarManager
	 * @param \closure $objectManager
	 * @param CalendarFactory $factory
	 * @param Folder $userFolder
	 * @param IBackend $sharingBackend
	 * @param ILogger $logger
	 * @param IL10N $l10n
	 */
	public function __construct(BusinessLayer\CalendarManager $calendarManager,
								\closure $objectManager, CalendarFactory $factory,
								Folder $userFolder, IBackend $sharingBackend,
								ILogger $logger, IL10N $l10n) {
		$this->calendars = $calendarManager;
		$this->objects = $objectManager;
		$this->factory = $factory;
		$this->logger = $logger;
		$this->l10n = $l10n;
		$this->sharingBackend = $sharingBackend;
		$this->userFolder = $userFolder;
	}


	/**
	 * {@inheritDoc}
	 */
	public function isValidSource($itemSource, $uidOwner) {
		//format of itemSource: $calendarId::$objectUri
		if (substr_count($itemSource, '::') === 0) {
			return false;
		}

		list ($calendarId, $objectUri) = explode('::', $itemSource, 1);

		try {
			$calendar = $this->calendars->find($calendarId, $uidOwner);
			/** @var BusinessLayer\ObjectManager $objects */
			$objects = call_user_func_array($this->objects, [$calendar]);
			$object = $objects->find($objectUri);
		} catch(\Exception $ex) {
			$this->logger->debug($ex->getMessage());
			return false;
		}

		/** @var \OCA\Calendar\IObject $object */
		if ($object && $object->getCalendar() === $calendar) {
			return true;
		}

		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function generateTarget($itemSource, $shareWith, $exclude = null) {
		return $itemSource;
	}


	/**
	 * {@inheritDoc}
	 */
	public function formatItems($items, $format, $parameters = null) {
		$entities = [];

		foreach ($items as $item) {
			if (substr_count($item['item_source'], '::') === 0) {
				return false;
			}

			list ($calendarId, $objectUri) = explode('::', $item['item_source'], 1);

			$ownerId = $item['uid_owner'];

			if ($format === Types::GROUPED) {
				if (!isset($entities[$ownerId])) {
					$calendar = $this->factory->createEntity([
						'backend' => $this->sharingBackend,
						'cruds' => Permissions::READ,
						'privateUri' => 'objects::' . $ownerId,
						'userId' => $item['share_with'],
						'ownerId' => $ownerId,
						'displayname' => strval($this->l10n->t('%s\'s events', [$ownerId])),
						'color' => 'rgb(107, 107, 107)',
						'components' => ObjectType::EVENT,
						'enabled' => false,
						'ctag' => 0,
					], CalendarFactory::FORMAT_PARAM);

					$entities[$ownerId] = [
						'calendar' => $calendar,
						'ctag' => 0,
						'objects' => [],
					];
				}

				/** @var \OCA\Calendar\ICalendar $calendar */
				$calendar = $entities[$ownerId]['calendar'];
				$calendar->setCtag(max($calendar->getCtag(), $item['stime']));
				$entities[$ownerId]['objects'] = [
					'calendarId' => $calendarId,
					'objectUri' => $objectUri,
					'shareItem' => $item,
				];
			} elseif ($format === Types::GROUPEDLIST) {
				$privateUri = 'object::' . $ownerId;
				if (!in_array($privateUri, $entities)) {
					$entities[] = $privateUri;
				}
			}
		}

		return $entities;
	}


	/**
	 * {@inheritDoc}
	 */
	public function getFilePath($itemSource, $uidOwner) {
		try {
			if (substr_count($itemSource, '::') === 0) {
				return false;
			}

			list ($calendarId) = explode('::', $itemSource, 1);
			$calendar = $this->calendars->find($calendarId, $uidOwner);

			$fileId = $calendar->getFileId();
			if ($fileId === null) {
				return false;
			}

			$files = $this->userFolder->getById($fileId);
			if (!$files || empty($files)) {
				return false;
			} else {
				return $files[0]->getPath();
			}
		} catch (BusinessLayer\Exception $ex) {
			return false;
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function isShareTypeAllowed($shareType) {
		return true;
	}
}
