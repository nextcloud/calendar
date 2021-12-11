/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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
 * @param {string} title Title to find illustration for
 * @param {string[]} categories A list of categories
 * @return {string} Link to image
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
 * @param {string} str The string to find a matching illustration for
 * @return {string|null}
 */
function findIllustrationForString(str) {
	for (const illustration of data) {
		for (const illustrationString of illustration.strings) {
			const regex = new RegExp('\\b' + illustrationString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '\\b', 'gi')
			if (str.match(regex) !== null) {
				return imagePath('calendar', 'illustrations/'
								+ illustration.illustrationNames[str.charCodeAt(str.length - 1) % illustration.illustrationNames.length])
			}
		}
	}

	return null
}

/**
 * This function returns the default illustration in case there was no match
 *
 * @return {string}
 */
function getDefaultIllustration() {
	return imagePath('calendar', 'illustrations/no_data')
}

const data = [{
	strings: [
		'Meditation',
		'Relaxing',
		'Relax',
		'Break',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meditation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Relaxing'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Relax'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Break'),
	],
	illustrationNames: [
		'relaxation',
		'meditation',
		'a_moment_to_relax',
	],
}, {
	strings: [
		'Commute',
		'Commuting',
		'Shuttle',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Commute'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Commuting'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Shuttle'),
	],
	illustrationNames: [
		'city_driver',
		'subway',
		'bicycle',
		'biking',
	],
}, {
	strings: [
		'Holiday',
		'Vacation',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Holiday'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Vacation'),
	],
	illustrationNames: [
		'sunlight',
		'outdoor_adventure',
	],
}, {
	strings: [
		'Invoice',
		'Finance',
		'Bank',
		'Money',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Invoice'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Finance'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Bank'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Money'),
	],
	illustrationNames: [
		'pay_online',
		'personal_finance',
	],
}, {
	strings: [
		'Wedding',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Wedding'),
	],
	illustrationNames: [
		'wedding',
	],
}, {
	strings: [
		'Dog',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Dog'),
	],
	illustrationNames: [
		'dog_walking',
	],
}, {
	strings: [
		'Concert',
		'Festival',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Concert'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Festival'),
	],
	illustrationNames: [
		'compose_music',
	],
}, {
	strings: [
		'Theater',
		'Theatre',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Theater'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Theatre'),
	],
	illustrationNames: [
		'awards',
	],
}, {
	strings: [
		'Presentation',
		'Talk',
		'Speech',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Presentation'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Talk'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Speech'),
	],
	illustrationNames: [
		'presentation',
		'business_plan',
		'candidate',
	],
}, {
	strings: [
		'Deadline',
		'Submission',
		'Reporting',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Deadline'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Submission'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Reporting'),
	],
	illustrationNames: [
		'charts',
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
		'outdoor_adventure',
	],
}, {
	strings: [
		'Election',
		'Voting',
		'Vote',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Election'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Voting'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Vote'),
	],
	illustrationNames: [
		'voting',
	],
}, {
	strings: [
		'Barbecue',
		'Barbeque',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Barbecue'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Barbeque'),
	],
	illustrationNames: [
		'barbecue',
	],
}, {
	strings: [
		'Garden',
		'Farm',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Garden'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Farm'),
	],
	illustrationNames: [
		'gardening',
		'farm_girl',
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
		'Review',
		'Audit',
		'Inspection',
		'Proofreading',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Review'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Audit'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Inspection'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Proofreading'),
	],
	illustrationNames: [
		'reviewed_docs',
		'certification',
	],
}, {
	strings: [
		'Baseball',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Baseball'),
	],
	illustrationNames: [
		'home_run',
	],
}, {
	strings: [
		'Meeting',
		'Meet',
		'Planning',
		'Pointing',
		'Retrospective', 'Retro',
		'Review',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meeting'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Meet'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Planning'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Pointing'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Retrospective'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Review'),
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
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Gaming'),
	],
	illustrationNames: [
		'gaming',
		'old_day',
	],
}, {
	strings: [
		'Drive',
		'Driving',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Drive'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Driving'),
	],
	illustrationNames: [
		'electric_car',
	],
}, {
	strings: [
		'Bicycle',
		'Cycle',
		'Cycling',
		'Biking',
		'Bike',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Bicycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Cycle'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Cycling'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Biking'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Bike'),
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
		'greek_freak',
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
		'art_museum',
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
		'Walk',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Park'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Walk'),
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
		'Hospital',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Doctor'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Health'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Dentist'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Hospital'),
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
		'Hairdresser',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Barber'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Haircut'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Hairdresser'),
	],
	illustrationNames: [
		'barber',
	],
}, {
	strings: [
		'Exam',
		'Written test',
		'Oral test',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Exam'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Written test'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Oral test'),
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
		'Video-conference',
		'Video conference',
		'Videoconference',
		'Conference-call',
		'Conference call',
		'Conferencecall',
		'Video-call',
		'Video call',
		'Videocall',
		'Video-chat',
		'Video chat',
		'Videochat',
		'Video-meeting',
		'Video meeting',
		'Videomeeting',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Video-conference'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Conference-call'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Video-call'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Video-chat'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Video-meeting'),
	],
	illustrationNames: [
		'conference_call',
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
		'Trip',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Travelling'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Travel'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Trip'),
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
		'Pair',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Collaborate'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Pair'),
	],
	illustrationNames: [
		'collab',
	],
}, {
	strings: [
		'Lecture',
		'Seminar',
		'Teaching',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Lecture'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Seminar'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Teaching'),
	],
	illustrationNames: [
		'professor',
		'teaching',
	],
}, {
	strings: [
		'Photograph', 'Photo',
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
		'celebration',
	],
}, {
	strings: [
		'Birthday',
		'Anniversary',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Birthday'),
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Anniversary'),
	],
	illustrationNames: [
		'birthday_cake',
		'gift',
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
		'Groceries',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Groceries'),
	],
	illustrationNames: [
		'empty_cart',
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
}, {
	strings: [
		'Lunch',
		// TRANSLATORS This string is used for matching the event title to an illustration
		t('calendar', 'Lunch'),
	],
	illustrationNames: [
		'eating_together',
	],
}]

export default getIllustrationForTitle
