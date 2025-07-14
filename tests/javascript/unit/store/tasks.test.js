/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useTasksStore from '../../../../src/store/unscheduledTasks.js'
import { setActivePinia, createPinia } from 'pinia'

describe('store/tasks test suite', () => {

    setActivePinia(createPinia())

    const tasksStore = useTasksStore()

    it('should provide a default state', () => {
        expect(tasksStore.map).toEqual({})
    })

    const task1 = {
        id: "1-1",
        title: "Task 1",
    }
    const task2 = {
        id: "1-2",
        title: "Task 2",
    }
    const task3 = {
        id: "1-3",
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

    const task4 = {
        id: "1-4",
        title: "Task 4"
    }
    const task5 = {
        id: "1-5",
        title: "Task 5"
    }

    it('should provide a mutation to remove a task - existing', () => {


        tasksStore.appendTask(1, task4)
        tasksStore.appendTask(2, task5)

        tasksStore.removeTask(1, task4)

        expect(tasksStore.map[1]).toEqual([
                task1,
                task2,
                task3
             ])

        expect(tasksStore.map[2]).toEqual([
           task2,
           task5])
    })


    const task6 = {
        id: "1-6",
        title: "Task 6"
    }
    const task7 = {
        id: "1-7",
        title: "Task 7"
    }
    const task8 = {
        id: "1-8",
        title: "Task 8"
    }

    it('should provide a mutation to remove a task - non-existing', () => {


        tasksStore.appendTask(1, task6)
        tasksStore.appendTask(1, task7)

        tasksStore.removeTask(1, task8)

        expect(tasksStore.map[1]).toEqual([task1, task2, task3, task6, task7])

    })
})
