/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
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

 app.factory('TimezoneModel', function () {
   var TimezoneModel = function () {
     this.timezones = [];
     this.timezoneslist = [];
     this.timezoneId = {};
   };

   TimezoneModel.prototype = {
     addAll: function (timezones) {
       for(var i=0; i<timezones.length; i++) {
         this.add(timezones[i]);
       }
     },
     getAll: function () {
       return this.timezones;
     },
     get: function (id) {
       return this.timezoneId[id];
     },
     add: function (timezone) {
       return 0;
     },
     delete: function (id) {
       return 0;
     }
   };

   return new TimezoneModel();
 });
