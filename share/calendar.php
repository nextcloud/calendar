<?php
/**
 * ownCloud
 *
 * @author Michael Gapczynski
 * @copyright 2012 Michael Gapczynski mtgap@owncloud.com
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
use OCA\Calendar\IBackend;

use OCP\Files\Folder;
use OCP\ILogger;
use OCP\Share_Backend_File_Dependent;

class Calendar implements Share_Backend_File_Dependent {

	/**
	 * @var BusinessLayer\CalendarManager
	 */
	private $calendars;


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
	 * @param CalendarFactory $factory
	 * @param Folder $userFolder
	 * @param IBackend $sharingBackend
	 * @param ILogger $logger
	 */
	public function __construct(BusinessLayer\CalendarManager $calendarManager,
								CalendarFactory $factory, Folder $userFolder,
								IBackend $sharingBackend, ILogger $logger) {
		$this->calendars = $calendarManager;
		$this->factory = $factory;
		$this->logger = $logger;
		$this->sharingBackend = $sharingBackend;
		$this->userFolder = $userFolder;
	}


	/**
	 * {@inheritDoc}
	 */
	public function isValidSource($itemSource, $uidOwner) {
		try {
			$calendar = $this->calendars->find($itemSource, $uidOwner);
			if ($calendar->getUserId() === $uidOwner) {
				return true;
			}
			return false;
		} catch(BusinessLayer\Exception $ex) {
			$this->logger->debug($ex->getMessage());
			return false;
		}
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

		if ($format === Types::ENTITY) {
			foreach ($items as $item) {
				try {
					$calendar = $this->calendars->find($item['item_source'], $item['uid_owner']);
				} catch (BusinessLayer\Exception $ex) {
					$this->logger->debug($ex->getMessage());
					continue;
				}

				$calendar->setId(null);
				$calendar->setBackend($this->sharingBackend);
				$calendar->setCruds($item['permissions']);
				$calendar->setPrivateUri('calendar::' . $item['item_source']);
				$calendar->setUserId($item['share_with']);

				$entities[] = $calendar;
			}

			return $this->factory->createCollectionFromEntities($entities);
		} elseif ($format === Types::ENTITYLIST) {
			foreach ($items as $item) {
				$entities[] = $item['item_source'];
			}

			return $entities;
		} else {
			return null;
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function getFilePath($itemSource, $uidOwner) {
		try {
			$calendar = $this->calendars->find($itemSource, $uidOwner);

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
