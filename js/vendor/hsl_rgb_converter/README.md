##HSL -> RGB
Simple node module to convert HSL values (hue, saturation, light) to RGB values (red, blue, green). Expected values:
Hue: [0, 360)
Saturation: [0, 1]
Lightness: [0, 1]


Getting started:
```
npm install hsl-to-rgb
```

Use:
```
var converter = require('hsl-to-rgb');

var slateBlue = converter(223, 0.44, 0.56);

console.log(slateBlue);
// logs [86, 115, 189]
```
