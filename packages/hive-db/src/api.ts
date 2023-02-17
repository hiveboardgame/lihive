import { Game } from './game/game';
import { Move } from 'hive-lib';

// WIP API access functions to replace firebase

export async function postJSON(uri: string, body: string): Promise<any> {
  const res = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  });
  return res.json();
}

export async function getJSON(uri: string): Promise<any> {
  const res = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return res.json();
}

export async function postGame(game: Game): Promise<Game> {
  return postJSON('/api/game', JSON.stringify(game))
    .then(() => game);
}