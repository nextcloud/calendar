<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\ICS;

use OCP\AppFramework\IAppContainer;
use OCA\Calendar\Db\Entity;
use OCA\Calendar\Http\ISerializer;
use OCP\Calendar\IEntity;

abstract class ICS implements ISerializer {

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
	 */
	public function __construct(IAppContainer $app) {
		$this->app = $app;
	}


	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array();
	}


	/**
	 * @brief get object JSONObject was initialized with.
	 */
	public function getObject() {
		return $this->object;
	}


	/**
	 * @brief set object
	 * @param IEntity $object
	 * @return mixed ($this|null)
	 */
	public function setObject(IEntity $object) {
		if ($object instanceof Entity) {
			$this->object = $object;
			return $this;
		}
		return null;
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	abstract public function serialize();
}