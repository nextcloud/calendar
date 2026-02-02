/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useTasksStore from '../../../../src/store/unscheduledTasks.js'
import { setActivePinia, createPinia } from 'pinia'

describe('store/tasks test suite', () => {

	let tasksStore

	beforeEach(() => {
		setActivePinia(createPinia())
		tasksStore = useTasksStore()
	})

    it('should provide a default state', () => {
        expect(tasksStore.map).toEqual({})
    })

    const task1 = {
        id: "1",
        title: "Task 1",
    }
    const task2 = {
        id: "2",
        title: "Task 2",
    }
    const task3 = {
        id: "3",
        title: "Task 3",
    }

    it('should provide a mutation to add a task', () => {


        tasksStore.appendTask(1, task1)
        tasksStore.appendTask(2, task2)
        tasksStore.appendTask(3, task3)

        // It should not add the same again:
        tasksStore.appendTask(1, task1)

        expect(tasksStore.map[1]).toEqual([
            task1
        ])

        tasksStore.appendTask(1, task3)
        tasksStore.appendTask(1, task2)

        tasksStore.finishCalendar(1)

        expect(tasksStore.map[1]).toEqual([
            task1,
            task2,
            task3
        ])
    })

    it('should provide a mutation to remove a task - existing', () => {
        tasksStore.appendTask(1, task1)
        tasksStore.removeTask(1, task1)

        expect(tasksStore.map[1]).toEqual([])
    })

    it('should provide a mutation to remove a task - non-existing', () => {
        tasksStore.appendTask(1, task1)
        tasksStore.removeTask(1, task2)

        expect(tasksStore.map[1]).toEqual([task1])
    })
})
