<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use \OCP\AppFramework\IAppContainer;

class Serializer extends Manager {

	const Calendar = 1;
	const CalendarCollection = 2;
	const Object = 3;
	const ObjectCollection = 4;
	const Timezone = 5;
	const TimezoneCollection = 6;

	const Backend = 7;
	const BackendCollection = 8;

	/**
	 * reader object
	 * @var \OCA\Calendar\Http\ISerializer
	 */
	private $serializer;


	public function __construct(IAppContainer $app, $type, $data, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if (!$class) {
			$class = self::getFallback($type);
		}
		if (!$class) {
			throw new Exception('No serializer found.');
		}

		$this->serializer = new $class($app);
		$this->serializer->setObject($data);
	}

	public function __call($method, $params) {
		if(is_callable(array($this->serializer, $method))) {
			return call_user_func_array(array($this->serializer, $method), $params);
		}
		throw new \BadFunctionCallException('Call to undefined method ' . $method);
	}
}

Serializer::set(Serializer::Backend, 'OCA\\Calendar\\Http\\JSON\\JSONBackend', 'application/json');
Serializer::set(Serializer::BackendCollection, 'OCA\\Calendar\\Http\\JSON\\JSONBackendCollection', 'application/json');
Serializer::set(Serializer::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendar', 'application/json');
Serializer::set(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarCollection', 'application/json');
Serializer::set(Serializer::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObject', 'application/json');
Serializer::set(Serializer::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObject', 'application/calendar+json');
Serializer::set(Serializer::ObjectCollection, 'OCA\\Calendar\\Http\\JSON\\JSONObjectCollection', 'application/json');
Serializer::set(Serializer::ObjectCollection, 'OCA\\Calendar\\Http\\JSON\\JSONObjectCollection', 'application/calendar+json');
Serializer::set(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone', 'application/json');
Serializer::set(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone', 'application/calendar+json');
Serializer::set(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection', 'application/json');
Serializer::set(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection', 'application/calendar+json');

Serializer::set(Serializer::Calendar, 'OCA\\Calendar\\Http\\ICS\\ICSCalendar', 'text/calendar');
Serializer::set(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\ICS\\ICSCalendarCollection', 'text/calendar');
Serializer::set(Serializer::Object, 'OCA\\Calendar\\Http\\ICS\\ICSObject', 'text/calendar');
Serializer::set(Serializer::ObjectCollection, 'OCA\\Calendar\\Http\\ICS\\ICSObjectCollection', 'text/calendar');
Serializer::set(Serializer::Timezone, 'OCA\\Calendar\\Http\\ICS\\ICSTimezone', 'text/calendar');
Serializer::set(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\ICS\\ICSTimezoneCollection', 'text/calendar');

Serializer::setFallback(Serializer::Backend, 'OCA\\Calendar\\Http\\JSON\\JSONBackend');
Serializer::setFallback(Serializer::BackendCollection, 'OCA\\Calendar\\Http\\JSON\\JSONBackendCollection');
Serializer::setFallback(Serializer::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendar');
Serializer::setFallback(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarCollection');
Serializer::setFallback(Serializer::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObject');
Serializer::setFallback(Serializer::ObjectCollection, 'OCA\\Calendar\\Http\\JSON\\JSONObjectCollection');
Serializer::setFallback(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone');
Serializer::setFallback(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection');