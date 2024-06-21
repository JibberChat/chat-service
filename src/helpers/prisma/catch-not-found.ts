import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { NotFoundException } from "@nestjs/common";

export const prismaCatchNotFound = (message: string) => {
  return (error: unknown) => {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") throw new NotFoundException(message);
    throw error;
  };
};
