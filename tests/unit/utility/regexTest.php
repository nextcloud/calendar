<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Utility;

class RegexTest extends \PHPUnit_Framework_TestCase {

	public function testURI() {
		// URI not used anywhere in the code?
		$this->assertSame( preg_match(RegexUtility::URI, "a"), 1 );
		$this->assertSame( preg_match(RegexUtility::URI, "areallylongURIcontaininglowercaseUPPERCASEAndNumbers0123456789"), 1 );

		$this->assertSame( preg_match(RegexUtility::URI, "" ), 0 );
		$this->assertSame( preg_match(RegexUtility::URI, "!)/§$=§§"), 0 );
	}


	public function testVEVENT() {

		$missingNewLineVEVENT = "BEGIN:VEVENTEND:VEVENT";
		$incompleteVEVENT = "BEGIN:VEVENT";
		$minimalVEVENT = "BEGIN:VEVENT

END:VEVENT
";
		$longerVEVENT = "BEGIN:VEVENT
UID:uid1@example.com
DTSTAMP:19970714T170000Z
ORGANIZER;CN=John Doe:MAILTO:john.doe@example.com
DTSTART:19970714T170000Z
DTEND:19970715T035959Z
SUMMARY:Bastille Day Party
END:VEVENT
";
		$this->assertSame ( preg_match(RegexUtility::VEVENT, ""), 0);
		$this->assertSame ( preg_match(RegexUtility::VEVENT, $missingNewLineVEVENT), 0);
		$this->assertSame ( preg_match(RegexUtility::VEVENT, $incompleteVEVENT), 0);
		$this->assertSame ( preg_match(RegexUtility::VEVENT, $minimalVEVENT), 1);
		$this->assertSame ( preg_match(RegexUtility::VEVENT, $longerVEVENT), 1);
	}


	public function testVJOURNAL() {
		$invalidVJOURNAL = "BEGIN:VJOURNAL  END:VJOURNAL";
		$incompleteVJOURNAL = "BEGIN:VJOURNAL

END:VJO
";
		$minimalVJOURNAL = "BEGIN:VJOURNAL

END:VJOURNAL
";
		$longerVJOURNAL = "BEGIN:VJOURNAL
DTSTAMP:19970324T120000Z
UID:uid5@example.com
ORGANIZER:MAILTO:jsmith@example.com
STATUS:DRAFT
CLASS:PUBLIC
CATEGORIES:Project Report, XYZ, Weekly Meeting
DESCRIPTION:Project xyz Review Meeting Minutes\n
 Agenda\n1. Review of project version 1.0 requirements.\n2.
 Definition
 of project processes.\n3. Review of project schedule.\n
 Participants: John Smith, Jane Doe, Jim Dandy\n-It was
  decided that the requirements need to be signed off by
  product marketing.\n-Project processes were accepted.\n
 -Project schedule needs to account for scheduled holidays
  and employee vacation time. Check with HR for specific
  dates.\n-New schedule will be distributed by Friday.\n-
 Next weeks meeting is cancelled. No meeting until 3/23.
END:VJOURNAL
";

		$this->assertSame ( preg_match(RegexUtility::VJOURNAL, ""), 0 );
		$this->assertSame ( preg_match(RegexUtility::VJOURNAL, $invalidVJOURNAL), 0);
		$this->assertSame ( preg_match(RegexUtility::VJOURNAL, $incompleteVJOURNAL), 0);
		$this->assertSame ( preg_match(RegexUtility::VJOURNAL, $minimalVJOURNAL), 1);
		$this->assertSame ( preg_match(RegexUtility::VJOURNAL, $longerVJOURNAL), 1);
	}


	public function testVTODO() {
		$invalidVTODO = "BEGIN:VTODO  END:VTODO";
		$incompleteVTODO = "BEGIN:VTODO

		END:VTOD";
		$minimalVTODO = "BEGIN:VTODO

END:VTODO
";
		$longerVTODO = "BEGIN:VTODO
DTSTAMP:19980130T134500Z
SEQUENCE:2
UID:uid4@example.com
DUE:19980415T235959
STATUS:NEEDS-ACTION
SUMMARY:Submit Income Taxes
BEGIN:VALARM
ACTION:AUDIO
TRIGGER:19980403T120000
ATTACH;FMTTYPE=audio/basic:http://example.com/pub/audio-files/ssbanner.aud
REPEAT:4
DURATION:PT1H
END:VALARM
END:VTODO
";

		$this->assertSame ( preg_match(RegexUtility::VTODO, ""), 0 );
		$this->assertSame ( preg_match(RegexUtility::VTODO, $invalidVTODO), 0);
		$this->assertSame ( preg_match(RegexUtility::VTODO, $incompleteVTODO), 0);
		$this->assertSame ( preg_match(RegexUtility::VTODO, $minimalVTODO), 1);
		$this->assertSame ( preg_match(RegexUtility::VTODO, $longerVTODO), 1);
	}


	public function testVFREEBUSY() {
		$invalidVFREEBUSY = "BEGIN:VFREEBUSY  END:VFREEBUSY";
		$incompleteVFREEBUSY = "BEGIN:VFREEBUSY

		END:VFREE";
		$minimalVFREEBUSY = "BEGIN:VFREEBUSY

END:VFREEBUSY
";
		$longerVFREEBUSY = "BEGIN:VFREEBUSY
ORGANIZER:MAILTO:jsmith@example.com
DTSTART:19980313T141711Z
DTEND:19980410T141711Z
FREEBUSY:19980314T233000Z/19980315T003000Z
FREEBUSY:19980316T153000Z/19980316T163000Z
FREEBUSY:19980318T030000Z/19980318T040000Z
URL:http://www.example.com/calendar/busytime/jsmith.ifb
END:VFREEBUSY
";

		$this->assertSame ( preg_match(RegexUtility::VFREEBUSY, ""), 0 );
		$this->assertSame( preg_match(RegexUtility::VFREEBUSY, $invalidVFREEBUSY), 0);
		$this->assertSame( preg_match(RegexUtility::VFREEBUSY, $incompleteVFREEBUSY), 0);

		$this->assertSame ( preg_match(RegexUtility::VFREEBUSY, $minimalVFREEBUSY), 1);
		$this->assertSame ( preg_match(RegexUtility::VFREEBUSY, $longerVFREEBUSY), 1);

	}


	public function testVTIMEZONE() {
		$invalidVTIMEZONE = "BEGIN:VTIMEZONE  END:VTIMEZONE";

		$invalidVTIMEZONE2 = "BEGIN:TIMEZONE  END:TIMEZONE";
		$incompleteVTIMEZONE = "BEGIN:VTIMEZONE

END:VTIMEZON
";
		$minimalVTIMEZONE = "BEGIN:VTIMEZONE

END:VTIMEZONE
";
		$longerVTIMEZONE = "BEGIN:VTIMEZONE
TZID:US-Eastern
LAST-MODIFIED:19870101T000000Z
BEGIN:STANDARD
DTSTART:19971026T020000
RDATE:19971026T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19971026T020000
RDATE:19970406T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
END:DAYLIGHT
END:VTIMEZONE
";

		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, ""), 0 );
		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, $invalidVTIMEZONE), 0);
		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, $invalidVTIMEZONE2), 0);
		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, $incompleteVTIMEZONE), 0);
		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, $minimalVTIMEZONE), 1);
		$this->assertSame ( preg_match(RegexUtility::VTIMEZONE, $longerVTIMEZONE), 1);
	}
}
