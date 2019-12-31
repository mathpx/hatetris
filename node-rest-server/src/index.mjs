
import "./server";
import { make_game } from "./game";

const game = make_game();

console.log(game.handleMove("D"));
