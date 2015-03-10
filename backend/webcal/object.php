<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Maxime Corteel
 * @copyright 2014 Maxime Corteel <mcorteel@gmail.com>
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
namespace OCA\Calendar\Backend\WebCal;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectAPI;
use OCA\Calendar\IObjectCollection;
use OCA\Calendar\CacheOutDatedException;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCA\Calendar\ObjectType;
use OCA\Calendar\Sabre\VObject\Splitter\ICalendar as ICalendarSplitter;

class Object extends WebCal implements IObjectAPI {

	/**
	 * @var string
	 */
	private $uri;


	/**
	 * @var string
	 */
	private $userId;


	/**
	 * @param string $privateUri
	 * @param string $userId
	 */
	public function __construct($privateUri, $userId) {
		$this->uri = $privateUri;
		$this->userId = $userId;
	}


	/**
	 * @return boolean
	 */
	public function cache() {
		return true;
	}


	/**
	 * find object
	 * @param string $objectURI
	 * @param integer $type
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return IObject
	 */
	public function find($objectURI, $type=ObjectType::ALL) {

	}


	/**
	 * Find objects
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @throws CorruptDataException
	 * @throws DoesNotExistException
	 * @return IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		try {
			$subscription = $this->subscriptions->findByType($calendar->getPrivateUri(), $this->getBackendIdentifier(), $calendar->getUserId());
		} catch(BusinessLayerException $ex) {
			throw new DoesNotExistException($ex->getMessage());
		}
		$curl = curl_init();
		$url = $subscription->getUrl();
		$data = null;

		$this->prepareRequest($curl, $url);
		$this->getRequestData($curl, $data);
		$this->validateRequest($curl);

		$objectCollection = new ObjectCollection();

		try {
			$splitter = new ICalendarSplitter($data);
			while($vobject = $splitter->getNext()) {
				$object = new Object();
				$object->fromVObject($vobject);
				$objectCollection->add($object);
			}
		} catch(ParseException $ex) {
			throw new CorruptDataException('CalendarManager-data is not valid!');
		}
		return $objectCollection;
	}


	/**
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL) {

	}
}