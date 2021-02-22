# This file is licensed under the Affero General Public License version 3 or
# later. See the COPYING file.

all: dev-setup lint build-js-production test test-php

# Dev env management
dev-setup: clean npm-init

npm-init:
	npm ci

composer-init:
	composer install --prefer-dist
	composer update --prefer-dist

npm-update:
	npm update

# Building
build-js:
	npm run dev

build-js-production:
	npm run build

watch-js:
	npm run watch

# Testing
test:
	npm run test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

test-php:
	phpunit -c phpunit.xml
	phpunit -c phpunit.integration.xml

test-php-coverage:
	phpunit -c phpunit.xml --coverage-clover=coverage-unit.xml
	phpunit -c phpunit.integration.xml --coverage-clover=coverage-integration.xml

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Style linting
stylelint:
	npm run stylelint

stylelint-fix:
	npm run stylelint:fix

# Cleaning
clean:
	rm -rf js

# Builds the source package for the app store, ignores php and js tests
appstore:
	krankerl package
