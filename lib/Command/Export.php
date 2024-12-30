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
				foreach ($this->exportService->export($calendar, $format) as $chunk) {
					fwrite($handle, $chunk);
				}
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
