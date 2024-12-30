<?php
/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Command;

use OCA\Calendar\Service\Export\ExportService;
use OCP\Calendar\ICalendarExport;
use OCP\Calendar\IManager;
use OCP\IUserManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Export extends Command {
	public function __construct(
		private IUserManager $userManager,
		private IManager $calendarManager,
		private ExportService $exportService,
	) {
		parent::__construct();
	}

	protected function configure(): void {
		$this->setName('calendar:export')
			 ->setDescription('Export a specific calendar for a user')
			 ->addArgument('uid', InputArgument::REQUIRED, 'Id of system user')
			 ->addArgument('cid', InputArgument::REQUIRED, 'Id of calendar')
			 ->addArgument('format', InputArgument::OPTIONAL, 'Format of output (iCal, jCal, xCal) default to iCal')
			 ->addArgument('location', InputArgument::OPTIONAL, 'location of where to write the output. defaults to stdout');
	}

	protected function execute(InputInterface $input, OutputInterface $output): int {
		
		$userId = $input->getArgument('uid');
		$calendarId = $input->getArgument('cid');
		$format = $input->getArgument('format');
		$location = $input->getArgument('location');

		if (!$this->userManager->userExists($userId)) {
			throw new \InvalidArgumentException("User <$userId> not found.");
		}
		// retrieve calendar and evaluate if export is supported
		$calendars = $this->calendarManager->getCalendarsForPrincipal('principals/users/' . $userId, [$calendarId]);
		if ($calendars === []) {
			throw new \InvalidArgumentException("Calendar <$calendarId> not found.");
		}
		$calendar = $calendars[0];
		/*
		if ($calendar instanceof ICalendarExport) {
			throw new \InvalidArgumentException("Calendar <$calendarId> dose support this function");
		}
		*/
		// evaluate if requested format is supported
		if ($format !== null && !in_array($format, $this->exportService::FORMATS)) {
			throw new \InvalidArgumentException("Format <$format> is not valid.");
		} elseif ($format === null) {
			$format = 'ical';
		}
		// evaluate is a valid location was given and is usable otherwise output to stdout
		if ($location !== null) {
			$handle = fopen($location, "w");
			if ($handle === false) {
				throw new \InvalidArgumentException("Location <$location> is not valid. Can not open location for write operation.");
			} else {

				fwrite($handle, "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//IDN nextcloud.com//Calendar App//EN\n");
				

				for ($i=0; $i < 16384; $i++) { 
					
				$id = uniqid();
				fwrite(
					$handle,
'BEGIN:VEVENT
CREATED:20240910T123608Z
LAST-MODIFIED:20240916T075225Z
DTSTAMP:20240916T075225Z
UID:' . $id . PHP_EOL .
'SUMMARY:Brainstorming workshop- Collectives - Room A
STATUS:CONFIRMED
ORGANIZER;CN=Irina Mikhaylina;SCHEDULE-STATUS=1.1:mailto:irina.mikhaylina@n
 extcloud.com
ATTENDEE;RSVP=TRUE;CN=Jonas Meurer;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL;
 ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:jonas.meurer@n
 extcloud.com
ATTENDEE;RSVP=TRUE;CN=Simon Lindner;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL
 ;ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:simon.lindner
 @nextcloud.com
ATTENDEE;RSVP=TRUE;CN=Louis Chemineau;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDU
 AL;ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:louis.chemi
 neau@nextcloud.com
ATTENDEE;RSVP=TRUE;CN=Jenna Stocks;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL;
 ROLE=REQ-PARTICIPANT;LANGUAGE=en_GB;SCHEDULE-STATUS=1.1:mailto:jenna.stock
 s@nextcloud.com
ATTENDEE;RSVP=TRUE;CN=Marcel Hibbe;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL;
 ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:marcel.hibbe@n
 extcloud.com
ATTENDEE;RSVP=TRUE;CN=Peter Mocanu;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL;
 ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:peter.mocanu@n
 extcloud.com
ATTENDEE;RSVP=TRUE;CN=Cyprien Edouard;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDU
 AL;ROLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:cyprien.edo
 uard@nextcloud.com
ATTENDEE;RSVP=TRUE;CN=Kim Pohlmann;PARTSTAT=NEEDS-ACTION;CUTYPE=INDIVIDUAL;
 ROLE=REQ-PARTICIPANT;LANGUAGE=de;SCHEDULE-STATUS=1.1:mailto:kim.pohlmann@n
 extcloud.com
ATTENDEE;RSVP=TRUE;CN=Tobias Kaminsky;PARTSTAT=ACCEPTED;CUTYPE=INDIVIDUAL;R
 OLE=REQ-PARTICIPANT;LANGUAGE=en;SCHEDULE-STATUS=1.1:mailto:tobias.kaminsky
 @nextcloud.com
DTSTART;TZID=Europe/Berlin:20240919T100000
DTEND;TZID=Europe/Berlin:20240919T110000
SEQUENCE:4
LOCATION:Room A (ground floor)
DESCRIPTION:Hello dear team\,  \n  \nwe would like to invite you to join ou
 r upcoming Product Brainstorming Session\, where we will come together in 
 a group of 10 people to spark creativity and collaborate on potential new 
 features for Nextcloud apps 💥  Here is the structure of the session:\n\
 n1. Introduction (5 minutes): We\'ll start with a brief introduction from t
 he design team\, followed by participants introducing themselves. To make 
 things fun and relaxed\, we\'ll choose a moderator from the group. We’ll 
 just ask for volunteers on the spot\, so no one feels pressured or assigne
 d without their agreement.\n\n2. App Demo (10 minutes): Next\, the develop
 er of each team will share their screen and give a short demo of the app\,
  walking everyone through its current features and explaining what it does
 .\n\n3. Idea Generation (10 minutes): After the demo\, it\'s time for every
 one to jot down ideas for new features or improvements they\'d like to see.
  You can come up with up to 5 ideas and stick them on a whiteboard for us 
 all to review.\n\n4. Discussion (25 minutes): The moderator will then go t
 hrough each idea on the board. The person who wrote it will explain their 
 thought process\, and then we’ll open the floor for feedback. Everyone c
 an share whether they agree\, disagree\, or offer praise and suggestions.\
 n\n5. Prioritization (10 minutes): We’ll pick the most important ideas b
 ased on our discussion.\n\nThroughout the session\, the moderator will kee
 p track of time and ensure we don’t spend too long on any one idea 🤓 
 \n\nIf you have any questions\, feel free to reach out with me!\n\nKind re
 gards\nIrina
X-MOZ-GENERATION:1
END:VEVENT
'
				);
			}
			fwrite($handle, "END:VCALENDAR\n");
				/*
				foreach ($this->exportService->export($calendar, $format) as $chunk) {
					fwrite($handle, $chunk);
				}
				*/
				fclose($handle);
			}
		} else {
			foreach ($this->exportService->export($calendar, $format) as $chunk) {
				$output->writeln($chunk);
			}
		}

		return self::SUCCESS;
	}
}
