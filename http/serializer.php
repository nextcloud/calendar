<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use OCP\AppFramework\IAppContainer;

use BadFunctionCallException;

class Serializer extends Manager {

	const Backend = 1;
	const BackendCollection = 2;
	const Calendar = 3;
	const CalendarCollection = 4;
	const Object = 5;
	const ObjectCollection = 6;
	const Subscription = 7;
	const SubscriptionCollection = 8;
	const Timezone = 9;
	const TimezoneCollection = 10;


	/**
	 * reader object
	 * @var \OCA\Calendar\Http\ISerializer
	 */
	private $serializer;


	/**
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param integer $type
	 * @param resource $data
	 * @param string $requestedMimeType
	 * @throws SerializerException
	 */
	public function __construct(IAppContainer $app, $type, $data, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if (!$class) {
			$class = self::getFallback($type);
		}
		if (!$class) {
			throw new SerializerException('No serializer found.');
		}

		$this->serializer = new $class($app, $data);
	}


	/**
	 * @param string $method
	 * @param array $params
	 * @throws BadFunctionCallException
	 * @return mixed
	 */
	public function __call($method, $params) {
		if(is_callable(array($this->serializer, $method))) {
			return call_user_func_array(array($this->serializer, $method), $params);
		}
		throw new BadFunctionCallException('Call to undefined method ' . $method);
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

Serializer::set(Serializer::Subscription, 'OCA\\Calendar\\Http\\JSON\\JSONSubscription', 'application/json');
Serializer::set(Serializer::SubscriptionCollection, 'OCA\\Calendar\\Http\\JSON\\JSONSubscriptionCollection', 'application/json');

Serializer::set(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone', 'application/json');
Serializer::set(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone', 'application/calendar+json');
Serializer::set(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection', 'application/json');
Serializer::set(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection', 'application/calendar+json');

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

Serializer::setFallback(Serializer::Subscription, 'OCA\\Calendar\\Http\\JSON\\JSONSubscription');
Serializer::setFallback(Serializer::SubscriptionCollection, 'OCA\\Calendar\\Http\\JSON\\JSONSubscriptionCollection');

Serializer::setFallback(Serializer::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezone');
Serializer::setFallback(Serializer::TimezoneCollection, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneCollection');