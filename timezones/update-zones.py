#!/usr/bin/python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""
This script allows updating Lightning's zones.json.
  python update-zones.py --vzic /path/to/tzurl/vzic --tzdata /path/to/latest/tzdata

You can also have the latest tzdata downloaded automatically:
  python update-zones.py --vzic /path/to/tzurl/vzic

IMPORTANT: Make sure your local copy of zones.json is in sync with Hg before running this script.
Otherwise manual corrections will get dropped when pushing the update.

"""

from __future__ import absolute_import

import argparse, ftplib, json, os, os.path, re, shutil, subprocess, sys, tarfile, tempfile
from collections import OrderedDict
from datetime import date, timedelta

# Keep timezone changes from this date onwards. If the zones.json file is becoming
# too large, consider changing to a later date.
HISTORY_CUTOFF = 20180101
FUTURE_CUTOFF = 20221231


class TimezoneUpdater(object):
    """ Timezone updater class, use the run method to do everything automatically"""
    def __init__(self, tzdata_path, zoneinfo_pure_path):
        self.tzdata_path = tzdata_path
        self.zoneinfo_pure_path = zoneinfo_pure_path

    def download_tzdata(self):
        """Download the latest tzdata from ftp.iana.org"""
        tzdata_download_path = tempfile.mktemp(".tar.gz", prefix="zones")
        sys.stderr.write("Downloading tzdata-latest.tar.gz from"
                         " ftp.iana.org to %s\n" % tzdata_download_path)
        ftp = ftplib.FTP("ftp.iana.org")
        ftp.login()
        ftp.retrbinary("RETR /tz/tzdata-latest.tar.gz", open(tzdata_download_path, "wb").write)
        ftp.quit()

        self.tzdata_path = tempfile.mkdtemp(prefix="zones")
        sys.stderr.write("Extracting %s to %s\n" % (tzdata_download_path, self.tzdata_path))
        tarfile.open(tzdata_download_path).extractall(path=self.tzdata_path)
        os.unlink(tzdata_download_path)

    def get_tzdata_version(self):
        """Extract version number of tzdata files."""
        version = None
        with open(os.path.join(self.tzdata_path, "version"), "r") as versionfile:
            for line in versionfile:
                match = re.match(r"\w+", line)
                if match is not None:
                    version = "2." + match.group(0)
                    break
        return version

    def run_vzic(self, vzic_path):
        """Use vzic to create ICS versions of the data."""

        # Use `vzic` to create zone files.
        sys.stderr.write("Exporting pure zone info to %s\n" % self.zoneinfo_pure_path)
        subprocess.check_call([
            vzic_path,
            "--olson-dir", self.tzdata_path,
            "--output-dir", self.zoneinfo_pure_path,
            "--pure"
        ], stdout=sys.stderr)

    def read_backward(self):
        """Read the 'backward' file, which contains timezone identifier links"""
        links = {}
        with open(os.path.join(self.tzdata_path, "backward"), "r") as backward:
            for line in backward:
                parts = line.strip().split()
                if len(parts) == 3 and parts[0] == "Link":
                    _, tgt, src = parts
                    links[src] = tgt
        return links

    def read_zones_tab(self):
        """Read zones.tab for latitude and longitude data."""
        lat_long_data = {}
        with open(os.path.join(self.zoneinfo_pure_path, "zones.tab"), "r") as tab:
            for line in tab:
                if len(line) < 19:
                    sys.stderr.write("Line in zones.tab not long enough: %s\n" % line.strip())
                    continue

                [latitude, longitude, name] = line.rstrip().split(" ", 2)
                lat_long_data[name] = (latitude, longitude)

        return lat_long_data

    def read_ics(self, filename, lat_long_data):
        """Read a single zone's ICS files."""
        with open(os.path.join(self.zoneinfo_pure_path, filename), "r") as zone:
            zoneinfo_pure = zone.readlines()

        # Loop through the lines of the file, splitting it into components.
        components = []
        current_component = None
        for i in range(0, len(zoneinfo_pure)):
            line = zoneinfo_pure[i].rstrip()
            [key, value] = line.split(":", 1)

            if line in ["BEGIN:STANDARD", "BEGIN:DAYLIGHT"]:
                current_component = {"line": i, "type": value}

            elif line in ["END:STANDARD", "END:DAYLIGHT"]:
                components.append(current_component)
                current_component = None

            elif current_component:
                if key == "RDATE":
                    if "rdates" not in current_component:
                        current_component["rdates"] = []
                    current_component["rdates"].append(value)
                else:
                    current_component[key] = value

        # Create a copy of each component for every date that it started.
        # Later, we'll sort them into order of starting date.
        components_by_start_date = {}
        for component in components:
            max_rdate = int(component["DTSTART"][0:8])
            components_by_start_date[max_rdate] = component
            if "rdates" in component:
                for rdate in component["rdates"]:
                    rdate = int(rdate[0:8])
                    max_rdate = max(rdate, max_rdate)
                    components_by_start_date[rdate] = component
                component["valid_rdates"] = filter(
                    lambda rd: FUTURE_CUTOFF >= int(rd[0:8]) >= HISTORY_CUTOFF,
                    component["rdates"]
                )
            component["max_date"] = max_rdate

        # Sort, and keep only the components in use since the cutoff date.
        kept_components = []
        finished = False
        for key in sorted(components_by_start_date.keys(), reverse=True):
            if key > FUTURE_CUTOFF:
                continue
            component = components_by_start_date[key]
            if finished and "RRULE" not in component:
                continue
            if "used" in component:
                continue
            component["used"] = True
            kept_components.append(component)
            if key <= HISTORY_CUTOFF:
                finished = True

        for i in range(len(kept_components)):
            component = kept_components[i]
            last = i == len(kept_components) - 1
            # In this block of code, we attempt to match what vzic does when
            # creating "Outlook-compatible" timezone files. This is to minimize
            # changes in our zones.json file. And to be more Outlook-compatible.
            if int(component["DTSTART"][0:8]) < HISTORY_CUTOFF:
                if not last and "valid_rdates" in component and len(component["valid_rdates"]) > 0:
                    component["DTSTART"] = component["valid_rdates"][0]
                    continue

                # Change the start date to what it would've been in 1970.
                start_date = "19700101"
                start_time = "T000000"

                if "RRULE" in component:
                    rrule = dict(part.split("=") for part in component["RRULE"].split(";"))
                    bymonth = int(rrule["BYMONTH"])
                    weekday = rrule["BYDAY"].lstrip("-012345")
                    weekday_index = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"].index(weekday)

                    if "BYMONTHDAY" in rrule:
                        bymonthday = list(int(d) for d in rrule["BYMONTHDAY"].split(","))
                        for day in bymonthday:
                            test_day = date(1970, bymonth, day)
                            if test_day.weekday() == weekday_index:
                                start_date = test_day.strftime("%Y%m%d")
                                start_time = component["DTSTART"][8:]
                                break
                    elif "BYDAY" in rrule:
                        which_weekday = int(rrule["BYDAY"].rstrip("AEFHMORSTUW"))
                        days_matching = [0]
                        test_day = date(1970, bymonth, 1)
                        while test_day.month == bymonth:
                            if test_day.weekday() == weekday_index:
                                days_matching.append(test_day)
                            test_day = test_day + timedelta(days=1)
                        start_date = days_matching[which_weekday].strftime("%Y%m%d")
                        start_time = component["DTSTART"][8:]

                component["DTSTART"] = start_date + start_time

        # Sort the components back into the order they appeared in the original file.
        # This is to minimize changes in our zones.json file.
        kept_components.sort(key=lambda b: b["line"])

        zone_name = filename[:-4]
        ics = []
        for component in kept_components:
            ics_lines = []
            ics_lines.append("BEGIN:%s" % component["type"])
            if len(kept_components) == 1 or len(component["TZOFFSETFROM"]) != 5:
                ics_lines.append("TZOFFSETFROM:%s" % component["TZOFFSETTO"])
            else:
                ics_lines.append("TZOFFSETFROM:%s" % component["TZOFFSETFROM"])
            ics_lines.append("TZOFFSETTO:%s" % component["TZOFFSETTO"])

            if "TZNAME" in component:
                ics_lines.append("TZNAME:%s" % component["TZNAME"])
            ics_lines.append("DTSTART:%s" % component["DTSTART"])
            if "RRULE" in component:
                ics_lines.append("RRULE:%s" % component["RRULE"])
            elif len(kept_components) > 1 and "valid_rdates" in component:
                for rdate in component["valid_rdates"]:
                    ics_lines.append("RDATE:%s" % rdate)

            ics_lines.append("END:%s" % component["type"])
            ics.append("\r\n".join(ics_lines))

        zone_data = {
            "ics": ics,
        }
        if zone_name in lat_long_data:
            zone_data["latitude"] = lat_long_data[zone_name][0]
            zone_data["longitude"] = lat_long_data[zone_name][1]

        return zone_data

    def read_dir(self, path, process_zone, prefix=""):
        """Recursively read a directory for ICS files.

        Files could be two or three levels deep."""

        zones = {}
        for entry in os.listdir(path):
            if entry == "Etc":
                continue
            fullpath = os.path.join(path, entry)
            if os.path.isdir(fullpath):
                zones.update(self.read_dir(fullpath, process_zone, os.path.join(prefix, entry)))
            elif prefix != "":
                filename = os.path.join(prefix, entry)
                zones[filename[:-4]] = process_zone(filename)
        return zones

    @staticmethod
    def link_removed_zones(oldzones, newzones, links):
        """Checks which zones have been removed and creates an alias entry if
           there is one"""
        aliases = {}
        for key in oldzones:
            if key not in newzones and key in links:
                sys.stderr.write("Linking %s to %s\n" % (key, links[key]))
                aliases[key] = {"aliasTo": links[key]}
        return aliases

    @staticmethod
    def update_timezones_properties(tzprops_file, version, newzones, aliases):
        TZ_LINE = re.compile(r'^(?P<name>pref.timezone.[^=]+)=(?P<value>.*)$')
        outlines = []
        zoneprops = {}

        with open(tzprops_file) as fp:
            for line in fp.readlines():
                match = TZ_LINE.match(line.rstrip("\n"))
                if match:
                    zoneprops[match.group('name')] = match.group('value')

        for zone in newzones:
            propname = 'pref.timezone.' + zone.replace('/', '.')
            if propname not in zoneprops:
                outlines.append(propname + "=" + zone.replace("_", " "))

        if len(outlines):
            with open(tzprops_file, 'a') as fp:
                fp.write("\n#added with %s\n" % version)
                fp.write("\n".join(outlines) + "\n")

    @staticmethod
    def write_output(version, aliases, zones, filename):
        """Write the data to zones.json."""
        data = OrderedDict()
        data["version"] = version
        data["aliases"] = OrderedDict(sorted(aliases.items()))
        data["zones"] = OrderedDict(sorted(zones.items()))

        with open(filename, "w") as jsonfile:
            json.dump(data, jsonfile, indent=2, separators=(",", ": "))
            jsonfile.write("\n")

    def run(self, zones_json_file, tzprops_file, vzic_path):
        """Run the timezone updater, with a zones.json file and the path to vzic"""

        need_download_tzdata = self.tzdata_path is None
        if need_download_tzdata:
            self.download_tzdata()

        with open(zones_json_file, "r") as jsonfile:
            zonesjson = json.load(jsonfile)

        version = self.get_tzdata_version()
        if version == zonesjson["version"]:
            sys.stderr.write("zones.json is already up to date (%s)\n" % version)
            return
        else:
            sys.stderr.write("You are using tzdata %s\n" % version[2:])

        links = self.read_backward()

        self.run_vzic(vzic_path)
        lat_long_data = self.read_zones_tab()

        newzones = self.read_dir(self.zoneinfo_pure_path,
                                 lambda fn: self.read_ics(fn, lat_long_data))

        newaliases = self.link_removed_zones(zonesjson["zones"], newzones, links)
        zonesjson["aliases"].update(newaliases)

        self.update_timezones_properties(tzprops_file, version, newzones, zonesjson["aliases"])

        self.write_output(version, zonesjson["aliases"], newzones, zones_json_file)

        if need_download_tzdata:
            shutil.rmtree(self.tzdata_path)


def parse_args():
    """Gather arguments from the command-line."""
    parser = argparse.ArgumentParser(
        description="Create timezone info JSON file from tzdata files"
    )
    parser.add_argument("-v", "--vzic", dest="vzic_path", required=True,
                        help="""Path to the `vzic` executable. This must be
                        downloaded from https://code.google.com/p/tzurl/ and
                        compiled.""")
    parser.add_argument("-t", "--tzdata", dest="tzdata_path",
                        help="""Path to a directory containing the IANA
                        timezone data.  If this argument is omitted, the data
                        will be downloaded from ftp.iana.org.""")
    return parser.parse_args()


def create_test_data(zones_file):
    """Creating test data."""

    previous_file = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                 "..", "test", "unit", "data", "previous.json")

    previous_version = "no previous version"
    current_version = "no current version"
    if (os.path.isfile(zones_file) and os.access(zones_file, os.R_OK)):
        with open(zones_file, "r") as rzf:
            current_data = json.load(rzf)
            current_version = current_data["version"]
            current_zones = current_data["zones"]
            current_aliases = current_data["aliases"]
    if (os.path.isfile(previous_file) and os.access(previous_file, os.R_OK)):
        with open(previous_file, "r") as rpf:
            previous_data = json.load(rpf)
            previous_version = previous_data["version"]

    if (current_version == "no current version"):
        """Test data creation not possible - currently no zones.json file available."""

    elif (current_version != previous_version):
        """Extracting data from zones.json"""

        test_aliases = current_aliases.keys()
        test_zones = current_zones.keys()

        test_data = OrderedDict()
        test_data["version"] = current_version
        test_data["aliases"] = sorted(test_aliases)
        test_data["zones"] = sorted(test_zones)

        """Writing test data"""
        with open(previous_file, "w") as wpf:
            json.dump(test_data, wpf, indent=2, separators=(",", ": "))
            wpf.write("\n")

        """Please run calendar xpshell test 'test_timezone_definition.js' to check the updated
        timezone definition for any glitches."""

    else:
        # This may happen if the script is executed multiple times without new tzdata available
        """Skipping test data creation.
        Test data are already available for the current version of zones.json"""


def main():
    """Run the timezone updater from command-line args"""
    args = parse_args()
    json_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), "zones.json")
    tzprops_file = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                "..", "locales", "en-US", "chrome", "calendar",
                                "timezones.properties")

    # A test data update must occur before the zones.json file gets updated to have meaningful data
    create_test_data(json_file)

    zoneinfo_pure_path = tempfile.mkdtemp(prefix="zones")

    updater = TimezoneUpdater(args.tzdata_path, zoneinfo_pure_path)
    updater.run(json_file, tzprops_file, args.vzic_path)

    # Clean up.
    shutil.rmtree(zoneinfo_pure_path)

if __name__ == "__main__":
    main()
