/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const babelConfig = require('@nextcloud/babel-config')

// Fix collecting coverage from TypeScript files when running Jest
babelConfig.presets.push('@babel/preset-typescript')

module.exports = babelConfig
