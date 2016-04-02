/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

/**
 * Controller: ImportController
 * Description: Takes care of importing calendars
 */

app.controller('ImportController', ['$scope', '$rootScope', '$filter', 'CalendarService', 'VEventService', 'SplitterService', '$uibModalInstance', 'files',
	function($scope, $rootScope, $filter, CalendarService, VEventService, SplitterService, $uibModalInstance, files) {
		'use strict';

		$scope.files = files;
		$scope.showCloseButton = false;

		$scope.import = function (file) {
			file.progressToReach = file.split.vevent.length +
				file.split.vjournal.length +
				file.split.vtodo.length;
			//state: import scheduled
			file.state = 2;

			var importCalendar = function(calendar) {
				var componentNames = ['vevent', 'vjournal', 'vtodo'];
				angular.forEach(componentNames, function (componentName) {
					angular.forEach(file.split[componentName], function(object) {
						VEventService.create(calendar, object, false).then(function(response) {
							//state: importing
							file.state = 3;
							file.progress++;
							$scope.$apply();

							if (!response) {
								file.errors++;
							}

							calendar.list.loading = true;
							if (file.progress === file.progressToReach) {
								//state: done
								file.state = 4;
								$scope.$apply();
								$rootScope.$broadcast('refetchEvents', calendar);
								$scope.closeIfNecessary();
							}
						});
					});
				});
			};

			if (file.calendar === 'new') {
				var name = file.newCalendarName || file.name;
				var color = file.newCalendarColor || '#1d2d44';

				var components = [];
				if (file.split.vevent.length > 0) {
					components.push('vevent');
					components.push('vtodo');
				}
				if (file.split.vjournal.length > 0) {
					components.push('vjournal');
				}
				if (file.split.vtodo.length > 0 && components.indexOf('vtodo') === -1) {
					components.push('vtodo');
				}

				CalendarService.create(name, color, components).then(function(calendar) {
					if (calendar.components.vevent) {
						$scope.calendars.push(calendar);
						$rootScope.$broadcast('createdCalendar', calendar);
						$rootScope.$broadcast('reloadCalendarList');
					}
					importCalendar(calendar);
				});
			} else {
				var calendar = $scope.calendars.filter(function (element) {
					return element.url === file.calendar;
				})[0];
				importCalendar(calendar);
			}


		};

		$scope.preselectCalendar = function(file) {
			var possibleCalendars = $filter('importCalendarFilter')($scope.calendars, file);
			if (possibleCalendars.length === 0) {
				file.calendar = 'new';
			} else {
				file.calendar = possibleCalendars[0];
			}
		};

		$scope.changeCalendar = function(file) {
			if (file.calendar === 'new') {
				file.incompatibleObjectsWarning = false;
			} else {
				var possibleCalendars = $filter('importCalendarFilter')($scope.calendars, file);
				file.incompatibleObjectsWarning = (possibleCalendars.indexOf(file.calendar) === -1);
			}
		};

		angular.forEach($scope.files, function(file) {
			var reader = new FileReader();
			reader.onload = function(event) {
				var splitter = SplitterService.split(event.target.result);

				angular.extend(reader.linkedFile, {
					split: splitter.split,
					newCalendarColor: splitter.color,
					newCalendarName: splitter.name,
					//state: analyzed
					state: 1
				});
				$scope.preselectCalendar(reader.linkedFile);
				$scope.$apply();

			};

			angular.extend(file, {
				//state: analyzing
				state: 0,
				errors: 0,
				progress: 0,
				progressToReach: 0
			});

			reader.linkedFile = file;
			reader.readAsText(file);
		});


		$scope.closeIfNecessary = function() {
			var unfinishedFiles = $scope.files.filter(function(element) {
				return (element.state !== -1 && element.state !== 4);
			});
			var filesEncounteredErrors = $scope.files.filter(function(element) {
				return (element.state === 4 && element.errors !== 0);
			});

			if (unfinishedFiles.length === 0 && filesEncounteredErrors.length === 0) {
				$uibModalInstance.close();
			} else if (unfinishedFiles.length === 0 && filesEncounteredErrors.length !== 0) {
				$scope.showCloseButton = true;
			}
		};

		$scope.close = function() {
			$uibModalInstance.close();
		};

		$scope.cancelFile = function(file) {
			file.state = -1;
			$scope.closeIfNecessary();
		};
	}
]);