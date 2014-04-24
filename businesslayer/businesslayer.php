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

abstract class BusinessLayer {

	/**
	 * app container for dependency injection
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * ownCloud's core api
	 * @var \OCP\AppFramework\IApi
	 */
	protected $api;


	/**
	 * app container for dependency injection
	 * @var \OCA\Calendar\BusinessLayer\BackendBusinessLayer
	 */
	private $bmp;


	/**
	 * Backend Collection
	 * @var \OCA\Calendar\Db\BackendCollection
	 */
	protected $backends;


	/**
	 * Constructor
	 * @param IAppContainer $app interface to the app
	 * @param BackendBusinessLayer $backendBusinessLayer
	 */
	public function __construct(IAppContainer $app, BackendMapper $backendMapper){
		$this->app = $app;
		$this->bmp = $backendMapper;
		$this->api = $app->getCoreApi();

		$this->setupBackends();
	}


	/**
	 * @brief split up calendarURI
	 * @param string $calendarId e.g. local::personal
	 * @return array [$backend, $calendarURI]
	 * @throws BusinessLayerException if uri is empty
	 * @throws BusinessLayerException if uri is not valid
	 */
	final protected function splitCalendarURI($calendarId) {
		$split = CalendarUtility::splitURI($calendarId);

		if($split[0] === false || $split[1] === false) {
			$msg  = 'BusinessLayer::splitCalendarURI(): User Error: ';
			$msg .= 'Given calendarId is not valid!';
			throw new BusinessLayerException($msg);
		}

		return $split;
	}


	/**
	 * @brief check if a backend does support a certian action
	 * @param string $backend
	 * @param integer $action
	 * @return boolean
	 */
	final protected function doesBackendSupport($backend, $action) {
		return $this->backends->search('backend', $backend)->current()->api->implementsActions($action);
	}


	/**
	 * @brief check if a backend is enabled
	 * @param string $backend
	 * @return boolean
	 */
	final protected function isBackendEnabled($backend) {
		try {
			return $this->backends->search('backend', $backend)->current()->getEnabled();
		} catch(DoesNotExistException $ex){
			throw new BusinessLayerException($ex->getMessage());
		} catch(MultipleObjectsReturnedException $ex){
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * @brief get the default backend
	 * @return string
	 */
	final protected function getDefaultBackend(){
		return $this->bmp->getDefault();
	}


	/**
	 * @brief set the default backend
	 * @param string $backend
	 */
	final protected function setDefaultBackend($backend){
		return $this->bmp->setDefault($backend);
	}


	/**
	 * @brief find a backend
	 * @param string $backend
	 * @return \OCA\Calendar\Db\Backend
	 */
	final protected function findBackend($backendId) {
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
	final protected function findAllBackends($limit=null, $offset=null) {
		return $this->bmp->findAll($limit, $offset);
	}


	/**
	 * @brief find all disabled backend
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\Db\BackendCollection
	 */
	final protected function findAllDisabledBackeds($limit=null, $offset=null) {
		return $this->bmp->findWhereEnabledIs(false, $limit, $offset);
	}


	/**
	 * @brief find all enabled backend
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\Db\BackendCollection
	 */
	final protected function findAllEnabledBackends($limit=null, $offset=null) {
		return $this->bmp->findWhereEnabledIs(true, $limit, $offset);
	}


	/**
	 * @brief create a backend
	 * @param Backend $backend
	 */
	final protected function createBackend(Backend $backend) {
		if($this->bmp->doesExist($backend)) {
			$msg  = 'BusinessLayer::allowNoBackendTwice(): ';
			$msg .= 'Backend already exists';
			throw new BusinessLayerException($msg, BusinessLayerException::CONFLICT);
		}

		return $this->bmp->create($create);
	}


	/**
	 * @brief update a backend
	 * @param Backend $backend
	 */
	final protected function updateBackend(Backend $backend) {
		return $this->bmp->update($backend);
	}


	/**
	 * @brief enable a backend
	 * @param string $backend
	 */
	final protected function enableBackend($backendId){
		$backend = $this->findBackend($backendId)->setEnabled(false);
		return $this->bmp->update($backend);
	}


	/**
	 * @brief disable a backend
	 * @param string $backend
	 */
	final protected function disableBackend($backendId){
		$backend = $this->findByName($backendId)->setEnabled(true);
		return $this->bmp->update($backend);
	}


	/**
	 * @brief delete a backend
	 * @param Backend $backend
	 */
	final protected function deleteBackend(Backend $backend) {
		return $this->bmp->delete($backend);
	}


	/**
	 * @brief setup backends
	 * @throws BusinessLayerException if no backends could be setup
	 */
	private function setupBackends() {
		$backendCollection = new BackendCollection();

		$enabledBackends = $this->findAllEnabledBackends();
		$enabledBackends->iterate(function($backend) use (&$backendCollection) {
			$className = $backend->getClassname();
			$args = is_array($backend->getArguments()) ? $backend->getArguments() : array();

			if(class_exists($className) === false){
				$msg  = 'BusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" not found';
				\OCP\Util::writeLog('calendar', $msg, \OCP\Util::DEBUG);
				$this->updateBackend($backend->disable());
				return false;
			}

			if($backendCollection->search('backend', $backend->getBackend())->count() > 0) {
				$msg  = 'BusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" already initialized. ';
				$msg .= 'Please check for double entries';
				\OCP\Util::writeLog('calendar', $msg, \OCP\Util::DEBUG);
				return false;
			}

			$reflectionObj = new \ReflectionClass($className);
			$api = $reflectionObj->newInstanceArgs(array($this->app, $args, $this));
			$backend->registerAPI($api);

			//check if a backend can enabled
			if($backend->api->canBeEnabled()) {
				$backendCollection->add($backend);
			}
		});

		if($backendCollection->count() === 0){
			$msg  = 'BusinessLayer::setupBackends(): ';
			$msg .= 'No backend was setup successfully';
			throw new BusinessLayerException($msg);
		}

		$this->backends = $backendCollection;
	}
}