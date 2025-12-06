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

test("parseBackgroundImage", () => {
  const input = 'url("image1.png"), image-set(url("image\\"2.png") 1x, "image3.png" 2x)';
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
        }
      ]
    }
  ];
  assert.deepEqual(result, expected);
});
