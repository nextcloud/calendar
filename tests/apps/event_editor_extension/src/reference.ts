/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Renders the reference provided by ReferenceController with `NcReferenceWidget`, like apps rendering references do.
// The widget of the Calendar app must already be registered when the component is set up,
// which `Util::addScript` ensures by loading this script after the scripts of the Calendar app.

import { loadState } from '@nextcloud/initial-state'
import { createApp, h } from 'vue'
import { NcReferenceWidget } from '@nextcloud/vue/components/NcRichText'

type Reference = InstanceType<typeof NcReferenceWidget>['$props']['reference']

const reference = loadState<Reference>('event_editor_extension', 'reference')

createApp(() => h(NcReferenceWidget, { reference, interactive: true }))
	.mount('#event-editor-extension-reference')
