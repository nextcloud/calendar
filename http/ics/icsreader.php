<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCP\AppFramework\IAppContainer;

use OCP\Calendar\ICollection;
use OCP\Calendar\IEntity;

use OCA\Calendar\Http\IReader;
use OCA\Calendar\Http\ReaderException;


abstract class ICSReader implements IReader {

	/**
	 * data
	 * @var \OCA\Calendar\Http\IReader
	 */
	protected $handle;


	/**
	 * reader object
	 * @var mixed (IEntity|ICollection)
	 */
	protected $object;


	/**
	 * @brief Constructor
	 */
	public function __construct(IAppContainer $app, $handle) {
		if(!is_resource($handle)) {
			$msg  = 'ICSReader::setHandle(): Internal Error: ';
			$msg .= 'Not a valid handle';
			throw new ReaderException($msg);
		}

		$this->app = $app;
		$this->handle = $handle;
	}


	/**
	 * @brief sanitize input
	 * @return $this
	 */
	public function sanitize(){
		return $this;
	}


	/**
	 * @brief get object created from reader
	 * @return mixed
	 */
	public function getObject() {
		if ($this->object === null) {
			$this->parse();
		}

		return $this->object;
	}


	/**
	 * @brief set object
	 */
	protected function setObject($object) {
		if ($object instanceof IEntity || $object instanceof ICollection) {
			$this->object = $object;
			return $this;
		}

		$msg  = 'ICSReader::setPbject(): Internal Error: ';
		$msg .= 'Object is neither entity nor collection!';
		throw new ReaderException($msg);
	}


	/**
	 * @param array $properties
	 * @return $this
	 */
	protected function nullProperties($properties) {
		$isCollection = ($this->object instanceof ICollection);

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