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

use OCA\Calendar\Backend\Backend;

class BackendBusinessLayer extends BusinessLayer {

	/**
	 * @param string $userId
	 * @param limit $limit
	 * @param limit $offset
	 */
	public function findAll($limit, $offset) {

	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 */
	public function findAllEnabled($limit, $offset) {

	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 */
	public function findAllDisabled($limit, $offset) {

	}


	/**
	 * @param string $backend
	 */
	public function find($backend) {

	}


	/**
	 * @param string $backend
	 */
	public function doesExist($backend) {

	}


	/**
	 * @param Backend $backend
	 */
	public function create(Backend $backend) {

	}


	/**
	 * @param Backend $backend
	 * @param $name
	 */
	public function update(Backend $backend, $name) {

	}


	/**
	 * @param Backend $backend
	 */
	public function delete(Backend $backend) {

	}


	/**
	 * @brief get default backend
	 * @return Backend
	 */
	public function getDefault() {

	}


	/**
	 * @param Backend $backend
	 */
	public function setDefault(Backend $backend) {

	}
}