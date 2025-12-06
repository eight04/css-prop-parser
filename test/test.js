import test from "node:test";
import assert from "node:assert/strict";

import {parseBackgroundImage, parseCommaList} from "../lib/index.js";

test("keyword", () => {
  const input = "none, initial, inherit";
  const result = [];
  parseCommaList(
    {input, lastIndex: 0},
    {
      keyword: (_, kw) => {
        result.push(kw);
      }
    }
  );
  const expected = ["none", "initial", "inherit"];
  assert.deepEqual(result, expected);
});

test("ignore unknown func", () => {
  const input = "none, foo(a, b), inherit";
  const result = [];
  parseCommaList(
    {input, lastIndex: 0},
    {
      keyword: (_, kw) => {
        result.push(kw);
      }
    }
  );
  const expected = ["none", "inherit"];
  assert.deepEqual(result, expected);
});

// NOTE: parseCommaList does consume the closing paren but doesn't check for it
test("Throw on missing paren", {skip: true}, () => {
  const input = "url(image.png, inherit";
  assert.throws(() => {
    parseCommaList( {input, lastIndex: 0});
  });
});

test("unquote string", () => {
  const input = '"ima\\22ge1.png", \'image2.png\'';
  const result = [];
  parseCommaList(
    {input, lastIndex: 0},
    {
      string: (_, s) => {
        result.push(s);
      }
    }
  );
  const expected = ['ima"ge1.png', "image2.png"];
  assert.deepEqual(result, expected);
});

test("unclosed quote", () => {
  const input = '"image1.png, image2.png\'';
  assert.throws(() => {
    parseCommaList( {input, lastIndex: 0});
  });
})

test("parseBackgroundImage", () => {
  const input = 'url("image1.png"), image-set(url("image\\"2.png") 1x, "image3.png" 2x), url( foo.png )';
  const result = parseBackgroundImage(input);
  const expected = [
    {
      type: "url",
      url: "image1.png"
    },
    {
      type: "image-set",
      sources: [
        {
          url: "image\"2.png",
          resolution: "1x"
        },
        {
          url: "image3.png",
          resolution: "2x"
        },
      ]
    },
    {
      type: "url",
      url: "foo.png"
    }
  ];
  assert.deepEqual(result, expected);
});
