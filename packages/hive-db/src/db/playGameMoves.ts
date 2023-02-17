import {
  Game,
  getBlackUid,
  getGameNotation,
  getGameOptions,
  getWhiteUid,
  newPartialGameWithFieldValues
} from '../game/game';
import {
  buildBoard,
  buildGameNotation,
  buildPassMove,
  canMove,
  GameBoard,
  getGameMoves,
  getGameResult,
  Move
} from 'hive-lib';
import { getColorTurn, newGameState } from '../game/state';
import { newPartialGameMetaWithFieldValues } from '../game/meta';
import { postJSON } from '../api';

/**
 * Play some number of moves by updating a game document in the Firestore
 * database.
 *
 * Determines if the given moves result in a required pass from the next player,
 * and if so adds that pass to the list of moves being played. Also determines
 * if the list of moves ends the game, and updates the metadata and player
 * data accordingly.
 *
 * @param game The game to update.
 * @param moves An ordered list of moves to play.
 */
export function playGameMove(game: Game, move: Move): Promise<GameMoveResponse> {
  const uri = `/api/board/${game.gid}/move/${move.notation}`;
  return postJSON(uri, {}, true);
}

interface GameMoveResponse {
  game: Game,
  validNextMoves: Move[],
}

function determineGameResult(game: Game, board: GameBoard): string {
  const result = getGameResult(board);
  if (result === 'black') return getBlackUid(game);
  if (result === 'white') return getWhiteUid(game);
  return result;
}

/**
 * TODO: Use Alloy to check if a stalemate is possible. Until then, let's
 *       include this failsafe to prevent infinite passing.
 */
function throwStalemateError() {
  throw new Error(
    'This move ends the game in a stalemate. If you are seeing this ' +
      'message, PLEASE notify the developers because you have stumbled upon ' +
      'a very unique case!'
  );
}
