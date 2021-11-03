/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { getLoggerBuilder } from '@nextcloud/logger'

const logger = getLoggerBuilder()
	.setApp('calendar')
	.detectUser()
	.build()

/**
 * Logs a debug message
 *
 * @param {string} message The message to log
 * @param {object=} context Additional context if needed
 */
const logDebug = (message, context = {}) => {
	logger.debug(message, context)
}

/**
 * Logs an error message
 *
 * @param {string} message The message to log
 * @param {object=} context Additional context if needed
 */
const logError = (message, context = {}) => {
	logger.error(message, context)
}

/**
 * Logs a fatal message
 *
 * @param {string} message The message to log
 * @param {object=} context Additional context if needed
 */
const logFatal = (message, context = {}) => {
	logger.fatal(message, context)
}

/**
 * Logs an info message
 *
 * @param {string} message The message to log
 * @param {object=} context Additional context if needed
 */
const logInfo = (message, context = {}) => {
	logger.info(message, context)
}

/**
 * Logs a warn message
 *
 * @param {string} message The message to log
 * @param {object=} context Additional context if needed
 */
const logWarn = (message, context = {}) => {
	logger.warn(message, context)
}

export default logger
export {
	logDebug,
	logError,
	logFatal,
	logInfo,
	logWarn,
}
