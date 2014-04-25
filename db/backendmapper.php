<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;

class BackendMapper extends Mapper {

	/**
	 * IAppContainer object
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * name of config
	 * @var string
	 */
	protected $configName;


	/**
	 * backendcollection object
	 * @var \OCA\Calendar\Db\BackendCollectiom
	 */
	private $backendCollection;


	/**
	 * whether or not object changed
	 * @var boolean
	 */
	private $didChange=false;


	/**
	 * @brief Constructor
	 * @param IAppContainer $api: Instance of the API abstraction layer
	 * @param string $configName
	 */
	public function __construct(IAppContainer $app, $configName='calendar_backends'){
		$this->app = $app;
		$this->configName = $configName;

		$backends = \OCP\Config::getSystemValue($configName);
		if ($backends === null) {
			$backends = $app->query('fallbackBackendConfig');
		}

		$backendCollection = new BackendCollection();

		foreach($backends as $id => $backend) {
			$backend = new Backend($backend);
			$backend->setId($id);

			$backendCollection->add($backend);
		}

		$this->backendCollection = $backendCollection;
	}


	/**
	 * @brief Destructor - write changes
	 * @param API $api: Instance of the API abstraction layer
	 */
	public function __destruct() {
		if ($this->didChange) {
			$newConfig = $this->backendCollection->getObjects();
			//\OCP\Config::setSystemValue($this->configName, $newConfig);
		}
	}


	/**
	 * @brief Finds an item by it's name
	 * @param string $backend name of backend
	 * @throws DoesNotExistException: if the item does not exist
	 * @return the backend item
	 */
	public function find($backend){
		return $this->backendCollection->find($backend);
	}


	/**
	 * Finds all Items
	 * @return array containing all items
	 */
	public function findAll(){
		return $this->backendCollection;
	}


	/**
	 * Finds all Items where enabled is ?
	 * @return array containing all items where enabled is ?
	 */
	public function findWhereEnabledIs($isEnabled){
		return $this->backendCollection->search('enabled', $isEnabled);
	}


	/**
	 * Saves an item into the database
	 * @param Item $item: the item to be saved
	 * @return $this
	 */
	public function insert(Entity $item){
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * Updates an item
	 * @param Item $item: the item to be updated
	 * @return $this
	 */
	public function update(Entity $item){
		$this->backendCollection->removeByProperty('id', $item->getId());
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * Deletes an item
	 * @param Entity $item: the item to be deleted
	 * @return $this
	 */
	public function delete(Entity $item){
		$this->backendCollection->removeByEntity($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * get backend object of default backend
	 * @return Backend object
	 */
	public function getDefault() {
		return $this->find($this->app->query('defaultBackend'));
	}
}