<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Backend;
use \OCA\Calendar\Db\BackendCollection;
use \OCA\Calendar\Db\BackendMapper;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\CalendarUtility;
use \OCA\Calendar\Utility\ObjectUtility;

class BackendBusinessLayer extends BusinessLayer {

	/**
	 * app container for dependency injection
	 * @var \OCA\Calendar\BusinessLayer\BackendBusinessLayer
	 */
	private $bmp;


	/**
	 * Constructor
	 * @param IAppContainer $app interface to the app
	 * @param BackendBusinessLayer $backendBusinessLayer
	 */
	public function __construct(IAppContainer $app, BackendMapper $backendMapper){
		parent::__construct($app);
		$this->bmp = $backendMapper;
	}


	/**
	 * @brief get the default backend
	 * @return string
	 */
	public function getDefault(){
		return $this->bmp->getDefault();
	}


	/**
	 * @brief set the default backend
	 * @param string $backend
	 */
	public function setDefault($backend){
		return $this->bmp->setDefault($backend);
	}


	/**
	 * @brief find a backend
	 * @param string $backend
	 * @return \OCA\Calendar\Db\Backend
	 */
	public function find($backendId) {
		try {
			return $this->bmp->find($backendId);
		} catch(DoesNotExistException $ex){
			throw new BusinessLayerException($ex->getMessage());
		} catch(MultipleObjectsReturnedException $ex){
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * @brief find all backend
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\Db\BackendCollection
	 */
	public function findAll($limit=null, $offset=null) {
		return $this->bmp->findAll($limit, $offset);
	}


	/**
	 * @brief find all disabled backend
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\Db\BackendCollection
	 */
	public function findAllDisabled($limit=null, $offset=null) {
		return $this->bmp->findWhereEnabledIs(false, $limit, $offset);
	}


	/**
	 * @brief find all enabled backend
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\Db\BackendCollection
	 */
	public function findAllEnabled($limit=null, $offset=null) {
		return $this->bmp->findWhereEnabledIs(true, $limit, $offset);
	}


	/**
	 * @brief create a backend
	 * @param Backend $backend
	 */
	public function create(Backend $backend) {
		if ($this->bmp->doesExist($backend)) {
			$msg  = 'BackendBusinessLayer::create(): ';
			$msg .= 'Backend already exists';
			throw new BusinessLayerException($msg, BusinessLayerException::CONFLICT);
		}

		return $this->bmp->create($create);
	}


	/**
	 * @brief update a backend
	 * @param Backend $backend
	 */
	public function update(Backend $backend) {
		return $this->bmp->update($backend);
	}


	/**
	 * @brief enable a backend
	 * @param string $backend
	 */
	public function enable($backendId){
		$backend = $this->find($backendId)->setEnabled(true);
		return $this->bmp->update($backend);
	}


	/**
	 * @brief disable a backend
	 * @param string $backend
	 */
	public function disable($backendId){
		$backend = $this->find($backendId)->setEnabled(false);
		return $this->bmp->update($backend);
	}


	/**
	 * @brief delete a backend
	 * @param Backend $backend
	 */
	public function delete(Backend $backend) {
		return $this->bmp->delete($backend);
	}


	/**
	 * @brief setup backends
	 * @throws BusinessLayerException if no backends could be setup
	 */
	public function setup() {
		$backendCollection = new BackendCollection();

		$enabledBackends = $this->findAllEnabled();
		$enabledBackends->iterate(function($backend) use (&$backendCollection) {
			$className = $backend->getClassname();
			$args = is_array($backend->getArguments()) ? $backend->getArguments() : array();

			if (class_exists($className) === false){
				$msg  = 'BackendBusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" not found';
				\OCP\Util::writeLog('calendar', $msg, \OCP\Util::DEBUG);
				$this->update($backend->disable());
				return false;
			}

			if ($backendCollection->search('backend', $backend->getBackend())->count() > 0) {
				$msg  = 'BackendBusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" already initialized. ';
				$msg .= 'Please check for double entries';
				\OCP\Util::writeLog('calendar', $msg, \OCP\Util::DEBUG);
				return false;
			}

			$reflectionObj = new \ReflectionClass($className);
			$api = $reflectionObj->newInstanceArgs(array($this->app, $args, $this));
			$backend->registerAPI($api);

			//check if a backend can enabled
			if ($backend->api->canBeEnabled()) {
				$backendCollection->add($backend);
			}
		});

		if ($backendCollection->count() === 0){
			$msg  = 'BackendBusinessLayer::setupBackends(): ';
			$msg .= 'No backend was setup successfully';
			throw new BusinessLayerException($msg);
		}

		return $backendCollection;
	}
}