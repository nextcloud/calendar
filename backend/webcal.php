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

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;
use \OCA\Calendar\Db\CorruptDataException;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;
use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;
use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\Subscription;
use \OCA\Calendar\Db\SubscriptionCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Utility\ObjectUtility;

use \DateTime;

class WebCal extends Backend {

	/**
	 * subscription mapper
	 * @var \OCA\Calendar\Db\SubscriptionMapper
	 */
	protected $smp;


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'WebCAL');

		$this->smp = $app->query('SubscriptionMapper');
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns array with \OCA\Calendar\Db\Calendar object
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendar($calendarURI, $userId) {
		return new Calendar();
	}


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\CalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendars($userId, $limit=null, $offset=null) {
		$subscriptions = $this->smp->findAllByType($userId, 'webcal', $limit, $offset);

		$calendars = new CalendarCollection();
		$subscriptions->interate(function($subscription) use (&$calendars) {
			if (!$this->isSubscriptionValid($subscription)) {
				return;
			}

			$calendar = $this->createCalendarFromSubscription($subscription);
			if ($calendar) {
				$calendars->add($calendar);
			}
		});

		return $calendars;
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userid
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return 0;
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		
	}


	/**
	 * @brief returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId 
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns \OCA\Calendar\Db\Object object
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(Calendar &$calendar, $objectURI) {
		throw new DoesNotExistException();
	}


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\ObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(Calendar &$calendar, $limit, $offset) {
		return new ObjectCollection();
	}


	private function createCalendarFromSubscription(Subscription $subscription) {
		$calendar = new Calendar();

		$curl = $this->prepareRequest($subscription->getUrl());
		$data = curl_exec($curl);
		$responseCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		$contentType = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);

		if ($responseCode < 200 || $responseCode >= 300) {
			return false;
		}
		if ($contentType !== 'text/calendar') {
			return false;
		}

		//we just need things like X-WR-Calname, no need to parse all objects
		$data = preg_replace(RegexUtility::VEVENT, '', $data);
		$data = preg_replace(RegexUtility::VJOURNAL, '', $data);
		$data = preg_replace(RegexUtility::VTODO, '', $data);
		$data = preg_replace(RegexUtility::VFREEBUSY, '', $data);
		$data = preg_replace(RegexUtility::VTIMEZONE, '', $data);

		try {
			$vobject = Reader::read($data);
			$calendar->fromVObject($vobject);
		} catch(ParseException $ex) {
			//TODO implement
		} catch(EofException $ex) {
			//TODO implement
		}
	}


	/**
	 * @brief validate a url
	 * @param string $url
	 * @return boolean
	 */
	public static function validateUrl($url) {
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
	private static function prepareRequest($url) {
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
	private static function wasRequestSuccessful($ch) {
		$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

		if ($responseCode < 200 || $responseCode >= 300) {
			return false;
		}
		if ($contentType !== 'text/calendar') {
			return false;
		}

		return true;
	}
}