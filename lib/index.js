export const RX_COMMA_LIST = /,|[\w-]+\(|\)|'|"/g;
export const RX_WHITESPACE = /^\s+/y;

/**
 * @typedef {Object} UrlInfo
 * @property {"url"} type
 * @property {string} url
 */

/**
 * @typedef {Object} ImageSet
 * @property {"image-set"} type
 * @property {Array<ImageSetSource>} sources
 */

/**
 * @typedef {Object} ImageSetSource
 * @property {string} url
 * @property {string} [resolution]
 */

/**
 * @typedef {Object} Context
 * @property {string} input input string being parsed
 * @property {number} lastIndex current position in the input string
 */

/**
 * Parse a CSS background-image property value.
 * @param {string} input 
 * @returns {Array<UrlInfo|ImageSet>} Array of parsed background image objects.
 */
export function parseBackgroundImage(input) {
  const ctx = {
    input,
    lastIndex: 0,
  };
  const result = [];
  parseCommaList(ctx, {
    func: {
      "url(": () => {
        eatWhitespace(ctx);
        result.push({type: "url", url: parseString(ctx)});
        eatRightParen(ctx);
      },
      "image-set(": () => {
        result.push(parseImageSet(ctx));
      }
    }
  });
  return result;
}

/**
 * Eat a right parenthesis from the input at the current context position.
 * @param {Context} ctx 
 */
export function eatRightParen(ctx) {
  RX_COMMA_LIST.lastIndex = ctx.lastIndex;
  const match = RX_COMMA_LIST.exec(ctx.input);
  if (!match || match[0] !== ")") {
    throw new Error("Expected )");
  }
  ctx.lastIndex = RX_COMMA_LIST.lastIndex;
}

/**
 * Parse a comma-separated list from the input at the current context position.
 *
 * Note that this function consumes the closing parenthesis at the end of the list, if any.
 *
 * @param {Context} ctx 
 * @param {Object} handlers
 * @param {(ctx: Context, keyword: string) => void} [handlers.keyword] called with each keyword found
 * @param {(ctx: Context, str: string) => void} [handlers.string] called with each string found
 * @param {(ctx: Context)} [handlers.comma] called when a comma is found
 * @param {Object<string, (ctx: Context) => void>} [handlers.func] object mapping lowercase function names to handler functions. the key is the function name including the opening parenthesis, e.g. "url(". Handler functions should consume the function arguments and the closing parenthesis.
 */
export function parseCommaList(ctx, handlers) {
  let match;
  RX_COMMA_LIST.lastIndex = ctx.lastIndex;
  while ((match = RX_COMMA_LIST.exec(ctx.input)) !== null) {
    if (ctx.lastIndex !== match.index) {
      const keyword = ctx.input.slice(ctx.lastIndex, match.index).trim();
      if (keyword) {
        handlers?.keyword?.(ctx, keyword);
      }
    }
    ctx.lastIndex = RX_COMMA_LIST.lastIndex;
    const token = match[0].toLowerCase();
    if (token.endsWith("(")) {
      const funcHandler = handlers?.func?.[token];
      if (funcHandler) {
        funcHandler(ctx);
      } else {
        parseCommaList(ctx);
      }
    } else if (token === ",") {
      handlers?.comma?.(ctx);
    } else if (token === ")") {
      return;
    } else if (token === '"' || token === "'") {
      ctx.lastIndex = RX_COMMA_LIST.lastIndex - 1;
      const s = parseString(ctx);
      if (handlers?.string) {
        handlers.string(ctx, s);
      }
    } else {
      // unknown token
    }
    RX_COMMA_LIST.lastIndex = ctx.lastIndex;
  }
  if (ctx.lastIndex < ctx.input.length) {
    const keyword = ctx.input.slice(ctx.lastIndex).trim();
    if (keyword) {
      handlers?.keyword?.(ctx, keyword);
    }
    ctx.lastIndex = ctx.input.length;
  }
}

/**
 * Parse an image-set() function from the input at the current context position.
 * @param {Context} ctx 
 * @returns {ImageSet}
 */
export function parseImageSet(ctx) {
  const result = {type: "image-set", sources: [{}]};
  let currentSource = result.sources[0];
  parseCommaList(ctx, {
    string: (_, s) => {
      currentSource.url = s;
    },
    keyword: (_, kw) => {
      currentSource.resolution = kw;
    },
    comma: () => {
      currentSource = {};
      result.sources.push(currentSource);
    },
    func: {
      "url(": () => {
        eatWhitespace(ctx);
        currentSource.url = parseString(ctx);
        eatRightParen(ctx);
      }
    }
  });
  return result;
}

/** Eat whitespace from the input at the current context position.
 * @param {Context} ctx 
 */
export function eatWhitespace(ctx) {
  RX_WHITESPACE.lastIndex = ctx.lastIndex;
  const match = RX_WHITESPACE.exec(ctx.input);
  if (match) {
    ctx.lastIndex += match[0].length;
  }
}

/** Parse a string (quoted or unquoted) from the input at the current context position.
 * @param {Context} ctx 
 * @returns {string}
 */
export function parseString(ctx) {
  const i = ctx.lastIndex;
  if (ctx.input[i] === "'" || ctx.input[i] === '"') {
    return parseQuotedString(ctx);
  }
  // FIXME: does unquoted string always end at closing parenthesis?
  let j = ctx.input.indexOf(")", i);
  if (j === -1) {
    throw new Error("Unclosed function");
  }
  ctx.lastIndex = j;
  return ctx.input.slice(i, j).trim();
}

/** Parse a quoted string from the input at the current context position.
 * @param {Context} ctx 
 * @returns {string}
 */
export function parseQuotedString(ctx) {
  const i = ctx.lastIndex;
  const quote = ctx.input[i];
  let j = i;
  do {
    j = ctx.input.indexOf(quote, j + 1);
  } while (j !== -1 && ctx.input[j - 1] === "\\");
  if (j === -1) {
    throw new Error("Unclosed string");
  }
  ctx.lastIndex = j + 1;
  return unquote(ctx.input.slice(i + 1, j));
}

const RX_STRING_ESCAPE = /\\([0-9a-fA-F]{1,6})|\\(.)/g;

/**
 * Unquote a quoted string and unescape escaped characters. excluding the surrounding quotes.
 * @param {string} s 
 * @returns {string}
 */
export function unquote(s) {
  return s.replace(RX_STRING_ESCAPE, (_, hex, char) => {
    if (hex) {
      const codePoint = parseInt(hex, 16);
      return String.fromCodePoint(codePoint);
    }
    return char;
  });
}

