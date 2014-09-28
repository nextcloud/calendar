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

use OCP\AppFramework\Http;
use OCP\Calendar\IEntity;

use OCA\Calendar\Db\Mapper;

abstract class BusinessLayer {

	/**
	 * @var \OCA\Calendar\Db\Mapper
	 */
	protected $mapper;


	/**
     * @param Mapper $mapper
	 */
	public function __construct(Mapper $mapper){
		$this->mapper = $mapper;
	}


	/**
	 * throw exception if entity is not valid
	 * @param IEntity $entity
	 * @throws BusinessLayerException
	 */
	protected function checkIsValid(IEntity $entity) {
		if (!$entity->isValid()) {
			$msg = $this->getClassName($entity) . ' is not valid';
			throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @param IEntity $entity
	 * @return string
	 */
	private function getClassName(IEntity $entity) {
		$class = get_class($entity);
		return substr($class, strrpos( $class, '\\' ) + 1);
	}
}