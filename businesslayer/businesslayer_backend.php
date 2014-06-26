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
}

