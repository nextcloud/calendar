# This file is licensed under the Affero General Public License version 3 or
# later. See the COPYING file.
# @author Bernhard Posselt <dev@bernhard-posselt.com>
# @copyright Bernhard Posselt 2016
# @author Georg Ehrke <oc.list@georgehrke.com>
# @copyright Georg Ehrke 2016

# Generic Makefile for building and packaging a Nextcloud app which uses npm and
# Composer.
#
# Dependencies:
# * make
# * which
# * curl: used if phpunit and composer are not installed to fetch them from the web
# * tar: for building the archive
# * npm: for building and testing everything JS
#
# If no composer.json is in the app root directory, the Composer step
# will be skipped. The same goes for the package.json which can be located in
# the app root or the js/ directory.
#
# The npm command by launches the npm build script:
#
#    npm run build
#
# The npm test command launches the npm test script:
#
#    npm run test
#
# The idea behind this is to be completely testing and build tool agnostic. All
# build tools and additional package managers should be installed locally in
# your project, since this won't pollute people's global namespace.
#
# The following npm scripts in your package.json install and update the npm
# dependencies and use gulp as build system (notice how everything is
# run from the node_modules folder):
#
#    "scripts": {
#        "test": "node node_modules/gulp-cli/bin/gulp.js karma",
#        "prebuild": "npm install",
#        "build": "node node_modules/gulp-cli/bin/gulp.js"
#    },

app_name=$(notdir $(CURDIR))
build_tools_directory=$(CURDIR)/build/tools
source_build_directory=$(CURDIR)/build/source/calendar
source_artifact_directory=$(CURDIR)/build/artifacts/source
source_package_name=$(source_artifact_directory)/$(app_name)
appstore_build_directory=$(CURDIR)/build/appstore/calendar
appstore_artifact_directory=$(CURDIR)/build/artifacts/appstore
appstore_package_name=$(appstore_artifact_directory)/$(app_name)
yarn=$(shell which yarn 2> /dev/null)
gcp=$(shell which gcp 2> /dev/null)
composer:=$(shell which composer 2> /dev/null)
ifeq (,$(composer))
	composer:=php $(build_tools_directory)/composer.phar
endif

ifeq (, $(gcp))
	copy_command=cp
else
	copy_command=gcp
endif

# code signing
# assumes the following:
# * the app is inside the nextcloud/apps folder
# * the private key is located in ~/.nextcloud/calendar.key
# * the certificate is located in ~/.nextcloud/calendar.crt
configdir=$(CURDIR)/../../config
private_key=$(HOME)/.nextcloud/$(app_name).key
certificate=$(HOME)/.nextcloud/$(app_name).crt
sign_skip_msg="Skipping signing, no key and certificate found in $(private_key) and $(certificate)"
openssl_msg="SHA512 signature for appstore package"
ifneq (,$(wildcard $(private_key)))
ifneq (,$(wildcard $(certificate)))
	CAN_SIGN=true
endif
endif

TAR_CAN_EXCLUDE_VCS=$(shell expr `tar --version | grep ^tar | sed 's/^.* //g'` \>= 1.28)

all: build

# Fetches the PHP and JS dependencies and compiles the JS. If no composer.json
# is present, the composer step is skipped, if no package.json or js/package.json
# is present, the npm step is skipped
.PHONY: build
build:
	make yarn

# Installs and updates the composer dependencies. If composer is not installed
# a copy is fetched from the web
.PHONY: composer
composer:
ifeq (, $(shell which composer 2> /dev/null))
	@echo "No composer command available, downloading a copy from the web"
	mkdir -p $(build_tools_directory)
	curl -sS https://getcomposer.org/installer | php
	mv composer.phar $(build_tools_directory)
endif
	$(composer) install --prefer-dist

# Installs yarn dependencies
.PHONY: yarn
yarn:
	cd js && $(yarn) run build

# Removes the appstore build
.PHONY: clean
clean:
	rm -rf ./build
	rm -rf css/public
	rm -rf js/public

# Same as clean but also removes dependencies installed by composer and npm
.PHONY: distclean
distclean: clean
	rm -rf vendor
	rm -rf node_modules
	rm -rf js/node_modules

# Builds the source and appstore package
.PHONY: dist
dist:
	make source
	make appstore

# Builds the source package
.PHONY: source
source:
	rm -rf $(source_build_directory) $(source_artifact_directory)
	mkdir -p $(source_build_directory) $(source_artifact_directory)
	rsync -rv . $(source_build_directory) \
	--exclude=/.git/ \
	--exclude=/.idea/ \
	--exclude=/build/ \
	--exclude=/js/node_modules/ \
	--exclude=*.log
	tar -cvzf $(source_package_name).tar.gz -C $(source_build_directory)/../ $(app_name)

# Builds the source package for the app store, ignores php and js tests
.PHONY: appstore
appstore:
	rm -rf $(appstore_build_directory) $(appstore_artifact_directory)
	mkdir -p $(appstore_build_directory) $(appstore_artifact_directory)
	$(copy_command) --parents -r \
	"appinfo" \
	"controller" \
	"http" \
	"img" \
	"l10n" \
	"templates" \
	"css/public" \
	"js/public" \
	"COPYING" \
	"CHANGELOG.md" \
	".gitignore" \
	$(appstore_build_directory)
ifeq "$(TAR_CAN_EXCLUDE_VCS)" "1"
	tar -czf $(appstore_package_name).tar.gz -C $(appstore_build_directory)/../ --exclude-vcs-ignores --exclude='.gitignore' $(app_name)
else
	tar -czf $(appstore_package_name).tar.gz -C $(appstore_build_directory)/../ --exclude='.gitignore' $(app_name)
endif
ifdef CAN_SIGN
	@echo $(openssl_msg)
	openssl dgst -sha512 -sign $(private_key) $(appstore_package_name).tar.gz | openssl base64
else
	@echo $(sign_skip_msg)
endif


# Command for running JS and PHP tests. Works for package.json files in the js/
# and root directory. If phpunit is not installed systemwide, a copy is fetched
# from the internet
.PHONY: test
test:
ifndef TRAVIS
	make composer
endif
	cd js && $(yarn) run test && cd ../
	export PATH="$$PWD/vendor/bin:$$PATH" && phpunit -c phpunit.xml --coverage-clover coverage.clover
