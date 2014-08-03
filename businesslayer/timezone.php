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
use OCP\Calendar\ITimezone;
use OCP\Calendar\ITimezoneCollection;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;
use OCA\Calendar\Db\TimezoneMapper;

class TimezoneBusinessLayer extends BusinessLayer {

	/**
	 * @var TimezoneMapper
	 */
	protected $mapper;


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ITimezoneCollection
	 */
	public function findAll($userId, $limit, $offset) {
		return $this->mapper->findAll($userId, $limit, $offset);
	}


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function listAll($userId, $limit, $offset) {
		return $this->mapper->listAll($userId, $limit, $offset);
	}


	/**
	 * @param string $tzId
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return ITimezone
	 */
	public function find($tzId, $userId) {
		try {
			return $this->mapper->find($tzId, $userId);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage(), Http::STATUS_NOT_FOUND, $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), HTTP::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}
	}


	/**
	 * @param string $tzId
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExist($tzId, $userId) {
		return $this->mapper->doesExist($tzId, $userId);
	}


	/**
	 * @param ITimezone $timezone
	 * @throws BusinessLayerException
	 * @return ITimezone
	 */
	public function create(ITimezone $timezone) {
		$this->checkTimezoneIsValid($timezone);
		$this->mapper->insert($timezone);

		throw new BusinessLayerException('Creating timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @param ITimezone $timezone
	 * @throws BusinessLayerException
	 * @return ITimezone
	 */
	public function update(ITimezone $timezone) {
		$this->checkTimezoneIsValid($timezone);
		$this->mapper->update($timezone);

		throw new BusinessLayerException('Updating timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @param ITimezone $timezone
	 * @throws BusinessLayerException
	 */
	public function delete(ITimezone $timezone) {
		$this->mapper->delete($timezone);

		throw new BusinessLayerException('Deleting timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * make sure a subscription is valid
	 * @param ITimezone $timezone
	 * @throws BusinessLayerException
	 */
	private function checkTimezoneIsValid(ITimezone $timezone) {
		if (!$timezone->isValid()) {
			throw new BusinessLayerException('Timezone is not valid', Http::STATUS_UNPROCESSABLE_ENTITY);
		}
	}
}