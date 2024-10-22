import Game from "../models/Game";

export const getGamesService = async() => {
    const games = await Game.findAll();
    return games;
};

export const createGameService = async(payload:any) => {
    const game = await Game.create(payload);
    return game;
};

export const updateGameService = async (id: string, payload: any) => {
    const game = await Game.findByPk(id);
    if (!game) {
        throw new Error("Game not found");
    }
    return await game.update(payload);
};

export const deleteGameService = async (id: string) => {
    const game = await Game.findByPk(id);
    if (!game) {
        throw new Error("Game not found"); 
    }
    await game.destroy(); 
    return;
};