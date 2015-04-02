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
use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;

use OCA\Contacts\App as ContactsApp;

use OCP\IL10N;

class Calendar extends Contact implements BackendUtils\ICalendarAPI {

	/**
	 * @var \OCA\Calendar\IBackend
	 */
	private $backend;


	/**
	 * @var IL10N
	 */
	private $l10n;


	/**
	 * @var CalendarFactory
	 */
	private $factory;


	/**
	 * @param ContactsApp $contacts
	 * @param IBackend $backend
	 * @param IL10N $l10n
	 * @param CalendarFactory $factory
	 */
	public function __construct(ContactsApp $contacts, IBackend $backend, IL10N $l10n, CalendarFactory $factory) {
		parent::__construct($contacts);

		$this->backend = $backend;
		$this->l10n = $l10n;
		$this->factory = $factory;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($privateUri, $userId) {
		if (!array_key_exists($privateUri, $this->uris)) {
			throw new BackendUtils\DoesNotExistException(
				$privateUri . 'does not exist!'
			);
		}

		return $this->factory->createEntity([
			'userId' => $userId,
			'ownerId' => $userId,
			'backend'=> $this->backend,
			'privateUri' => $privateUri,
			'components' => ObjectType::EVENT,
			'cruds' => Permissions::READ + Permissions::SHARE,
			'color' => 'rgba(77,87,100,0.75)',
			'order' => 0,
			'enabled' => true,
			'displayname' => $this->generateDisplayname($privateUri),
			'ctag' => $this->generateCTag(),
		], CalendarFactory::FORMAT_PARAM);
	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$calendars = [];

		foreach($this->uris as $uri => $property) {
			$calendars[] = $this->find($uri, $userId);
		}

		return $this->factory
			->createCollectionFromEntities($calendars)
			->subset($limit, $offset);
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($userId) {
		return array_keys($this->uris);
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(ICalendar $calendar) {
		$oldCTag = $calendar->getCtag();
		$currentCTag = $this->generateCTag();

		return ($oldCTag !== $currentCTag);
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


	/**
	 * @param $privateUri
	 * @return string
	 */
	private function generateDisplayname($privateUri) {
		$displayname = '';
		switch($privateUri) {
			case 'anniversary':
				$displayname = $this->l10n->t('Anniversary');
				break;

			case 'birthday':
				$displayname = $this->l10n->t('Birthday');
				break;

			default:
				break;
		}

		return strval($displayname);
	}
}