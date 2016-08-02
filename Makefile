# Makefile for building the project

app_name=calendar
project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
appstore_dir=$(build_dir)/appstore
source_dir=$(build_dir)/source
package_name=$(app_name)

clean:
	rm -rf $(build_dir)

build: clean
	cd js && grunt build
	mkdir -p $(appstore_dir)
	tar cvzf $(appstore_dir)/$(package_name).tar.gz $(project_dir) \
	--exclude-vcs \
	--exclude-vcs-ignores \
	--add-file=$(project_dir)/js/public/app.js \
	--add-file=$(project_dir)/css/public/app.css \
	--exclude=$(project_dir)/css/app \
	--exclude=$(project_dir)/js/app \
	--exclude=$(project_dir)/js/config \
	--exclude=$(project_dir)/tests \
	--exclude=$(project_dir)/.idea \
	--exclude=$(project_dir)/.gitignore \
	--exclude=$(project_dir)/.scrutinizer.yml \
	--exclude=$(project_dir)/.travis.yml \
	--exclude=$(project_dir)/issue_template.md \
	--exclude=$(project_dir)/coverage \
	--exclude=$(project_dir)/Makefile \
	--exclude=$(project_dir)/phpunit.xml \
	--exclude=$(project_dir)/README.md \
	--exclude=$(project_dir)/build \
	--exclude=$(project_dir)/js/.bowerrc \
	--exclude=$(project_dir)/js/.jshintrc \
	--exclude=$(project_dir)/js/bower.json \
	--exclude=$(project_dir)/js/Gruntfile.js \
	--exclude=$(project_dir)/js/package.json \
	--exclude=$(project_dir)/js/node_modules \
	--exclude=$(project_dir)/js/vendor/**/.bower.json \
	--exclude=$(project_dir)/js/vendor/**/.npmignore \
	--exclude=$(project_dir)/js/vendor/**/bower.json \
	--exclude=$(project_dir)/js/vendor/**/Gruntfile.js \
	--exclude=$(project_dir)/js/vendor/**/package.json \
	--exclude=$(project_dir)/js/vendor/**/*.md \
	--exclude=$(project_dir)/js/vendor/**/karma.conf.js \
	--exclude=$(project_dir)/js/vendor/angular-mocks \
	--exclude=$(project_dir)/js/vendor/davclient.js/index.html \
	--exclude=$(project_dir)/js/vendor/fullcalendar/dist/gcal.js \
	--exclude=$(project_dir)/js/vendor/fullcalendar/dist/lang \
	--exclude=$(project_dir)/js/vendor/ical.js/build/benchmark \
	--exclude=$(project_dir)/js/vendor/ical.js/lib \
	--exclude=$(project_dir)/js/vendor/ical.js/samples \
	--exclude=$(project_dir)/js/vendor/ical.js/sandbox \
	--exclude=$(project_dir)/js/vendor/ical.js/tasks \
	--exclude=$(project_dir)/js/vendor/ical.js/test-agent \
	--exclude=$(project_dir)/js/vendor/ical.js/test-agent-server.js \
	--exclude=$(project_dir)/js/vendor/ical.js/test-agent-coverage.json \
	--exclude=$(project_dir)/js/vendor/jquery-timepicker/i18n \
	--exclude=$(project_dir)/js/vendor/jquery-timepicker/include \
	--exclude=$(project_dir)/js/vendor/jquery-timepicker/legacy_1.2.6 \
	--exclude=$(project_dir)/js/vendor/jquery-timepicker/tests \
	--exclude=$(project_dir)/js/vendor/jquery-timepicker/index.html \
	--exclude=$(project_dir)/timezones/INFO.md \

appstore: build
	cd build/artifacts/appstore && \
	tar -xvf calendar.tar.gz && \
	cd ../../../../../config && \
	mv config.php config2.php && \
	cd .. && \
	php occ integrity:sign-app --path="/Users/georgehrke/Development/Projects/ownCloud/apps/calendar/build/artifacts/appstore/calendar" --privateKey="/Users/georgehrke/Development/Keys/calendar/calendar.key" --certificate="/Users/georgehrke/Development/Keys/calendar/calendar.crt" && \
	cd config && \
	mv config2.php config.php && \
	cd ../apps/calendar/build/artifacts/appstore && \
	tar cvzf calendar.tar.gz calendar/