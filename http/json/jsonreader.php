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
namespace OCA\Calendar\Http\JSON;

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\IEntity;
use OCP\Calendar\ICollection;

use OCA\Calendar\Http\IReader;
use OCA\Calendar\Http\ReaderException;

abstract class JSONReader implements IReader {

	/**
	 * data
	 * @var \OCA\Calendar\Http\IReader
	 */
	protected $handle;


	/**
	 * reader object
	 * @var \OCA\Calendar\Http\IReader
	 */
	protected $object;


	/**
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param resource $handle
	 * @throws ReaderException
	 */
	public function __construct(IAppContainer $app, $handle) {
		if(!is_resource($handle)) {
			$msg  = 'JSONReader::setHandle(): Internal Error: ';
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

		$msg  = 'JSONReader::setPbject(): Internal Error: ';
		$msg .= 'Object is neither entity nor collection!';
		throw new ReaderException($msg);
	}


	/**
	 * replaces values of props in list with null
	 * @param array
	 * @return $this
	 */
	protected function nullProperties($properties) {
		foreach($properties as $property) {
			if ($this->object instanceof ICollection) {
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