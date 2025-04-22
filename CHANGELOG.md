## [5.2.2](https://github.com/nextcloud/calendar/compare/v5.2.1...v5.2.2) (2025-04-22)


### Bug Fixes

* **deps:** bump @nextcloud/vue to ^8.25.1 ([c2fab28](https://github.com/nextcloud/calendar/commit/c2fab28b37c191725d7a99580e395020598a3e37))
* **deps:** Fix npm audit ([581c70a](https://github.com/nextcloud/calendar/commit/581c70a141c974dc30fe278a86c50f2ac1e653a5))
* **editor:** show add talk button if there are no attendees yet ([2770f80](https://github.com/nextcloud/calendar/commit/2770f80a9c63f020c5cfd70155cec9977c66885f))
* freebusy ui visual improvements ([dc76010](https://github.com/nextcloud/calendar/commit/dc76010154e40dbf765b6dd8f7a25ddaada81e40))
* **l10n:** Update translations from Transifex ([b35903c](https://github.com/nextcloud/calendar/commit/b35903ca2cf7c0f84cc188ff5d98581dabea7513))
* **l10n:** Update translations from Transifex ([da3a6d0](https://github.com/nextcloud/calendar/commit/da3a6d00510bddd9dd63c0b33d4e14c25e313951))
* **talkintegration:** allow room creation with description ([2c28127](https://github.com/nextcloud/calendar/commit/2c2812718d0c27890a06c5fb4bebd6ad01b4d3c3))
* update app store description ([41c0c4d](https://github.com/nextcloud/calendar/commit/41c0c4d4e7511d7f4c3931598882b69d76ad979f))



## [5.2.1](https://github.com/nextcloud/calendar/compare/v5.2.0...v5.2.1) (2025-04-07)


### Bug Fixes

* add a gap for event dragging ([b7d96a7](https://github.com/nextcloud/calendar/commit/b7d96a7c1ec98b03b4edb3c4c43107bf91ae8072))
* allow all calendars as appointment conflict calendars ([e2ebe0e](https://github.com/nextcloud/calendar/commit/e2ebe0ee2e4c02e7f65e9c5eacbf342c05c5e365))
* **deps:** Fix npm audit ([066c758](https://github.com/nextcloud/calendar/commit/066c75890de6eb98501e281fb23726b05abaab7b))
* **editor:** Allow edits as attending organizer ([efaeb45](https://github.com/nextcloud/calendar/commit/efaeb45a81acf18cbf7bd3b804bd6f21e83e4e40))
* **EditorMixin:** add viewed by organizer if no attendees ([bf296e8](https://github.com/nextcloud/calendar/commit/bf296e8bf49a1019695b4700c7853c1d5fa3d80c))
* **editor:** Rephraze ambiguous "group" invites ([457a829](https://github.com/nextcloud/calendar/commit/457a829890ad8db1c27bddcd778f043095661dba))
* **editor:** wrap date selects on small screens ([55da3da](https://github.com/nextcloud/calendar/commit/55da3daae7bd4c5fd0b011ed8c375162fabfe3e6))
* end time resetting when changing day ([2b2e895](https://github.com/nextcloud/calendar/commit/2b2e895d34d902b890a076dea4ec2a7cf2b9453c))
* **eventDidMount:** make time text color be main text ([3ac3bc6](https://github.com/nextcloud/calendar/commit/3ac3bc643f0f8fff09697446351402fb5759de6c))
* **lint-php-cs:** use minimum available php version ([4256290](https://github.com/nextcloud/calendar/commit/42562905474762c86043f696647741b20a436696))
* monthly recurrance type and bymonthday selection ([9214d6e](https://github.com/nextcloud/calendar/commit/9214d6eec42af90e784c70c13cb059d5b62f520e))
* room suggestions not being rendered ([a4dd581](https://github.com/nextcloud/calendar/commit/a4dd581484acd2bee64876ed7e702373d18dc0f1))
* show generic participation status for the organizer ([4e8fc92](https://github.com/nextcloud/calendar/commit/4e8fc92386380b93a7d80ceb9ce516197853d73e))
* yearly recurrance options - month selection ([d277b1e](https://github.com/nextcloud/calendar/commit/d277b1e83f0e2044484223f2d415d3c9b4064c96))
* yearly recurrance options - month selection ([910cdc3](https://github.com/nextcloud/calendar/commit/910cdc34b592eb7eb28f6962b289df25813a8eac))



# [5.2.0-rc1](https://github.com/nextcloud/calendar/compare/v5.1.0-beta3...v5.2.0-rc1) (2025-03-11)


### Bug Fixes

* always show alarm unit in pural ([1509e87](https://github.com/nextcloud/calendar/commit/1509e8747f526baed2520d2ce1b85517651467dd))
* avoid hotkeys in contenteditable ([cad954e](https://github.com/nextcloud/calendar/commit/cad954e7bdf20c591afcf087c2719438b9c7eff2))
* **calendar-list:** restrict calendar visibility toggle to checkbox only ([f1ceb1a](https://github.com/nextcloud/calendar/commit/f1ceb1a2a32e535f4006a163b96b7819d514777f)), closes [#3027](https://github.com/nextcloud/calendar/issues/3027)
* close modal after creating conversation ([a636ea0](https://github.com/nextcloud/calendar/commit/a636ea09f00fb38c4fb308fda51b627fab7da372))
* color picker size ([0c1d227](https://github.com/nextcloud/calendar/commit/0c1d22737ef82fb5e76ca5abbf842f178c9912f6))
* Console-log errors thrown when saving an event ([30f9eb7](https://github.com/nextcloud/calendar/commit/30f9eb75892ef56bac5a5a25140b59d09a2678f0))
* date selector resetting time ([caf5cf8](https://github.com/nextcloud/calendar/commit/caf5cf87b2a075a061294d09a657b3047cc89b5c))
* **deps:** bump @nextcloud/calendar-js from 8.0.3 to ^8.1.0 (main) ([#6646](https://github.com/nextcloud/calendar/issues/6646)) ([a75bd08](https://github.com/nextcloud/calendar/commit/a75bd08d0548dcaaaeecc54a313a5618f0081a6d))
* **deps:** bump @nextcloud/dialogs from 6.0.1 to ^6.1.1 (main) ([#6647](https://github.com/nextcloud/calendar/issues/6647)) ([d30e56a](https://github.com/nextcloud/calendar/commit/d30e56abb76c0ee642fa3803ee24165d1bee0f1e))
* **deps:** bump @nextcloud/event-bus from 3.3.1 to ^3.3.2 (main) ([#6783](https://github.com/nextcloud/calendar/issues/6783)) ([3b4fc40](https://github.com/nextcloud/calendar/commit/3b4fc40e69666e68f76de49358dbe68e3371335f))
* **deps:** bump @nextcloud/l10n from 3.2.0 to ^3.2.0 (main) ([#6745](https://github.com/nextcloud/calendar/issues/6745)) ([e0e0bb3](https://github.com/nextcloud/calendar/commit/e0e0bb32e767b0521fc24a2f6a97a634d6d02467))
* **deps:** bump @nextcloud/vue from 8.22.0 to ^8.23.1 ([c7e91ab](https://github.com/nextcloud/calendar/commit/c7e91ab1ef08323f158fa151988e24c6631b0d9c))
* **deps:** bump color-convert from 2.0.1 to v3 ([dde4ba5](https://github.com/nextcloud/calendar/commit/dde4ba59c31da3a093c5dca0b1a788960db82e84))
* **deps:** bump color-string from 1.9.1 to v2 ([a08c9ee](https://github.com/nextcloud/calendar/commit/a08c9eead5a76af3d6e82a04420f294748145d08))
* **deps:** bump core-js from 3.40.0 to ^3.41.0 (main) ([#6784](https://github.com/nextcloud/calendar/issues/6784)) ([a8920a1](https://github.com/nextcloud/calendar/commit/a8920a1306186ad2463a362e1d83abb12d778169))
* **deps:** bump pinia from 2.3.0 to ^2.3.1 (main) ([#6645](https://github.com/nextcloud/calendar/issues/6645)) ([097f964](https://github.com/nextcloud/calendar/commit/097f9642bef7c7d37c6ea141a722702b5a595095))
* **deps:** bump webdav from 5.7.1 to ^5.8.0 (main) ([#6769](https://github.com/nextcloud/calendar/issues/6769)) ([e1b1db5](https://github.com/nextcloud/calendar/commit/e1b1db53235626318f803ff62450a38b58d73de1))
* **deps:** Fix npm audit ([3fa3f18](https://github.com/nextcloud/calendar/commit/3fa3f1831156fffdead028b45b73fccafb886009))
* do not show attendee actions in viewing mode ([a4c061e](https://github.com/nextcloud/calendar/commit/a4c061ee28d9028dce262283510ad61f110329c9))
* do not show attendee list when there are no attendees in viewing mode ([8d2a7f4](https://github.com/nextcloud/calendar/commit/8d2a7f477dc130c0bf830118cb20c9702d796a6e))
* do not show items from deleted calendars in widget ([9d1d26f](https://github.com/nextcloud/calendar/commit/9d1d26f0dcdfdf39930e8b85808bd087304cb5e8))
* EditSideBar bug ([ab102c7](https://github.com/nextcloud/calendar/commit/ab102c72f133641a0f71457b144b8af34d31ca8c))
* force height for descr and location ([832f86d](https://github.com/nextcloud/calendar/commit/832f86dfcc1a3c0d5a0f0ac69a66b5a08c41c21e))
* free busy not updating date ([3b2d626](https://github.com/nextcloud/calendar/commit/3b2d6269c30d436ef0970807c27168fc33ada18c))
* **freebusy:** free busy ignoring user's time zone ([b3fc6dc](https://github.com/nextcloud/calendar/commit/b3fc6dc0e62906f7db336ca46359578947b67974))
* **freebusy:** slot header format not respecting user's locale ([8d73bd2](https://github.com/nextcloud/calendar/commit/8d73bd23b08d514ddeeeaef805ec3bda56611ceb))
* keyboard shortcut modal not being responsive ([1ecf27b](https://github.com/nextcloud/calendar/commit/1ecf27b67c23c99bd16ecb4e3630743971e660ae))
* **l10n:** add context for translators (second vs. seconds) ([9d76c8c](https://github.com/nextcloud/calendar/commit/9d76c8c5a3487c58732fe193155a59d59c1a5861))
* **public-calendar:** remove toggle functionality from public view ([8fb5f97](https://github.com/nextcloud/calendar/commit/8fb5f9743f507f5d8679e77571fd3268e472945f))
* Release automation ([6a941c9](https://github.com/nextcloud/calendar/commit/6a941c96b41e3d2345eb28d53873b1f4e1cecfed))
* restrict attendees edit priveleges in the frontend ([7c77be2](https://github.com/nextcloud/calendar/commit/7c77be260ba54b70b060c60c1d258b5410897578))
* show display name instead of user id in availability integration ([cb7d9aa](https://github.com/nextcloud/calendar/commit/cb7d9aa2b02ebe7a9ec3caea1c711349dae3f082))
* simple calendar view width ([27d7852](https://github.com/nextcloud/calendar/commit/27d7852bff6120d7763bdb36ada927f7003fe1b2))
* simple editor size and jumping ([11f766f](https://github.com/nextcloud/calendar/commit/11f766f2dd6f89636859b69b431b3508525eaeaf))
* sort talk conversations by most recent activity ([056a8aa](https://github.com/nextcloud/calendar/commit/056a8aa333121a7d88a071cdb0a3e9a7816d3c66))
* **transifex:** backport to stable5.1 ([d081af5](https://github.com/nextcloud/calendar/commit/d081af5839ce520427a375d7de1681fe13165903))


### Features

* add support for nextcloud 32 ([5be4249](https://github.com/nextcloud/calendar/commit/5be4249857a0ba83dd73b14da41e062b0386ae98))
* **FullCalendar:** add conditional styling for participation status in grid ([a68f90c](https://github.com/nextcloud/calendar/commit/a68f90ccb2456c86a2fb3d9a77618a75e10af3ec))
* remove support for nextcloud 32 (unreleased) ([3a028f6](https://github.com/nextcloud/calendar/commit/3a028f6daa087e68ccac2f431b5796537cafe791))
* **talkintegration:** add object type to talk room creation ([85bec05](https://github.com/nextcloud/calendar/commit/85bec05b878c3dafccbcdd2610a3ac0196bc9bd0))



# [5.1.0-beta2](https://github.com/nextcloud/calendar/compare/v5.1.0-beta1...v5.1.0-beta2) (2025-01-16)


### Bug Fixes

* **deps:** bump @nextcloud/calendar-availability-vue from 2.2.4 to ^2.2.6 (main) ([#6628](https://github.com/nextcloud/calendar/issues/6628)) ([a67b49f](https://github.com/nextcloud/calendar/commit/a67b49f2b21ad691bef6bd128e9f5d8f633c94df))
* **deps:** bump core-js from 3.39.0 to ^3.40.0 (main) ([#6629](https://github.com/nextcloud/calendar/issues/6629)) ([7a8ede3](https://github.com/nextcloud/calendar/commit/7a8ede390f21f34c69e65df48f68dc4139c550ed))
* location and description not being saved ([5348612](https://github.com/nextcloud/calendar/commit/5348612ffae9196963b495b9c71007489c29f685))


### Features

* **editor:** improve attendee and resource status display ([9c23ed8](https://github.com/nextcloud/calendar/commit/9c23ed8e11811faa94d5b91e406d272d36918c9b))



# [5.1.0-beta1](https://github.com/nextcloud/calendar/compare/v5.1.0-alpha2...v5.1.0-beta1) (2025-01-14)


### Features

* add availability action to the contacts menu ([266a345](https://github.com/nextcloud/calendar/commit/266a34543e8ca552b5bd164472676379a80ae8de))
* Add overlay between calendar and open simple editor ([8699a65](https://github.com/nextcloud/calendar/commit/8699a658475e8a511b23187056bc7308b535b6f8))



# [5.1.0-alpha2](https://github.com/nextcloud/calendar/compare/v5.1.0-alpha1...v5.1.0-alpha2) (2025-01-09)


### Bug Fixes

* firefox avatar icon styling inconsistency ([02e8ed4](https://github.com/nextcloud/calendar/commit/02e8ed422aba9d2edf543196d317b4f2a0d84c62))
* max-width for long timezones names ([c27f067](https://github.com/nextcloud/calendar/commit/c27f067da8efcce8a77ad120b8930e022b202703))



# [5.1.0-alpha1](https://github.com/nextcloud/calendar/compare/v5.0.0-alpha4...v5.1.0-alpha1) (2025-01-07)


### Bug Fixes

* add border to sidebar button ([50878bf](https://github.com/nextcloud/calendar/commit/50878bfea41f1c9e372afc4c83db46a60b8244a7))
* add missing license ([9196525](https://github.com/nextcloud/calendar/commit/91965257efe918bbac804aedc43f066895bffdfa))
* adjust url for task links ([#6550](https://github.com/nextcloud/calendar/issues/6550)) ([e86c82a](https://github.com/nextcloud/calendar/commit/e86c82a965a791fae0e9ee14966f2949502011b8))
* **alarms:** also update DISPLAY alarms ([b66f96a](https://github.com/nextcloud/calendar/commit/b66f96ab30cdd5011695b52001179edbacb99f2a))
* allow adding self to shared event ([479ba82](https://github.com/nextcloud/calendar/commit/479ba82475b81687c6d6dc4355acead16c2f081a))
* appointment slots start and end time ([6e06e87](https://github.com/nextcloud/calendar/commit/6e06e87c416120482f3ae38dcb26c967564b8050))
* **appointments:** log calculated start and end times for slot generation ([13ad251](https://github.com/nextcloud/calendar/commit/13ad251c07e5eda8cd2b1859b7b2fd4a82573295))
* **appointments:** properly localise the calendar events ([74df703](https://github.com/nextcloud/calendar/commit/74df7032d0a03855ad98bf4b678a49ac96313780))
* **appointments:** Set organiser email to correct langauge ([7893c95](https://github.com/nextcloud/calendar/commit/7893c95cd2c5d04d4b231553855ce423b289ab82))
* **appointments:** simplify booking response ([3acd930](https://github.com/nextcloud/calendar/commit/3acd93027c3948eb52a4091408e6fe0128269afc))
* attachment folder picker ([93374fa](https://github.com/nextcloud/calendar/commit/93374fad5e8fd1d16b31fd776077a2e0b560d483))
* **attachments:** add missing file picker confirm ([df34ac0](https://github.com/nextcloud/calendar/commit/df34ac087e28f547ab3d06f81762b18693e7273e))
* **attachments:** adjust click handler ([9346664](https://github.com/nextcloud/calendar/commit/9346664359110c0a052d6933b57b4fc99c94dd5c))
* **attachmentService, propfindErrorParse:** add an error message for when a file is not compatible for windows ([d7288b0](https://github.com/nextcloud/calendar/commit/d7288b06368b3fa0e4a3999c7e70338322e02f02))
* **attachments:** improve layout ([e9e9bcf](https://github.com/nextcloud/calendar/commit/e9e9bcf209e1ae3a051e44f7cfb24d62ff30c533))
* avatar status icon text misalignment ([f837082](https://github.com/nextcloud/calendar/commit/f8370822b0c7f697b8683bf0c453725d21ce357d))
* **CalendarListNew:** Public Calendar Modal Opening ([0ae73bc](https://github.com/nextcloud/calendar/commit/0ae73bcb63ace8cb5c268b2a49d174d73441fb6e))
* **CalendarObjectInstance:** reset attendee participation status on duplication of an event ([0b7f8dc](https://github.com/nextcloud/calendar/commit/0b7f8dc5d9d339218c2cc9990f01e15adad32e65))
* **calendarPicker:** undefined calendar ([94fc5d1](https://github.com/nextcloud/calendar/commit/94fc5d12b7772f7aa3e06aef28e6feb8a812926a))
* check if userId is null ([a123dc8](https://github.com/nextcloud/calendar/commit/a123dc80d6e80f17d3f985f6c3ad34818240a687))
* CI ([75445bd](https://github.com/nextcloud/calendar/commit/75445bd624e9d1ba0fb06b25c683a6cb4f6528cc))
* default calendar needs to support VEVENTs ([99921bc](https://github.com/nextcloud/calendar/commit/99921bc9ce7e243b9bbf028d90f7195d815380e3))
* default reminder ui bug ([def95a6](https://github.com/nextcloud/calendar/commit/def95a6b109b11485ee176aa4ab0fea94f0ac6ab))
* **deps:** bump @nextcloud/auth from 2.2.1 to ^2.3.0 (main) ([#5946](https://github.com/nextcloud/calendar/issues/5946)) ([9f1f387](https://github.com/nextcloud/calendar/commit/9f1f3878ede2499f0abbf1510bf40285c9383b3d))
* **deps:** bump @nextcloud/auth from 2.4.0 to ^2.4.0 (main) ([#6257](https://github.com/nextcloud/calendar/issues/6257)) ([8d3357f](https://github.com/nextcloud/calendar/commit/8d3357f8bd72776e3f7a18eabfbc55ac1b3b6864))
* **deps:** bump @nextcloud/axios from 2.4.0 to ^2.5.0 (main) ([#5989](https://github.com/nextcloud/calendar/issues/5989)) ([928d36b](https://github.com/nextcloud/calendar/commit/928d36bc50c687f7901b25678e9e726b03f11865))
* **deps:** bump @nextcloud/axios from 2.5.0 to ^2.5.1 (main) ([#6366](https://github.com/nextcloud/calendar/issues/6366)) ([5203eeb](https://github.com/nextcloud/calendar/commit/5203eebd680cdf2325ae6de6f3e32e90e7320129))
* **deps:** bump @nextcloud/calendar-availability-vue from 2.2.0 to ^2.2.1 (main) ([#6019](https://github.com/nextcloud/calendar/issues/6019)) ([70b8ae7](https://github.com/nextcloud/calendar/commit/70b8ae7b3c2813b7aa07dbf3766609a05d0324e6))
* **deps:** bump @nextcloud/calendar-availability-vue from 2.2.1 to ^2.2.2 (main) ([#6085](https://github.com/nextcloud/calendar/issues/6085)) ([4081035](https://github.com/nextcloud/calendar/commit/408103599f1c7cfacc68b9d19940ff793e762125))
* **deps:** bump @nextcloud/calendar-availability-vue from 2.2.2 to ^2.2.4 (main) ([#6272](https://github.com/nextcloud/calendar/issues/6272)) ([37f6e34](https://github.com/nextcloud/calendar/commit/37f6e345e8149657dda9ff84c9c7d14ec42a2428))
* **deps:** bump @nextcloud/calendar-js from 8.0.2 to ^8.0.3 (main) ([#6526](https://github.com/nextcloud/calendar/issues/6526)) ([d674751](https://github.com/nextcloud/calendar/commit/d674751988b334342f94acb508f1978d2ce1d527))
* **deps:** bump @nextcloud/cdav-library from 1.3.0 to ^1.4.0 ([b8e713c](https://github.com/nextcloud/calendar/commit/b8e713c8138cff678e5cfd8221020494ce9899ae))
* **deps:** bump @nextcloud/cdav-library from 1.4.0 to ^1.5.0 (main) ([#6174](https://github.com/nextcloud/calendar/issues/6174)) ([5e5a9a0](https://github.com/nextcloud/calendar/commit/5e5a9a061d91f9258a06e5872d8884d1d93e6e91))
* **deps:** bump @nextcloud/cdav-library from 1.5.0 to ^1.5.1 (main) ([#6182](https://github.com/nextcloud/calendar/issues/6182)) ([48116a4](https://github.com/nextcloud/calendar/commit/48116a4fcfd8edd9a26ff6244a04ccb79f702911))
* **deps:** bump @nextcloud/cdav-library from 1.5.1 to ^1.5.2 (main) ([#6426](https://github.com/nextcloud/calendar/issues/6426)) ([faf4cd6](https://github.com/nextcloud/calendar/commit/faf4cd6a46062cf0d5c1f1b8d8391a38773a7292))
* **deps:** bump @nextcloud/dialogs from 4.2.6 to v5 ([e93fb34](https://github.com/nextcloud/calendar/commit/e93fb34070a4f8575bb1ab9ff3ed2dc36cc1836f))
* **deps:** bump @nextcloud/dialogs from 5.3.1 to ^5.3.2 (main) ([#6055](https://github.com/nextcloud/calendar/issues/6055)) ([c384096](https://github.com/nextcloud/calendar/commit/c384096f2a614563c6c30b6df795475ca7fd4f97))
* **deps:** bump @nextcloud/dialogs from 5.3.2 to ^5.3.4 (main) ([#6086](https://github.com/nextcloud/calendar/issues/6086)) ([d3ba8ce](https://github.com/nextcloud/calendar/commit/d3ba8cec1597d3273b9029f29b86266fbfc6d342))
* **deps:** bump @nextcloud/dialogs from 5.3.4 to ^5.3.5 (main) ([#6132](https://github.com/nextcloud/calendar/issues/6132)) ([ad5a518](https://github.com/nextcloud/calendar/commit/ad5a518abc2565d78c3aaf73f518124d47fae1cd))
* **deps:** bump @nextcloud/dialogs from 5.3.5 to ^5.3.6 (main) ([#6273](https://github.com/nextcloud/calendar/issues/6273)) ([da7cc68](https://github.com/nextcloud/calendar/commit/da7cc685fc6681bb4b7a4e1476223662094946ad))
* **deps:** bump @nextcloud/dialogs from 5.3.6 to ^5.3.7 (main) ([#6296](https://github.com/nextcloud/calendar/issues/6296)) ([e21d65e](https://github.com/nextcloud/calendar/commit/e21d65e41fb30541ee75da21e14bf8baf1b3f99d))
* **deps:** bump @nextcloud/dialogs from 5.3.7 to ^5.3.8 (main) ([#6464](https://github.com/nextcloud/calendar/issues/6464)) ([aa30c8f](https://github.com/nextcloud/calendar/commit/aa30c8f6c164b420cfeb4b40cb3d91d4c1d39716))
* **deps:** bump @nextcloud/dialogs from 5.3.8 to v6 ([e2a85a4](https://github.com/nextcloud/calendar/commit/e2a85a471778594d0638fbe28fc9549423c1d274))
* **deps:** bump @nextcloud/event-bus from 3.2.0 to ^3.2.0 (main) ([#5947](https://github.com/nextcloud/calendar/issues/5947)) ([3cb4d04](https://github.com/nextcloud/calendar/commit/3cb4d04baa389a838fc383d8c57d3563c3626443))
* **deps:** bump @nextcloud/event-bus from 3.2.0 to ^3.3.1 (main) ([#6028](https://github.com/nextcloud/calendar/issues/6028)) ([f242ae8](https://github.com/nextcloud/calendar/commit/f242ae81d976e1a83ea65ee3324d63fad5e4aca5))
* **deps:** bump @nextcloud/initial-state from 2.1.0 to ^2.2.0 (main) ([#5990](https://github.com/nextcloud/calendar/issues/5990)) ([8f695f8](https://github.com/nextcloud/calendar/commit/8f695f83f26a7c608fba03e7737ae3388fba7bb6))
* **deps:** bump @nextcloud/l10n from 2.2.0 to v3 ([bd67b27](https://github.com/nextcloud/calendar/commit/bd67b275a0454689612ecc8b7f447af6c29cf9e1))
* **deps:** bump @nextcloud/logger from 2.7.0 to v3 ([5f84062](https://github.com/nextcloud/calendar/commit/5f84062945a27e5f373ca17f4b4b03fb5857c95a))
* **deps:** bump @nextcloud/logger from 3.0.1 to ^3.0.2 (main) ([#6020](https://github.com/nextcloud/calendar/issues/6020)) ([f75b2a6](https://github.com/nextcloud/calendar/commit/f75b2a6c98830dd9b5720412e9f0172c5d953814))
* **deps:** bump @nextcloud/moment from 1.3.1 to ^1.3.2 (main) ([#6575](https://github.com/nextcloud/calendar/issues/6575)) ([8d3b8b4](https://github.com/nextcloud/calendar/commit/8d3b8b46b662716cfc8e7c23f4780cfd541d2167))
* **deps:** bump @nextcloud/router from 3.0.0 to ^3.0.1 (main) ([#5945](https://github.com/nextcloud/calendar/issues/5945)) ([2f8515d](https://github.com/nextcloud/calendar/commit/2f8515d0fe28696fa81173dc484d7b91ce23d747))
* **deps:** bump @nextcloud/vue from 8.11.2 to ^8.11.2 ([e15a1a2](https://github.com/nextcloud/calendar/commit/e15a1a266374672555e0ee5e9d0394fa97b1f310))
* **deps:** bump @nextcloud/vue from 8.11.2 to ^8.11.3 ([ccf5f95](https://github.com/nextcloud/calendar/commit/ccf5f95d88842b91e2944066d76ac6628b95495f))
* **deps:** bump @nextcloud/vue from 8.11.3 to ^8.12.0 ([d5af6fc](https://github.com/nextcloud/calendar/commit/d5af6fc5fe920539bb6b3b8d0d5bdde941cb1dfa))
* **deps:** bump @nextcloud/vue from 8.12.0 to ^8.13.0 ([f3a79a7](https://github.com/nextcloud/calendar/commit/f3a79a7416ba5ad933982e1f86b7a6bc48107a85))
* **deps:** bump @nextcloud/vue from 8.13.0 to ^8.14.0 ([60d03d4](https://github.com/nextcloud/calendar/commit/60d03d4e4d9489cf4befd197b2a8669a67b90c97))
* **deps:** bump @nextcloud/vue from 8.14.0 to ^8.15.0 ([0271a5b](https://github.com/nextcloud/calendar/commit/0271a5b1496eaa7c9d957301d4479e63bce6ad75))
* **deps:** bump @nextcloud/vue from 8.15.0 to ^8.15.1 ([de9bebb](https://github.com/nextcloud/calendar/commit/de9bebb62449de8b30fc5b704d6d3337824231ab))
* **deps:** bump @nextcloud/vue from 8.15.1 to ^8.16.0 ([48a812c](https://github.com/nextcloud/calendar/commit/48a812cf3b615d58f276a944b43299e894ef5734))
* **deps:** bump @nextcloud/vue from 8.18.0 to ^8.18.0 ([bd73f27](https://github.com/nextcloud/calendar/commit/bd73f27ab5fd9a793fbaec15feb6cc1bbc8107d7))
* **deps:** bump @nextcloud/vue from 8.19.0 to ^8.19.0 ([6309905](https://github.com/nextcloud/calendar/commit/6309905c58c85b58118d825354b6d369e38f9b94))
* **deps:** bump @nextcloud/vue from 8.19.0 to ^8.20.0 ([128c0ba](https://github.com/nextcloud/calendar/commit/128c0ba612c97b39f0c1676b38051de5f1bb91e3))
* **deps:** bump @nextcloud/vue from 8.20.0 to ^8.22.0 ([5350abb](https://github.com/nextcloud/calendar/commit/5350abb88d020e6a085dcb7686c75a7b2d8a2084))
* **deps:** bump core-js from 3.36.1 to ^3.37.0 (main) ([#5927](https://github.com/nextcloud/calendar/issues/5927)) ([7c62824](https://github.com/nextcloud/calendar/commit/7c62824dab7f3a25a8a04ba9b505894d0c027020))
* **deps:** bump core-js from 3.37.0 to ^3.37.1 (main) ([#6006](https://github.com/nextcloud/calendar/issues/6006)) ([fb1d43c](https://github.com/nextcloud/calendar/commit/fb1d43c65dce261c28d7a0a899878fc021762299))
* **deps:** bump core-js from 3.37.1 to ^3.38.0 (main) ([#6242](https://github.com/nextcloud/calendar/issues/6242)) ([399c8b6](https://github.com/nextcloud/calendar/commit/399c8b66746093f58635204e5d5481984fe64649))
* **deps:** bump core-js from 3.38.0 to ^3.38.1 (main) ([#6298](https://github.com/nextcloud/calendar/issues/6298)) ([2ada469](https://github.com/nextcloud/calendar/commit/2ada469e5561588205d3f264d307dd3543826749))
* **deps:** bump core-js from 3.38.1 to ^3.39.0 (main) ([#6491](https://github.com/nextcloud/calendar/issues/6491)) ([5f6bbbf](https://github.com/nextcloud/calendar/commit/5f6bbbf2e7416f7ba856d2973af1e491d7c22192))
* **deps:** bump debounce from 2.0.0 to ^2.1.0 (main) ([#6030](https://github.com/nextcloud/calendar/issues/6030)) ([cb76a3f](https://github.com/nextcloud/calendar/commit/cb76a3f1cb45e9c8303957fbc58de16ee4655488))
* **deps:** bump debounce from 2.1.1 to ^2.1.1 (main) ([#6334](https://github.com/nextcloud/calendar/issues/6334)) ([696cb0b](https://github.com/nextcloud/calendar/commit/696cb0b8c62542b841969dcf09d0ae80eeeccaf8))
* **deps:** bump debounce from 2.1.1 to ^2.2.0 ([13545a6](https://github.com/nextcloud/calendar/commit/13545a6f288efed6bf88dd4d018e46ce0cfac0f8))
* **deps:** bump fullcalendar family from 6.1.11 to v6.1.14 ([8c443cc](https://github.com/nextcloud/calendar/commit/8c443cc3195c64078a110a93533f25fdf5e30b72))
* **deps:** bump fullcalendar family from 6.1.14 to v6.1.15 ([7fb8727](https://github.com/nextcloud/calendar/commit/7fb872793d73bdc785603a14e76079c43579b29a))
* **deps:** bump linkifyjs from 4.1.3 to ^4.2.0 (main) ([#6576](https://github.com/nextcloud/calendar/issues/6576)) ([f31991d](https://github.com/nextcloud/calendar/commit/f31991dbaa3e5d589c829abfb615a9ee6de67002))
* **deps:** bump p-limit from 5.0.0 to v6 ([b093b06](https://github.com/nextcloud/calendar/commit/b093b06ded3b784751712bbd5afdca692842a608))
* **deps:** bump p-limit from 6.1.0 to ^6.2.0 (main) ([#6592](https://github.com/nextcloud/calendar/issues/6592)) ([8fdb932](https://github.com/nextcloud/calendar/commit/8fdb932240ab550441175d4016108d724f0c98fb))
* **deps:** bump pinia from 2.1.7 to ^2.2.0 (main) ([#6209](https://github.com/nextcloud/calendar/issues/6209)) ([e4b2139](https://github.com/nextcloud/calendar/commit/e4b21392b4833f025012780ca502d81a4301ad7c))
* **deps:** bump pinia from 2.2.0 to ^2.2.1 (main) ([#6240](https://github.com/nextcloud/calendar/issues/6240)) ([795a49d](https://github.com/nextcloud/calendar/commit/795a49d4d8be16a4c8a423233175e925fd6589f3))
* **deps:** bump pinia from 2.2.1 to ^2.2.2 (main) ([#6299](https://github.com/nextcloud/calendar/issues/6299)) ([7b55dd5](https://github.com/nextcloud/calendar/commit/7b55dd54835eaaaeacac9379b51e33d2271d172a))
* **deps:** bump pinia from 2.2.2 to ^2.2.4 (main) ([#6387](https://github.com/nextcloud/calendar/issues/6387)) ([d59146b](https://github.com/nextcloud/calendar/commit/d59146b64e1529ef30a0fc369d9bff987f0cfdc7))
* **deps:** bump pinia from 2.2.4 to ^2.2.5 (main) ([#6450](https://github.com/nextcloud/calendar/issues/6450)) ([730b9e8](https://github.com/nextcloud/calendar/commit/730b9e8d986f207fe497fd2bd3884821887d358c))
* **deps:** bump pinia from 2.2.5 to ^2.2.6 (main) ([#6465](https://github.com/nextcloud/calendar/issues/6465)) ([1ab521c](https://github.com/nextcloud/calendar/commit/1ab521c0db8e05c589d32cf3fa2092d0104520b8))
* **deps:** bump pinia from 2.2.6 to ^2.3.0 (main) ([#6577](https://github.com/nextcloud/calendar/issues/6577)) ([fcc3182](https://github.com/nextcloud/calendar/commit/fcc318245d24ef2c8d6012146247a57751c3c1e0))
* **deps:** bump vue-material-design-icons from 5.3.0 to ^5.3.1 (main) ([#6412](https://github.com/nextcloud/calendar/issues/6412)) ([b097235](https://github.com/nextcloud/calendar/commit/b097235cb35caede9e41e115a5a221c6c969d4e1))
* **deps:** bump webdav from 5.5.0 to ^5.6.0 (main) ([#6007](https://github.com/nextcloud/calendar/issues/6007)) ([e3f9fe8](https://github.com/nextcloud/calendar/commit/e3f9fe845801aa2cfa0f27399b75abd0d3bf7cec))
* **deps:** bump webdav from 5.6.0 to ^5.7.1 (main) ([#6243](https://github.com/nextcloud/calendar/issues/6243)) ([9fc1b6a](https://github.com/nextcloud/calendar/commit/9fc1b6a79815262cd068b39b585f97dba0ae7885))
* **deps:** Fix npm audit ([492beb5](https://github.com/nextcloud/calendar/commit/492beb5d16cc1db0161c22f506c8168fb8338619))
* **deps:** Fix npm audit ([dac1c26](https://github.com/nextcloud/calendar/commit/dac1c2677bc9301fef88629e97128ac6fa9e4500))
* **deps:** Fix npm audit ([6a5ba16](https://github.com/nextcloud/calendar/commit/6a5ba160ec0af4bd25ea191057259230959335ad))
* **deps:** Fix npm audit ([ccf2a1a](https://github.com/nextcloud/calendar/commit/ccf2a1a1cee4226ef6dc56af46aca42dcec116d6))
* **deps:** Fix npm audit ([ef73eaf](https://github.com/nextcloud/calendar/commit/ef73eaf695a063a624228e4a3285d9ce3958bd09))
* **deps:** Fix npm audit ([3d6e499](https://github.com/nextcloud/calendar/commit/3d6e499865a84121b0ab28712d61f1bafb01526b))
* disable save appointment button ([6bdbb85](https://github.com/nextcloud/calendar/commit/6bdbb85a89139111d24e3cc40597f2a36204f736))
* don't apply default calendar on Nextcloud < 29 ([b46ea0d](https://github.com/nextcloud/calendar/commit/b46ea0d50edff571dff2b6280efbef0507186fc0))
* **editor:** add and remove categories from events ([97f62e6](https://github.com/nextcloud/calendar/commit/97f62e604fd5ff61466ff12ef9ead9a0b492b755))
* **editor:** add indicator to calendar picker ([0dfb690](https://github.com/nextcloud/calendar/commit/0dfb6902a0375bbe6fdf1d0336919373c599d813))
* **editor:** calendar picker width ([e35da5f](https://github.com/nextcloud/calendar/commit/e35da5f9922dbb8f127ee28e2c15c6076eab4b50))
* **editor:** creating custom categories ([403ed95](https://github.com/nextcloud/calendar/commit/403ed95864b989502e1b73f77b28d4bc490d224d))
* **editor:** don't respect default calendar in the calendar picker ([4f2caf6](https://github.com/nextcloud/calendar/commit/4f2caf615b8ecdcb0f2f63abd71093581a0a68bb))
* **editor:** sidebar editor custom header styling ([aec306b](https://github.com/nextcloud/calendar/commit/aec306b16cb06eaaf0e0ce1aa45b94aec43482b9))
* **editor:** switching to sidebar after creating a new event ([c3df245](https://github.com/nextcloud/calendar/commit/c3df245dcc9c1ace74123e7d89654592b75ec04e)), closes [#5840](https://github.com/nextcloud/calendar/issues/5840)
* **embed:** calendar header overlapping and adjust to compact design ([96fb2c7](https://github.com/nextcloud/calendar/commit/96fb2c736cf3543842f00317e85598912ada4667))
* enable attendee selection on shared calendars ([34de776](https://github.com/nextcloud/calendar/commit/34de776798486161e49e195722aa88288dbb4715))
* enable directory selection in file picker ([4944b64](https://github.com/nextcloud/calendar/commit/4944b64c335c0cc93642f0d2d9fc3a606a39204a))
* Entity parameter types ([c413f8d](https://github.com/nextcloud/calendar/commit/c413f8d1776924c1ba9c8994b80e60fc4e9734c8))
* Events with overlapping time visually overlap ([ae0cc82](https://github.com/nextcloud/calendar/commit/ae0cc8222105b07ff7aa62891333ab6b9a74d1d6))
* external attachment dialog mounted warning ([3fd760f](https://github.com/nextcloud/calendar/commit/3fd760f2466d472760fce345f0e4da9fe8eee106))
* **fc:** Adjust *today* border radius ([8dbff4c](https://github.com/nextcloud/calendar/commit/8dbff4c4b4ae5f4d58dc87982c68c3bd73bc96d8))
* **fc:** adjust week day header border radius to new design ([e4dd483](https://github.com/nextcloud/calendar/commit/e4dd483879f8c053def835bbc1023799b5bbcee5))
* **fc:** tiny white border on highlighted cells ([1017e40](https://github.com/nextcloud/calendar/commit/1017e40e4cc110c317f85ba6da12057db6278426))
* **files:** fix misplaced empty content ([80e131a](https://github.com/nextcloud/calendar/commit/80e131a0900162d74a1373b6cda96d6502cd0388))
* **files:** replace input fields with `NcTextField` ([31dd0e9](https://github.com/nextcloud/calendar/commit/31dd0e9bc4ff126aa52ec005d0d67aeab884e25a))
* **FreeBusySlotService:** improve suggested slots ([aac9479](https://github.com/nextcloud/calendar/commit/aac9479f7176e75ea329fdc3c960eb76aab4efeb))
* **FullCalendar CSS:** make events in weekly view have the correct width ([0dad0f8](https://github.com/nextcloud/calendar/commit/0dad0f80adc223418909783cd9a0dced79ae99a8))
* handle timezones with no transitions properly ([991402f](https://github.com/nextcloud/calendar/commit/991402f8669db6508f3f525c1db35bf451f0cd0a))
* Ignore existing attendee without email in search results ([58fb57b](https://github.com/nextcloud/calendar/commit/58fb57b856cfababeebaa32cc6d2f737a17eb2e0))
* Ignore VScode IDE directory ([ba60a11](https://github.com/nextcloud/calendar/commit/ba60a1190a2ff000e7c553bc6069f43ac62f0ad3))
* input label warnings ([bc58a38](https://github.com/nextcloud/calendar/commit/bc58a38efb336bb536b644470b0318f4fbedc985))
* **InviteesListSearch:** make avatar status not clip ([3cfb3a2](https://github.com/nextcloud/calendar/commit/3cfb3a24726bb4a75741f19aef874baf0df5c9f6))
* **l10n:** propfind error message translation source ([343fe47](https://github.com/nextcloud/calendar/commit/343fe476439551e79167906e111155fecf491783))
* make call token extraction more robust ([401f674](https://github.com/nextcloud/calendar/commit/401f674a92c41248fdd383f8da386c382ca8ecde))
* make sidebar tabs spacing consistent ([bc2cc6d](https://github.com/nextcloud/calendar/commit/bc2cc6d5ad1046a65ae5c5431a184f28bb37972f))
* missing default props warnings ([4ca0dca](https://github.com/nextcloud/calendar/commit/4ca0dca377b1a6d5d2113fef6dd8f1d0790ae449))
* modified unit test to include arguments ([c8626fb](https://github.com/nextcloud/calendar/commit/c8626fb8c3986a01901cdd91a7f1f0ec34d249a4))
* navigation when clicking on the grid on a custom week/month ([209bb44](https://github.com/nextcloud/calendar/commit/209bb44eec28e3ff77dc1d15bda3f6023b3269e4))
* **navigation:** scope all styles to the calendar app ([307a265](https://github.com/nextcloud/calendar/commit/307a26546e66e5676edb1df9e9c928948cef14a1))
* **notifications:** Notifier::prepare() threw \InvalidArgumentException which is deprecated ([2ab1b8f](https://github.com/nextcloud/calendar/commit/2ab1b8f033f09cd39d723875f8d7aa6c9061d51d))
* php lint complaints ([0b9f4cb](https://github.com/nextcloud/calendar/commit/0b9f4cb7311549f3cfd3571b9fe6dec66626c355))
* phpUnit required time zone object not string ([3c369e4](https://github.com/nextcloud/calendar/commit/3c369e44706a2ab18f62a5a26b1e53468fe4fb81))
* popover custom trigger warnings ([b8b6490](https://github.com/nextcloud/calendar/commit/b8b6490272b6140d983050c7933f1009eec07ba6))
* **PropertyColor:** now color is selected with submit button instead of directly ([16ebe41](https://github.com/nextcloud/calendar/commit/16ebe4165f2b403477d2a4f362e7fed9d99d72e2))
* recurrance selection ([3927688](https://github.com/nextcloud/calendar/commit/3927688e749ff1a3ce28bf5e04bd5087f764b09a))
* recurrance until selection ([692ea9e](https://github.com/nextcloud/calendar/commit/692ea9e605e340392eb187a8c496d73f6eea20e1))
* **release:** Fix wget output option ([f77d285](https://github.com/nextcloud/calendar/commit/f77d285fe4a54d8fde47af5fb1d594af49ae13dc))
* **release:** Ignore unnecessary files ([30efafe](https://github.com/nextcloud/calendar/commit/30efafe12b53d22779606dab000f5c2eae80a43c))
* **rtl:** align event title ([9bc72ad](https://github.com/nextcloud/calendar/commit/9bc72adfad0e6e18268a7afb650b475853418999))
* **rtl:** invitees list ([1a4c008](https://github.com/nextcloud/calendar/commit/1a4c008bbbbe1a228908491c39714bda7a201246))
* **rtl:** navigation buttons ([4f88b3c](https://github.com/nextcloud/calendar/commit/4f88b3c0e9104ebcea017105dd5f724fa9f3e347))
* **scheduling:** Find attendee via email ([3c0ec2a](https://github.com/nextcloud/calendar/commit/3c0ec2ade0541729384f3e2c7807db48783f22f6))
* scope global sidebar styles to the app ([2460c53](https://github.com/nextcloud/calendar/commit/2460c539e8b7fdd0b867012006e0f0484ba91d48))
* send date as sting instead of epoch ([91d787c](https://github.com/nextcloud/calendar/commit/91d787ca37af9ecf3c06d2dfdc22e8018a9b8111))
* send requestee and requester correct date and time when timezones differ [#5198](https://github.com/nextcloud/calendar/issues/5198) ([01e7e2d](https://github.com/nextcloud/calendar/commit/01e7e2d68a6610d33f77d82b089890d19c5a3969))
* **settings:** adjust design of import button ([911d5b9](https://github.com/nextcloud/calendar/commit/911d5b93be0b26aa7245e061fc9f741f2d37aff0))
* **Settings:** invert edit simple checkbox ([761a6cb](https://github.com/nextcloud/calendar/commit/761a6cba7f1c0330847b02c9f66056302a61c293))
* sidebar editor tab scrolling ([9cb56bd](https://github.com/nextcloud/calendar/commit/9cb56bd2f74c66808cffcee612c03ada1b12ea7c))
* **teams:** resolve undefined variable error and add logging ([9d1688c](https://github.com/nextcloud/calendar/commit/9d1688c87b4fdf77d66d97c49458dd8334f0a9b7))
* thrown error on json decoding errors ([2f5c5ba](https://github.com/nextcloud/calendar/commit/2f5c5baa66c1c065e5b231bcfc82d1d27d737b5d))
* time zone picker when using the simple editor ([dd4d83c](https://github.com/nextcloud/calendar/commit/dd4d83ca787b667db5f4c477ad7fab3654437183))
* update calendar sharing icon ([55cb697](https://github.com/nextcloud/calendar/commit/55cb69718bf0cc76d2c105eeb6b533ab7d00009a))
* use first day of week setting from server ([3203378](https://github.com/nextcloud/calendar/commit/3203378112f9a681061ab5bb2837197d0633b597))
* use folder icon as fallback ([a099e7b](https://github.com/nextcloud/calendar/commit/a099e7bf7409bb4d4222cc62fc23d06861c30c00))


### Features

* add organizer selection ([cbfbda2](https://github.com/nextcloud/calendar/commit/cbfbda2468e3f1de864a06a1d8bb4c65cbf8d11f))
* allow inviting contact groups ([7f70db9](https://github.com/nextcloud/calendar/commit/7f70db9929144ab31afe169d3ac6d68816e74447))
* Allow shared calendars as appointment conflict calendars ([c08f7d1](https://github.com/nextcloud/calendar/commit/c08f7d1ada4c0547c98343ded48c69f0f9c5221f))
* **appointments:** add timezone to all emails ([d30e6a7](https://github.com/nextcloud/calendar/commit/d30e6a78288a535e5b7385564881bf15a9923cc9))
* **CalendarList:** fix dragging to order calendars ([619f4f0](https://github.com/nextcloud/calendar/commit/619f4f0e9f93788e7c0c43c379544493cc531603))
* **dashboard:** reload widget once every 10 minutes ([af94950](https://github.com/nextcloud/calendar/commit/af94950cbd81445e64f6b70dc7429a207175e356))
* **DatePicker:** use native date and time picker ([7ed3e6e](https://github.com/nextcloud/calendar/commit/7ed3e6ea1960c0663d69ec2fc8a3b3076fe86b4c))
* **deps:** Add Nextcloud 30 support ([00ba483](https://github.com/nextcloud/calendar/commit/00ba4834f000ed4df81cafb659c8926919ab6929))
* disable autocompletion for event property field ([cc04b57](https://github.com/nextcloud/calendar/commit/cc04b577ccfb404a16bfec8fe929b045d479f4a8))
* **editor:** allow adding attendees in simple editor ([7953d6a](https://github.com/nextcloud/calendar/commit/7953d6adf8372ac2b1a79926dc28212cb16bfb2e))
* implement resources and rooms overview ([8b09651](https://github.com/nextcloud/calendar/commit/8b0965144982eb3f35a4379c9d35febb217858ea))
* improve sidebar organization ([6bebd61](https://github.com/nextcloud/calendar/commit/6bebd61e442ef70e748c1f3962e128c1c53f46ec))
* improve the description text ([8f9e504](https://github.com/nextcloud/calendar/commit/8f9e5048c693190d99bea9aadd0001f082ad7aae))
* rebrand circles to teams in calendar sharing modal ([27f98ba](https://github.com/nextcloud/calendar/commit/27f98ba8aeca3541122cae949924d203e0758df9))
* reduce header sizes in calendar modal ([3bd39a1](https://github.com/nextcloud/calendar/commit/3bd39a13cc2e070f82523582389004eab6edc780))
* reduce opacitiy for past events ([3fa906b](https://github.com/nextcloud/calendar/commit/3fa906b67c54fb426b87fed8d41137c840f79daa))
* refresh calenders on remote changes ([6d1a23d](https://github.com/nextcloud/calendar/commit/6d1a23d2ac17226bd7f7495303bbe21a696892cc))
* require caldav backend ([5b3293f](https://github.com/nextcloud/calendar/commit/5b3293fabf2e0c7a05dcf5dbae8e6df3e4dd9b0b))
* update to php8.1 ([1917636](https://github.com/nextcloud/calendar/commit/1917636fe5d8c30b7cdc95a493350aeb9631736f))


### Reverts

* Revert "fix: popover custom trigger warnings" ([1d1f517](https://github.com/nextcloud/calendar/commit/1d1f517160e5f4736f2ad646057d1055bcfef948))
* Revert "fix: external attachment dialog mounted warning" ([7cad79a](https://github.com/nextcloud/calendar/commit/7cad79a9903ee57c5a5f3bb532a9a1a229998edb))
* Revert "fix: input label warnings" ([a64251c](https://github.com/nextcloud/calendar/commit/a64251c240973e177c9b199368af4503d3cc528e))
* Revert "fix: delay initializing the resize observer until FC is ready" ([a633a5a](https://github.com/nextcloud/calendar/commit/a633a5a0ad440a83db7706ae3634faa53c277c17))



# [4.7.0-beta4](https://github.com/nextcloud/calendar/compare/v4.7.0-beta3...v4.7.0-beta4) (2024-03-20)


### Bug Fixes

* add VTIMEZONE to Appointments ([496896a](https://github.com/nextcloud/calendar/commit/496896a34daa2b728d659708d083af55d3158565))
* **appointments:** add date to booking detail view ([eeacfa6](https://github.com/nextcloud/calendar/commit/eeacfa694adeed2de9e3286c3e3b8c54ec5d7fc1))
* **appointments:** allow 5 minute increments for rounding in slot bookings ([37b2047](https://github.com/nextcloud/calendar/commit/37b20472427614af913a081ee8ad8431f9bda731))
* **appointments:** Decide rounding by increment OR length ([e49e4a6](https://github.com/nextcloud/calendar/commit/e49e4a6e9431dc5aefa94277a26d4c6988b37a0b))
* **appointments:** Fix button style ([da06ac5](https://github.com/nextcloud/calendar/commit/da06ac5986022b6849666e571c7525488ef6e7f1))
* **appointments:** Make rooms public ([d39352f](https://github.com/nextcloud/calendar/commit/d39352f9a2638691b0cffa461ebd8ad7710ffa13))
* **appointments:** Rate limit config creation and booking ([0f77b41](https://github.com/nextcloud/calendar/commit/0f77b41942d67c58daccdac1ff3a7f80d3b569a7))
* **appointments:** slot generation deviation for increments that don't fit modulo ([0176063](https://github.com/nextcloud/calendar/commit/0176063a82c78c3970f146552b2d45f4a22197e1))
* **appointments:** Write Talk link to event ([dcb2524](https://github.com/nextcloud/calendar/commit/dcb2524ecc77801a6e06dbd5e50d05b10cdde87e))
* **attachments:** Convert FileList to array ([d8ed0ff](https://github.com/nextcloud/calendar/commit/d8ed0ffab5a499ecb7c26f8b6ac82d2d961c89ee))
* **attachments:** folder picker opening twice ([d520471](https://github.com/nextcloud/calendar/commit/d52047176599cbe5f14e58b8c5d854996ff38793))
* **dashboard:** properly handle recurring events ([babc444](https://github.com/nextcloud/calendar/commit/babc444245f6e6cef2fd1a88773532074c9cad0e))
* default calendar picker search and make it not clearable ([9dcc3bb](https://github.com/nextcloud/calendar/commit/9dcc3bbeca324867eb6126f0106f45af7f452d63))
* **deps:** bump @nextcloud/auth from 2.1.0 to ^2.2.1 (main) ([#5522](https://github.com/nextcloud/calendar/issues/5522)) ([884bf79](https://github.com/nextcloud/calendar/commit/884bf79a6da0bc07a1085662e498ee043367d2f3))
* **deps:** bump @nextcloud/calendar-availability-vue from 1.0.0 to ^1.0.1 (main) ([#5520](https://github.com/nextcloud/calendar/issues/5520)) ([ab04d3a](https://github.com/nextcloud/calendar/commit/ab04d3aa73af11963ccf52b9a7dbcee9c212b8bc))
* **deps:** bump @nextcloud/calendar-availability-vue from 2.1.0 to ^2.2.0 ([205dbcb](https://github.com/nextcloud/calendar/commit/205dbcb93ca78e836d1006a75af6668e38190daf))
* **deps:** bump @nextcloud/calendar-js from 6.0.1 to ^6.1.0 (main) ([#5562](https://github.com/nextcloud/calendar/issues/5562)) ([066f9d9](https://github.com/nextcloud/calendar/commit/066f9d9b97c7ae7a4e953f41ea55ae01a7597ce6))
* **deps:** bump @nextcloud/dialogs from 4.1.0 to ^4.2.0-beta.2 (main) ([#5415](https://github.com/nextcloud/calendar/issues/5415)) ([2eb9c0a](https://github.com/nextcloud/calendar/commit/2eb9c0aefecfbf72a0ab8832d49bf2aef9e0767d))
* **deps:** bump @nextcloud/dialogs from 4.2.0 to ^4.2.1 (main) ([#5493](https://github.com/nextcloud/calendar/issues/5493)) ([940bafa](https://github.com/nextcloud/calendar/commit/940bafaccb6f6d83198abf9cacf2bcc14fd636c9))
* **deps:** bump @nextcloud/dialogs from 4.2.0-beta.2 to ^4.2.0-beta.3 (main) ([#5423](https://github.com/nextcloud/calendar/issues/5423)) ([bf1aab4](https://github.com/nextcloud/calendar/commit/bf1aab4152b8b5f1bdd083d767977523eab06933))
* **deps:** bump @nextcloud/dialogs from 4.2.0-beta.3 to ^4.2.0-beta.4 (main) ([#5428](https://github.com/nextcloud/calendar/issues/5428)) ([75e3294](https://github.com/nextcloud/calendar/commit/75e3294154b25445cec918586414f8de151df724))
* **deps:** bump @nextcloud/dialogs from 4.2.0-beta.4 to ^4.2.0 (main) ([#5452](https://github.com/nextcloud/calendar/issues/5452)) ([d717473](https://github.com/nextcloud/calendar/commit/d717473e6917b120b379170a313787402b715c29))
* **deps:** bump @nextcloud/dialogs from 4.2.1 to ^4.2.2 (main) ([#5576](https://github.com/nextcloud/calendar/issues/5576)) ([fe03d46](https://github.com/nextcloud/calendar/commit/fe03d463615a6092bbb2ed9661848b0b45b63cb9))
* **deps:** bump @nextcloud/dialogs from 4.2.2 to ^4.2.3 (main) ([#5711](https://github.com/nextcloud/calendar/issues/5711)) ([58df3da](https://github.com/nextcloud/calendar/commit/58df3da170679b1f04c5025fb7f9d44f0528a122))
* **deps:** bump @nextcloud/dialogs from 4.2.3 to ^4.2.4 (main) ([#5725](https://github.com/nextcloud/calendar/issues/5725)) ([5728a3d](https://github.com/nextcloud/calendar/commit/5728a3d0eb12985cc7317f554b7c159572543d85))
* **deps:** bump @nextcloud/dialogs from 4.2.4 to ^4.2.5 (main) ([#5740](https://github.com/nextcloud/calendar/issues/5740)) ([c7f5aa9](https://github.com/nextcloud/calendar/commit/c7f5aa9141d16908d230a8936823a4b3d30f2404))
* **deps:** bump @nextcloud/dialogs from 4.2.5 to ^4.2.6 (main) ([#5803](https://github.com/nextcloud/calendar/issues/5803)) ([27a33d8](https://github.com/nextcloud/calendar/commit/27a33d85d1702f41002b81345ef7ec50f46e6f6b))
* **deps:** bump @nextcloud/logger from 2.5.0 to ^2.7.0 (main) ([#5523](https://github.com/nextcloud/calendar/issues/5523)) ([c53bde0](https://github.com/nextcloud/calendar/commit/c53bde0f16ef4c234de0362078b69b065ae52312))
* **deps:** bump @nextcloud/moment from 1.2.1 to ^1.2.2 (main) ([#5535](https://github.com/nextcloud/calendar/issues/5535)) ([b91ec46](https://github.com/nextcloud/calendar/commit/b91ec469238824627a941990e4068b5298468286))
* **deps:** bump @nextcloud/moment from 1.2.2 to ^1.3.1 (main) ([#5699](https://github.com/nextcloud/calendar/issues/5699)) ([9382732](https://github.com/nextcloud/calendar/commit/93827329ed2651d2f37a9396be0766186a6e3943))
* **deps:** bump @nextcloud/router from 2.1.2 to ^2.2.0 (main) ([#5548](https://github.com/nextcloud/calendar/issues/5548)) ([ffa118b](https://github.com/nextcloud/calendar/commit/ffa118b2302803a6a70652ca1bd8a097d8a5197e))
* **deps:** bump @nextcloud/router from 2.2.0 to ^2.2.1 (main) ([#5726](https://github.com/nextcloud/calendar/issues/5726)) ([28d5a02](https://github.com/nextcloud/calendar/commit/28d5a029d4ab36ee11580b72605aa2448622a702))
* **deps:** bump @nextcloud/router from 2.2.1 to v3 ([fa9c2a1](https://github.com/nextcloud/calendar/commit/fa9c2a126eb345cc46b5c92ad79e1220ab88f3bb))
* **deps:** bump @nextcloud/vue from 7.12.1 to ^7.12.2 ([b6e4fae](https://github.com/nextcloud/calendar/commit/b6e4faeccc12c03e72958c49610562fcd96e5587))
* **deps:** bump @nextcloud/vue from 7.12.2 to ^7.12.4 ([0462476](https://github.com/nextcloud/calendar/commit/04624765597a266563207970b2a6816643fb7f07))
* **deps:** bump @nextcloud/vue from 7.12.4 to ^7.12.5 ([f05aee2](https://github.com/nextcloud/calendar/commit/f05aee245fb1fa393dbe82ab7f748c62e79bc650))
* **deps:** bump @nextcloud/vue from 7.12.5 to ^7.12.6 ([aa7c81d](https://github.com/nextcloud/calendar/commit/aa7c81d956ee56ec432f93ad9d9c2f971b7a2b09))
* **deps:** bump @nextcloud/vue from 7.12.6 to ^7.12.7 ([7bc57a8](https://github.com/nextcloud/calendar/commit/7bc57a8d49616302b6a6057f0182b9d490252a28))
* **deps:** bump @nextcloud/vue from 8.6.2 to ^8.7.0 ([eb7c054](https://github.com/nextcloud/calendar/commit/eb7c05436be67c59be1a3755d40c90f770f82101))
* **deps:** bump @nextcloud/vue from 8.7.0 to ^8.7.1 ([7833b1e](https://github.com/nextcloud/calendar/commit/7833b1ea4a29903e58b078d2d9ffdb462d3ba007))
* **deps:** bump core-js from 3.32.0 to ^3.32.1 (main) ([#5430](https://github.com/nextcloud/calendar/issues/5430)) ([0b8ec0d](https://github.com/nextcloud/calendar/commit/0b8ec0da85a3d6605953dc53161396fdd5050c1a))
* **deps:** bump core-js from 3.32.1 to ^3.32.2 (main) ([#5470](https://github.com/nextcloud/calendar/issues/5470)) ([df6b600](https://github.com/nextcloud/calendar/commit/df6b600e118cdd5631e2a46c4e6ede773ac5b620))
* **deps:** bump core-js from 3.32.2 to ^3.33.0 (main) ([#5524](https://github.com/nextcloud/calendar/issues/5524)) ([63fd15e](https://github.com/nextcloud/calendar/commit/63fd15e585c49ada7b4da5b369d58706b6508ae9))
* **deps:** bump core-js from 3.33.0 to ^3.33.1 (main) ([#5546](https://github.com/nextcloud/calendar/issues/5546)) ([b6446c4](https://github.com/nextcloud/calendar/commit/b6446c41b508384c39c61ace250f5af7e200eae7))
* **deps:** bump core-js from 3.33.1 to ^3.33.2 (main) ([#5558](https://github.com/nextcloud/calendar/issues/5558)) ([4315fbf](https://github.com/nextcloud/calendar/commit/4315fbf61af061da2b5f17ac0086f383b34ed274))
* **deps:** bump core-js from 3.33.2 to ^3.33.3 (main) ([#5585](https://github.com/nextcloud/calendar/issues/5585)) ([c6b1ed3](https://github.com/nextcloud/calendar/commit/c6b1ed34ba69e09ffab2e32b7f8a40b01bcaa917))
* **deps:** bump core-js from 3.33.3 to ^3.34.0 (main) ([#5626](https://github.com/nextcloud/calendar/issues/5626)) ([0648771](https://github.com/nextcloud/calendar/commit/0648771a9fe4fd111e7cd90516b7b66e50afd960))
* **deps:** bump core-js from 3.34.0 to ^3.35.0 (main) ([#5661](https://github.com/nextcloud/calendar/issues/5661)) ([5e60295](https://github.com/nextcloud/calendar/commit/5e60295d0e74712d7b420e5dacabed83cda62e53))
* **deps:** bump core-js from 3.35.0 to ^3.35.1 (main) ([#5712](https://github.com/nextcloud/calendar/issues/5712)) ([84e98c6](https://github.com/nextcloud/calendar/commit/84e98c6baaf95299e17b4afe592bd310e5f137ef))
* **deps:** bump core-js from 3.35.1 to ^3.36.0 (main) ([#5811](https://github.com/nextcloud/calendar/issues/5811)) ([752b87e](https://github.com/nextcloud/calendar/commit/752b87eb99b4190933cd639cb0d3e7d60d63f697))
* **deps:** bump core-js from 3.36.0 to ^3.36.1 (main) ([#5858](https://github.com/nextcloud/calendar/issues/5858)) ([59fe5d0](https://github.com/nextcloud/calendar/commit/59fe5d0cacc0eff31336ed3ce99505587b49e4fb))
* **deps:** bump debounce from 1.2.1 to v2 ([dba8c91](https://github.com/nextcloud/calendar/commit/dba8c91c4e105daa6da6f31168e72923a641485d))
* **deps:** bump fullcalendar family from 6.1.10 to v6.1.11 ([82b6908](https://github.com/nextcloud/calendar/commit/82b6908b6aac573aa9539caab348144d8b28c146))
* **deps:** bump fullcalendar family from 6.1.8 to v6.1.9 ([7d484a9](https://github.com/nextcloud/calendar/commit/7d484a9fa92356a0db0289e2e32e27d35d1fa4ec))
* **deps:** bump fullcalendar family from 6.1.9 to v6.1.10 ([6d29805](https://github.com/nextcloud/calendar/commit/6d298059ce9bc6e35a1542a82406bce77bf12f19))
* **deps:** bump linkifyjs from 4.1.1 to ^4.1.2 (main) ([#5577](https://github.com/nextcloud/calendar/issues/5577)) ([1e2df09](https://github.com/nextcloud/calendar/commit/1e2df0964a24a009d8a5fd7b0877480ffaefeec9))
* **deps:** bump linkifyjs from 4.1.2 to ^4.1.3 (main) ([#5610](https://github.com/nextcloud/calendar/issues/5610)) ([fe924ae](https://github.com/nextcloud/calendar/commit/fe924ae3694da8ee9efa92bbcfac3ebad6887322))
* **deps:** bump p-limit from 4.0.0 to v5 ([a8120b9](https://github.com/nextcloud/calendar/commit/a8120b90f6c30cc1bffb15fdbd63251509405565))
* **deps:** bump vue monorepo from 2.7.14 to ^2.7.15 (main) ([#5547](https://github.com/nextcloud/calendar/issues/5547)) ([d6f7259](https://github.com/nextcloud/calendar/commit/d6f72593b56f786ebdca8540836935ad44c2864d))
* **deps:** bump vue monorepo from 2.7.15 to ^2.7.16 (main) ([#5623](https://github.com/nextcloud/calendar/issues/5623)) ([2e712e6](https://github.com/nextcloud/calendar/commit/2e712e65cc1f5524e93af46f87c84ac76238e0c0))
* **deps:** bump vue-material-design-icons from 5.2.0 to ^5.3.0 (main) ([#5728](https://github.com/nextcloud/calendar/issues/5728)) ([38ebbcf](https://github.com/nextcloud/calendar/commit/38ebbcf3bcc647b909b2e8d4905c0964f086d04c))
* **deps:** bump webdav from 5.2.3 to ^5.3.0 (main) ([#5453](https://github.com/nextcloud/calendar/issues/5453)) ([50ddadf](https://github.com/nextcloud/calendar/commit/50ddadf37b5b58dfbd17ca6e93f160807db94317))
* **deps:** bump webdav from 5.3.0 to ^5.3.1 (main) ([#5624](https://github.com/nextcloud/calendar/issues/5624)) ([c1cdd74](https://github.com/nextcloud/calendar/commit/c1cdd7416d46a8447da385a28562cd6f02a8f736))
* **deps:** bump webdav from 5.3.1 to ^5.3.2 (main) ([#5739](https://github.com/nextcloud/calendar/issues/5739)) ([50991fd](https://github.com/nextcloud/calendar/commit/50991fdc38b5b2bf7cd3e16d866b3603978acb82))
* **deps:** bump webdav from 5.3.2 to ^5.4.0 (main) ([#5812](https://github.com/nextcloud/calendar/issues/5812)) ([07e87f4](https://github.com/nextcloud/calendar/commit/07e87f49d93dd19a160cc87aa382ebc2e410b5eb))
* **deps:** bump webdav from 5.4.0 to ^5.5.0 (main) ([#5859](https://github.com/nextcloud/calendar/issues/5859)) ([6244af9](https://github.com/nextcloud/calendar/commit/6244af93bfca824ce32bfec5db25b1594a159fb6))
* disable resharing of incoming shared calendars ([c370c11](https://github.com/nextcloud/calendar/commit/c370c1163af69926c48394dc4569fbf7b5e2fd61))
* dont forward internal exceptions ([3b5ecd0](https://github.com/nextcloud/calendar/commit/3b5ecd08ff8fc7bc7fa502cef5a0dd652447967a))
* **editor:** bring back the three-dot menu ([de1cf84](https://github.com/nextcloud/calendar/commit/de1cf849af30518efd22d32e8f88af93bef00cb1))
* **editor:** convert start date to user's tz for the sub line ([0716226](https://github.com/nextcloud/calendar/commit/0716226f34af38060a03021eb22988365e537911))
* **editor:** grow save buttons and change their order ([f2e6975](https://github.com/nextcloud/calendar/commit/f2e6975f29225326ece58d6613a0ee8856a56948))
* **editor:** show placeholder if an event's title is empty ([b6383fe](https://github.com/nextcloud/calendar/commit/b6383fe0908646bdc62d01dcf2fb04056a7ec245))
* **editor:** top right actions not positioned properly ([af4e4c1](https://github.com/nextcloud/calendar/commit/af4e4c1fc19c07871d4fac24bcc1d0654e5cbd6e))
* error handling for exceptions for recurrence next ([cc02049](https://github.com/nextcloud/calendar/commit/cc0204971a851819d32866543367c01ae290496c))
* **freebusy:** free for all blocks ([fd46192](https://github.com/nextcloud/calendar/commit/fd4619256466e93f767443392e0ce77dd7f93c38))
* kazakhstan holiday calendars ([66223fd](https://github.com/nextcloud/calendar/commit/66223fd8e8395d82be4c887bc9d6e04c8ab2ee8c))
* missing public calendar initial state ([c9398b7](https://github.com/nextcloud/calendar/commit/c9398b72f7ff69461547cfdab1c8506af6d78d43))
* move global sidebar style overrides to sfc ([d1edd61](https://github.com/nextcloud/calendar/commit/d1edd61e46254de5482d60994856013219af3c54))
* restore original event ordering ([ded1f29](https://github.com/nextcloud/calendar/commit/ded1f294eb40f7299167fcb12c8d6cb63387c9bb)), closes [#4431](https://github.com/nextcloud/calendar/issues/4431) [#4646](https://github.com/nextcloud/calendar/issues/4646)
* **scheduling:** Disable free/busy for attendees ([d9e67db](https://github.com/nextcloud/calendar/commit/d9e67dbb1b8106f8d028fce1246580c09937729c))
* **scheduling:** Rephraze "Invitation sent" to "Awaiting response" ([5d4e3e2](https://github.com/nextcloud/calendar/commit/5d4e3e224dc47295ee75d4bb148ad63bff00e419))
* **scheduling:** Use attendee placeholder avatars ([521b530](https://github.com/nextcloud/calendar/commit/521b5303e27dfdf793ccdbb94289e40ec393d131)), closes [#3099](https://github.com/nextcloud/calendar/issues/3099)
* **sidebar:** hide alarm actions menu when starting to edit ([25a6f13](https://github.com/nextcloud/calendar/commit/25a6f1397a67ed6a84bb3e8c60b006d2056b95db))
* **talk:** Do not invite guest participants ([e6e8c2a](https://github.com/nextcloud/calendar/commit/e6e8c2a531ae75c4223a5ea50036f75892715439))
* update changelog v4.5.3 ([c0ade81](https://github.com/nextcloud/calendar/commit/c0ade818b857e458b3855267737d11e55fe6e2e0))
* update holiday calendars ([5a45f89](https://github.com/nextcloud/calendar/commit/5a45f8916f3ff393636d664d62ee1f87c7c73751))


### Features

* Ability to invite circles ([df2d51b](https://github.com/nextcloud/calendar/commit/df2d51b66631c5149e5a4d7db73c0ccad60bb6fc))
* Ability to render groups as attendees ([33e236c](https://github.com/nextcloud/calendar/commit/33e236c285513db01f1232722c5ea59974f332a7))
* add a setting for the default calendar url ([7a307bb](https://github.com/nextcloud/calendar/commit/7a307bbcf0160ca9dd2202ccfe123d086de4c141))
* **appointments:** show indicator when loading slots and show toast in case of error ([4d3172f](https://github.com/nextcloud/calendar/commit/4d3172f09773e6547b35a592eae3ffb11bc5354c))
* **editors:** redesign editors ([3369fc8](https://github.com/nextcloud/calendar/commit/3369fc8ea9ac88e0344d9c91f12941585a7a60aa))
* **scheduling:** Automate free/busy slot selection ([d47632e](https://github.com/nextcloud/calendar/commit/d47632eb0906de5be957fe6b8b0197af049564c0))
* update info.xml and appversion ([1c32a12](https://github.com/nextcloud/calendar/commit/1c32a12b9c99e79ecdb49ec92db7923ab3fb0d61))


### Performance Improvements

* **bundles:** refactor @nextcloud/vue imports to use the esm bundle ([baeeae2](https://github.com/nextcloud/calendar/commit/baeeae244614586bbc3c1efd3233f26a84ec0a01))
* **dashboard:** implement widget item api v2 ([a00f344](https://github.com/nextcloud/calendar/commit/a00f34419eed45d709082b3601cb995ca1855fed))


### Reverts

* Revert "fix(appointments): Ignore extraneous columns in AppointmentConfigMapper::findByToken" ([8838fba](https://github.com/nextcloud/calendar/commit/8838fba6c0c4be347ff0fa160f6a9dcaa3d216b5))
* Augment the category menu by system tags and already used categories ([eae6dea](https://github.com/nextcloud/calendar/commit/eae6deada277e718a153a5ff48836f8dba509dd0))



# [4.5.0-beta1](https://github.com/nextcloud/calendar/compare/v4.5.0-alpha2...v4.5.0-beta1) (2023-08-11)


### Features

* **editor:** make links clickable in locations and description areas ([8fa9d99](https://github.com/nextcloud/calendar/commit/8fa9d99ea7877f0355f357a6511d0698bcd9ad72))



# [4.5.0-alpha2](https://github.com/nextcloud/calendar/compare/v4.5.0-alpha1...v4.5.0-alpha2) (2023-08-07)


### Bug Fixes

* add requistes link to README ([28ccf72](https://github.com/nextcloud/calendar/commit/28ccf729534b9362b1bb66584dc806172108b9f4))
* Allow dynamic autoloading for classes added during upgrade ([c88cb60](https://github.com/nextcloud/calendar/commit/c88cb60b810fb2055db9b4806468de9926c359b6))
* **appointements:** add context for translators for the talk room name string ([ac9e7e5](https://github.com/nextcloud/calendar/commit/ac9e7e5b03f6d9abb9b2d83010209f79ef9d754d)), closes [#5297](https://github.com/nextcloud/calendar/issues/5297)
* **appointments:** calendar booking notifications ([a61f7a9](https://github.com/nextcloud/calendar/commit/a61f7a91559c5da569453b6ac6ded8d3e986faa8))
* **appointments:** equalize slot booking button width ([7866b18](https://github.com/nextcloud/calendar/commit/7866b18e9a4655352e05443ee8f500ed5241ca77))
* **appointments:** Fix disabling appointments feature ([f00ce71](https://github.com/nextcloud/calendar/commit/f00ce710d01089d85ff9f6b1df564de6fbbb66d8))
* **appointments:** Ignore extraneous columns in AppointmentConfigMapper::findByToken ([94c93f1](https://github.com/nextcloud/calendar/commit/94c93f1f457d8fd4910d38cf6e80ef3d4caa0fd3))
* **appointments:** set visibility to private by default ([e35ba35](https://github.com/nextcloud/calendar/commit/e35ba352eaf7fcb21b3eb4da6b8529884a8485b2))
* **attachments:** generate proper urls to dav service ([ba04707](https://github.com/nextcloud/calendar/commit/ba047076d1d51c0f27295065a333084b011befee))
* bring back advanced color picker fields ([3c987b5](https://github.com/nextcloud/calendar/commit/3c987b5184456bd5c438a0adf7a0dedba46f29a5))
* calendar export button ([07b58ab](https://github.com/nextcloud/calendar/commit/07b58ab939dd166a33f589bae3857bb0bea2692b))
* **categories:** fall back to empty array ([32fa3fa](https://github.com/nextcloud/calendar/commit/32fa3fa114c7611b41c1d61f0c6e3118c45556b1))
* debounce calendar modal save and edit methods ([eef9e1b](https://github.com/nextcloud/calendar/commit/eef9e1b75af67e28375c10356e519f2533c5a25c))
* **deps:** bump @nextcloud/axios from 2.3.0 to ^2.4.0 ([64fe74a](https://github.com/nextcloud/calendar/commit/64fe74ae5775c01b0e39435d6d3bb5a6a6ca6ff6))
* **deps:** bump @nextcloud/calendar-availability-vue from 0.6.0-alpha1 to v1 ([a937482](https://github.com/nextcloud/calendar/commit/a937482c8c5e6daa4a1ca705e8c0ea431b2de4db))
* **deps:** bump @nextcloud/dialogs from 4.0.1 to ^4.1.0 ([934f40b](https://github.com/nextcloud/calendar/commit/934f40b36da1f2c7d6e41996ed7b7d2707df6807))
* **deps:** bump @nextcloud/initial-state from 2.0.0 to ^2.1.0 ([f28d5c4](https://github.com/nextcloud/calendar/commit/f28d5c44a97f00cd9f8a6800635b28c5289286a7))
* **deps:** bump @nextcloud/l10n from 2.1.0 to ^2.2.0 ([bc18ffa](https://github.com/nextcloud/calendar/commit/bc18ffaaffe7fd7b6c3608bc78b57d0dce95aa44))
* **deps:** bump @nextcloud/router from 2.1.1 to ^2.1.2 ([63a9f41](https://github.com/nextcloud/calendar/commit/63a9f411ba51b0a1cbdf9d83cd85b1fbcd912ce5))
* **deps:** bump @nextcloud/vue from 7.11.6 to ^7.12.0 ([9ac0475](https://github.com/nextcloud/calendar/commit/9ac047536cbc9b1818d422321f832ce8b4188426))
* **deps:** bump @nextcloud/vue from 7.12.0 to ^7.12.1 ([8e0ac6f](https://github.com/nextcloud/calendar/commit/8e0ac6f393cd2901d12206776826010d75d3a1aa))
* **deps:** bump bamarni/composer-bin-plugin from 1.8.2 to ^1.8.2 ([b46131d](https://github.com/nextcloud/calendar/commit/b46131de549349ead6bad4a8c0187377371a4e40))
* **deps:** bump core-js from 3.30.2 to ^3.31.0 ([1c029d1](https://github.com/nextcloud/calendar/commit/1c029d10b907ec16141628e1083c07a6d29fbb2c))
* **deps:** bump core-js from 3.31.0 to ^3.31.1 ([bb4b86a](https://github.com/nextcloud/calendar/commit/bb4b86a9141aa0453b667f5803f16d6ee79d8db7))
* **deps:** bump core-js from 3.31.1 to ^3.32.0 (main) ([#5388](https://github.com/nextcloud/calendar/issues/5388)) ([4dc430f](https://github.com/nextcloud/calendar/commit/4dc430fa3f563b7827a97796313618a472d84525))
* **deps:** bump webdav from 5.0.0 to ^5.1.0 ([882008f](https://github.com/nextcloud/calendar/commit/882008fc59139d9cabdf9dd4360886f986332543))
* **deps:** bump webdav from 5.1.0 to ^5.2.1 ([f41a986](https://github.com/nextcloud/calendar/commit/f41a986f9ca56b3d7f4fb13dd5dacb54153755f8))
* **deps:** bump webdav from 5.2.1 to ^5.2.2 ([1e9a34d](https://github.com/nextcloud/calendar/commit/1e9a34dad7747d9996ac208ec30ff4dbba43c179))
* **deps:** bump webdav from 5.2.2 to ^5.2.3 ([302b84a](https://github.com/nextcloud/calendar/commit/302b84a0c273f9e930164d3554ecea4cb02947d9))
* **deps:** pin dependencies ([9ae057a](https://github.com/nextcloud/calendar/commit/9ae057afcd6512643e6802b6bd46d42a43a711a8))
* **duplicateEvent:** Open duplicate in sidebar not original ([3dfd7fa](https://github.com/nextcloud/calendar/commit/3dfd7fab060fa534d066e26e54c06929ba13cffe))
* improve grammar ([edfe0d5](https://github.com/nextcloud/calendar/commit/edfe0d54ab098330aad7487ea8ac72469f213171))
* indicate if calendar is shared by me ([0e609c6](https://github.com/nextcloud/calendar/commit/0e609c6a8af590d88d65f17b35916943537552d0))
* **public-embed:** Fix header showing on embed view ([ff17233](https://github.com/nextcloud/calendar/commit/ff17233536ae5ff2a7796a06818ff6f6bc71aee6))
* **Public-Sharing:** Show footer with server details and eventual ToS through PublicTemplateResponse ([3a42cf6](https://github.com/nextcloud/calendar/commit/3a42cf6ced848c7a7d4f697540558f9a1f9c6c43))
* **settings:** Fix link to personal availability settings depending on NC version ([df16051](https://github.com/nextcloud/calendar/commit/df16051b84f616bf4ad1375d2e7ee0e65e25591b)), closes [#5226](https://github.com/nextcloud/calendar/issues/5226)
* **sharing:** skip long email addresses ([7899440](https://github.com/nextcloud/calendar/commit/7899440bbbf1a7ab9d68749595668e335cbc4913))
* sidebar editor subtitle not respecting event's timezone ([de03f3b](https://github.com/nextcloud/calendar/commit/de03f3bc1f90e2dee797b21ec6d3caecefd3d2d9))
* userAsAttendee failing in case of public links ([e9c0ba9](https://github.com/nextcloud/calendar/commit/e9c0ba997670007a3faaeb14f84ae829e2ca44f3))


### Features

* Add link to the Thunderbird holiday calendar page ([5f071dd](https://github.com/nextcloud/calendar/commit/5f071dd393be332d94416f0d5cc2481c45652bec))
* **alarms:** improve email alarm RFC compliance ([150cc29](https://github.com/nextcloud/calendar/commit/150cc2976db52ce61f0ef394e148029adc2fc975))
* **appointments:** Disable the booking button while loading ([#5244](https://github.com/nextcloud/calendar/issues/5244)) ([da158a0](https://github.com/nextcloud/calendar/commit/da158a07a753acf1c990db9174ce38835c117b3e))
* **deps:** Revive PHP7.4 support ([5d88b22](https://github.com/nextcloud/calendar/commit/5d88b229fce11c485d7c72ff0ab5b60f30b9eb8d))
* **editor:** implement app config to hide resources tab ([28d672c](https://github.com/nextcloud/calendar/commit/28d672c368a6fd27c40c9a06f4215d7ec2a716cb))
* implement dedicated calendar modal save button ([f8d52c8](https://github.com/nextcloud/calendar/commit/f8d52c83ba98b451db5ae619868dc49a0b64f464))
* migrate trash bin buttons to NcButton ([34577d2](https://github.com/nextcloud/calendar/commit/34577d2b50836eebdeea5f0da504701b368a4285))
* support Nextcloud 28 ([da70650](https://github.com/nextcloud/calendar/commit/da70650ba9ec699225e15288d9ceb7b0b1eaa322))
* **talkintegration:** Set Talk conversation description ([9f53311](https://github.com/nextcloud/calendar/commit/9f5331141485232e3351daa0efaacca13e9d3868))
* **talk:** Make event attendees Talk room participants ([8820948](https://github.com/nextcloud/calendar/commit/8820948844096cf165d41abef315f07dea91eccd))
* **view:** Introduce year grid view (with FC multiMonthYear plugin) ([e4ab210](https://github.com/nextcloud/calendar/commit/e4ab21072bc8f872ad879d1673f127b322dd7312)), closes [#159](https://github.com/nextcloud/calendar/issues/159)
* **webcal:** Name button *Subscribed* for existing calendars ([d66843d](https://github.com/nextcloud/calendar/commit/d66843d3c4383db68b7ed24a6858c078371d7d14))
* **webcal:** Thunderbird holiday subscription picker ([1de6116](https://github.com/nextcloud/calendar/commit/1de611697ddbcb3fb441e40da791e1cf1f467c7a))
* Write Talk URL into location, not description ([7f39c7b](https://github.com/nextcloud/calendar/commit/7f39c7b7dc2690d3bd7532cceb1090d7f4e097b4))


### Performance Improvements

* **autoloader:** Use Composer's authoritative classmap ([0eb41dc](https://github.com/nextcloud/calendar/commit/0eb41dc1bc2d72a91eb59375c38a36edfd29e97b))
* Lazy load dashboard components ([e927aa5](https://github.com/nextcloud/calendar/commit/e927aa543df8183e5a084441d69ee6780c1a7257))


### Reverts

* Revert "Create Talk rooms for appointments" ([5b9c879](https://github.com/nextcloud/calendar/commit/5b9c8796e904004d5a40f8a1f02469fa6615ef06))
* Revert "Create command-rebase.yml" ([8ffc2df](https://github.com/nextcloud/calendar/commit/8ffc2dfd0f852ad20d74c09731a00a824e6e77e8))
* Revert "Move event rendering to vue" ([ca2abbb](https://github.com/nextcloud/calendar/commit/ca2abbb2e82a753bcd6b5bbf34561b862819c955))
* Revert "Show icon for events with attendees" ([7582e1c](https://github.com/nextcloud/calendar/commit/7582e1c75fd9e9fb5d0c1c2f457f01fa21c8d278))
* Revert "Fix events being editable by invitees" ([cb92d5c](https://github.com/nextcloud/calendar/commit/cb92d5c478819cb86f2dc801f27f6ef6178f9f80))



# [3.0.0-rc1](https://github.com/nextcloud/calendar/compare/v3.0.0-beta2...v3.0.0-rc1) (2021-11-26)



# [3.0.0-beta2](https://github.com/nextcloud/calendar/compare/v3.0.0-beta1...v3.0.0-beta2) (2021-11-26)



# [3.0.0-beta1](https://github.com/nextcloud/calendar/compare/v2.4.0-rc2...v3.0.0-beta1) (2021-11-25)



# [2.4.0-rc2](https://github.com/nextcloud/calendar/compare/v2.4.0-rc.1...v2.4.0-rc2) (2021-11-15)



# [2.4.0-rc.1](https://github.com/nextcloud/calendar/compare/v2.3.0-RC.1...v2.4.0-rc.1) (2021-11-09)



# [2.3.0-RC.1](https://github.com/nextcloud/calendar/compare/v2.3.0-alpha.3...v2.3.0-RC.1) (2021-06-22)



# [2.3.0-alpha.3](https://github.com/nextcloud/calendar/compare/v2.3.0-alpha.2...v2.3.0-alpha.3) (2021-06-04)



# [2.3.0-alpha.2](https://github.com/nextcloud/calendar/compare/v2.3.0-alpha.1...v2.3.0-alpha.2) (2021-06-01)



# [2.3.0-alpha.1](https://github.com/nextcloud/calendar/compare/v2.2.0...v2.3.0-alpha.1) (2021-06-01)


### Reverts

* Revert "Add Dependabot for stable2.2" ([9697327](https://github.com/nextcloud/calendar/commit/9697327072cef227f1c414c0764b287402ef66a7))



# [2.2.0](https://github.com/nextcloud/calendar/compare/v2.1.3...v2.2.0) (2021-03-24)



## [2.1.3](https://github.com/nextcloud/calendar/compare/v2.1.2...v2.1.3) (2021-01-04)



## [2.1.2](https://github.com/nextcloud/calendar/compare/v2.1.1...v2.1.2) (2020-09-24)


### Reverts

* Revert "Bump css-loader from 3.6.0 to 4.2.0" ([c128a1f](https://github.com/nextcloud/calendar/commit/c128a1fabe52eabca84f4ee78fb6b31c39dcce0d))



## [1.6.3](https://github.com/nextcloud/calendar/compare/v1.6.2...v1.6.3) (2018-10-16)



## [1.6.2](https://github.com/nextcloud/calendar/compare/v1.6.1...v1.6.2) (2018-09-05)



## [1.6.1](https://github.com/nextcloud/calendar/compare/v1.6.0...v1.6.1) (2018-03-06)



## [1.5.1](https://github.com/nextcloud/calendar/compare/v1.5.0...v1.5.1) (2017-03-01)



# [1.4.0](https://github.com/nextcloud/calendar/compare/v1.3.3...v1.4.0) (2016-09-19)


### Reverts

* Revert "hide random color button" ([c575c0e](https://github.com/nextcloud/calendar/commit/c575c0e2ff00254a5b35f7680cf4d08140f42a0c))



## [1.3.3](https://github.com/nextcloud/calendar/compare/v1.3.2...v1.3.3) (2016-08-24)


### Reverts

* Revert "Fix handling of UTC and "floating" tz." ([846b42d](https://github.com/nextcloud/calendar/commit/846b42d8e774b8cf5126986b9dbb5bd644965018))
* Revert "Fixed  tzid on floating date" ([a6a5a5a](https://github.com/nextcloud/calendar/commit/a6a5a5a63a70d44e5e2736d77c53bbdd839262a6))
* Revert "fix code formatting of pr" ([784b481](https://github.com/nextcloud/calendar/commit/784b481416880d7ef7ec635be2280e91e969ebb7))



## [1.3.2](https://github.com/nextcloud/calendar/compare/v1.3.1...v1.3.2) (2016-08-05)



## [1.3.1](https://github.com/nextcloud/calendar/compare/v1.3.0...v1.3.1) (2016-07-24)



# [1.3.0](https://github.com/nextcloud/calendar/compare/v1.2.2...v1.3.0) (2016-07-24)



## [1.2.2](https://github.com/nextcloud/calendar/compare/v1.2.1...v1.2.2) (2016-05-20)



## [1.2.1](https://github.com/nextcloud/calendar/compare/4854f3b5ce16bf442bc7cc1729349dd92851af7f...v1.2.1) (2016-05-17)


### Reverts

* Revert "Increment version number" ([4854f3b](https://github.com/nextcloud/calendar/commit/4854f3b5ce16bf442bc7cc1729349dd92851af7f))



