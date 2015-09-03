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
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Db\ObjectType;

use OCA\Calendar\IObject;
use OCP\Contacts\IManager;
use Sabre\VObject\Component\VCalendar;
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
	 * @param IManager $contactsManager
	 * @param ICalendar $calendar
	 * @param IL10N $l10n
	 * @param ObjectFactory $objectFactory
	 */
	public function __construct(IManager $contactsManager, ICalendar $calendar, IL10N $l10n,
								ObjectFactory $objectFactory) {
		parent::__construct($contactsManager);

		$this->calendar = $calendar;
		$this->l10n = $l10n;
		$this->factory = $objectFactory;

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

		$contact = $this->getContactFromUri($objectURI);
		$object = $this->getObjectFromContact($contact);
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

		/*
		 * If the pattern is empty, it'll return all contacts. That's why we search for '-'.
		 * The days are formatted as YYYY-MM-DD, so there is always a dash in there.
		 */
		$contacts = $this->contactsManager->search('-', [$this->uris[$this->uri]], []);
		foreach($contacts as $contact) {
			if (!is_null($offset) && $i < $offset) {
				$i++;
				continue;
			}
			if (!is_null($limit) && $i > ($offset + $limit)) {
				break;
			}

			$object = $this->getObjectFromContact($contact);
			if (!is_null($object)) {
				$objects[] = $object;
			}
			$i++;
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

		$contacts = $this->contactsManager->search('-', [$this->uris[$this->uri]], []);
		foreach($contacts as $contact) {
			if ($this->isObjectInteresting($contact)) {
				$list[] = $this->getUriFromContact($contact);
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

		return ($object->getEtag() !== $contact['ETAG']);
	}


	/**
	 * @param array $contact
	 * @return null|\OCA\Calendar\Db\Object
	 */
	private function getObjectFromContact($contact) {
		if (!$this->isObjectInteresting($contact)) {
			return null;
		}

		$propertyName = $this->uris[$this->uri];
		$property = array_key_exists($propertyName, $contact) ? $contact[$propertyName] : null;
		if (empty($property)) {
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

		$vObject = new VCalendar();
		$vObject->add('VEVENT', [
			'summary' => $title,
			'dtstart' => $date,
			'duration' => 'P1D',
			'uid' => $contact['id'],
			'rrule' => 'FREQ=YEARLY'
		]);
		$vObject->VEVENT->DTSTART['VALUE'] = 'date';

		$object = $this->factory->createEntity($vObject, ObjectFactory::FORMAT_VObject);
		$object->setCalendar($this->calendar);
		$object->setUri($this->getUriFromContact($contact));
		$object->setEtag($contact['ETAG']);

		return $object;
	}


	/**
	 * get contact entity based on object's uri
	 * @param $objectURI
	 * @return null | []
	 */
	private function getContactFromUri($objectURI) {
		$objectURI = substr($objectURI, 0, (strlen($objectURI) - 4));
		list($addressBookId, $contactId) = explode('::', $objectURI, 2);

		if (!$addressBookId || !$contactId) {
			return null;
		}

		$contacts = $this->contactsManager->search('-', [$this->uris[$this->uri]], []);
		foreach($contacts as $contact) {
			if ($contact['addressbook-key'] === $addressBookId && $contact['id'] == $contactId) {
				return $contact;
			}
		}

		return null;
	}


	/**
	 * @param array $contact
	 * @return string
	 */
	private function getUriFromContact($contact) {
		$uri = implode('::', [
			$contact['addressbook-key'],
			$contact['id'],
		]);

		$uri .= '.ics';
		return $uri;
	}


	/**
	 * @param [] $contact
	 * @param \DateTime $date
	 * @return null|string
	 */
	private function getTitleFromContact($contact, \DateTime $date) {
		$name = strtr(strval($contact['FN']), array('\,' => ',', '\;' => ';'));
		$year = $date->format('Y');

		switch($this->uri) {
			case 'anniversary':
				$title  = '💍 ';
				$title .= $this->l10n->t('%s (%s)', [$name, $year]);
				break;

			case 'birthday':
				$title  = '🎂 ';
				$title .= $this->l10n->t('%s (%s)', [$name, $year]);
				break;

			default:
				$title = null;
				break;
		}

		return $title;
	}


	/**
	 * @param [] $contact
	 * @return boolean
	 */
	private function isObjectInteresting($contact) {
		$propertyName = $this->uris[$this->uri];
		return array_key_exists($propertyName, $contact);
	}
}
