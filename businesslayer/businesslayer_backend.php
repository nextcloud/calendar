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
use OCP\AppFramework\Http;
use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendAPI;
use OCP\Calendar\IBackendCollection;
use OCA\Calendar\Db\Mapper;

abstract class BackendCollectionBusinessLayer extends BusinessLayer {

	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @param IAppContainer $app
	 * @param IBackendCollection $backends
	 * @param Mapper $mapper
	 */
	public function __construct(IAppContainer $app,
								IBackendCollection $backends,
								Mapper $mapper) {
		parent::__construct($app, $mapper);
		$this->backends = $backends;
	}

	/**
	 * check if a backend does support a certain action
	 * @param string $backend
	 * @param integer $action
	 * @return boolean
	 */
	protected function doesBackendSupport($backend, $action) {
		if (!($this->backends instanceof IBackendCollection)) {
			return false;
		} else {
			$backend = $this->backends->search('backend', $backend)->current();
			if (!($backend instanceof IBackend) || !($backend->getApi() instanceof IBackendAPI)) {
				return false;
			}
			return $backend->getAPI()->implementsActions($action);
		}
	}


	/**
	 * throw exception if backend is not enabled
	 * @param string $backend
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	protected function checkBackendEnabled($backend) {
		if (!($this->backends instanceof IBackendCollection)) {
			$msg = 'No backends set-up!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		if (!$this->backends->isEnabled($backend)) {
			$msg = 'Backend found but not enabled!';
			throw new BusinessLayerException($msg, Http::STATUS_BAD_REQUEST);
		}

		return true;
	}


	/**
	 * throw exception if backend does not support action
	 * @param string $backend
	 * @param integer $action
	 * @return bool
	 * @throws BusinessLayerException
	 */
	protected function checkBackendSupports($backend, $action) {
		if (!$this->doesBackendSupport($backend, $action)) {
			$msg = 'Backend does not support wanted action!';
			throw new BusinessLayerException($msg, HTTP::STATUS_BAD_REQUEST);
		}

		return true;
	}
}

