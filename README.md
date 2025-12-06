css-prop-parser
==============

[![test](https://github.com/eight04/css-prop-parser/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/css-prop-parser/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/eight04/css-prop-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/css-prop-parser)

A small library to parse CSS property strings. Can be useful to extract value from CSS properties without a full CSS parser.

Installation
------------

```
npm install css-prop-parser
```

Usage
-----

```JavaScript
import {parseCommaList} from "css-prop-parser";

const ctx = {
  input: "rgba(255, 0, 0, 0.5), #00ff00, blue",
  lastIndex: 0,
};
parseCommaList(ctx, {
  keyword: (_, value) => {
    console.log("keyword:", value);
  },
  func: {
    "rgba(": () => {
      console.log("found rgba()");
      parseCommaList(ctx, {
        keyword: (_, value) => {
          console.log("  arg:", value);
        },
      });
    }
  }
});
```
Output:
```
found rgba()
  arg: 255
  arg: 0
  arg: 0
  arg: 0.5
keyword: #00ff00
keyword: blue
```

API references
--------------

Check the [.d.ts file](./types/index.d.ts) for TypeScript type definitions.

Alternatives
------------

* [css-tree](https://www.npmjs.com/package/css-tree?activeTab=readme)

Changelog
---------

* 0.1.0 (Dec 7, 2025)

  - First release
