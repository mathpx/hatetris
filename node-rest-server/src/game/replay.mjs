/**
	Replay handling
*/

import * as hex from "./replay-codecs/hex";
import * as base65536 from "./replay-codecs/base65536";
import * as base2048 from "./replay-codecs/base2048";

/**
	Convert an array of moves into a replay
*/
// const encode = moves => hex.encode(moves)
// const encode = moves => base65536.encode(moves)
export const encode = moves => base2048.encode(moves);

/**
	Convert a string back into an array of moves
*/
export const decode = string => {
	if (/^[0123456789ABCDEF# ]*$/.test(string)) {
		return hex.decode(string);
	}
	try {
		return base65536.decode(string);
	} catch (e) {
		// 
	}
	return base2048.decode(string);
};
