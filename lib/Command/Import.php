<?php
/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Command;

use OCA\Calendar\Service\Import\ImportService;
use OCP\Calendar\CalendarImportSettings;
use OCP\Calendar\ICalendarImport;
use OCP\Calendar\IManager;
use OCP\IUserManager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class Import extends Command {
	public function __construct(
		private IUserManager $userManager,
		private IManager $calendarManager,
		private ImportService $importService,
	) {
		parent::__construct();
	}

	protected function configure(): void {
		$this->setName('calendar:import')
			 ->setDescription('Import a file or stream')
			 ->addArgument('uid', InputArgument::REQUIRED, 'Id of system user')
			 ->addArgument('cid', InputArgument::REQUIRED, 'Id of calendar')
			 ->addArgument('format', InputArgument::OPTIONAL, 'Format of output (iCal, jCal, xCal) default to iCal')
			 ->addArgument('location', InputArgument::OPTIONAL, 'location of where to write the output. defaults to stdin');
	}

	protected function execute(InputInterface $input, OutputInterface $output): int {
		
		$userId = $input->getArgument('uid');
		$calendarId = $input->getArgument('cid');
		$format = $input->getArgument('format');
		$location = $input->getArgument('location');

		if (!$this->userManager->userExists($userId)) {
			throw new \InvalidArgumentException("User <$userId> not found.");
		}
		// retrieve calendar and evaluate if import is supported and writeable
		$calendars = $this->calendarManager->getCalendarsForPrincipal('principals/users/' . $userId, [$calendarId]);
		if ($calendars === []) {
			throw new \InvalidArgumentException("Calendar <$calendarId> not found.");
		}
		$calendar = $calendars[0];
		if ($calendar instanceof ICalendarImport) {
			//throw new \InvalidArgumentException("Calendar <$calendarId> dose support this function");
		}
		if (!$calendar->isWritable()) {
			throw new \InvalidArgumentException("Calendar <$calendarId> is not writeable");
		}
		if ($calendar->isDeleted()) {
			throw new \InvalidArgumentException("Calendar <$calendarId> is deleted");
		}
		// construct settings object
		$settings = new CalendarImportSettings();
		// evaluate if provided format is supported
		if ($format !== null && !in_array($format, $this->importService::FORMATS)) {
			throw new \InvalidArgumentException("Format <$format> is not valid.");
		} elseif ($format === null) {
			$settings->format = 'ical';
		}
		// evaluate if a valid location was given and is usable otherwise default to stdin
		if ($location !== null) {
			$input = fopen($location, "r");
			if ($input === false) {
				throw new \InvalidArgumentException("Location <$location> is not valid. Can not open location for read operation.");
			} else {
				try {
					$this->importService->import($input, $calendar, $settings);
				} finally {
					fclose($input);
				}
			}
		} else {
			$input = fopen('php://stdin', 'r');
			if ($input === false) {
				throw new \InvalidArgumentException("Can not open stdin for read operation.");
			} else {
				try {
					$temp = tmpfile();
					while (!feof($input)) {
						fwrite($temp, fread($input, 8192));
					}
					fseek($temp, 0);
					$this->importService->import($temp, $calendar, $settings);
				} finally {
					fclose($input);
					fclose($temp);
				}
			}
		}

		return self::SUCCESS;
	}
}
