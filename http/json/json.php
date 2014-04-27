<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Entity;

use \OCA\Calendar\Http\Serializer;
use \OCA\Calendar\Http\ISerializer;

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
	 * @param Entity $object
	 */
	public function __construct(IAppContainer $app, Entity $object) {
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