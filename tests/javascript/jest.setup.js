/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

document.title = 'Standard Nextcloud title'

// The webdav client requires a public fetch function
window.fetch = () => {}
