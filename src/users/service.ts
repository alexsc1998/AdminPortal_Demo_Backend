import { DrizzleError, and, desc, eq } from "drizzle-orm";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { ERRORS } from "@/utils/errors.js";
import { logger } from "@/logger.js";
import { SelectedFields, date } from "drizzle-orm/pg-core";
import { generateRandomUuid } from "@/utils/helpers.js";
import { message, transport } from '@/utils/send-email.js';

import QRCode from 'qrcode';
import moment from 'moment';

export type CreateUser = {
  name: string;
  email: string;
  expireDate: Date;
};

export type UserWithQR = {
  name: string;
  email: string;
  expireDate: Date;
  qrcode: string;
}

const sendEmailToUser = async (user: UserWithQR) => {
  const msg = await message({
    id: user.qrcode,
    email: user.email,
    subject: 'Affin Bank Onboarding',
    name: user.name,
    expireDate: moment(user.expireDate).format("YYYY-MM-DD HH:mm")
  });

  transport
    .sendMail(msg)
    .then((_) =>
      logger.info(`user activation email sent to user with address ${user.email}`)
    )
    .catch((err) =>
      logger.error(`sending user activation email for ${user.email} failed\n`, err)
    );
}

export async function createUsers(body: CreateUser[]) {
  try {
    const usersData: UserWithQR[] = body.map((cuser) => {
      const user: UserWithQR = {
        name: cuser.name,
        email: cuser.email,
        expireDate: cuser.expireDate,
        qrcode: generateRandomUuid(16, 'hex')
      };
      return user;
    })

    await db.insert(users).values(usersData);

    usersData.map((user) => {
      sendEmailToUser(user);
    })

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
    const updatedUser: UserWithQR = {
      ...body,
      qrcode: generateRandomUuid(16, 'hex')
    };

    await db
      .update(users)
      .set(updatedUser)
      .where(eq(users.email, body.email));
    
    sendEmailToUser(updatedUser);

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
      .select()
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

export async function checkQRCode(qrId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.qrcode, qrId));
    
    if (result.length > 0) {
      const now = new Date();
      const expireDate = result[0].expireDate;
      if (now > expireDate) {
        return { error: 'The onboarding link is used or expired!' };
      } else if(result[0].used === true) {
        return { error: 'The onboarding link is used or expired!' };
      }
      return { user: result[0] };
    } else {
      return { error: 'The onboarding link is used or expired!' };
    }
  } catch (error) {
    logger.error(error);
    const err = error as Error;
    if (err.message.includes("invalid input syntax for type uuid")) {
      return { error: "invalid id" };
    }
    return { error: err.message };
  }
}