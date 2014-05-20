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
namespace OCA\Calendar\Backend;

use OCP\AppFramework\IAppContainer;

use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\Calendar\ISubscription;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;

use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Sabre\VObject\ParseException;

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;
use OCA\Calendar\Db\CorruptDataException;


use OCA\Calendar\Db\Subscription;

use OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer;

use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;

use OCA\Calendar\Utility\ObjectUtility;
use OCA\Calendar\Utility\RegexUtility;

use DateTime;

class WebCal extends Backend {

	/**
	 * subscription-businesslayer
	 * @var SubscriptionBusinessLayer
	 */
	protected $subscriptions;


	/**
	 * @type string
	 */
	const TYPE = 'webcal';


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'WebCal');

		$this->subscriptions = $app->query('SubscriptionBusinessLayer');
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendar($calendarURI, $userId) {
		$subscription = $this->subscriptions->find($calendarURI, $userId);
		if (!$this->isSubscriptionValid($subscription)) {
			throw new DoesNotExistException('Subscription exists, but is not valid!');
		}

		$calendar = $this->createCalendarFromSubscription($subscription);
		if ($calendar === false) {
			throw new DoesNotExistException('Calendar is corrupt!');
		} else {
			return $calendar;
		}
	}


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendars($userId, $limit, $offset) {
		$subscriptions = $this->subscriptions->findAllByType($userId, self::TYPE, $limit, $offset);

		$calendars = new CalendarCollection();
		$subscriptions->iterate(function(ISubscription $subscription) use (&$calendars, $userId) {
			if (!$this->isSubscriptionValid($subscription)) {
				return;
			}

			$calendar = $this->createCalendarFromSubscription($subscription);
			if ($calendar !== false) {
				$calendars->add($calendar);
			}
		});

		return $calendars;
	}


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getCalendarIdentifiers($userId, $limit, $offset) {
		return $this->subscriptions->findAllByType($userId, self::TYPE, $limit, $offset);
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userId
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return $this->subscriptions->countByType($userId, self::TYPE);
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		return $this->subscriptions->doesExistOfType($calendarURI, self::TYPE, $userId);
	}


	/**
	 * @brief returns information about the object (event/journal/todos) with the uid $objectURI in the calendar $calendarURI of the user $userId
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @returns IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(ICalendar &$calendar, $objectURI) {
		$object = new Object();
		((($object)));
		throw new DoesNotExistException();
	}


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		return new ObjectCollection();
	}


	/**
	 * @param Subscription $subscription
	 * @return mixed (bool|Calendar)
	 */
	private function createCalendarFromSubscription(Subscription $subscription) {
		$curl = $this->prepareRequest($subscription->getUrl());
		$data = curl_exec($curl);
		if (!$this->wasRequestSuccessful($curl)) {
			return false;
		}

		$headerLength = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
		$data = substr($data, $headerLength);

		//we just need things like X-WR-Calname, no need to parse all objects
		$data = preg_replace(RegexUtility::VEVENT, '', $data);
		$data = preg_replace(RegexUtility::VJOURNAL, '', $data);
		$data = preg_replace(RegexUtility::VTODO, '', $data);
		$data = preg_replace(RegexUtility::VFREEBUSY, '', $data);
		//$data = preg_replace(RegexUtility::VTIMEZONE, '', $data);

		try {
			$vobject = Reader::read($data);
			$calendar = new Calendar();
			$calendar->fromVObject($vobject);
		} catch(ParseException $ex) {
			//TODO - implement
			return false;
		}

		$calendar->setUserId($subscription->getUserId());
		$calendar->setOwnerId($subscription->getUserId());
		$calendar->setBackend($this->backend);
		$calendar->setUri($subscription->getName());
		$calendar->setComponents(ObjectType::EVENT);
		//TODO - use something better
		$calendar->setCtag(time());

		return $calendar;
	}


	private function isSubscriptionValid(ISubscription $subscription) {
		if ($subscription->getType() !== self::TYPE) {
			return false;
		}

		$url = $subscription->getUrl();
		$parsed = parse_url($url);
		if (!$parsed) {
			return false;
		}
		if (!array_key_exists('host', $parsed)) {
			return false;
		}
		if ($parsed['scheme'] === 'webcal') {
			$parsed['scheme'] = 'http';
		}
		if ($parsed['scheme'] !== 'http' && $parsed['scheme'] !== 'https') {
			return false;
		}

		//TODO - are more checks necessary?

		return true;
	}


	/**
	 * @brief validate a url
	 * @param string $url
	 * @return boolean
	 */
	public function validateUrl($url) {
		$components = parse_url($url);

		if (!$components) {
			return false;
		}
		if (!array_key_exists('scheme', $components)) {
			return false;
		}
		if ($components['scheme'] !== 'http' && $components['scheme'] !== 'https') {
			return false;
		}

		$curl = self::prepareRequest($url);
		$data = curl_exec($curl);
		$responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

		if ($responseCode < 200 || $responseCode >= 300) {
			return false;
		}
		if ($contentType !== 'text/calendar') {
			return false;
		}

		$curl = self::prepareRequest($url);
		curl_setopt($curl, CURLOPT_NOBODY, true);

		curl_exec($curl);

		return self::wasRequestSuccessful($curl);
	}



	/**
	 * @brief prepare curl request
	 * @param string $url
	 * @return resource $ch
	 */
	private function prepareRequest($url) {
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_HEADER, true);

		return $ch;
	}


	/**
	 * @brief check if a request was successful
	 * @param resource $ch
	 * @return boolean
	 */
	private function wasRequestSuccessful($ch) {
		$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

		if ($responseCode < 200 || $responseCode >= 300) {
			return false;
		}
		if (substr($contentType, 0, 13) !== 'text/calendar') {
			return false;
		}

		return true;
	}



}