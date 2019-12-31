// TODO: this AI is needs to be made agnostic to the order of pieces
// given in the rotation system. At present it just returns whatever
// the first one is!

import getGetPossibleFutures from "./../get-get-possible-futures";

const searchDepth = 0; // min = 0, suggested max = 1

export default function(rotationSystem, placeFirstPiece, bar, wellDepth, wellWidth) {
	const getPossibleFutures = getGetPossibleFutures(rotationSystem, placeFirstPiece, bar, wellDepth, wellWidth);

	const getHighestBlue = well => {
		let row;
		for (row = 0; row < well.length; row++) {
			if (well[row] !== 0) {
				break;
			}
		}
		return row;
	};

	// deeper lines are worth less than immediate lines
	// this is so the game will never give you a line if it can avoid it
	// NOTE: make sure rating doesn't return a range of more than 100 values...
	const getWellRating = (well, depthRemaining) =>
		getHighestBlue(well) + (depthRemaining === 0 ? 0 : getWorstPieceRating(well, depthRemaining - 1) / 100);

	/**
		Given a well and a piece, find the best possible location to put it.
		Return the best rating found.
	*/
	const getBestWellRating = (well, pieceId, depthRemaining) =>
		Math.max.apply(Math, getPossibleFutures(well, pieceId).map(possibleFuture =>
			getWellRating(possibleFuture.well, depthRemaining)
		));

	const getWorstPieceDetails = (well, depthRemaining) =>
		Object
			.keys(rotationSystem)
			.map(pieceId => ({
				pieceId,
				rating: getBestWellRating(well, pieceId, depthRemaining)
			}))
			.sort((a, b) => a.rating - b.rating)[0];

	// pick the worst piece that could be put into this well
	// return the rating of this piece
	// but NOT the piece itself...
	const getWorstPieceRating = (well, depthRemaining) =>
		getWorstPieceDetails(well, depthRemaining).rating;

	// pick the worst piece that could be put into this well
	// return the piece but not its rating
	const getWorstPiece = well =>
		getWorstPieceDetails(well, searchDepth).pieceId;

	return getWorstPiece;
}
