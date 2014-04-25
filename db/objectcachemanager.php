<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Object;

class ObjectCacheManager extends Mapper {

	const DELETED = 1;
	const CREATED = 2;
	const OUTDATED = 3;

	public function setDeleted($calendar, $objectURIs) {
		
	}

	public function setOneDeleted($calendar, $objectURI) {
		
	}

	public function getDeleted($calendar, $limit, $offset) {
		
	}

	public function deleteDeleted($calendar, $objectURI) {
		
	}


	public function setCreated($calendar, $objectURIs) {
		
	}

	public function setOneCreated($calendar, $objectURI) {
		
	}

	public function getCreated($calendar, $limit, $offset) {
		
	}

	public function deleteCreated($calendar, $objectURI) {
		
	}
	

	public function setOutDated($calendar, $objectURIs) {
		
	}

	public function getOutDated($calendar, $limit, $offset) {
		
	}

	public function deleteUpdated($calendar, $objectURI) {
		
	}
}