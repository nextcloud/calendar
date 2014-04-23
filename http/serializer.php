<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

class Serializer extends Manager implements ISerializer {

	const Calendar = 1;
	const CalendarCollection = 2;
	const Object = 3;
	const ObjectCollection = 4;
	const Timezone = 5;
	const TimezoneCollection = 6;

	private $serializer;

	public function __construct($type, $data, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if(!$class) {
			$class = self::getFallback($type);
		}
		if(!$class) {
			throw new Exception('No serializer found.');
		}

		$this->serializer = new $class();
		$this->serializer->setObject($data);
	}

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return $this->serializer->getHeaders();
	}

	/**
	 * @brief get serialized data
	 * @return string
	 */
	public function serialize($convenience=true) {
		return $this->serializer->serialize($convenience);
	}

	/**
	 * @brief set object
	 * @param mixed $object
	 */
	public function setObject($object) {
		$this->serializer->setObject($object);
		return $this;
	}
}

Serializer::set(Serializer::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendar', 'application/json');
Serializer::set(Serializer::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendar', 'application/calendar+json');
Serializer::set(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarCollection', 'application/json');
Serializer::set(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarCollection', 'application/calendar+json');
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

Serializer::setFallback(Serializer::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendar');
Serializer::setFallback(Serializer::CalendarCollection, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarCollection');
Serializer::setFallback(Serializer::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObject');
Serializer::setFallback(Serializer::ObjectCollection, 'OCA\\Calendar\\Http\\JSON\\JSONObjectCollection');
Serializer::setFallback(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone');
Serializer::setFallback(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection');