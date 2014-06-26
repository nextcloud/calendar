<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCA\Calendar\Utility\BackendUtility;
use OCP\AppFramework\IAppContainer;
use OCP\Calendar\IEntity;
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
	 * Finds all Items
	 * @return IBackendCollection
	 */
	public function findAllWithApi() {
		$enabled = $this->findAll();
		return BackendUtility::setup($this->app, $enabled);
	}


	/**
	 * Finds all Items
	 * @return IBackendCollection
	 */
	public function findAllEnabled(){
		return $this->findWhereEnabledIs(true);
	}


	/**
	 * Finds all Items
	 * @return IBackendCollection
	 */
	public function findAllDisabled(){
		return $this->findWhereEnabledIs(false);
	}


	/**
	 * @param $isEnabled
	 * @return BackendCollection
	 */
	public function findWhereEnabledIs($isEnabled){
		return $this->backendCollection->search('enabled', $isEnabled);
	}


	/**
	 * @param IEntity $item
	 * @return $this
	 */
	public function insert(IEntity $item){
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * @param IEntity $item
	 * @return $this
	 */
	public function update(IEntity $item){
		$this->backendCollection->removeByProperty('id', $item->getId());
		$this->backendCollection->add($item);

		$this->didChange = true;
		return $this;
	}


	/**
	 * @param IEntity $item
	 * @return $this|void
	 */
	public function delete(IEntity $item){
		$this->backendCollection->removeByEntity($item);

		$this->didChange = true;
		return $this;
	}
}