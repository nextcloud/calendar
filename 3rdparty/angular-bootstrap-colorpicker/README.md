angular-bootstrap-colorpicker
=============================

This version contains a native AngularJS directive based on bootstrap-colorpicker jQuery library.<br />
No dependency on jQuery or jQuery plugin is required.<br />

<a href="http://cdpn.io/tyKGL" target="_blank">Demo page (Bootstrap v3.x.x)</a>

Previous releases:
  - <a href="https://github.com/buberdds/angular-bootstrap-colorpicker/tree/2.0">branch 2.0</a> (Bootstrap v2.x.x)
  - <a href="https://github.com/buberdds/angular-bootstrap-colorpicker/tree/1.0.0">branch 1.0</a> if you need a functionality from the original plugin or IE&lt;9 support

Installation
===============================
Copy `css/colorpicker.css` and `js/bootstrap-colorpicker-module.js`.
Add a dependency to your app, for instance:

    angular.module('myApp', ['colorpicker.module'])

Examples:
===============================

Hex format
```html
<input colorpicker type="text" ng-model="your_model" />
```
or
```html
<input colorpicker="hex" type="text" ng-model="your_model" />
```

RGB format
```html
<input colorpicker="rgb" type="text" ng-model="your_model" />
```

RBGA format
```html
<input colorpicker="rgba" type="text" ng-model="your_model" />
```

As non input element
```html
<div colorpicker ng-model="your_model"></div>
```

The color picker template with an input element
```html
<input colorpicker colorpicker-with-input="true" type="text" ng-model="your_model" />
```

Position of the color picker (top, right, bottom, left).
```html
<input colorpicker colorpicker-position="right" type="text" ng-model="your_model" />
```

The color picker in a fixed element
```html
<input colorpicker colorpicker-fixed-position="true" type="text" ng-model="your_model" />
```

When using fixed positioning, you can also put the picker into the parent element (this allows more styling control)
```html
<input colorpicker colorpicker-fixed-position="true" colorpicker-parent="true" type="text" ng-model="your_model" />
```

The color picker in UI Bootstrap modal (the parent element position property must be set to relative)
```html
<input colorpicker colorpicker-parent="true" type="text" ng-model="your_model" />
```
