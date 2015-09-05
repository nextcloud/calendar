<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backgroundjob;

use \OCA\Calendar\App;

class Task {
	static public function run() {
		$app = new App();


		//TODO
		//- [ ] update calendar cache from remote
		//- [ ] make updater use limit and offset
		//- [ ] cache repeating objects
		//- [ ] make repeating objects cacher use limits and offset

		//$app->dispatch('Updater', 'update');
	}
}