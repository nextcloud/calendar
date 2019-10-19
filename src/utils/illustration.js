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
import { imagePath } from '@nextcloud/router'
import { translate } from '@nextcloud/l10n'

/**
 * Get an illustration for a given title
 *
 * @param {String} title Title to find illustration for
 * @returns {string} Link to image
 */
export const getIllustrationForTitle = (title) => {
	for (const illustration of data) {
		for (const str of illustration.strings) {
			if (title.toLowerCase().includes(str.toLowerCase())) {
				// TODO: vary if there are multiple illustrationNames
				return imagePath('calendar', 'illustrations/' + illustration.illustrationNames[0])
			}
		}
	}

	return imagePath('calendar', 'illustrations/no_data')
}

const data = [{
	strings: [
		'Meditation',
		'Relaxing',
		'Relax',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Meditation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Relaxing'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Relax')
	],
	illustrationNames: [
		'relaxation',
		'meditation',
		'a_moment_to_relax'
	]
}, {
	strings: [
		'Presentation',
		'Present',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Presentation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Present')
	],
	illustrationNames: [
		'presentation',
		'business_plan'
	]
}, {
	strings: [
		'Camping',
		'Camp',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Camping'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Camp')
	],
	illustrationNames: [
		'camping',
		'into_the_night'
	]
}, {
	strings: [
		'Movie',
		'Cinema',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Movie'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Cinema')
	],
	illustrationNames: [
		'movie_night'
	]
}, {
	strings: [
		'Graduation',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Graduation')
	],
	illustrationNames: [
		'graduation'
	]
}, {
	strings: [
		'Brainstorm',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Brainstorm')
	],
	illustrationNames: [
		'creation_process'
	]
}, {
	strings: [
		'Baseball',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Baseball')
	],
	illustrationNames: [
		'home_run',
		'greek_freak'
	]
}, {
	strings: [
		'Meeting',
		'Meet',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Meeting'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Meet')
	],
	illustrationNames: [
		'meeting'
	]
}, {
	strings: [
		'Office',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Office')
	],
	illustrationNames: [
		'in_the_office'
	]
}, {
	strings: [
		'Party',
		'Celebration',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Party'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Celebration')
	],
	illustrationNames: [
		'celebration'
	]
}, {
	strings: [
		'Mail',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Mail')
	],
	illustrationNames: [
		'newsletter'
	]
}, {
	strings: [
		'Soccer',
		'Football',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Soccer'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Football')
	],
	illustrationNames: [
		'goal'
	]
}, {
	strings: [
		'Gaming',
		'Play',
		'Game',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Gaming'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Play'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Game')
	],
	illustrationNames: [
		'gaming',
		'old_day'
	]
}, {
	strings: [
		'Drive',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Drive')
	],
	illustrationNames: [
		'electric_car'
	]
}, {
	strings: [
		'Bicycle',
		'Cycle',
		'Biking',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Bicycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Cycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Biking')
	],
	illustrationNames: [
		'bicycle',
		'biking'
	]
}, {
	strings: [
		'Podcast',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Podcast')
	],
	illustrationNames: [
		'podcast'
	]
}, {
	strings: [
		'Basketball',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Basketball')
	],
	illustrationNames: [
		'basketball'
	]
}, {
	strings: [
		'Fishing',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Fishing')
	],
	illustrationNames: [
		'fishing'
	]
}, {
	strings: [
		'Hiking',
		'Hike',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Hiking'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Hike')
	],
	illustrationNames: [
		'exploring',
		'hiking'
	]
}, {
	strings: [
		'Art',
		'Exhibition',
		'Museum',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Art'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Exhibition'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Museum')
	],
	illustrationNames: [
		'art_lover'
	]
}, {
	strings: [
		'Pilates',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Pilates')
	],
	illustrationNames: [
		'pilates'
	]
}, {
	strings: [
		'Park',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Park')
	],
	illustrationNames: [
		'a_day_at_the_park'
	]
}, {
	strings: [
		'Studying',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Studying')
	],
	illustrationNames: [
		'studying'
	]
}, {
	strings: [
		'Doctor',
		'Health',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Doctor'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Health')
	],
	illustrationNames: [
		'doctors',
		'medicine'
	]
}, {
	strings: [
		'Interview',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Interview')
	],
	illustrationNames: [
		'interview'
	]
}, {
	strings: [
		'Training',
		'Sports',
		'Exercise',
		'Work out',
		'Working out',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Training'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Sports'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Exercise'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Work out'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Working out')
	],
	illustrationNames: [
		'personal_trainer',
		'working_out'
	]
}, {
	strings: [
		'Barber',
		'Haircut',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Barber'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Haircut')
	],
	illustrationNames: [
		'barber'
	]
}, {
	strings: [
		'Exam',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Exam')
	],
	illustrationNames: [
		'exams'
	]
}, {
	strings: [
		'Working',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Working')
	],
	illustrationNames: [
		'working_remotely'
	]
}, {
	strings: [
		'New Years Eve',
		'NYE',
		'Fireworks',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'New Years Eve'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'NYE'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Fireworks')
	],
	illustrationNames: [
		'fireworks'
	]
}, {
	strings: [
		'Running',
		'Go for a run',
		'Marathon',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Running'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Go for a run'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Marathon')
	],
	illustrationNames: [
		'finish_line_katerina_limpitsouni'
	]
}, {
	strings: [
		'Call',
		'Calling',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Call'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Calling')
	],
	illustrationNames: [
		'calling'
	]
}, {
	strings: [
		'Christmas',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Christmas')
	],
	illustrationNames: [
		'christmas_tree'
	]
}, {
	strings: [
		'Conference',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Conference')
	],
	illustrationNames: [
		'conference_speaker'
	]
}, {
	strings: [
		'Pizza',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Pizza')
	],
	illustrationNames: [
		'pizza_sharing'
	]
}, {
	strings: [
		'Travelling',
		'Travel',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Travelling'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Travel')
	],
	illustrationNames: [
		'travelers',
		'adventure',
		'travel_plans'
	]
}, {
	strings: [
		'Journey',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Journey')
	],
	illustrationNames: [
		'journey'
	]
}, {
	strings: [
		'Collaborate',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Collaborate')
	],
	illustrationNames: [
		'collab'
	]
}, {
	strings: [
		'Lecture',
		'Seminar',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Lecture'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Seminar')
	],
	illustrationNames: [
		'professor'
	]
}, {
	strings: [
		'Photograph',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Photograph')
	],
	illustrationNames: [
		'camera',
		'photo_session'
	]
}, {
	strings: [
		'Party',
		'Celebration',
		'Celebrate',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Party'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Celebration'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Celebrate')
	],
	illustrationNames: [
		'party'
	]
}, {
	strings: [
		'Shopping',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Shopping')
	],
	illustrationNames: [
		'empty_cart',
		'window_shopping'
	]
}, {
	strings: [
		'Skate',
		'Skateboard',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Skate'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Skateboard')
	],
	illustrationNames: [
		'skateboard'
	]
}, {
	strings: [
		'Wine tasting',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Wine tasting')
	],
	illustrationNames: [
		'wine_tasting'
	]
}, {
	strings: [
		'Golf',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Golf')
	],
	illustrationNames: [
		'golf'
	]
}, {
	strings: [
		'Dinner',
		// TRANSLATORS This string is used for matching the event title to an illustration
		translate('calendar', 'Dinner')
	],
	illustrationNames: [
		'dinner'
	]
}]
