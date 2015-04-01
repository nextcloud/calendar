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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\ObjectCollectionFactory;
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Db\ObjectType;

use OCA\Calendar\IObject;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Contacts\App as ContactsApp;
use OCA\Contacts\Addressbook as AddressBookEntity;
use OCA\Contacts\Contact as ContactEntity;
use OCP\IL10N;

class Object extends Contact implements BackendUtils\IObjectAPI {

	/**
	 * @var \OCA\Calendar\ICalendar
	 */
	private $calendar;


	/**
	 * @var IL10N
	 */
	private $l10n;


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
	 * @param IL10N $l10n
	 * @param ObjectFactory $objectFactory
	 * @param ObjectCollectionFactory $objectCollectionFactory
	 */
	public function __construct(ContactsApp $contacts, ICalendar $calendar, IL10N $l10n,
								ObjectFactory $objectFactory, ObjectCollectionFactory $objectCollectionFactory) {
		parent::__construct($contacts);

		$this->calendar = $calendar;
		$this->l10n = $l10n;

		$this->uri = $calendar->getPrivateUri();
		$this->userId = $calendar->getUserId();
	}


	/**
	 * {@inheritDoc}
	 */
	public function cache() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($objectURI, $type=ObjectType::ALL) {
		if (!(ObjectType::EVENT & $type)) {
			throw new BackendUtils\DoesNotExistException();
		}

		$object = $this->getObjectFromUri($objectURI);
		if (is_null($object)) {
			throw new BackendUtils\DoesNotExistException();
		}

		return $object;
	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		$objects = new ObjectCollection();
		if (!(ObjectType::EVENT & $type)) {
			return $objects;
		}

		$offset = (!is_null($limit) && is_null($offset)) ? 0 : $offset;
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

				$object = $this->getObjectFromContact($addressBook, $contact);
				if (!is_null($object)) {
					$objects[] = $object;
				}
				$i++;
			}
		}

		return $objects;
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($type=ObjectType::ALL) {
		$list = [];
		if (!(ObjectType::EVENT & $type)) {
			return $list;
		}

		$addressBooks = $this->contacts->getAddressBooksForUser();
		foreach($addressBooks as $addressBook) {
			foreach($addressBook->getChildren() as $contact) {
				if ($this->isObjectInteresting($contact)) {
					$list[] = $this->getUriFromContact($addressBook, $contact);
				}
			}
		}

		return $list;
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(IObject $object) {
		$contact = $this->getContactFromUri($object->getUri());
		if (!$contact) {
			throw new BackendUtils\DoesNotExistException();
		}

		return ($object->getEtag() !== $contact->getETag());
	}


	/**
	 * @param AddressBookEntity $addressBook
	 * @param ContactEntity $contact
	 * @return null|\OCA\Calendar\Db\Object
	 */
	private function getObjectFromContact(AddressBookEntity $addressBook, ContactEntity $contact) {
		if (!$this->isObjectInteresting($contact)) {
			return null;
		}

		$propertyName = $this->uris[$this->uri];
		$property = $contact->{$propertyName};
		if (isset($property->parameters['VALUE']) && $property->parameters['VALUE'] === 'text') {
			return null;
		}

		try {
			$date = new \DateTime(strval($property));
		} catch(\Exception $e) {
			return null;
		}

		$title = $this->getTitleFromContact($contact, $date);
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
		$object->setUri($this->getUriFromContact($addressBook, $contact));
		$object->setEtag($contact->getETag());

		return $object;
	}


	/**
	 * get addressBook entity based on object's uri
	 * @param $objectURI
	 * @return null|AddressBookEntity
	 */
	private function getAddressBookFromUri($objectURI) {
		$objectURI = substr($objectURI, 0, (strlen($objectURI) - 4));
		list($backend, $addressBookId) = explode('::', $objectURI);

		if (!$backend || !$addressBookId) {
			return null;
		}

		return $this->contacts->getAddressBook($backend, $addressBookId);
	}


	/**
	 * get contact entity based on object's uri
	 * @param $objectURI
	 * @return null|ContactEntity
	 */
	private function getContactFromUri($objectURI) {
		$objectURI = substr($objectURI, 0, (strlen($objectURI) - 4));
		list($backend, $addressBookId, $contactId) = explode('::', $objectURI);

		if (!$backend || !$addressBookId || !$contactId) {
			return null;
		}

		return $this->contacts->getContact($backend, $addressBookId, $contactId);
	}


	/**
	 * @param $objectURI
	 * @return null|\OCA\Calendar\Db\Object
	 */
	private function getObjectFromUri($objectURI) {
		return $this->getObjectFromContact(
			$this->getAddressBookFromUri($objectURI),
			$this->getContactFromUri($objectURI)
		);
	}


	/**
	 * @param AddressBookEntity $addressBook
	 * @param ContactEntity $contact
	 * @return string
	 */
	private function getUriFromContact(AddressBookEntity $addressBook, ContactEntity $contact) {
		$uri = implode('::', [
			$addressBook->getBackend()->name,
			$addressBook->getId(),
			$contact->getId(),
		]);

		$uri .= '.ics';
		return $uri;
	}


	/**
	 * @param ContactEntity $contact
	 * @param \DateTime $date
	 * @return null|string
	 */
	private function getTitleFromContact(ContactEntity $contact, \DateTime $date) {
		$name = strtr(strval($contact->FN), array('\,' => ',', '\;' => ';'));
		$year = $date->format('Y');

		switch($this->uri) {
			case 'anniversary':
				$title = $this->l10n->t('%s\'s Anniversary (%s)', [$name, $year]);
				break;

			case 'birthday':
				$title = $this->l10n->t('%s\'s Birthday (%s)', [$name, $year]);
				break;

			default:
				$title = null;
				break;
		}

		return $title;
	}


	/**
	 * @param ContactEntity $contact
	 * @return boolean
	 */
	private function isObjectInteresting(ContactEntity $contact) {
		$property = $this->uris[$this->uri];
		return isset($contact->{$property});
	}
}