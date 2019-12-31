import getEnemyAi from "./enemy-ais/get-hatetris";
import getGameIsOver from "./game-over-conditions/get-hatetris";
import getPlaceFirstPiece from "./piece-placement/get-hatetris";
import rotationSystem from "./rotation-systems/hatetris";

import getFirstState from "./get-first-state";
import getGetNextState from "./get-get-next-state";
import * as replayCodec from "./replay";

const minWidth = 4;

export class Game {
	constructor(props={}) {
		this.props = props;
		const {
			rotationSystem,
			placeFirstPiece,
			bar,
			wellDepth,
			wellWidth,
			enemyAi
		} = this.props;
		if (rotationSystem.length < 1) {
			throw Error("Have to have at least one piece!");
		}

		if (wellDepth < bar) {
			throw Error("Can't have well with depth " + String(wellDepth) + " less than bar at " + String(bar));
		}

		if (wellWidth < minWidth) {
			throw Error("Can't have well with width " + String(wellWidth) + " less than " + String(minWidth));
		}

		this.firstState = getFirstState(wellDepth, placeFirstPiece, enemyAi);
		this.getNextState = getGetNextState(rotationSystem, bar, wellDepth, wellWidth);

		this.state = {
			mode: "GAME_OVER",
			wellStateId: -1,
			wellStates: [],
			replay: [],
		};
		this.startGame();
	}
	setState(state=null) {
		this.state = state;
	}
	startGame () {

		// clear the field and get ready for a new game
		this.setState({
			mode: "PLAYING",
			wellStateId: 0,
			wellStates: [this.firstState],
			replay: [],
		});
	}
	handleMove(move) {

		const {
			mode,
			replay,
			wellStateId,
			wellStates
		} = this.state;

		if (mode !== "PLAYING") {
			throw new Error(`Ignoring event ${move} because mode is ${mode}`);
		}

		const {
			enemyAi,
			gameIsOver,
			placeFirstPiece
		} = this.props;

		const nextWellStateId = wellStateId + 1;

		let nextReplay;
		let nextWellStates;

		if (wellStateId in replay && move === replay[wellStateId]) {
			nextReplay = replay;
			nextWellStates = wellStates;
		} else {
			// Push the new move
			nextReplay = replay.slice(0, wellStateId).concat([move]);

			// And truncate the future
			nextWellStates = wellStates.slice(0, wellStateId + 1);
		}

		if (!(nextWellStateId in nextWellStates)) {
			const nextWellState = this.getNextState(nextWellStates[wellStateId], move);
			nextWellStates = nextWellStates.slice().concat([nextWellState]);
		}

		const nextWellState = nextWellStates[nextWellStateId];

		const nextMode = gameIsOver(nextWellState) ? "GAME_OVER"
			: (mode === "REPLAYING" && !(nextWellStateId in replay)) ? "PLAYING"
				: mode;

		// no live piece? make a new one
		// suited to the new world, of course
		if (nextWellState.piece === null && nextMode !== "GAME_OVER") {
			nextWellState.piece = placeFirstPiece(enemyAi(nextWellState.well));
		}

		this.setState({
			mode: nextMode,
			wellStateId: nextWellStateId,
			wellStates: nextWellStates,
			replay: nextReplay
		});
		return {
			mode: nextMode,
			replay: this.gen_replay(),
			...nextWellStates[nextWellStateId],
		};
	}
	gen_replay() {

		const {
			mode,
			replay,
		} = this.state;

		return mode === "GAME_OVER" && replay.length > 0 ? replayCodec.encode(replay) : null;
	}
}

export function make_game({ bar=4, wellDepth=20, wellWidth=10 }={}) {
	// Fixed attributes of all of Tetris
	// const bar = 4
	// const wellDepth = 20 // min = bar
	// const wellWidth = 10 // min = 4

	const placeFirstPiece = getPlaceFirstPiece(wellWidth);
	const gameIsOver = getGameIsOver(bar);
	const enemyAi = getEnemyAi(rotationSystem, placeFirstPiece, bar, wellDepth, wellWidth);

	return new Game({
		bar,
		enemyAi,
		gameIsOver,
		placeFirstPiece,
		rotationSystem,
		wellDepth,
		wellWidth
	});
}
