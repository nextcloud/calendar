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
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\Http\Reader;
use OCA\Calendar\Http\ReaderException;

use OCP\IRequest;

class ObjectReader extends Reader {

	/**
	 * @var ObjectFactory
	 */
	protected $factory;


	/**
	 * @param IRequest $request
	 * @param ObjectFactory $factory
	 */
	public function __construct(IRequest $request, ObjectFactory $factory) {
		parent::__construct($request);
		$this->factory = $factory;
	}


	/**
	 * parse json object
	 * @throws ReaderException
	 * @return $this
	 */
	public function parse() {
		try {
			$object = $this->factory->createCollectionFromData($this->request->getParams(), ObjectFactory::FORMAT_ICAL);
		} catch(/* TODO */\Exception $ex) {
			throw new ReaderException($ex->getMessage(), $ex->getCode(), $ex);
		}

		$this->setObject($object);
	}
}