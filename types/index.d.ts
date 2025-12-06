declare module 'css-prop-parser' {
	/**
	 * Parse a CSS background-image property value.
	 * @returns Array of parsed background image objects.
	 */
	export function parseBackgroundImage(input: string): Array<UrlInfo | ImageSet>;
	/**
	 * Eat a right parenthesis from the input at the current context position.
	 * */
	export function eatRightParen(ctx: Context): void;
	/**
	 * Parse a comma-separated list from the input at the current context position.
	 *
	 * Note that this function consumes the closing parenthesis at the end of the list, if any.
	 *
	 * */
	export function parseCommaList(ctx: Context, handlers: {
		keyword?: (ctx: Context, keyword: string) => void;
		string?: (ctx: Context, str: string) => void;
		comma?: (ctx: Context) => any;
		func?: {
			[x: string]: (ctx: Context) => void;
		};
	}): void;
	/**
	 * Parse an image-set() function from the input at the current context position.
	 * */
	export function parseImageSet(ctx: Context): ImageSet;
	/** Eat whitespace from the input at the current context position.
	 * */
	export function eatWhitespace(ctx: Context): void;
	/** Parse a string (quoted or unquoted) from the input at the current context position.
	 * */
	export function parseString(ctx: Context): string;
	/** Parse a quoted string from the input at the current context position.
	 * */
	export function parseQuotedString(ctx: Context): string;
	/**
	 * Unquote a quoted string and unescape escaped characters. excluding the surrounding quotes.
	 * */
	export function unquote(s: string): string;
	export const RX_COMMA_LIST: RegExp;
	export const RX_WHITESPACE: RegExp;
	export type UrlInfo = {
		type: "url";
		url: string;
	};
	export type ImageSet = {
		type: "image-set";
		sources: Array<ImageSetSource>;
	};
	export type ImageSetSource = {
		url: string;
		resolution?: string;
	};
	export type Context = {
		/**
		 * input string being parsed
		 */
		input: string;
		/**
		 * current position in the input string
		 */
		lastIndex: number;
	};

	export {};
}

//# sourceMappingURL=index.d.ts.map