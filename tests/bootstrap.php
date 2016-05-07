<?php
/**
 * ownCloud - Calendar
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Alessandro Cosentino <cosenal@gmail.com>
 * @copyright Alessandro Cosentino 2016
 * @author Bernhard Posselt <dev@bernhard-posselt.com>
 * @copyright Bernhard Posselt 2016
 */

require_once __DIR__ . '/../../../3rdparty/autoload.php';

// to execute without owncloud, we need to create our own classloader
spl_autoload_register(function ($className){
	if (strpos($className, 'OCA\\') === 0) {

		$path = strtolower(
			str_replace('\\', '/', substr($className, 3)) . '.php'
		);
		$relPath = __DIR__ . '/../..' . $path;

		if(file_exists($relPath)){
			require $relPath;
		} else {
			list(,$app, $rest) = explode('/', $path);
			$relPath = __DIR__ . '/../../' . $app . '/lib/' . $rest;
			if (file_exists($relPath)) {
				require $relPath;
			}
		}
	} else if(strpos($className, 'OCP\\') === 0) {
		$path = strtolower(
			str_replace('\\', '/', substr($className, 3)) . '.php'
		);
		$relPath = __DIR__ . '/../../../lib/public' . $path;

		if(file_exists($relPath)){
			require_once $relPath;
		}
	} else if(strpos($className, 'OC\\') === 0) {
		$path = str_replace('\\', '/', substr($className, 2)) . '.php';
		$relPath = __DIR__ . '/../../../lib/private' . $path;

		if(file_exists($relPath)){
			require_once $relPath;
		}
	} else if(strpos($className, 'Test\\') === 0) {
		$path = strtolower(
			str_replace('\\', '/', substr($className, 4)) . '.php'
		);
		echo $path;
		$relPath = __DIR__ . '/../../../tests/lib' . $path;

		if(file_exists($relPath)){
			require_once $relPath;
		}
	}
});
