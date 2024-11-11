import { compareSync, encryptSync } from "../util/encrypt";
import User from "../models/User";
import { Op, where } from "sequelize";
import Player from "../models/Player";
import { createNotificationService, getNotificationsService } from "./notificationService";
import { io } from "../server";
import { createChatService } from "./chatService";

export const createUser = async (payload: any) => {
  payload.password = encryptSync(payload.password);
  const user = await User.create(payload);
  return user;
};

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const userExists = async (
  options: { email: string | null} = {
    email: null,
  }
) => {
  if (!options.email) {
    throw new Error("Please provide either of these options: email");
  }
  const where: any = {
    [Op.or]: [],
  };
  if (options.email) {
    where[Op.or].push({ email: options.email });
  }
  const users = await User.findAll({ where: where });
  return users.length > 0;
};

export const validatePassword = async (email: string, password: string) => {
  if (!email && !password) {
    throw new Error("Please provide email and password");
  }
  const where = {
    [Op.or]: [] as any,
  };

  if (email) {
    where[Op.or].push({ email: email });
  }

  const user = await User.findOne({ where });

  return User.validPassword(password, user.password);
};

export const findOneUser = async (options: any) => {
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

  const user = await User.findOne({
    where,
    attributes: { exclude: ["password"] },
  });
  return user;
};

export const updateUserById = (user: any, userId: number) => {
  if (!user && !userId) {
    throw new Error("Please provide user data and/or user id to update");
  }
  if (userId && isNaN(userId)) {
    throw new Error("Invalid user id");
  }
  if (user.id || userId) {
    const id = user.id || userId;

    if (user.password) {
      user.password = encryptSync(user.password);
    }

    return User.update(user, {
      where: { id: id },
    });
  }
};

export const deleteUserById = (userId: number) => {
  if (!userId) {
    throw new Error("Please user id to delete");
  }
  if (userId && isNaN(userId)) {
    throw new Error("Invalid user id");
  }

  return User.destroy({
    where: { id: userId },
  });
};


export const getUsersService = async() => {
  const users = await User.findAll();
  return users;
};


export const updateUserService = async(data:any,id:number) => {
  return User.update(data, {
    where: { id: id },
  });
};

export const updatePriceService = async (price: number, playerId: number, userId: number,message?:string) => {
  try {
    const user = await User.findByPk(userId);
    const player = await Player.findByPk(playerId);

    if (!user || !player) {
      throw new Error("User or player not found");
    }

    const playerUser = await User.findByPk(player.userId);
    if (!playerUser) {
      throw new Error("Player's user not found");
    }

    await User.update(
      { price: user.price - price },
      { where: { id: userId } }
    );

    await User.update(
      { price: playerUser.price + price },
      { where: { id: playerUser.id } }
    );
    const path = `/rental-request-list?userId=${user.id}`;
    await createNotificationService({
      title: "Donate to you",
      message:  `${user.fullName} has donated ${new Intl.NumberFormat("vi-VN").format(price)}USD to you`,
      userId: player.userId,
      path,
    });
    const notifications = await getNotificationsService(player.userId);
    io.emit("newPriceNotification", {
      userId: player.userId,
      player: notifications,
    });
    const messageData = `
      <p>Donated <span style="color: red; font-weight: bold;">${new Intl.NumberFormat("en-US").format(price)} VND</span> to the player.</p>
      <p>${message}</p>
    `;
    const chat = await createChatService({
      playerId,
      message: messageData,
      userId: userId,
      senderType: "user",
      donate:1
    });
    io.emit("newChatMessage", chat);
    return { message: "Prices updated successfully" };
  } catch (error) {
    throw new Error(`Failed to update prices: ${error.message}`);
  }
};

export const changePasswordService = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the old password
  if (!compareSync(oldPassword, user.password)) {
    throw new Error("Incorrect old password");
  }

  // Encrypt and update the new password
  const encryptedPassword = encryptSync(newPassword);
  await user.update({ password: encryptedPassword });

  return "Password updated successfully";
};

