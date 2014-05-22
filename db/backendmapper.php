<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCP\AppFramework\IAppContainer;
use OCP\Config;

use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendCollection;

class BackendMapper extends Mapper {

	/**
	 * IAppContainer object
	 * @var IAppContainer
	 */
	protected $app;


	/**
	 * name of config
	 * @var string
	 */
	protected $configName;


	/**
	 * backend-collection object
	 * @var BackendCollection
	 */
	private $backendCollection;


	/**
	 * whether or not object changed
	 * @var bool
	 */
	private $didChange=false;


	/**
	 * @param IAppContainer $app
	 * @param string $configName
	 */
	public function __construct(IAppContainer $app, $configName='calendar_backends'){
		$this->app = $app;
		$this->configName = $configName;

		$backends = Config::getSystemValue($configName);
		if ($backends === null) {
			$backends = $app->query('fallbackBackendConfig');
		}

		$backendCollection = new BackendCollection();

		foreach($backends as $id => $backendData) {
			$backend = new Backend($backendData);
			$backend->setId($id);

			$backendCollection->add($backend);
		}

		$this->backendCollection = $backendCollection;
	}


	/**
	 * @brief saves config
	 */
	public function __destruct() {
		if ($this->didChange) {
			$newConfig = $this->backendCollection->getObjects();
			Config::setSystemValue($this->configName, $newConfig);
		}
	}


	/**
	 * @brief Finds an item by it's name
	 * @param string $backend name of backend
	 * @throws DoesNotExistException: if the item does not exist
	 * @return IBackend
	 */
	public function find($backend){
		return $this->backendCollection->find($backend);
	}


	/**
	 * Finds all Items
	 * @return IBackendCollection
	 */
	public function findAll(){
		return $this->backendCollection;
	}


	/**
	 * @param $isEnabled
	 * @return BackendCollection
	 */
	public function findWhereEnabledIs($isEnabled){
		return $this->backendCollection->search('enabled', $isEnabled);
	}


	/**
	 * @param Entity $item
	 * @return $this
	 */
	public function insert(Entity $item){
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * @param Entity $item
	 * @return $this
	 */
	public function update(Entity $item){
		$this->backendCollection->removeByProperty('id', $item->getId());
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * @param Entity $item
	 * @return $this|void
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
		return $this->app->query('defaultBackend');
	}
}