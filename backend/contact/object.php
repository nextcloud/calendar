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

use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectAPI;
use OCA\Calendar\IObjectCollection;
use OCA\Calendar\CacheOutDatedException;
use OCA\Calendar\ObjectType;

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Backend\MultipleObjectsReturnedException;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Contacts\App as ContactsApp;
use OCA\Contacts\Addressbook as AddressBookEntity;
use OCA\Contacts\Contact as ContactEntity;

class Object extends Contact implements IObjectAPI {

	/**
	 * @var \OCA\Calendar\ICalendar
	 */
	private $calendar;


	/**
	 * @var string
	 */
	private $uri;


	/**
	 * @var string
	 */
	private $userId;


	/**
	 * @param ContactsApp $contacts
	 * @param ICalendar $calendar
	 */
	public function __construct(ContactsApp $contacts, ICalendar $calendar) {
		parent::__construct($contacts);

		$this->calendar = $calendar;

		$this->uri = $calendar->getPrivateUri();
		$this->userId = $calendar->getUserId();
	}


	/**
	 * @return boolean
	 */
	public function cache() {
		return false;
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
		if (!(ObjectType::EVENT & $type)) {
			throw new DoesNotExistException();
		}

		$objectURI = substr($objectURI, 0, (strlen($objectURI) - 4));
		list($backend, $addressBookId, $contactId) = explode('::', $objectURI);;
		$contact = $this->contacts->getContact($backend, $addressBookId, $contactId);
		if(is_null($contact)) {
			\OC::$server->getLogger()->debug('Contact not found!');
			throw new DoesNotExistException();
		}

		$object = $this->createObjectFromContact(
			$this->contacts->getAddressBook($backend, $addressBookId),
			$contact
		);
		if (is_null($object)) {
			\OC::$server->getLogger()->debug('Contact found, but doesn\'t contain property of interest!');
			throw new DoesNotExistException();
		}

		return $object;
	}


	/**
	 * Find objects
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		$objects = new ObjectCollection();
		if (!(ObjectType::EVENT & $type)) {
			return $objects;
		}

		if (!is_null($limit) && is_null($offset)) {
			$offset = 0;
		}

		$i = 0;
		$addressBooks = $this->contacts->getAddressBooksForUser();
		foreach($addressBooks as $addressBook) {
			foreach($addressBook->getChildren() as $contact) {
				if (!is_null($offset) && $i < $offset) {
					$i++;
					continue;
				}
				if (!is_null($limit) && $i > ($offset + $limit)) {
					break;
				}

				$object = $this->createObjectFromContact($addressBook, $contact);
				if (!is_null($object)) {
					$objects[] = $object;
				}

				$i++;
			}
		}

		return $objects;
	}


	/**
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL) {
		$list = [];
		if (!(ObjectType::EVENT & $type)) {
			return $list;
		}

		$addressBooks = $this->contacts->getAddressBooksForUser();
		foreach($addressBooks as $addressBook) {
			foreach($addressBook->getChildren() as $contact) {
				if ($this->isInterestingObject($contact)) {
					$list[] = $this->createObjectUriFromContact($addressBook, $contact);
				}
			}
		}

		return $list;
	}


	/**
	 * @param AddressBookEntity $addressBook
	 * @param ContactEntity $contact
	 * @return null|\OCA\Calendar\Db\Object
	 */
	protected function createObjectFromContact(AddressBookEntity $addressBook, ContactEntity $contact) {
		if ($this->isInterestingObject($contact)) {
			return null;
		}

		$property = $contact->{$this->uris[$this->uri]};
		if (isset($property->parameters['VALUE']) && $property->parameters['VALUE'] === 'text') {
			return null;
		}

		try {
			$date = new \DateTime(strval($property));
		} catch(\Exception $e) {
			return null;
		}

		$title = $this->createTitleFromContactAndDate($contact, $date);
		if (is_null($title)) {
			return null;
		}

		$vobject = new VCalendar();
		$vobject->add('VEVENT', [
			'summary' => $title,
			'dtstart' => $date,
			'duration' => 'P1D',
			'uid' => $contact->UID,
			'rrule' => 'FREQ=YEARLY'
		]);

		$object = \OCA\Calendar\Db\Object::fromVObject($vobject);
		$object->setCalendar($this->calendar);
		$object->setUri($this->createObjectUriFromContact($addressBook, $contact));

		return $object;
	}


	/**
	 * @param AddressBookEntity $addressBook
	 * @param ContactEntity $contact
	 * @return string
	 */
	protected function createObjectUriFromContact(AddressBookEntity $addressBook, ContactEntity $contact) {
		return $addressBook->getBackend()->name . '::' .
			$addressBook->getId() . '::' .
			$contact->getId() . '.ics';
	}


	/**
	 * @param ContactEntity $contact
	 * @param \DateTime $date
	 * @return null|string
	 */
	protected function createTitleFromContactAndDate(ContactEntity $contact, \DateTime $date) {
		$title = null;
		switch($this->uri) {
			case 'anniversary':
				$title = \OC::$server->getL10N('calendar')
					->t('{name}\'s Anniversary');
				break;

			case 'birthday':
				$title = \OC::$server->getL10N('calendar')
					->t('{name}\'s Birthday');
				break;

			default:
				break;
		}

		if (is_null($title)) {
			return null;
		}

		$title = str_replace('{name}',
			strtr(strval($contact->FN), array('\,' => ',', '\;' => ';')),
			$title
		);

		$title .= ' (' . $date->format('Y') . ')';

		return $title;
	}


	/**
	 * @param ContactEntity $contact
	 * @return bool
	 */
	protected function isInterestingObject(ContactEntity $contact) {
		return isset($contact->{$this->uris[$this->uri]});
	}
}