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

use OCP\Calendar\IObject;
use OCP\Share_Backend_Collection;
use OCP\Share_Backend_File_Dependent;
use OCA\Calendar\Application;
use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\Db\CalendarCollection;

class Calendar implements Share_Backend_Collection, Share_Backend_File_Dependent {

	/**
	 * @var \OCA\Calendar\Application;
	 */
	private $app;


	/**
	 * @var \OCA\Calendar\BusinessLayer\CalendarBusinessLayer
	 */
	private $calendars;


	/**
	 * @var \OCA\Calendar\BusinessLayer\ObjectBusinessLayer
	 */
	private $objects;


	/**
	 * @var int
	 */
	const CALENDAR = 1;


	/**
	 * Constructor
	 */
	public function __construct() {
		$app = new Application();
		$container = $app->getContainer();

		$this->app = $app;
		$this->calendars = $container->query('CalendarBusinessLayer');
		$this->objects = $container->query('ObjectBusinessLayer');
	}


	/**
	 * Get the source of the item to be stored in the database
	 * @param string $itemSource
	 * @param string $uidOwner of the item
	 * @return mixed|array|false Source
	 *
	 * Return an array if the item is file dependent, the array needs two keys: 'item' and 'file'
	 * Return false if the item does not exist for the user
	 *
	 * The formatItems() function will translate the source returned back into the item
	 */
	public function isValidSource($itemSource, $uidOwner) {
		try {
			$calendar = $this->calendars->findById($itemSource);

			if ($calendar->getUserId() === $uidOwner) {
				$fileId = $calendar->getFileId();
				if ($fileId === null) {
					return true;
				} else {
					//TODO - fix me
					return array(
						'item' => null,
						'file' => null,
					);
				}
			} else {
				return false;
			}

		} catch(BusinessLayerException $ex) {
			return false;
		}
	}


	/**
	 * Get a unique name of the item for the specified user
	 * @param string $itemSource
	 * @param string|false $shareWith User the item is being shared with
	 * @param array|null $exclude List of similar item names already
	 * existing as shared items
	 * @return string Target name
	 *
	 * This function needs to verify that the user does not already have
	 * an item with this name.
	 * If it does generate a new name e.g. name_#
	 */
	public function generateTarget($itemSource, $shareWith, $exclude = null) {
		try {
			$this->calendars->findById($itemSource)->getDisplayname();
		} catch (BusinessLayerException $ex) {
			return null;
		}
	}

	/**
	 * Converts the shared item sources back into the item in the specified format
	 * @param array $items Shared items
	 * @param int $format Format
	 * @param array $parameters
	 * @return null|CalendarCollection
	 *
	 * The items array is a 3-dimensional array with the item_source as the
	 * first key and the share id as the second key to an array with
	 * the share info.
	 * The key/value pairs included in the share info depend on the function
	 * originally called:
	 * If called by getItem(s)Shared: id, item_type, item, item_source,
	 * share_type, share_with, permissions, stime, file_source
	 * If called by getItem(s)SharedWith: id, item_type, item, item_source,
	 * item_target, share_type, share_with, permissions, stime, file_source,
	 * file_target
	 * This function allows the backend to control the output of shared items
	 * with custom formats.
	 * It is only called through calls to the
	 * public getItem(s)Shared(With) functions.
	 */
	public function formatItems($items, $format, $parameters = null) {
		$calendars = new CalendarCollection();

		if ($format === self::CALENDAR) {
			foreach ($items as $item) {
				try {
					$calendar = $this->calendars->findById($item['item_source']);

					$calendar->setId(null);
					$calendar->setBackend('org.ownCloud.sharing');
					$calendar->setCruds($item['permissions']);
					$calendar->setPrivateUri($item['item_source']);
					$calendar->setUserId($item['share_with']);
					$calendar->setLastObjectUpdate(0);
					$calendar->setLastPropertiesUpdate(0);

					$calendars->add($calendar);
				} catch (BusinessLayerException $ex) {
					var_dump($item);
					exit;
				}
			}
		}

		return $calendars;
	}


	/**
	 * Get the sources of the children of the item
	 * @param string $itemSource
	 * @return array Returns an array of children each inside an array with
	 * the keys: source, target, and file_path if applicable
	 */
	public function getChildren($itemSource) {
		try {
			$calendar = $this->calendars->findById($itemSource);
			$objects = $this->objects->findAll($calendar);

			$children = array();
			$objects->iterate(function(IObject $object) use (&$children) {
				$children[] = array(
					'source' => '',//TODO generate unique source
					'target' => $object->getSummary(),
					'file_path' => null
				);
			});

			return $children;
		} catch(BusinessLayerException $ex) {
			return null;
		}
	}


	/**
	 * Get the file path of the item
	 * @param string $itemSource
	 * @param string $uidOwner User that is the owner of shared item
	 * @return string|false
	 */
	public function getFilePath($itemSource, $uidOwner) {
		try {
			$calendar = $this->calendars->findById($itemSource);

			if ($calendar->getUserId() !== $uidOwner) {
				return false;
			}

			$fileId = $calendar->getFileId();
			if ($fileId === null) {
				return false;
			}

			$file = $this->app->getContainer()->getServer()
				->getUserFolder();

			//if ($file->)
			//TODO fix me
			$path = (string)$file;
			return $path;
		} catch (BusinessLayerException $ex) {
			return false;
		}
	}
}