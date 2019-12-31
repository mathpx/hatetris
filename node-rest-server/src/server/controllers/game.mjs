
import { make_game } from "../../game";

const MAX_TIME = 5 * 60 * 1000;

const timers = {};
const storage = {};

export function make() {
	const id = gen_id();
	const game = make_game();
	storage[id] = game;
	const timer = setTimeout(function() {
		purge(id);
	}, MAX_TIME);
	timers[id] = timer;
	return id;
}

export function move(id, key) {
	const game = get_game(id);
	const state = game.handleMove(key);
	if(state.mode === "GAME_OVER") {
		purge(id);
	}
	return state;
}

export function state(id) {
	const game = get_game(id);
	return {
		mode: game.state.mode,
		replay: game.gen_replay(),
		...game.state.wellStates[game.state.wellStateId],
	};
}

export function purge(id) {
	get_game(id);
	delete storage[id];
	clearTimeout(timers[id]);
	delete timers[id];
}

function get_game(id) {
	if(storage[id] === undefined) {
		throw new Error("Game not found");
	}
	return storage[id];
}


function gen_id() {
	return parseInt(Math.random() * 1e12)
		.toString(32)
		.toUpperCase();
}
