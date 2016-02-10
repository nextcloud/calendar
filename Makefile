# Makefile for building the project

app_name=calendar
project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
appstore_dir=$(build_dir)/appstore
source_dir=$(build_dir)/source
package_name=$(app_name)

clean:
	rm -rf $(build_dir)

appstore: clean
	mkdir -p $(appstore_dir)
	tar cvzf $(appstore_dir)/$(package_name).tar.gz $(project_dir) \
	--exclude-vcs \
	--exclude-vcs-ignores \
	--exclude=$(project_dir)/js/app \
	--exclude=$(project_dir)/js/config \
	--exclude=$(project_dir)/tests \
	--exclude=$(project_dir)/.idea \
	--exclude=$(project_dir)/.gitignore \
	--exclude=$(project_dir)/.scrutinizer.yml \
	--exclude=$(project_dir)/.travis.yml \
	--exclude=$(project_dir)/Makefile \
	--exclude=$(project_dir)/phpunit.xml \
	--exclude=$(project_dir)/README.md \
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
	--exclude=$(project_dir)/js/vendor/davclient.js/index.html \
	--exclude=$(project_dir)/js/vendor/fullcalendar/dist/gcal.js \
	--exclude=$(project_dir)/js/vendor/fullcalendar/dist/lang-all.js \
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
