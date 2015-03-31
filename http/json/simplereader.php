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
namespace OCA\Calendar\Http\JSON;

use OCA\Calendar\Db\EntityFactory;
use OCA\Calendar\Http\Reader;

use OCP\IRequest;

abstract class SimpleReader extends Reader {

	/**
	 * @var EntityFactory
	 */
	protected $factory;


	/**
	 * @var array
	 */
	protected $json;


	/**
	 * @param IRequest $request
	 * @param EntityFactory $factory
	 */
	public function __construct(IRequest $request, EntityFactory $factory) {
		parent::__construct($request);
		$this->factory = $factory;
		$this->json = $request->getParams();
	}


	/**
	 * parse input data
	 * @return $this
	 */
	public function parse() {
		$data = [];

		foreach($this->json as $key => $value) {
			$this->setProperty($data, $key, $value);
		}

		$entity = $this->factory->createEntity($data, EntityFactory::FORMAT_PARAM);
		$this->setObject($entity);
	}


	/**
	 * set property in entity based on key-value pair from input data
	 * @param array $data
	 * @param string $key
	 * @param mixed $value
	 */
	abstract protected function setProperty(&$data, $key, $value);
}