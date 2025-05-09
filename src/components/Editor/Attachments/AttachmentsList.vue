<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div id="attachments">
		<input ref="localAttachments"
			class="attachments-input"
			type="file"
			multiple
			@change="onLocalAttachmentSelected">
		<div class="attachments-summary">
			<div class="attachments-summary-inner">
				<Paperclip :size="20" />
				<div v-if="attachments.length > 0" class="attachments-summary-inner-label">
					{{ n('calendar', '{count} attachment', '{count} attachments', attachments.length, { count: attachments.length }) }}
				</div>
				<div v-else class="attachments-summary-inner-label">
					{{ t('calendar', 'No attachments') }}
				</div>
			</div>

			<NcActions v-if="!isReadOnly">
				<template #icon>
					<Plus :size="20" />
				</template>
				<NcActionButton @click="openFilesModal()">
					<template #icon>
						<Folder :size="20" />
					</template>
					{{ t('calendar', 'Add from Files') }}
				</NcActionButton>
				<NcActionButton @click="clickOnUploadButton">
					<template #icon>
						<Upload :size="20" />
					</template>
					{{ t('calendar', 'Upload from device') }}
				</NcActionButton>
			</NcActions>
		</div>
		<div v-if="attachments.length > 0">
			<ul class="attachments-list">
				<NcListItem v-for="attachment in attachments"
					:key="attachment.path"
					class="attachments-list-item"
					:force-display-actions="true"
					:name="getBaseName(attachment.fileName)"
					@click="openFile(attachment.uri)">
					<template #icon>
						<img :src="getPreview(attachment)" class="attachment-icon">
					</template>
					<template #actions>
						<NcActionButton v-if="!isReadOnly"
							@click="deleteAttachmentFromEvent(attachment)">
							<template #icon>
								<Close :size="20" />
							</template>
							{{ t('calendar', 'Delete file') }}
						</NcActionButton>
					</template>
				</NcListItem>
			</ul>
		</div>

		<NcDialog v-if="showOpenConfirmation"
			:open.sync="showOpenConfirmation"
			:name="t('calendar', 'Confirmation')"
			:buttons="openConfirmationButtons">
			<p class="external-link-message">
				{{ openConfirmationMessage }}
			</p>
		</NcDialog>
	</div>
</template>

<script>
import {
	NcListItem,
	NcActions,
	NcActionButton,
	NcDialog,
} from '@nextcloud/vue'

import Upload from 'vue-material-design-icons/Upload.vue'
import Close from 'vue-material-design-icons/Close.vue'
import Folder from 'vue-material-design-icons/Folder.vue'
import Paperclip from 'vue-material-design-icons/Paperclip.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

import { generateUrl, getBaseUrl } from '@nextcloud/router'
import { getFilePickerBuilder, showError } from '@nextcloud/dialogs'
import logger from '../../../utils/logger.js'
import {
	uploadLocalAttachment,
	getFileInfo,
} from '../../../services/attachmentService.js'
import { parseXML } from 'webdav'
import usePrincipalsStore from '../../../store/principals.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useSettingsStore from '../../../store/settings.js'
import { mapStores } from 'pinia'

export default {
	name: 'AttachmentsList',
	components: {
		NcListItem,
		NcActions,
		NcActionButton,
		Upload,
		Close,
		Folder,
		Paperclip,
		Plus,
		NcDialog,
	},
	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			uploading: false,
			showOpenConfirmation: false,
			openConfirmationMessage: '',
			openConfirmationButtons: [],
		}
	},
	computed: {
		...mapStores(usePrincipalsStore, useSettingsStore, useCalendarObjectInstanceStore),
		currentUser() {
			return this.principalsStore.getCurrentUserPrincipal
		},
		attachments() {
			return this.calendarObjectInstance.attachments
		},
	},
	methods: {
		addAttachmentWithProperty(calendarObjectInstance, sharedData) {
			this.calendarObjectInstanceStore.addAttachmentWithProperty({
				calendarObjectInstance,
				sharedData,
			})
		},
		deleteAttachmentFromEvent(attachment) {
			this.calendarObjectInstanceStore.deleteAttachment({
				calendarObjectInstance: this.calendarObjectInstance,
				attachment,
			})
		},
		async openFilesModal() {
			const picker = getFilePickerBuilder(t('calendar', 'Choose a file to add as attachment'))
				.setMultiSelect(false)
				.allowDirectories(true)
				.addButton({
					label: t('calendar', 'Pick'),
					type: 'primary',
					callback: (nodes) => logger.debug('Picked attachment', { nodes }),
				})
				.build()
			try {
				const filename = await picker.pick(t('calendar', 'Choose a file to share as a link'))
				if (!this.isDuplicateAttachment(filename)) {
					// TODO do not share Move this to PHP
					const data = await getFileInfo(filename, this.currentUser.dav.userId)
					const davRes = await parseXML(data)
					const davRespObj = davRes?.multistatus?.response[0]?.propstat?.prop
					davRespObj.fileName = filename
					davRespObj.url = generateUrl(`/f/${davRespObj.fileid}`)
					davRespObj.value = davRespObj.url
					this.addAttachmentWithProperty(this.calendarObjectInstance, davRespObj)
				}

			} catch (error) {

			}
		},
		isDuplicateAttachment(path) {
			return this.attachments.find(attachment => {
				if (attachment.fileName === path) {
					showError(t('calendar', 'Attachment {name} already exist!', { name: this.getBaseName(path) }))
					return true
				}
				return false
			})
		},
		clickOnUploadButton() {
			this.$refs.localAttachments.click()
		},
		async onLocalAttachmentSelected(e) {
			try {
				const attachmentsFolder = await this.settingsStore.createAttachmentsFolder()
				const attachments = await uploadLocalAttachment(attachmentsFolder, Array.from(e.target.files), this.currentUser.dav, this.attachments)
				// TODO do not share file, move to PHP
				attachments.map(async attachment => {
					const data = await getFileInfo(`${attachmentsFolder}/${attachment.path}`, this.currentUser.dav.userId)
					const davRes = await parseXML(data)
					const davRespObj = davRes?.multistatus?.response[0]?.propstat?.prop
					davRespObj.fileName = attachment.path
					davRespObj.url = generateUrl(`/f/${davRespObj.fileid}`)
					davRespObj.value = davRespObj.url
					this.addAttachmentWithProperty(this.calendarObjectInstance, davRespObj)
				})

				e.target.value = ''
			} catch (error) {
				logger.error('Could not upload attachment(s)', { error })
				showError(t('calendar', 'Could not upload attachment(s)'))
			}
		},
		getIcon(mime) {
			return OC.MimeType.getIconUrl(mime)
		},
		getPreview(attachment) {
			if (attachment.xNcHasPreview) {
				return generateUrl(`/core/preview?fileId=${attachment.xNcFileId}&x=100&y=100&a=0`)
			}
			return attachment.formatType
				? OC.MimeType.getIconUrl(attachment.formatType)
				: OC.MimeType.getIconUrl('folder')
		},
		getBaseName(name) {
			return name.split('/').pop()
		},
		openFile(rawUrl) {
			let url
			try {
				url = new URL(rawUrl, getBaseUrl())
			} catch (error) {
				logger.error(`Refusing to open invalid URL: ${rawUrl}`, { error })
				return
			}

			const baseUrl = new URL(getBaseUrl())
			if (url.href.startsWith(baseUrl.href)) {
				if (url.pathname.endsWith('/download') || url.pathname.endsWith('/download/')) {
					// Show a confirmation to warn users of direct downloads
					this.showConfirmationDialog(
						t('calendar', 'You are about to download a file. Please check the file name before opening it. Are you sure to proceed?'),
						url,
					)
					return
				}

				// URL belongs to this instance and is safe
				window.open(url.href, '_blank', 'noopener noreferrer')
				return
			}

			// Otherwise, show a confirmation dialog for external links
			this.showConfirmationDialog(
				t('calendar', 'You are about to navigate to {host}. Are you sure to proceed? Link: {link}', {
					host: url.host,
					link: url.href,
				}),
				url,
			)
		},
		/**
		 * Open the confirmation dialog for suspicious or external attachments.
		 *
		 * @param {string} message The confirmation message to show.
		 * @param {URL} url The URL to navigate to after getting the user's confirmation.
		 */
		showConfirmationDialog(message, url) {
			this.openConfirmationMessage = message
			this.openConfirmationButtons = [
				{
					label: t('calendar', 'Cancel'),
					callback: () => {
						this.showOpenConfirmation = false
					},
				},
				{
					label: t('calendar', 'Proceed'),
					type: 'primary',
					callback: () => {
						window.open(url.href, '_blank', 'noopener noreferrer')
					},
				},
			]
			this.showOpenConfirmation = true
		},
	},
}
</script>

<style lang="scss" scoped>
.attachments-input {
	display: none;
}
.attachments-summary {
	display:flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 6px;

	.attachments-summary-inner {
		display:flex;
		align-items: center;

		span {
			width: 34px;
			height: 34px;
			margin-left: -10px;
			margin-right: 5px;
		}

		.attachments-summary-inner-label {
			padding: 0 7px;
			font-weight: bold;
		}
	}
}

.attachments-list {
	margin: 0 -8px;

	.attachments-list-item {
		// Reduce height to 44px
		:deep(.list-item) {
			padding: 0 8px;
		}
		:deep(.list-item-content__wrapper) {
			height: 44px;
		}

		:deep(.list-item-content) {
			// Align text with other properties
			padding-left: 18px;
		}

		:deep(.line-one__title) {
			font-weight: unset;
		}
	}
}

#attachments .empty-content {
	margin-top: 1rem;
	text-align: center;
}
.button-group {
	display: flex;
	align-content: center;
	justify-content: center;

	button:first-child {
		margin-right: 6px;
	}
}
.attachment-icon {
	width: 24px;
	height: 24px;
	border-radius: var(--border-radius);
}

.external-link-message {
	overflow-wrap: break-word;
}
</style>
