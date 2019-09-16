/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { imagePath } from 'nextcloud-router'

export const getIllustrationForTitle = (title) => {
	for (const illustration of data) {
		for (const str of illustration.strings) {
			if (title.includes(str)) {
				return imagePath('calendar', 'illustrations/' + illustration.illustrationNames[0])
			}
		}
	}

	return null
}

const data = [{
	strings: [
		'Meditation',
		'Relaxing',
		'Relax',
		t('calendar', 'Meditation'),
		t('calendar', 'Relaxing'),
		t('calendar', 'Relax'),
	],
	illustrationNames: [
		'relaxation',
		'meditation',
		'a_moment_to_relax'
	],
}, {
	strings: [
		'Presentation',
		'Present',
		t('calendar', 'Presentation'),
		t('calendar', 'Present'),
	],
	illustrationNames: [
		'presentation',
		'business_plan'
	],
}, {
	strings: [
		'Camping',
		'Camp',
		t('calendar', 'Camping'),
		t('calendar', 'Camp'),
	],
	illustrationNames: [
		'camping',
		'into_the_night'
	],
}, {
	strings: [
		'Movie',
		'Cinema',
		t('calendar', 'Movie'),
		t('calendar', 'Cinema'),
	],
	illustrationNames: [
		'movie_night'
	],
}, {
	strings: [
		'Graduation',
		t('calendar', 'Graduation'),
	],
	illustrationNames: [
		'graduation'
	],
}, {
	strings: [
		'Brainstorm',
		t('calendar', 'Brainstorm')
	],
	illustrationNames: [
		'creation_process'
	],
}, {
	strings: [
		'Baseball',
		t('calendar', 'Baseball')
	],
	illustrationNames: [
		'home_run',
		'greek_freak'
	],
}, {
	strings: [
		'Meeting',
		'Meet',
		t('calendar', 'Meeting'),
		t('calendar', 'Meet')
	],
	illustrationNames: [
		'meeting'
	],
}, {
	strings: [
		'Office',
		t('calendar', 'Office')
	],
	illustrationNames: [
		'in_the_office'
	],
}, {
	strings: [
		'Party',
		'Celebration',
		t('calendar', 'Party'),
		t('calendar', 'Celebration')
	],
	illustrationNames: [
		'celebration'
	],
}, {
	strings: [
		'Mail',
		t('calendar', 'Mail')
	],
	illustrationNames: [
		'newsletter'
	],
}, {
	strings: [
		'Soccer',
		'Football',
		t('calendar', 'Soccer'),
		t('calendar', 'Football')
	],
	illustrationNames: [
		'goal'
	],
}, {
	strings: [
		'Gaming',
		'Play',
		'Game',
		t('calendar', 'Gaming'),
		t('calendar', 'Play'),
		t('calendar', 'Game'),
	],
	illustrationNames: [
		'gaming',
		'old_day'
	],
}, {
	strings: [
		'Drive',
		t('calendar', 'Drive')
	],
	illustrationNames: [
		'electric_car'
	],
}, {
	strings: [
		'Bicycle',
		'Cycle',
		'Biking',
		t('calendar', 'Bicycle'),
		t('calendar', 'Cycle'),
		t('calendar', 'Biking'),
	],
	illustrationNames: [
		'bicycle',
		'biking'
	],
}, {
	strings: [
		'Podcast',
		t('calendar', 'Podcast')
	],
	illustrationNames: [
		'podcast'
	],
}, {
	strings: [
		'Basketball',
		t('calendar', 'Basketball')
	],
	illustrationNames: [
		'basketball'
	],
}, {
	strings: [
		'Fishing',
		t('calendar', 'Fishing')
	],
	illustrationNames: [
		'fishing'
	],
}, {
	strings: [
		'Hiking',
		'Hike',
		t('calendar', 'Hiking'),
		t('calendar', 'Hike')
	],
	illustrationNames: [
		'exploring',
		'hiking'
	],
}, {
	strings: [
		'Art',
		'Exhibition',
		'Museum',
		t('calendar', 'Art'),
		t('calendar', 'Exhibition'),
		t('calendar', 'Museum')
	],
	illustrationNames: [
		'art_lover'
	],
}, {
	strings: [
		'Pilates',
		t('calendar', 'Pilates')
	],
	illustrationNames: [
		'pilates'
	],
}, {
	strings: [
		'Park',
		t('calendar', 'Park')
	],
	illustrationNames: [
		'a_day_at_the_park'
	],
}, {
	strings: [
		'Studying',
		t('calendar', 'Studying')
	],
	illustrationNames: [
		'studying'
	],
}, {
	strings: [
		'Doctor',
		'Health',
		t('calendar', 'Doctor'),
		t('calendar', 'Health')
	],
	illustrationNames: [
		'doctors',
		'medicine'
	],
}, {
	strings: [
		'Interview',
		t('calendar', 'Interview')
	],
	illustrationNames: [
		'interview'
	],
}, {
	strings: [
		'Training',
		'Sports',
		'Exercise',
		'Work out',
		'Working out',
		t('calendar', 'Training'),
		t('calendar', 'Sports'),
		t('calendar', 'Exercise'),
		t('calendar', 'Work out'),
		t('calendar', 'Working out')
	],
	illustrationNames: [
		'personal_trainer',
		'working_out'
	],
}, {
	strings: [
		'Barber',
		'Haircut',
		t('calendar', 'Barber'),
		t('calendar', 'Haircut')
	],
	illustrationNames: [
		'barber'
	],
}, {
	strings: [
		'Exam',
		t('calendar', 'Exam')
	],
	illustrationNames: [
		'exams'
	],
}, {
	strings: [
		'Working',
		t('calendar', 'Working')
	],
	illustrationNames: [
		'working_remotely'
	],
}, {
	strings: [
		'New Years Eve',
		'NYE',
		'Fireworks',
		t('calendar', 'New Years Eve'),
		t('calendar', 'NYE'),
		t('calendar', 'Fireworks')
	],
	illustrationNames: [
		'fireworks'
	],
}, {
	strings: [
		'Running',
		'Go for a run',
		'Marathon',
		t('calendar', 'Running'),
		t('calendar', 'Go for a run'),
		t('calendar', 'Marathon')
	],
	illustrationNames: [
		'finish_line_katerina_limpitsouni'
	],
}, {
	strings: [
		'Call',
		'Calling',
		t('calendar', 'Call'),
		t('calendar', 'Calling')
	],
	illustrationNames: [
		'calling'
	],
}, {
	strings: [
		'Christmas',
		t('calendar', 'Christmas')
	],
	illustrationNames: [
		'christmas_tree'
	],
}, {
	strings: [
		'Conference',
		t('calendar', 'Conference')
	],
	illustrationNames: [
		'conference_speaker'
	],
}, {
	strings: [
		'Pizza',
		t('calendar', 'Pizza')
	],
	illustrationNames: [
		'pizza_sharing'
	],
}, {
	strings: [
		'Travelling',
		'Travel',
		t('calendar', 'Travelling'),
		t('calendar', 'Travel')
	],
	illustrationNames: [
		'travelers',
		'adventure',
		'travel_plans'
	],
}, {
	strings: [
		'Journey',
		t('calendar', 'Journey')
	],
	illustrationNames: [
		'journey'
	],
}, {
	strings: [
		'Collaborate',
		t('calendar', 'Collaborate')
	],
	illustrationNames: [
		'collab'
	],
}, {
	strings: [
		'Lecture',
		'Seminar',
		t('calendar', 'Lecture'),
		t('calendar', 'Seminar')
	],
	illustrationNames: [
		'professor'
	],
}, {
	strings: [
		'Photograph',
		t('calendar', 'Photograph')
	],
	illustrationNames: [
		'camera',
		'photo_session'
	],
}, {
	strings: [
		'Party',
		'Celebration',
		'Celebrate',
		t('calendar', 'Party'),
		t('calendar', 'Celebration'),
		t('calendar', 'Celebrate'),
	],
	illustrationNames: [
		'party'
	],
}, {
	strings: [
		'Shopping',
		t('calendar', 'Shopping')
	],
	illustrationNames: [
		'empty_cart',
		'window_shopping'
	],
}, {
	strings: [
		'Skate',
		'Skateboard',
		t('calendar', 'Skate'),
		t('calendar', 'Skateboard')
	],
	illustrationNames: [
		'skateboard'
	],
}, {
	strings: [
		'Wine tasting',
		t('calendar', 'Wine tasting')
	],
	illustrationNames: [
		'wine_tasting'
	],
}, {
	strings: [
		'Golf',
		t('calendar', 'Golf')
	],
	illustrationNames: [
		'golf'
	],
}, {
	strings: [
		'Dinner',
		t('calendar', 'Dinner')
	],
	illustrationNames: [
		'dinner'
	],
}]
