<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus <thomas@tanghus.net>
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
namespace OCA\Calendar\Backend\Contact;

use OCP\AppFramework\Db\DoesNotExistException;

use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarAPI;
use OCA\Calendar\ICalendarCollection;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Permissions;

use OCA\Contacts\App as ContactsApp;

class Calendar extends Contact implements ICalendarAPI {

	/**
	 * @var \OCA\Calendar\IBackend
	 */
	private $backend;


	/**
	 * @param ContactsApp $contacts
	 * @param IBackend $backend
	 */
	public function __construct(ContactsApp $contacts, IBackend $backend) {
		parent::__construct($contacts);

		$this->backend = $backend;
	}


	/**
	 * returns information about calendar $privateUri of the user $userId
	 * @param string $privateUri
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function find($privateUri, $userId) {
		if (!array_key_exists($privateUri, $this->uris)) {
			throw new DoesNotExistException(
				$privateUri . 'does not exist!'
			);
		}

		$calendar = new \OCA\Calendar\Db\Calendar();
		$calendar->setUserId($userId);
		$calendar->setOwnerId($userId);
		$calendar->setBackend($this->backend);
		$calendar->setPrivateUri($privateUri);
		$calendar->setComponents(ObjectType::EVENT);
		$calendar->setCruds(Permissions::READ + Permissions::SHARE);
		$calendar->setColor('rgba(77,87,100,0.75)');
		$calendar->setOrder(0);
		$calendar->setEnabled(true);

		$displayname = '';
		switch($privateUri) {
			case 'anniversary':
				$displayname = \OC::$server->getL10N('calendar')
					->t('Anniversary');
				break;

			case 'birthday':
				$displayname = \OC::$server->getL10N('calendar')
					->t('Birthday');
				break;

			default:
				break;
		}
		$calendar->setDisplayname($displayname);

		$ctag = $this->generateCTag();
		$calendar->setCtag($ctag);

		return $calendar;
	}


	/**
	 * returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$calendars = new CalendarCollection();

		foreach($this->uris as $uri => $property) {
			$calendars[] = $this->find($uri, $userId);
		}

		return $calendars->subset($limit, $offset);
	}


	/**
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		return array_keys($this->uris);
	}


	/**
	 * @return integer
	 */
	private function generateCTag() {
		$ctag = 0;

		$addressBooks = $this->contacts->getAddressBooksForUser();
		foreach ($addressBooks as $addressBook) {
			$tmp = $addressBook->lastModified();
			if(!is_null($tmp)) {
				$ctag = max($ctag, $tmp);
			}
		}

		return $ctag;
	}
}