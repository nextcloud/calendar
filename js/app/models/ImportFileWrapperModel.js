app.factory('ImportFileWrapper', function(Hook, ICalSplitterUtility) {
	'use strict';

	function ImportFileWrapper(file) {
		const context = {
			file: file,
			splittedICal: null,
			selectedCalendar: null,
			state: 0,
			errors: 0,
			progress: 0,
			progressToReach: 0
		};
		const iface = {
			_isAImportFileWrapperObject: true
		};

		context.checkIsDone = function() {
			if (context.progress === context.progressToReach) {
				context.state = ImportFileWrapper.stateDone;
				iface.emit(ImportFileWrapper.hookDone);
			}
		};

		Object.defineProperties(iface, {
			file: {
				get: function() {
					return context.file;
				}
			},
			splittedICal: {
				get: function() {
					return context.splittedICal;
				}
			},
			selectedCalendar: {
				get: function() {
					return context.selectedCalendar;
				},
				set: function(selectedCalendar) {
					context.selectedCalendar = selectedCalendar;
				}
			},
			state: {
				get: function() {
					return context.state;
				},
				set: function(state) {
					if (typeof state === 'number') {
						context.state = state;
					}
				}
			},
			errors: {
				get: function() {
					return context.errors;
				},
				set: function(errors) {
					if (typeof errors === 'number') {
						var oldErrors = context.errors;
						context.errors = errors;
						iface.emit(ImportFileWrapper.hookErrorsChanged, errors, oldErrors);
					}
				}
			},
			progress: {
				get: function() {
					return context.progress;
				},
				set: function(progress) {
					if (typeof progress === 'number') {
						var oldProgress = context.progress;
						context.progress = progress;
						iface.emit(ImportFileWrapper.hookProgressChanged, progress, oldProgress);

						context.checkIsDone();
					}
				}
			},
			progressToReach: {
				get: function() {
					return context.progressToReach;
				}
			}
		});

		iface.wasCanceled = function() {
			return context.state === ImportFileWrapper.stateCanceled;
		};

		iface.isAnalyzing = function() {
			return context.state === ImportFileWrapper.stateAnalyzing;
		};

		iface.isAnalyzed = function() {
			return context.state === ImportFileWrapper.stateAnalyzed;
		};

		iface.isScheduled = function() {
			return context.state === ImportFileWrapper.stateScheduled;
		};

		iface.isImporting = function() {
			return context.state === ImportFileWrapper.stateImporting;
		};

		iface.isDone = function() {
			return context.state === ImportFileWrapper.stateDone;
		};

		iface.hasErrors = function() {
			return context.errors > 0;
		};

		iface.read = function(afterReadCallback) {
			var reader = new FileReader();

			reader.onload = function(event) {
				context.splittedICal = ICalSplitterUtility.split(event.target.result);
				context.progressToReach = context.splittedICal.vevents.length +
					context.splittedICal.vjournals.length +
					context.splittedICal.vtodos.length;
				iface.state = ImportFileWrapper.stateAnalyzed;
				afterReadCallback();
			};

			reader.readAsText(file);
		};

		Object.assign(
			iface,
			Hook(context)
		);

		return iface;
	}

	ImportFileWrapper.isImportWrapper = function(obj) {
		return obj instanceof ImportFileWrapper || (typeof obj === 'object' && obj !== null && obj._isAImportFileWrapperObject !== null);
	};

	ImportFileWrapper.stateCanceled = -1;
	ImportFileWrapper.stateAnalyzing = 0;
	ImportFileWrapper.stateAnalyzed = 1;
	ImportFileWrapper.stateScheduled = 2;
	ImportFileWrapper.stateImporting = 3;
	ImportFileWrapper.stateDone = 4;

	ImportFileWrapper.hookProgressChanged = 1;
	ImportFileWrapper.hookDone = 2;
	ImportFileWrapper.hookErrorsChanged = 3;

	return ImportFileWrapper;
});
