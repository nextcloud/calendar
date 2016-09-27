/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

app.controller('ImportController', ['$scope', '$filter', 'CalendarService', 'VEventService', '$uibModalInstance', 'files', 'ImportFileWrapper', 'ColorUtility',
	function($scope, $filter, CalendarService, VEventService, $uibModalInstance, files, ImportFileWrapper, ColorUtility) {
		'use strict';

		$scope.nameSize = 25;

		$scope.rawFiles = files;
		$scope.files = [];

		$scope.showCloseButton = false;
		$scope.writableCalendars = $scope.calendars.filter(function(elem) {
			return elem.isWritable();
		});

		$scope.import = function (fileWrapper) {
			fileWrapper.state = ImportFileWrapper.stateScheduled;

			var importCalendar = function(calendar) {
				const objects = fileWrapper.splittedICal.objects;

				angular.forEach(objects, function(object) {
					VEventService.create(calendar, object, false).then(function(response) {
						fileWrapper.state = ImportFileWrapper.stateImporting;
						fileWrapper.progress++;

						if (!response) {
							fileWrapper.errors++;
						}
					});
				});
			};

			if (fileWrapper.selectedCalendar === 'new') {
				var name = fileWrapper.splittedICal.name || fileWrapper.file.name;
				var color = fileWrapper.splittedICal.color || ColorUtility.randomColor();

				var components = [];
				if (fileWrapper.splittedICal.vevents.length > 0) {
					components.push('vevent');
					components.push('vtodo');
				}
				if (fileWrapper.splittedICal.vjournals.length > 0) {
					components.push('vjournal');
				}
				if (fileWrapper.splittedICal.vtodos.length > 0 && components.indexOf('vtodo') === -1) {
					components.push('vtodo');
				}

				CalendarService.create(name, color, components).then(function(calendar) {
					if (calendar.components.vevent) {
						$scope.calendars.push(calendar);
						$scope.writableCalendars.push(calendar);
					}
					importCalendar(calendar);
					fileWrapper.selectedCalendar = calendar.url;
				});
			} else {
				var calendar = $scope.calendars.filter(function (element) {
					return element.url === fileWrapper.selectedCalendar;
				})[0];
				importCalendar(calendar);
			}


		};

		$scope.preselectCalendar = function(fileWrapper) {
			var possibleCalendars = $filter('importCalendarFilter')($scope.writableCalendars, fileWrapper);
			if (possibleCalendars.length === 0) {
				fileWrapper.selectedCalendar = 'new';
			} else {
				fileWrapper.selectedCalendar = possibleCalendars[0].url;
			}
		};

		$scope.changeCalendar = function(fileWrapper) {
			if (fileWrapper.selectedCalendar === 'new') {
				fileWrapper.incompatibleObjectsWarning = false;
			} else {
				var possibleCalendars = $filter('importCalendarFilter')($scope.writableCalendars, fileWrapper);
				fileWrapper.incompatibleObjectsWarning = (possibleCalendars.indexOf(fileWrapper.selectedCalendar) === -1);
			}
		};

		angular.forEach($scope.rawFiles, function(rawFile) {
			var fileWrapper = ImportFileWrapper(rawFile);
			fileWrapper.read(function() {
				$scope.preselectCalendar(fileWrapper);
				$scope.$apply();
			});

			fileWrapper.register(ImportFileWrapper.hookProgressChanged, function() {
				$scope.$apply();
			});

			fileWrapper.register(ImportFileWrapper.hookDone, function() {
				$scope.$apply();
				$scope.closeIfNecessary();

				var calendar = $scope.calendars.filter(function (element) {
					return element.url === fileWrapper.selectedCalendar;
				})[0];
				if (calendar.enabled) {
					calendar.enabled = false;
					calendar.enabled = true;
				}
			});

			fileWrapper.register(ImportFileWrapper.hookErrorsChanged, function() {
				$scope.$apply();
			});

			$scope.files.push(fileWrapper);
		});


		$scope.closeIfNecessary = function() {
			var unfinishedFiles = $scope.files.filter(function(fileWrapper) {
				return !fileWrapper.wasCanceled() && !fileWrapper.isDone();
			});
			var filesEncounteredErrors = $scope.files.filter(function(fileWrapper) {
				return fileWrapper.isDone() && fileWrapper.hasErrors();
			});

			if (unfinishedFiles.length === 0 && filesEncounteredErrors.length === 0) {
				$uibModalInstance.close();
			} else if (unfinishedFiles.length === 0 && filesEncounteredErrors.length !== 0) {
				$scope.showCloseButton = true;
				$scope.$apply();
			}
		};

		$scope.close = function() {
			$uibModalInstance.close();
		};

		$scope.cancelFile = function(fileWrapper) {
			fileWrapper.state = ImportFileWrapper.stateCanceled;
			$scope.closeIfNecessary();
		};
	}
]);
