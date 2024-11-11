import Player from "../models/Player";
import Game from "../models/Game";
import { Op, where } from "sequelize";
import { createUser } from "./userService";
import User from "../models/User";
export const getPlayersService = async ({ gameId }: { gameId?: number }) => {
    const players = await Player.findAll({
        include: [
            {
                model: Game,
                ...(gameId && {
                    where: { id: gameId }
                }),
                through: { attributes: [] }
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "fullName", "email","password"] 
            }
        ],
        order: [["created_at", "DESC"]]
    });
    return players;
};

export const getPlayersClientService = async ({ gameId }: { gameId?: number }) => {
    const players = await Player.findAll({
        include: [
            {
                model: Game,
                ...(gameId && {
                    where: { id: gameId }
                }),
                through: { attributes: [] }
            }
        ],
        where: {
            status: {
                [Op.or]: [1, 2, 3] 
            }
        },
        //DESC hoặc ASC
        order: [["created_at", "ASC"]]
    });
    return players;
};


export const playerGetByIdService = async ({ playerId }: { playerId: number }) => {
    const player = await Player.findByPk(playerId, {
        include: [
            {
                model: Game,
                through: { attributes: [] } 
            }
        ]
    });

    if (!player) {
        throw new Error(`Player with id ${playerId} not found`);
    }

    return player;
};


export const createPlayerService = async (
    playerData: any,
    gameIds: number[],
) => {
    let user: any;
    let player: any;

    if (playerData.userId) {
        user = await User.findByPk(playerData.userId);
        if (!user) {
            throw new Error("User not found");
        }
        await User.update({role:3},{where: {id:user.id}});
        player = await Player.create({ ...playerData,email:user.email,name:user.fullName, userId: user.id });
    } else {
        user = await createUser({
            role: 3,
            fullName: playerData.name,
            email: playerData.email,
            password: playerData.password,
            phone: playerData.phone,
            address: playerData.address
        });
        player = await Player.create({ ...playerData, userId: user.id });
    }

    const games = await Game.findAll({
        where: {
            id: gameIds,
        },
    });

    await player.addGames(games);

    return player; 
};



export const updatePlayerService = async (
    playerId: number,
    playerData: any,
    gameIds: number[]
) => {
    const player = await Player.findByPk(playerId);
    if (!player) {
        throw new Error("Player not found");
    }

    await player.update(playerData);

    const games = await Game.findAll({
        where: {
            id: gameIds,
        },
    });

    await player.setGames(games);

    return player;
};





// Delete a player
export const deletePlayerService = async (id: string) => {
    const player = await Player.findByPk(id);
    if (!player) {
        throw new Error("Player not found");
    }
    await player.destroy();
    return;
};




export const updateStatusPlayerService = async (id: number, status: number) => {
    const player = await Player.findByPk(id);
    if (!player) {
        throw new Error("Player not found");
    }
    await player.update({ status });

    return player; 
};


  export const findOnePlayer = async (options: any) => {
    if (!options.email && !options.id) {
      throw new Error("Please provide email or id ");
    }
    const where = {
      [Op.or]: [] as any,
    };
  
    if (options.email) {
      where[Op.or].push({ email: options.email });
    }
    if (options.id) {
      where[Op.or].push({ id: options.id });
    }
  
    const player = await Player.findOne({
      where,
      attributes: { exclude: ["password"] },
    });
    return player;
  };

  