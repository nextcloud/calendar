<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

use \OCP\AppFramework\IAppContainer;

class Reader extends Manager {

	const Calendar = 101;
	const Object = 102;
	const Subscription = 103;


	/**
	 * reader object
	 * @var \OCA\Calendar\Http\IReader
	 */
	private $reader;


	/**
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param integer $type
	 * @param resource $handle
	 * @param string $requestedMimeType
	 */
	public function __construct(IAppContainer $app, $type, $handle, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if (!$class) {
			throw new ReaderException('No reader for mimeType found.');
		}

		$this->reader = new $class($app, $handle);
	}


	/**
	 * @brief hand over function calls to reader instance
	 * @return mixed
	 */
	public function __call($method, $params) {
		if(is_callable(array($this->reader, $method))) {
			return call_user_func_array(array($this->reader, $method), $params);
		}
		throw new \BadFunctionCallException('Call to undefined method ' . $method);
	}
}

Reader::set(Reader::Calendar, 'OCA\\Calendar\\Http\\JSON\\JSONCalendarReader', 'application/json');
Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObjectReader', 'application/json');
Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\JSON\\JSONObjectReader', 'application/calendar+json');
Reader::set(Reader::Subscription, 'OCA\\Calendar\\Http\\JSON\\JSONSubscriptionReader', 'application/json');

Reader::set(Reader::Object, 'OCA\\Calendar\\Http\\ICS\\ICSObjectReader', 'text/calendar');