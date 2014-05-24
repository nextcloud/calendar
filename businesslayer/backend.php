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
namespace OCA\Calendar\BusinessLayer;

use OCP\AppFramework\IAppContainer;

use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendCollection;

use OCA\Calendar\Db\BackendMapper;
use OCP\Calendar\MultipleObjectsReturnedException;

class BackendBusinessLayer extends BusinessLayer {

	/**
	 * Mapper
	 * @var BackendMapper
	 */
	protected $mapper;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper){
		parent::__construct($app, $backendMapper);
		parent::initBackendSystem($backendMapper);
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * @return IBackendCollection
	 */
	public function findAll($limit, $offset) {
		return $this->backends->subset($limit, $offset);
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * @return IBackendCollection;=
	 */
	public function findAllEnabled($limit, $offset) {
		return $this->backends->search('enabled', true)->subset($limit, $offset);
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * @return IBackendCollection
	 */
	public function findAllDisabled($limit, $offset) {
		return $this->backends->search('enabled', false)->subset($limit, $offset);
	}


	/**
	 * @param string $backend
	 * @return IBackend
	 * @throws BusinessLayerException
	 */
	public function find($backend) {
		try {
			return $this->backends->find($backend);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}


	/**
	 * @param string $backend
	 * @return bool
	 */
	public function doesExist($backend) {
		return ($this->backends->search('backend', $backend)->count() === 1);
	}


	/**
	 * @brief get default backend
	 * @return IBackend
	 */
	public function getDefault() {
		return $this->mapper->getDefault();
	}


	/**
	 * @param IBackend $backend
	 * @throws BusinessLayerException
	 */
	public function setDefault(IBackend $backend) {
		$this->app->log($backend->getBackend(), 'debug');
		throw new BusinessLayerException('Setting default backend not supported yet');
	}
}