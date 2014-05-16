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
namespace OCA\Calendar\Db;

use OCP\AppFramework\IAppContainer;
use OCP\Util;

class TimezoneMapper extends Mapper {

	/**
	 * folder-name for timezone-files
	 * @var string
	 */
	private $folderName;


	/**
	 * blacklist of files that are not supposed to be indexed
	 * @var array
	 */
	private $fileBlacklist;


	/**
	 * @param IAppContainer $app
	 */
	public function __construct(IAppContainer $app){
		$this->app = $app;

		$this->folderName = __DIR__ . '/../timezones/';
		$this->fileBlacklist = array(
			'.',
			'..',
			'INFO.md'
		);
	}


	/**
	 * @brief find a timezone
	 * @param string $tzId
	 * @param string $userId
	 * @throws DoesNotExistException
	 * @return Timezone
	 */
	public function find($tzId, $userId) {
		$path = $this->getFileNameForTimezone($tzId);
		if (!$this->isValidFileName($tzId)) {
			throw new DoesNotExistException('Timezone not found');
		}

		$data = file_get_contents($path);
		return new Timezone($tzId, $data);
	}


	/**
	 * @param string $tzId
	 * @param string $userId
	 * @return bool
	 */
	public function doesExist($tzId, $userId) {
		if (!$this->isValidFileName($tzId)) {
			return false;
		}

		return file_exists($this->getFileNameForTimezone($tzId));
	}

	/**
	 * @brief get all timezones as a list
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function listAll($userId, $limit, $offset) {
		$timezones = $this->getAllAvailableTimezones($userId);
		return array_slice($timezones, $offset, $limit);
	}


	/**
	 * @brief find all timezones
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return TimezoneCollection
	 */
	public function findAll($userId, $limit, $offset) {
		$timezones = $this->listAll($userId, $limit, $offset);

		$timezoneCollection = new TimezoneCollection();
		foreach($timezones as $timezone) {
			$fileName = $this->getFileNameForTimezone($timezone);

			$data = file_get_contents($fileName);
			$timezone = new Timezone($timezone, $data);
			$timezoneCollection->add($timezone);
		}

		return $timezoneCollection;
	}


	/**
	 * @brief deleting timezones is not supported
	 */
	public function delete(Entity $entity){
		return null;
	}


	/**
	 * @brief create timezones is not supported
	 */
	public function insert(Entity $entity){
		return null;
	}


	/**
	 * @brief updating timezones is not supported
	 */
	public function update(Entity $entity){
		return null;
	}


	/**
	 * @param string $tzId
	 * @return string
	 */
	private function getFileNameForTimezone($tzId) {
		$tzFile = strtoupper($tzId);
		$tzFile = str_replace('/', '-', $tzFile);

		$path  = $this->folderName;
		$path .= $tzFile;
		$path .= '.ics';

		return $path;
	}


	/**
	 * @param $tzId
	 * @return bool
	 */
	private function isValidFileName($tzId) {
		$filename = str_replace('/', '-', $tzId);

		if (in_array($filename, $this->fileBlacklist) ||
			!Util::isValidFileName($filename)) {
			return false;
		}

		return true;
	}


	/**
	 * @param $userId
	 * @return array
	 */
	private function getAllAvailableTimezones($userId) {
		$tzFiles = scandir($this->folderName);
		$timezones = array_values(
			array_diff(
				$tzFiles,
				$this->fileBlacklist
			)
		);

		return array_map(function($value) {
			$value = str_replace('-', '/', $value);
			return substr($value, 0, -4);
		}, $timezones);
	}
}