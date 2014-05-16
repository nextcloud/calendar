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

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;

use OCA\Calendar\Db\Timezone;
use OCA\Calendar\Db\TimezoneCollection;

class TimezoneBusinessLayer extends BusinessLayer {

	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return TimezoneCollection
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
	 * @return Timezone
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
	 * @param Timezone $timezone
	 * @throws BusinessLayerException
	 * @return Timezone
	 */
	public function create(Timezone $timezone) {
		throw new BusinessLayerException('Creating timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @param Timezone $timezone
	 * @throws BusinessLayerException
	 * @return Timezone
	 */
	public function createFromRequest(Timezone $timezone) {
		return $this->create($timezone);
	}


	/**
	 * @param Timezone $timezone
	 * @param string $tzId
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return Timezone
	 */
	public function update(Timezone $timezone, $tzId, $userId) {
		throw new BusinessLayerException('Updating timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}


	/**
	 * @param Timezone $timezone
	 * @param string $tzId
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return Timezone
	 */
	public function updateFromRequest(Timezone $timezone, $tzId, $userId){
		return $this->update($timezone, $tzId, $userId);
	}


	/**
	 * @param Timezone $timezone
	 * @throws BusinessLayerException
	 */
	public function delete(Timezone $timezone) {
		throw new BusinessLayerException('Deleting timezones not yet supported', Http::STATUS_NOT_IMPLEMENTED);
	}
}