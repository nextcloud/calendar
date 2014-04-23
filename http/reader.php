<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

class Reader extends Manager implements IReader {

	const Calendar = 7;
	const Object = 8;
	const Timezone = 9;

	private $reader;

	/**
	 * @brief Constructor
	 * @param integer $type
	 * @param mixed $data
	 * @param string $requestedMimeType
	 */
	public function __construct($type, $data, $requestedMimeType) {
		$class = self::get($type, $requestedMimeType);
		if(!$class) {
			throw new \Exception('No reader found.');
		}

		$this->reader = new $class();
		$this->reader->setData($data);
	}

	/**
	 * @brief get object
	 * @return mixed (\OCA\Calendar\Db\Entity|\OCA\Calendar\Db\Collection)
	 */
	public function getObject() {
		return $this->reader->getObject();
	}

	/**
	 * @brief is object a collection
	 * @return boolean
	 */
	public function isCollection() {
		return $this->reader->isCollection();
	}

	/**
	 * @brief parse data
	 */
	public function parse() {
		$this->reader->parse();
		return $this;
	}

	/**
	 * @brief set data
	 * @param mixed $data
	 */
	public function setData($data) {
		$this->reader->setData($data);
		return $this;
	}

	public function sanitize() {
		$this->reader->sanitize();
		return $this;
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
Reader::set(Reader::Timezone, 'OCA\\Calendar\\Http\\ICS\\ICSTimezoneReader', 'text/calendar');