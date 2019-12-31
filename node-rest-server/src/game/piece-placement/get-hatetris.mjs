export default function(wellWidth) {
	return pieceId => ({
		id: pieceId,
		x: Math.floor((wellWidth - 4) / 2),
		y: 0,
		o: 0,
	});
}
