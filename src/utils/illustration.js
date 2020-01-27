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
import { translate as t } from '@nextcloud/l10n'

/**
 * Get an illustration for a given title
 *
 * @param {String} title Title to find illustration for
 * @param {String[]=} categories A list of categories
 * @returns {string} Link to image
 */
export const getIllustrationForTitle = (title, categories = []) => {
	const titleIllustration = findIllustrationForString(title)
	if (titleIllustration) {
		return titleIllustration
	}

	for (const category of categories) {
		const categoryMatch = findIllustrationForString(category)
		if (categoryMatch) {
			return categoryMatch
		}
	}

	return getDefaultIllustration()
}

/**
 * Find an matching illustration for a given string
 *
 * @param {String} str The string to find a matching illustration for
 * @returns {string|null}
 */
function findIllustrationForString(str) {
	for (const illustration of data) {
		for (const illustrationString of illustration.strings) {
			const regex = new RegExp('\\b' + illustrationString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '\\b', 'gi')
			if (str.match(regex) !== null) {
				return imagePath('calendar', 'illustrations/' + illustration.illustrationNames[0])
			}
		}
	}

	return null
}

/**
 * This function returns the default illustration in case there was no match
 *
 * @returns {string}
 */
function getDefaultIllustration() {
	return imagePath('calendar', 'illustrations/no_data')
}

const data = [{
	strings: [
		'Meditation',
		'Relaxing',
		'Relax',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meditation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Relaxing'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Relax'),
	],
	illustrationNames: [
		'relaxation',
		'meditation',
		'a_moment_to_relax',
	],
}, {
	strings: [
		'Presentation',
		'Present',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Presentation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Present'),
	],
	illustrationNames: [
		'presentation',
		'business_plan',
	],
}, {
	strings: [
		'Camping',
		'Camp',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Camping'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Camp'),
	],
	illustrationNames: [
		'camping',
		'into_the_night',
	],
}, {
	strings: [
		'Movie',
		'Cinema',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Movie'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Cinema'),
	],
	illustrationNames: [
		'movie_night',
	],
}, {
	strings: [
		'Graduation',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Graduation'),
	],
	illustrationNames: [
		'graduation',
	],
}, {
	strings: [
		'Brainstorm',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Brainstorm'),
	],
	illustrationNames: [
		'creation_process',
	],
}, {
	strings: [
		'Baseball',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Baseball'),
	],
	illustrationNames: [
		'home_run',
		'greek_freak',
	],
}, {
	strings: [
		'Meeting',
		'Meet',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meeting'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meet'),
	],
	illustrationNames: [
		'meeting',
	],
}, {
	strings: [
		'Office',
		'Contributor week',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Office'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Contributor week'),
	],
	illustrationNames: [
		'in_the_office',
	],
}, {
	strings: [
		'Party',
		'Celebration',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Party'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Celebration'),
	],
	illustrationNames: [
		'celebration',
	],
}, {
	strings: [
		'Mail',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Mail'),
	],
	illustrationNames: [
		'newsletter',
	],
}, {
	strings: [
		'Soccer',
		'Football',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Soccer'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Football'),
	],
	illustrationNames: [
		'goal',
	],
}, {
	strings: [
		'Gaming',
		'Play',
		'Game',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Gaming'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Play'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Game'),
	],
	illustrationNames: [
		'gaming',
		'old_day',
	],
}, {
	strings: [
		'Drive',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Drive'),
	],
	illustrationNames: [
		'electric_car',
	],
}, {
	strings: [
		'Bicycle',
		'Cycle',
		'Biking',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Bicycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Cycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Biking'),
	],
	illustrationNames: [
		'bicycle',
		'biking',
	],
}, {
	strings: [
		'Podcast',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Podcast'),
	],
	illustrationNames: [
		'podcast',
	],
}, {
	strings: [
		'Basketball',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Basketball'),
	],
	illustrationNames: [
		'basketball',
	],
}, {
	strings: [
		'Fishing',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Fishing'),
	],
	illustrationNames: [
		'fishing',
	],
}, {
	strings: [
		'Hiking',
		'Hike',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Hiking'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Hike'),
	],
	illustrationNames: [
		'exploring',
		'hiking',
	],
}, {
	strings: [
		'Art',
		'Exhibition',
		'Museum',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Art'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Exhibition'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Museum'),
	],
	illustrationNames: [
		'art_lover',
	],
}, {
	strings: [
		'Pilates',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Pilates'),
	],
	illustrationNames: [
		'pilates',
	],
}, {
	strings: [
		'Park',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Park'),
	],
	illustrationNames: [
		'a_day_at_the_park',
	],
}, {
	strings: [
		'Studying',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Studying'),
	],
	illustrationNames: [
		'studying',
	],
}, {
	strings: [
		'Doctor',
		'Health',
		'Dentist',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Doctor'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Health'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Dentist'),
	],
	illustrationNames: [
		'doctors',
		'medicine',
	],
}, {
	strings: [
		'Interview',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Interview'),
	],
	illustrationNames: [
		'interview',
	],
}, {
	strings: [
		'Training',
		'Practice',
		'Sports',
		'Exercise',
		'Work out',
		'Working out',
		'Gym',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Training'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Practice'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Sports'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Exercise'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Work out'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Working out'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Gym'),
	],
	illustrationNames: [
		'personal_trainer',
		'working_out',
	],
}, {
	strings: [
		'Barber',
		'Haircut',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Barber'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Haircut'),
	],
	illustrationNames: [
		'barber',
	],
}, {
	strings: [
		'Exam',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Exam'),
	],
	illustrationNames: [
		'exams',
	],
}, {
	strings: [
		'Working',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Working'),
	],
	illustrationNames: [
		'working_remotely',
	],
}, {
	strings: [
		'New Years Eve',
		'NYE',
		'Fireworks',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'New Years Eve'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'NYE'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Fireworks'),
	],
	illustrationNames: [
		'fireworks',
	],
}, {
	strings: [
		'Running',
		'Go for a run',
		'Marathon',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Running'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Go for a run'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Marathon'),
	],
	illustrationNames: [
		'finish_line_katerina_limpitsouni',
	],
}, {
	strings: [
		'Call',
		'Calling',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Call'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Calling'),
	],
	illustrationNames: [
		'calling',
	],
}, {
	strings: [
		'Christmas',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Christmas'),
	],
	illustrationNames: [
		'christmas_tree',
	],
}, {
	strings: [
		'Conference',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Conference'),
	],
	illustrationNames: [
		'conference_speaker',
	],
}, {
	strings: [
		'Pizza',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Pizza'),
	],
	illustrationNames: [
		'pizza_sharing',
	],
}, {
	strings: [
		'Travelling',
		'Travel',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Travelling'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Travel'),
	],
	illustrationNames: [
		'travelers',
		'adventure',
		'travel_plans',
	],
}, {
	strings: [
		'Journey',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Journey'),
	],
	illustrationNames: [
		'journey',
	],
}, {
	strings: [
		'Collaborate',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Collaborate'),
	],
	illustrationNames: [
		'collab',
	],
}, {
	strings: [
		'Lecture',
		'Seminar',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Lecture'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Seminar'),
	],
	illustrationNames: [
		'professor',
	],
}, {
	strings: [
		'Photograph',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Photograph'),
	],
	illustrationNames: [
		'camera',
		'photo_session',
	],
}, {
	strings: [
		'Party',
		'Celebration',
		'Celebrate',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Party'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Celebration'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Celebrate'),
	],
	illustrationNames: [
		'party',
	],
}, {
	strings: [
		'Shopping',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Shopping'),
	],
	illustrationNames: [
		'empty_cart',
		'window_shopping',
	],
}, {
	strings: [
		'Skate',
		'Skateboard',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Skate'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Skateboard'),
	],
	illustrationNames: [
		'skateboard',
	],
}, {
	strings: [
		'Wine tasting',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Wine tasting'),
	],
	illustrationNames: [
		'wine_tasting',
	],
}, {
	strings: [
		'Golf',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Golf'),
	],
	illustrationNames: [
		'golf',
	],
}, {
	strings: [
		'Dinner',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Dinner'),
	],
	illustrationNames: [
		'dinner',
	],
}]

export default getIllustrationForTitle
