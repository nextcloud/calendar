<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Db\Entity;
use \OCA\Calendar\Db\Collection;

use \OCA\Calendar\Http\IReader;

abstract class JSONReader implements IReader {

	protected $data;
	protected $object;

	/**
	 * @brief Constructor
	 */
	public function __construct($json=null) {
		if ($json !== null) {
			$this->setData($json);
		}
	}

	/**
	 * @brief get data
	 * @return mixed
	 */
	protected function getData() {
		return $this->data;
	}

	/**
	 * @brief sanitize input
	 * @return $this
	 */
	public function sanitize(){
		return $this;
	}

	/**
	 * @brief set data
	 */
	public function setData($json) {
		//reset object
		$this->object = null;

		if (is_array($json)) {
			$this->data = $json;
			return $this;
		}

		if (is_string($json)) {
			if (trim($json) === '') {
				$msg  = 'JSONReader::setData(): User Error: ';
				$msg .= 'Given string is empty';
				throw new JSONReaderException($msg);
			}

			$data = json_decode($json, true);
			if (!is_string($data)) {
				$msg  = 'JSONReader::setData(): User Error: ';
				$msg .= 'Could not parse given (json) string!';
				throw new JSONReaderException($msg);
			}

			$this->data = $data;
			return $this;
		}

		$msg  = 'JSONReader::setData(): User Error: ';
		$msg .= 'Could not recognise given data format!';
		throw new JSONReaderException($msg);
	}

	/**
	 * @brief get object created from reader
	 */
	public function getObject() {
		if ($this->getData() === null) {
			$msg  = 'JSONReader::getObject(): Internal Error: ';
			$msg .= 'getObject may not be called before any data was set!';
			throw new JSONReaderException($msg);
		}

		if ($this->object === null) {
			$this->parse();
		}

		return $this->object;
	}

	/**
	 * @brief set object
	 */
	protected function setObject($object) {
		if (($object instanceof Entity) ||
		   ($object instanceof Collection)) {
			$this->object = $object;
			return $this;
		}

		return null;
	}

	/**
	 * @brief get if reader will return collection
	 */
	public function isCollection() {
		if ($this->object === null) {
			$this->parse();
		}

		return ($this->object instanceof Collection);
	}

	/**
	 * @brief null properties
	 * @param array of strings
	 * 		  string should represent key
	 */
	protected function nullProperties($properties) {
		$isCollection = $this->isCollection();

		foreach($properties as $property) {
			if ($isCollection) {
				$this->object->setProperty($property, null);
			} else {
				$setter = 'set' . ucfirst($property);
				$this->object->{$setter}(null);
			}
		}

		return $this;
	}

	abstract public function parse();
}

class JSONReaderException extends \Exception {}