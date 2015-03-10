<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Http;

use OCA\Calendar\IEntity;
use OCA\Calendar\ICollection;

abstract class Reader {

	/**
	 * input data stream
	 * @var resource
	 */
	protected $handle;


	/**
	 * result of input-parser
	 * @var ICollection|IEntity
	 */
	protected $object;


	/**
	 * @param resource $handle
	 */
	public function __construct($handle) {
		if (!is_resource($handle)) {
			$this->handle = fopen('data://text/plain;base64,', 'rb');
		} else {
			$this->handle = $handle;
		}

		$this->object = null;
	}


	/**
	 * get result from parser
	 * @return ICollection|IEntity
	 */
	public function getObject() {
		if (is_null($this->object)) {
			$this->parse();
		}

		return $this->object;
	}


	/**
	 * sets the object, supposed to be called by parse()
	 * @param IEntity|ICollection $object
	 */
	protected function setObject($object) {
		if ($object instanceof IEntity || $object instanceof ICollection) {
			$this->object = $object;
		}
	}


	/**
	 * parse the actual input
	 */
	abstract protected function parse();
}