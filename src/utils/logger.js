/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
