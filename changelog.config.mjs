/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Release tags may point at merge commits. conventional-changelog runs
// `git log --no-merges` by default, so it never sees those tags and drops the
// releases. Include merge commits so tagged releases are detected; the angular
// preset ignores the non-conventional "Merge pull request" subjects anyway.
export default {
	gitRawCommitsOpts: {
		merges: null,
	},
}
