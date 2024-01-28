import { DrizzleError, and, desc, eq } from "drizzle-orm";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { ERRORS } from "@/utils/errors.js";
import { logger } from "@/logger.js";
import { SelectedFields, date } from "drizzle-orm/pg-core";

export type CreateUser = {
  name: string;
  email: string;
  expireDate: Date;
};

export async function createUsers(body: CreateUser[]) {
  try {
    await db.insert(users).values(body);
    return { msg: "success" };
  } catch (error) {
    const err = error as Error;
    const errDetail = error as {detail: string};
    if (err.message.includes("duplicate key value violates")) {
      return { error: `User with ${errDetail.detail.substring(13, errDetail.detail.lastIndexOf(')'))} address already exists` };
    }
    return { error: err.message };
  }
}

export async function updateUser(body: CreateUser) {
  try {
    await db
      .update(users)
      .set(body)
      .where(eq(users.email, body.email));
    return { msg: "success" };
  } catch (error) {
    const err = error as Error;
    const errDetail = error as {detail: string};
    if (err.message.includes("duplicate key value violates")) {
      return { error: `User with ${errDetail.detail.substring(13, errDetail.detail.lastIndexOf(')'))} address already exists` };
    }
    return { error: err.message };
  }
}

export async function getAllUsers() {
  try {
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    return { users: result };
  } catch (error) {
    logger.error(error);
    return { error: (error as Error).message };
  }
}

export async function getUser(id: string, pwd?: boolean) {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user.length) {
      return { error: ERRORS.NOT_FOUND };
    }
    return { user: user[0] };
  } catch (error) {
    logger.error(error);
    const err = error as Error;
    if (err.message.includes("invalid input syntax for type uuid")) {
      return { error: "invalid id" };
    }
    return { error: err.message };
  }
}

export async function changeUserStatus({
  id,
  email,
}: {
  id: string;
  email?: string;
}) {
  try {
    const result = await db
      .update(users)
      .set({ used: true })
      .where(email ? eq(users.email, email) : eq(users.id, id))
      .returning({ id: users.id });
    if (!result.length) {
      return { error: ERRORS.UPDATE_FAILED };
    }
    return { id: result[0].id };
  } catch (error) {
    logger.error(error);
    const err = error as Error;
    if (err.message.includes("invalid input syntax for type uuid")) {
      return { error: "invalid id" };
    }
    return { error: err.message };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        expireDate: users.expireDate,
      })
      .from(users)
      .where(eq(users.email, email));
    if (!user.length || !user[0].id) {
      return { error: ERRORS.NOT_FOUND };
    }
    return { user: user[0] };
  } catch (error) {
    logger.error(error);
    return { error: (error as Error).message };
  }
}

export async function deleteUser(id: string) {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    if (!result.length || !result[0].id) {
      return { error: ERRORS.DELETE_FAILED };
    }
    return { message: result[0].id };
  } catch (error) {
    logger.error(error);
    const err = error as Error;
    if (err.message.includes("invalid input syntax for type uuid")) {
      return { error: "invalid id" };
    }
    return { error: err.message };
  }
}
