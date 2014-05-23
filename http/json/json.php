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

use OCA\Calendar\Http\ISerializer;

abstract class JSON implements ISerializer {

	/**
	 * @brief app container
	 * @var IAppContainer $app
	 */
	protected $app;


	/**
	 * @brief object
	 * @var mixed (Entity|Collection)
	 */
	protected $object;


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param IEntity $object
	 */
	public function __construct(IAppContainer $app, IEntity $object) {
		$this->app = $app;
		$this->object = $object;
	}


	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array(
			'X-Content-Type-Options' => 'nosniff',
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	abstract public function serialize();
}