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

import argparse, ftplib, json, os, os.path, re, shutil, subprocess, sys, tarfile, tempfile
from collections import OrderedDict


class TimezoneUpdater(object):
    """ Timezone updater class, use the run method to do everything automatically"""
    def __init__(self, tzdata_path, zoneinfo_path, zoneinfo_pure_path):
        self.tzdata_path = tzdata_path
        self.zoneinfo_path = zoneinfo_path
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
        with open(os.path.join(self.tzdata_path, "Makefile"), "r") as makefile:
            for line in makefile:
                match = re.search(r"VERSION=\s*(\w+)", line)
                if match is not None:
                    version = "2." + match.group(1)
                    break
        return version

    def run_vzic(self, vzic_path):
        """Use vzic to create ICS versions of the data."""

        # Use `vzic` to create 'pure' and 'non-pure' zone files.
        sys.stderr.write("Exporting zone info to %s\n" % self.zoneinfo_path)
        subprocess.check_call([
            vzic_path,
            "--olson-dir", self.tzdata_path,
            "--output-dir", self.zoneinfo_path
        ], stdout=sys.stderr)

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
        with open(os.path.join(self.zoneinfo_path, "zones.tab"), "r") as tab:
            for line in tab:
                if len(line) < 19:
                    sys.stderr.write("Line in zones.tab not long enough: %s\n" % line.strip())
                    continue

                [latitude, longitude, name] = line.rstrip().split(" ", 2)
                lat_long_data[name] = (latitude, longitude)

        return lat_long_data

    def read_ics(self, filename, lat_long_data):
        """Read a single zone's ICS files.

        We keep only the lines we want, and we use the pure version of RRULE if
        the versions differ. See Asia/Jerusalem for an example."""
        with open(os.path.join(self.zoneinfo_path, filename), "r") as zone:
            zoneinfo = zone.readlines()

        with open(os.path.join(self.zoneinfo_pure_path, filename), "r") as zone:
            zoneinfo_pure = zone.readlines()

        ics_data = []
        for i in range(0, len(zoneinfo)):
            line = zoneinfo[i]
            key = line[:line.find(":")]

            if key == "BEGIN":
                if line != "BEGIN:VCALENDAR\r\n":
                    ics_data.append(line)
            elif key == "END":
                if line != "END:VCALENDAR\r\n":
                    ics_data.append(line)
            elif key in ("TZID", "TZOFFSETFROM", "TZOFFSETTO", "TZNAME", "DTSTART"):
                ics_data.append(line)
            elif key == "RRULE":
                if line == zoneinfo_pure[i]:
                    ics_data.append(line)
                else:
                    sys.stderr.write("Using pure version of %s\n" % filename[:-4])
                    ics_data.append(zoneinfo_pure[i])

        zone_data = {
            "ics": "".join(ics_data).rstrip()
        }
        zone_name = filename[:-4]
        if zone_name in lat_long_data:
            zone_data["latitude"] = lat_long_data[zone_name][0]
            zone_data["longitude"] = lat_long_data[zone_name][1]

        return zone_data

    def read_dir(self, path, process_zone, prefix=""):
        """Recursively read a directory for ICS files.

        Files could be two or three levels deep."""

        zones = {}
        for entry in os.listdir(path):
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

        newzones = self.read_dir(self.zoneinfo_path,
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

    zoneinfo_path = tempfile.mkdtemp(prefix="zones")
    zoneinfo_pure_path = tempfile.mkdtemp(prefix="zones")

    updater = TimezoneUpdater(args.tzdata_path, zoneinfo_path, zoneinfo_pure_path)
    updater.run(json_file, tzprops_file, args.vzic_path)

    # Clean up.
    shutil.rmtree(zoneinfo_path)
    shutil.rmtree(zoneinfo_pure_path)

if __name__ == "__main__":
    main()
