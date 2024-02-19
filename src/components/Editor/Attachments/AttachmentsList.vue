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
				<div v-if="attachments.length > 0">
					{{ n('calendar', '{count} attachment', '{count} attachments', attachments.length, { count: attachments.length }) }}
				</div>
				<div v-else>
					{{ t('calendar', 'No attachments') }}
				</div>
			</div>

			<NcActions>
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
			<ul class="attachments-list-item">
				<NcListItem v-for="attachment in attachments"
					:key="attachment.path"
					:force-display-actions="true"
					:title="getBaseName(attachment.fileName)"
					@click="openFile(attachment.uri)">
					<template #icon>
						<img :src="getPreview(attachment)" class="attachment-icon">
					</template>
					<template #actions>
						<NcActionButton @click="deleteAttachmentFromEvent(attachment)">
							<template #icon>
								<Close :size="20" />
							</template>
							{{ t('calendar', 'Delete file') }}
						</NcActionButton>
					</template>
				</NcListItem>
			</ul>
		</div>
	</div>
</template>

<script>
import {
	NcListItem,
	NcActions,
	NcActionButton,
} from '@nextcloud/vue'

import Upload from 'vue-material-design-icons/Upload.vue'
import Close from 'vue-material-design-icons/Close.vue'
import Folder from 'vue-material-design-icons/Folder.vue'
import Paperclip from 'vue-material-design-icons/Paperclip.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

import { generateUrl } from '@nextcloud/router'
import { getFilePickerBuilder, showError } from '@nextcloud/dialogs'
import logger from '../../../utils/logger.js'
import {
	uploadLocalAttachment,
	getFileInfo,
} from '../../../services/attachmentService.js'
import { parseXML } from 'webdav'
import usePrincipalsStore from '../../../store/principals.js'
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
	},
	props: {
		...mapStores(usePrincipalsStore()),
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
		}
	},
	computed: {
		currentUser() {
			return this.principalsStore.getCurrentUserPrincipal
		},
		attachments() {
			return this.calendarObjectInstance.attachments
		},
	},
	methods: {
		addAttachmentWithProperty(calendarObjectInstance, sharedData) {
			this.$store.commit('addAttachmentWithProperty', {
				calendarObjectInstance,
				sharedData,
			})
		},
		deleteAttachmentFromEvent(attachment) {
			this.$store.commit('deleteAttachment', {
				calendarObjectInstance: this.calendarObjectInstance,
				attachment,
			})
		},
		async openFilesModal() {
			const picker = getFilePickerBuilder(t('calendar', 'Choose a file to add as attachment')).setMultiSelect(false).build()
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
				const attachmentsFolder = await this.$store.dispatch('createAttachmentsFolder')
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
			return attachment.formatType ? OC.MimeType.getIconUrl(attachment.formatType) : null
		},
		getBaseName(name) {
			return name.split('/').pop()
		},
		openFile(url) {
			window.open(url, '_blank', 'noopener noreferrer')
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
			margin-right: 10px;
		}
	}
}

.attachments-list-item {
	margin: 0 -8px;
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
	width: 40px;
    height: auto;
	border-radius: var(--border-radius);
}
</style>
