/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/// <reference types="@rspack/core/module" />
import type { App, Component } from 'vue'

import { createApp, h, shallowRef } from 'vue'

import '@/styles/calendar.scss'

const stories = import.meta.glob('../**/*.story.ts')
const id = (f: string) => f.replace(/^(\.\.\/)+src\//, '').replace(/\.story\.\w+$/, '')

async function resolve(storyId: string) {
	const sep = storyId.lastIndexOf('/')
	const [path, name] = [storyId.slice(0, sep), storyId.slice(sep + 1)]
	const file = Object.keys(stories).find((f) => id(f) === path || id(f).endsWith('/' + path))
	const mod = (file && await stories[file]()) as Record<string, any> | undefined
	return mod?.[name] ?? mod?.default
}

const story = shallowRef<Component | null>(null)
const props = shallowRef<Record<string, any>>({})
const host = { render: () => (story.value ? h(story.value, props.value) : null) }
let app: App | undefined;

(window as any).mount = async ({ story: id, props: next }: { story: string, props?: Record<string, any> }) => {
	const resolved = await resolve(id)
	if (!resolved) {
		throw new Error(`Unknown story: ${id}`)
	}
	story.value = resolved
	props.value = next ?? {}
	if (!app) { // mount once; the ref updates above re-render in place
		app = createApp(host)
		app.mount('#root')
	}
};

(window as any).unmount = async () => {
	app?.unmount()
	app = undefined
}
