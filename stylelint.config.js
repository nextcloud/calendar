/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

module.exports = {
	extends: '@nextcloud/stylelint-config',
	plugins: ['stylelint-use-logical'],
	// TODO: Remove this when the Nextcloud stylelint config is updated to include this rule (planned)
	rules: {
		'csstools/use-logical': [
			'always',
			{
				severity: 'error',
				// Only lint LTR-RTL properties for now
				except: [
					// Position properties
					'top',
					'bottom',
					// Position properties with directional suffixes
					/-top$/,
					/-bottom$/,
					// Size properties
					'width',
					'max-width',
					'min-width',
					'height',
					'max-height',
					'min-height',
				],
			},
		],
	},
}
