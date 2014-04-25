<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use \OCP\AppFramework\IAppContainer;

class Reader extends Manager implements IReader {

	const Calendar = 107;
	const Object = 108;
	const Timezone = 109;


	/**
	 * reader object
	 * @var \OCA\Calendar\Http\IReader
	 */
	private $reader;


	/**
	 * @brief Constructor
	 * @param integer $type
	 * @param mixed $data
	 * @param string $requestedMimeType
	 */
	public function __construct(IAppContainer $app, $type, $data, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if (!$class) {
			throw new \Exception('No reader found.');
		}

		$this->reader = new $class($app);
		$this->reader->setData($data);
	}


	public function __call($method, $params) {
		if(is_callable(array($this->reader, $method))) {
			return call_user_func_array(array($this->reader, $method), $params);
		}
		throw new \BadFunctionCallException('Call to undefined method ' . $method);
	}
}

Reader::set(Reader::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarReader', 'application/json');
Reader::set(Reader::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarReader', 'application/calendar+json');
Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObjectReader', 'application/json');
Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObjectReader', 'application/calendar+json');
Reader::set(Reader::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneReader', 'application/json');
Reader::set(Reader::Timezone, 'OCA\\Calendar\\Http\\JSON\\JSONTimezoneReader', 'application/calendar+json');

Reader::set(Reader::Calendar, 'OCA\\Calendar\\Http\\ICS\\ICSCalendarReader', 'text/calendar');
Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\ICS\\ICSObjectReader', 'text/calendar');