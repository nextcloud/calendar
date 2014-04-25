<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

class BackendCollection extends Collection {

	/**
	 * @brief get a collection of all enabled backends within collection
	 * @return BackendCollection of all enabled backends
	 */
	public function enabled() {
		return $this->search('enabled', true);
	}


	/**
	 * @brief get a collection of all disabled backends within collection
	 * @return BackendCollection of all disabled backends
	 */
	public function disabled() {
		return $this->search('enabled', false);
	}


	/**
	 * @brief find backend by name
	 * @return Backend object
	 */
	public function find($backendName) {
		return $this->search('backend', $backendName)->current();
	}
}