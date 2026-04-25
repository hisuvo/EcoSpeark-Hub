// src/app.ts
import express2 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n  ideas         Idea[]\n  votes         Vote[]\n  comments      Comment[]\n  payments      Payment[]\n  purchases     Purchase[]\n\n  role               Role       @default(MEMBER)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Category {\n  id          String   @id @default(uuid())\n  name        String   @unique\n  description String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  ideas Idea[]\n\n  @@index([name], name: "category_name_idx")\n  @@index([description], name: "category_description_idx")\n  @@map("categories")\n}\n\nmodel Comment {\n  id      String @id @default(uuid())\n  content String @db.Text\n\n  ideaId String\n  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n\n  authorId String\n  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)\n\n  parentId String?\n  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)\n  replies  Comment[] @relation("CommentReplies")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([ideaId], name: "comment_idea_id_idx")\n  @@index([authorId], name: "comment_author_id_idx")\n  @@index([parentId], name: "comment_parent_id_idx")\n  @@map("comments")\n}\n\nenum Role {\n  MEMBER\n  ADMIN\n}\n\nenum IdeaStatus {\n  DRAFT\n  UNDER_REVIEW\n  APPROVED\n  REJECTED\n}\n\nenum VoteType {\n  UPVOTE\n  DOWNVOTE\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel Idea {\n  id          String     @id @default(uuid())\n  title       String\n  problem     String     @db.Text\n  solution    String     @db.Text\n  description String     @db.Text\n  imageUrl    String?\n  isPaid      Boolean    @default(false)\n  price       Float?     @default(0.0)\n  status      IdeaStatus @default(DRAFT)\n  feedback    String?    @db.Text\n\n  authorId   String\n  author     User     @relation(fields: [authorId], references: [id])\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  votes     Vote[]\n  comments  Comment[]\n  payments  Payment[]\n  purchases Purchase[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([title], name: "idea_title_idx")\n  @@index([problem], name: "idea_problem_idx")\n  @@index([solution], name: "idea_solution_idx")\n  @@index([description], name: "idea_description_idx")\n  @@map("ideas")\n}\n\n// model Payment {\n//   id        String   @id @default(uuid())\n//   amount    Float\n//   status    PaymentStatus @default(PENDING)\n//   userId    String\n//   user      User     @relation(fields: [userId], references: [id])\n//   ideaId    String\n//   idea      Idea     @relation(fields: [ideaId], references: [id])\n\n//   createdAt DateTime @default(now())\n\n//   @@index([amount], name: "payment_amount_idx")\n//   @@index([status], name: "payment_status_idx")\n//   @@map("payments")\n// }\n\n// model Payment {\n//   id                      String   @id @default(cuid())\n//   userId                  String\n//   ideaId                  String\n//   amount                  Int\n//   status                  PaymentStatus @default(PENDING)\n//   stripePaymentIntentId   String   @unique\n//   createdAt               DateTime @default(now())\n\n//   @@unique([userId, ideaId])\n// }\nmodel Payment {\n  id String @id @default(uuid())\n\n  amount Int\n  status PaymentStatus @default(PENDING)\n  userId String\n  user   User          @relation(fields: [userId], references: [id])\n  ideaId String\n  idea   Idea          @relation(fields: [ideaId], references: [id])\n\n  stripePaymentIntentId String  @unique\n  stripeClientSecret    String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // prevent duplicate purchase\n  @@unique([userId, ideaId])\n  // indexes\n  @@index([status])\n  @@index([stripePaymentIntentId])\n  @@map("payments")\n}\n\nmodel Purchase {\n  id        String   @id @default(uuid())\n  userId    String\n  ideaId    String\n  createdAt DateTime @default(now())\n\n  user User @relation(fields: [userId], references: [id])\n  idea Idea @relation(fields: [ideaId], references: [id])\n\n  @@unique([userId, ideaId])\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\n/// reference "./auth.prisma"\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Vote {\n  id        String   @id @default(uuid())\n  type      VoteType\n  ideaId    String\n  idea      Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([ideaId, userId]) // one vote per user per idea\n  @@map("votes")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"ideas","kind":"object","type":"Idea","relationName":"IdeaToUser"},{"name":"votes","kind":"object","type":"Vote","relationName":"UserToVote"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"PurchaseToUser"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ideas","kind":"object","type":"Idea","relationName":"CategoryToIdea"}],"dbName":"categories"},"Comment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"CommentToIdea"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"author","kind":"object","type":"User","relationName":"CommentToUser"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"replies","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"comments"},"Idea":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"problem","kind":"scalar","type":"String"},{"name":"solution","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isPaid","kind":"scalar","type":"Boolean"},{"name":"price","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"IdeaStatus"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"author","kind":"object","type":"User","relationName":"IdeaToUser"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToIdea"},{"name":"votes","kind":"object","type":"Vote","relationName":"IdeaToVote"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToIdea"},{"name":"payments","kind":"object","type":"Payment","relationName":"IdeaToPayment"},{"name":"purchases","kind":"object","type":"Purchase","relationName":"IdeaToPurchase"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"ideas"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToPayment"},{"name":"stripePaymentIntentId","kind":"scalar","type":"String"},{"name":"stripeClientSecret","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments"},"Purchase":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PurchaseToUser"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToPurchase"}],"dbName":null},"Vote":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"VoteType"},{"name":"ideaId","kind":"scalar","type":"String"},{"name":"idea","kind":"object","type":"Idea","relationName":"IdeaToVote"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToVote"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"votes"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","author","ideas","_count","category","idea","votes","parent","replies","comments","payments","purchases","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Comment.findUnique","Comment.findUniqueOrThrow","Comment.findFirst","Comment.findFirstOrThrow","Comment.findMany","Comment.createOne","Comment.createMany","Comment.createManyAndReturn","Comment.updateOne","Comment.updateMany","Comment.updateManyAndReturn","Comment.upsertOne","Comment.deleteOne","Comment.deleteMany","Comment.groupBy","Comment.aggregate","Idea.findUnique","Idea.findUniqueOrThrow","Idea.findFirst","Idea.findFirstOrThrow","Idea.findMany","Idea.createOne","Idea.createMany","Idea.createManyAndReturn","Idea.updateOne","Idea.updateMany","Idea.updateManyAndReturn","Idea.upsertOne","Idea.deleteOne","Idea.deleteMany","_avg","_sum","Idea.groupBy","Idea.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Purchase.findUnique","Purchase.findUniqueOrThrow","Purchase.findFirst","Purchase.findFirstOrThrow","Purchase.findMany","Purchase.createOne","Purchase.createMany","Purchase.createManyAndReturn","Purchase.updateOne","Purchase.updateMany","Purchase.updateManyAndReturn","Purchase.upsertOne","Purchase.deleteOne","Purchase.deleteMany","Purchase.groupBy","Purchase.aggregate","Vote.findUnique","Vote.findUniqueOrThrow","Vote.findFirst","Vote.findFirstOrThrow","Vote.findMany","Vote.createOne","Vote.createMany","Vote.createManyAndReturn","Vote.updateOne","Vote.updateMany","Vote.updateManyAndReturn","Vote.upsertOne","Vote.deleteOne","Vote.deleteMany","Vote.groupBy","Vote.aggregate","AND","OR","NOT","id","VoteType","type","ideaId","userId","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","amount","PaymentStatus","status","stripePaymentIntentId","stripeClientSecret","title","problem","solution","description","imageUrl","isPaid","price","IdeaStatus","feedback","authorId","categoryId","content","parentId","name","every","some","none","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","Role","role","UserStatus","needPasswordChange","isDeleted","deletedAt","userId_ideaId","ideaId_userId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "sQVZoAEWBAAA0wIAIAUAANQCACAHAAC_AgAgCwAA1QIAIA4AANYCACAPAADXAgAgEAAA2AIAILkBAADOAgAwugEAADQAELsBAADOAgAwvAEBAAAAAcEBQAC-AgAhwgFAAL4CACHQAQAA0QL5ASLgAQEAvAIAIfMBAQAAAAH0ASAAzwIAIfUBAQC9AgAh9wEAANAC9wEi-QEgAM8CACH6ASAAzwIAIfsBQADSAgAhAQAAAAEAIAwDAADbAgAguQEAAOsCADC6AQAAAwAQuwEAAOsCADC8AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIeYBQAC-AgAh8AEBALwCACHxAQEAvQIAIfIBAQC9AgAhAwMAAOAEACDxAQAA_QIAIPIBAAD9AgAgDAMAANsCACC5AQAA6wIAMLoBAAADABC7AQAA6wIAMLwBAQAAAAHAAQEAvAIAIcEBQAC-AgAhwgFAAL4CACHmAUAAvgIAIfABAQAAAAHxAQEAvQIAIfIBAQC9AgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAADbAgAguQEAAOoCADC6AQAABwAQuwEAAOoCADC8AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIecBAQC8AgAh6AEBALwCACHpAQEAvQIAIeoBAQC9AgAh6wEBAL0CACHsAUAA0gIAIe0BQADSAgAh7gEBAL0CACHvAQEAvQIAIQgDAADgBAAg6QEAAP0CACDqAQAA_QIAIOsBAAD9AgAg7AEAAP0CACDtAQAA_QIAIO4BAAD9AgAg7wEAAP0CACARAwAA2wIAILkBAADqAgAwugEAAAcAELsBAADqAgAwvAEBAAAAAcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIecBAQC8AgAh6AEBALwCACHpAQEAvQIAIeoBAQC9AgAh6wEBAL0CACHsAUAA0gIAIe0BQADSAgAh7gEBAL0CACHvAQEAvQIAIQMAAAAHACABAAAIADACAAAJACAXBgAA2wIAIAkAAOkCACALAADVAgAgDgAA1gIAIA8AANcCACAQAADYAgAguQEAAOYCADC6AQAACwAQuwEAAOYCADC8AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHQAQAA6ALbASLTAQEAvAIAIdQBAQC8AgAh1QEBALwCACHWAQEAvAIAIdcBAQC9AgAh2AEgAM8CACHZAQgA5wIAIdsBAQC9AgAh3AEBALwCACHdAQEAvAIAIQkGAADgBAAgCQAA4wQAIAsAANwEACAOAADdBAAgDwAA3gQAIBAAAN8EACDXAQAA_QIAINkBAAD9AgAg2wEAAP0CACAXBgAA2wIAIAkAAOkCACALAADVAgAgDgAA1gIAIA8AANcCACAQAADYAgAguQEAAOYCADC6AQAACwAQuwEAAOYCADC8AQEAAAABwQFAAL4CACHCAUAAvgIAIdABAADoAtsBItMBAQC8AgAh1AEBALwCACHVAQEAvAIAIdYBAQC8AgAh1wEBAL0CACHYASAAzwIAIdkBCADnAgAh2wEBAL0CACHcAQEAvAIAId0BAQC8AgAhAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACABAAAACwAgCwMAANsCACAKAADcAgAguQEAAOQCADC6AQAAEQAQuwEAAOQCADC8AQEAvAIAIb4BAADlAr4BIr8BAQC8AgAhwAEBALwCACHBAUAAvgIAIcIBQAC-AgAhAgMAAOAEACAKAADhBAAgDAMAANsCACAKAADcAgAguQEAAOQCADC6AQAAEQAQuwEAAOQCADC8AQEAAAABvgEAAOUCvgEivwEBALwCACHAAQEAvAIAIcEBQAC-AgAhwgFAAL4CACH9AQAA4wIAIAMAAAARACABAAASADACAAATACAOBgAA2wIAIAoAANwCACAMAADiAgAgDQAA1gIAILkBAADhAgAwugEAABUAELsBAADhAgAwvAEBALwCACG_AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHcAQEAvAIAId4BAQC8AgAh3wEBAL0CACEFBgAA4AQAIAoAAOEEACAMAADiBAAgDQAA3QQAIN8BAAD9AgAgDgYAANsCACAKAADcAgAgDAAA4gIAIA0AANYCACC5AQAA4QIAMLoBAAAVABC7AQAA4QIAMLwBAQAAAAG_AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHcAQEAvAIAId4BAQC8AgAh3wEBAL0CACEDAAAAFQAgAQAAFgAwAgAAFwAgAQAAABUAIAMAAAAVACABAAAWADACAAAXACABAAAAFQAgDgMAANsCACAKAADcAgAguQEAAN4CADC6AQAAHAAQuwEAAN4CADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIcIBQAC-AgAhzgECAN8CACHQAQAA4ALQASLRAQEAvAIAIdIBAQC9AgAhAwMAAOAEACAKAADhBAAg0gEAAP0CACAPAwAA2wIAIAoAANwCACC5AQAA3gIAMLoBAAAcABC7AQAA3gIAMLwBAQAAAAG_AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIc4BAgDfAgAh0AEAAOAC0AEi0QEBAAAAAdIBAQC9AgAh_AEAAN0CACADAAAAHAAgAQAAHQAwAgAAHgAgCQMAANsCACAKAADcAgAguQEAANoCADC6AQAAIAAQuwEAANoCADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIQIDAADgBAAgCgAA4QQAIAoDAADbAgAgCgAA3AIAILkBAADaAgAwugEAACAAELsBAADaAgAwvAEBAAAAAb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIfwBAADZAgAgAwAAACAAIAEAACEAMAIAACIAIAEAAAARACABAAAAFQAgAQAAABwAIAEAAAAgACADAAAAEQAgAQAAEgAwAgAAEwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAcACABAAAdADACAAAeACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAAAMAIAEAAAAHACABAAAACwAgAQAAABEAIAEAAAAVACABAAAAHAAgAQAAACAAIAEAAAABACAWBAAA0wIAIAUAANQCACAHAAC_AgAgCwAA1QIAIA4AANYCACAPAADXAgAgEAAA2AIAILkBAADOAgAwugEAADQAELsBAADOAgAwvAEBALwCACHBAUAAvgIAIcIBQAC-AgAh0AEAANEC-QEi4AEBALwCACHzAQEAvAIAIfQBIADPAgAh9QEBAL0CACH3AQAA0AL3ASL5ASAAzwIAIfoBIADPAgAh-wFAANICACEJBAAA2gQAIAUAANsEACAHAADzAwAgCwAA3AQAIA4AAN0EACAPAADeBAAgEAAA3wQAIPUBAAD9AgAg-wEAAP0CACADAAAANAAgAQAANQAwAgAAAQAgAwAAADQAIAEAADUAMAIAAAEAIAMAAAA0ACABAAA1ADACAAABACATBAAA0wQAIAUAANQEACAHAADVBAAgCwAA1gQAIA4AANcEACAPAADYBAAgEAAA2QQAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA-QEC4AEBAAAAAfMBAQAAAAH0ASAAAAAB9QEBAAAAAfcBAAAA9wEC-QEgAAAAAfoBIAAAAAH7AUAAAAABARYAADkAIAy8AQEAAAABwQFAAAAAAcIBQAAAAAHQAQAAAPkBAuABAQAAAAHzAQEAAAAB9AEgAAAAAfUBAQAAAAH3AQAAAPcBAvkBIAAAAAH6ASAAAAAB-wFAAAAAAQEWAAA7ADABFgAAOwAwEwQAAIcEACAFAACIBAAgBwAAiQQAIAsAAIoEACAOAACLBAAgDwAAjAQAIBAAAI0EACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIQIAAAABACAWAAA-ACAMvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh0AEAAIYE-QEi4AEBAO8CACHzAQEA7wIAIfQBIACPAwAh9QEBAIUDACH3AQAAhQT3ASL5ASAAjwMAIfoBIACPAwAh-wFAAPoDACECAAAANAAgFgAAQAAgAgAAADQAIBYAAEAAIAMAAAABACAdAAA5ACAeAAA-ACABAAAAAQAgAQAAADQAIAUIAACCBAAgIwAAhAQAICQAAIMEACD1AQAA_QIAIPsBAAD9AgAgD7kBAADHAgAwugEAAEcAELsBAADHAgAwvAEBAJkCACHBAUAAmwIAIcIBQACbAgAh0AEAAMkC-QEi4AEBAJkCACHzAQEAmQIAIfQBIACwAgAh9QEBAKcCACH3AQAAyAL3ASL5ASAAsAIAIfoBIACwAgAh-wFAAMMCACEDAAAANAAgAQAARgAwIgAARwAgAwAAADQAIAEAADUAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAIEEACC8AQEAAAABwAEBAAAAAcEBQAAAAAHCAUAAAAAB5gFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAQEWAABPACAIvAEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAeYBQAAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAEBFgAAUQAwARYAAFEAMAkDAACABAAgvAEBAO8CACHAAQEA7wIAIcEBQADxAgAhwgFAAPECACHmAUAA8QIAIfABAQDvAgAh8QEBAIUDACHyAQEAhQMAIQIAAAAFACAWAABUACAIvAEBAO8CACHAAQEA7wIAIcEBQADxAgAhwgFAAPECACHmAUAA8QIAIfABAQDvAgAh8QEBAIUDACHyAQEAhQMAIQIAAAADACAWAABWACACAAAAAwAgFgAAVgAgAwAAAAUAIB0AAE8AIB4AAFQAIAEAAAAFACABAAAAAwAgBQgAAP0DACAjAAD_AwAgJAAA_gMAIPEBAAD9AgAg8gEAAP0CACALuQEAAMYCADC6AQAAXQAQuwEAAMYCADC8AQEAmQIAIcABAQCZAgAhwQFAAJsCACHCAUAAmwIAIeYBQACbAgAh8AEBAJkCACHxAQEApwIAIfIBAQCnAgAhAwAAAAMAIAEAAFwAMCIAAF0AIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAAD8AwAgvAEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AFAAAAAAe0BQAAAAAHuAQEAAAAB7wEBAAAAAQEWAABlACANvAEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AFAAAAAAe0BQAAAAAHuAQEAAAAB7wEBAAAAAQEWAABnADABFgAAZwAwDgMAAPsDACC8AQEA7wIAIcABAQDvAgAhwQFAAPECACHCAUAA8QIAIecBAQDvAgAh6AEBAO8CACHpAQEAhQMAIeoBAQCFAwAh6wEBAIUDACHsAUAA-gMAIe0BQAD6AwAh7gEBAIUDACHvAQEAhQMAIQIAAAAJACAWAABqACANvAEBAO8CACHAAQEA7wIAIcEBQADxAgAhwgFAAPECACHnAQEA7wIAIegBAQDvAgAh6QEBAIUDACHqAQEAhQMAIesBAQCFAwAh7AFAAPoDACHtAUAA-gMAIe4BAQCFAwAh7wEBAIUDACECAAAABwAgFgAAbAAgAgAAAAcAIBYAAGwAIAMAAAAJACAdAABlACAeAABqACABAAAACQAgAQAAAAcAIAoIAAD3AwAgIwAA-QMAICQAAPgDACDpAQAA_QIAIOoBAAD9AgAg6wEAAP0CACDsAQAA_QIAIO0BAAD9AgAg7gEAAP0CACDvAQAA_QIAIBC5AQAAwgIAMLoBAABzABC7AQAAwgIAMLwBAQCZAgAhwAEBAJkCACHBAUAAmwIAIcIBQACbAgAh5wEBAJkCACHoAQEAmQIAIekBAQCnAgAh6gEBAKcCACHrAQEApwIAIewBQADDAgAh7QFAAMMCACHuAQEApwIAIe8BAQCnAgAhAwAAAAcAIAEAAHIAMCIAAHMAIAMAAAAHACABAAAIADACAAAJACAJuQEAAMECADC6AQAAeQAQuwEAAMECADC8AQEAAAABwQFAAL4CACHCAUAAvgIAIeQBAQC8AgAh5QEBALwCACHmAUAAvgIAIQEAAAB2ACABAAAAdgAgCbkBAADBAgAwugEAAHkAELsBAADBAgAwvAEBALwCACHBAUAAvgIAIcIBQAC-AgAh5AEBALwCACHlAQEAvAIAIeYBQAC-AgAhAAMAAAB5ACABAAB6ADACAAB2ACADAAAAeQAgAQAAegAwAgAAdgAgAwAAAHkAIAEAAHoAMAIAAHYAIAa8AQEAAAABwQFAAAAAAcIBQAAAAAHkAQEAAAAB5QEBAAAAAeYBQAAAAAEBFgAAfgAgBrwBAQAAAAHBAUAAAAABwgFAAAAAAeQBAQAAAAHlAQEAAAAB5gFAAAAAAQEWAACAAQAwARYAAIABADAGvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh5AEBAO8CACHlAQEA7wIAIeYBQADxAgAhAgAAAHYAIBYAAIMBACAGvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh5AEBAO8CACHlAQEA7wIAIeYBQADxAgAhAgAAAHkAIBYAAIUBACACAAAAeQAgFgAAhQEAIAMAAAB2ACAdAAB-ACAeAACDAQAgAQAAAHYAIAEAAAB5ACADCAAA9AMAICMAAPYDACAkAAD1AwAgCbkBAADAAgAwugEAAIwBABC7AQAAwAIAMLwBAQCZAgAhwQFAAJsCACHCAUAAmwIAIeQBAQCZAgAh5QEBAJkCACHmAUAAmwIAIQMAAAB5ACABAACLAQAwIgAAjAEAIAMAAAB5ACABAAB6ADACAAB2ACAJBwAAvwIAILkBAAC7AgAwugEAAJIBABC7AQAAuwIAMLwBAQAAAAHBAUAAvgIAIcIBQAC-AgAh1gEBAL0CACHgAQEAAAABAQAAAI8BACABAAAAjwEAIAkHAAC_AgAguQEAALsCADC6AQAAkgEAELsBAAC7AgAwvAEBALwCACHBAUAAvgIAIcIBQAC-AgAh1gEBAL0CACHgAQEAvAIAIQIHAADzAwAg1gEAAP0CACADAAAAkgEAIAEAAJMBADACAACPAQAgAwAAAJIBACABAACTAQAwAgAAjwEAIAMAAACSAQAgAQAAkwEAMAIAAI8BACAGBwAA8gMAILwBAQAAAAHBAUAAAAABwgFAAAAAAdYBAQAAAAHgAQEAAAABARYAAJcBACAFvAEBAAAAAcEBQAAAAAHCAUAAAAAB1gEBAAAAAeABAQAAAAEBFgAAmQEAMAEWAACZAQAwBgcAAOUDACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHWAQEAhQMAIeABAQDvAgAhAgAAAI8BACAWAACcAQAgBbwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdYBAQCFAwAh4AEBAO8CACECAAAAkgEAIBYAAJ4BACACAAAAkgEAIBYAAJ4BACADAAAAjwEAIB0AAJcBACAeAACcAQAgAQAAAI8BACABAAAAkgEAIAQIAADiAwAgIwAA5AMAICQAAOMDACDWAQAA_QIAIAi5AQAAugIAMLoBAAClAQAQuwEAALoCADC8AQEAmQIAIcEBQACbAgAhwgFAAJsCACHWAQEApwIAIeABAQCZAgAhAwAAAJIBACABAACkAQAwIgAApQEAIAMAAACSAQAgAQAAkwEAMAIAAI8BACABAAAAFwAgAQAAABcAIAMAAAAVACABAAAWADACAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAsGAADJAwAgCgAAyAMAIAwAAMwDACANAADKAwAgvAEBAAAAAb8BAQAAAAHBAUAAAAABwgFAAAAAAdwBAQAAAAHeAQEAAAAB3wEBAAAAAQEWAACtAQAgB7wBAQAAAAG_AQEAAAABwQFAAAAAAcIBQAAAAAHcAQEAAAAB3gEBAAAAAd8BAQAAAAEBFgAArwEAMAEWAACvAQAwAQAAABUAIAsGAAC7AwAgCgAAxgMAIAwAALwDACANAAC9AwAgvAEBAO8CACG_AQEA7wIAIcEBQADxAgAhwgFAAPECACHcAQEA7wIAId4BAQDvAgAh3wEBAIUDACECAAAAFwAgFgAAswEAIAe8AQEA7wIAIb8BAQDvAgAhwQFAAPECACHCAUAA8QIAIdwBAQDvAgAh3gEBAO8CACHfAQEAhQMAIQIAAAAVACAWAAC1AQAgAgAAABUAIBYAALUBACABAAAAFQAgAwAAABcAIB0AAK0BACAeAACzAQAgAQAAABcAIAEAAAAVACAECAAA3wMAICMAAOEDACAkAADgAwAg3wEAAP0CACAKuQEAALkCADC6AQAAvQEAELsBAAC5AgAwvAEBAJkCACG_AQEAmQIAIcEBQACbAgAhwgFAAJsCACHcAQEAmQIAId4BAQCZAgAh3wEBAKcCACEDAAAAFQAgAQAAvAEAMCIAAL0BACADAAAAFQAgAQAAFgAwAgAAFwAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAUBgAA2QMAIAkAANoDACALAADbAwAgDgAA3AMAIA8AAN0DACAQAADeAwAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAADbAQLTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBIAAAAAHZAQgAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAABARYAAMUBACAOvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAADbAQLTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBIAAAAAHZAQgAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAABARYAAMcBADABFgAAxwEAMBQGAACSAwAgCQAAkwMAIAsAAJQDACAOAACVAwAgDwAAlgMAIBAAAJcDACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAkQPbASLTAQEA7wIAIdQBAQDvAgAh1QEBAO8CACHWAQEA7wIAIdcBAQCFAwAh2AEgAI8DACHZAQgAkAMAIdsBAQCFAwAh3AEBAO8CACHdAQEA7wIAIQIAAAANACAWAADKAQAgDrwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACRA9sBItMBAQDvAgAh1AEBAO8CACHVAQEA7wIAIdYBAQDvAgAh1wEBAIUDACHYASAAjwMAIdkBCACQAwAh2wEBAIUDACHcAQEA7wIAId0BAQDvAgAhAgAAAAsAIBYAAMwBACACAAAACwAgFgAAzAEAIAMAAAANACAdAADFAQAgHgAAygEAIAEAAAANACABAAAACwAgCAgAAIoDACAjAACNAwAgJAAAjAMAIIUBAACLAwAghgEAAI4DACDXAQAA_QIAINkBAAD9AgAg2wEAAP0CACARuQEAAK8CADC6AQAA0wEAELsBAACvAgAwvAEBAJkCACHBAUAAmwIAIcIBQACbAgAh0AEAALIC2wEi0wEBAJkCACHUAQEAmQIAIdUBAQCZAgAh1gEBAJkCACHXAQEApwIAIdgBIACwAgAh2QEIALECACHbAQEApwIAIdwBAQCZAgAh3QEBAJkCACEDAAAACwAgAQAA0gEAMCIAANMBACADAAAACwAgAQAADAAwAgAADQAgAQAAAB4AIAEAAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAcACABAAAdADACAAAeACALAwAAiAMAIAoAAIkDACC8AQEAAAABvwEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAc4BAgAAAAHQAQAAANABAtEBAQAAAAHSAQEAAAABARYAANsBACAJvAEBAAAAAb8BAQAAAAHAAQEAAAABwQFAAAAAAcIBQAAAAAHOAQIAAAAB0AEAAADQAQLRAQEAAAAB0gEBAAAAAQEWAADdAQAwARYAAN0BADALAwAAhgMAIAoAAIcDACC8AQEA7wIAIb8BAQDvAgAhwAEBAO8CACHBAUAA8QIAIcIBQADxAgAhzgECAIMDACHQAQAAhAPQASLRAQEA7wIAIdIBAQCFAwAhAgAAAB4AIBYAAOABACAJvAEBAO8CACG_AQEA7wIAIcABAQDvAgAhwQFAAPECACHCAUAA8QIAIc4BAgCDAwAh0AEAAIQD0AEi0QEBAO8CACHSAQEAhQMAIQIAAAAcACAWAADiAQAgAgAAABwAIBYAAOIBACADAAAAHgAgHQAA2wEAIB4AAOABACABAAAAHgAgAQAAABwAIAYIAAD-AgAgIwAAgQMAICQAAIADACCFAQAA_wIAIIYBAACCAwAg0gEAAP0CACAMuQEAAKQCADC6AQAA6QEAELsBAACkAgAwvAEBAJkCACG_AQEAmQIAIcABAQCZAgAhwQFAAJsCACHCAUAAmwIAIc4BAgClAgAh0AEAAKYC0AEi0QEBAJkCACHSAQEApwIAIQMAAAAcACABAADoAQAwIgAA6QEAIAMAAAAcACABAAAdADACAAAeACABAAAAIgAgAQAAACIAIAMAAAAgACABAAAhADACAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIAYDAAD7AgAgCgAA_AIAILwBAQAAAAG_AQEAAAABwAEBAAAAAcEBQAAAAAEBFgAA8QEAIAS8AQEAAAABvwEBAAAAAcABAQAAAAHBAUAAAAABARYAAPMBADABFgAA8wEAMAYDAAD5AgAgCgAA-gIAILwBAQDvAgAhvwEBAO8CACHAAQEA7wIAIcEBQADxAgAhAgAAACIAIBYAAPYBACAEvAEBAO8CACG_AQEA7wIAIcABAQDvAgAhwQFAAPECACECAAAAIAAgFgAA-AEAIAIAAAAgACAWAAD4AQAgAwAAACIAIB0AAPEBACAeAAD2AQAgAQAAACIAIAEAAAAgACADCAAA9gIAICMAAPgCACAkAAD3AgAgB7kBAACjAgAwugEAAP8BABC7AQAAowIAMLwBAQCZAgAhvwEBAJkCACHAAQEAmQIAIcEBQACbAgAhAwAAACAAIAEAAP4BADAiAAD_AQAgAwAAACAAIAEAACEAMAIAACIAIAEAAAATACABAAAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACADAAAAEQAgAQAAEgAwAgAAEwAgCAMAAPUCACAKAAD0AgAgvAEBAAAAAb4BAAAAvgECvwEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAQEWAACHAgAgBrwBAQAAAAG-AQAAAL4BAr8BAQAAAAHAAQEAAAABwQFAAAAAAcIBQAAAAAEBFgAAiQIAMAEWAACJAgAwCAMAAPMCACAKAADyAgAgvAEBAO8CACG-AQAA8AK-ASK_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-QEIygEAAMoC-QEiBwgAAJ0CACAjAADLAgAgJAAAywIAIMMBAAAA-QECxAEAAAD5AQjFAQAAAPkBCMoBAADKAvkBIgTDAQAAAPkBAsQBAAAA-QEIxQEAAAD5AQjKAQAAywL5ASIHCAAAnQIAICMAAM0CACAkAADNAgAgwwEAAAD3AQLEAQAAAPcBCMUBAAAA9wEIygEAAMwC9wEiBMMBAAAA9wECxAEAAAD3AQjFAQAAAPcBCMoBAADNAvcBIhYEAADTAgAgBQAA1AIAIAcAAL8CACALAADVAgAgDgAA1gIAIA8AANcCACAQAADYAgAguQEAAM4CADC6AQAANAAQuwEAAM4CADC8AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHQAQAA0QL5ASLgAQEAvAIAIfMBAQC8AgAh9AEgAM8CACH1AQEAvQIAIfcBAADQAvcBIvkBIADPAgAh-gEgAM8CACH7AUAA0gIAIQLDASAAAAABygEgALgCACEEwwEAAAD3AQLEAQAAAPcBCMUBAAAA9wEIygEAAM0C9wEiBMMBAAAA-QECxAEAAAD5AQjFAQAAAPkBCMoBAADLAvkBIgjDAUAAAAABxAFAAAAABcUBQAAAAAXGAUAAAAABxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAMUCACED4QEAAAMAIOIBAAADACDjAQAAAwAgA-EBAAAHACDiAQAABwAg4wEAAAcAIAPhAQAAEQAg4gEAABEAIOMBAAARACAD4QEAABUAIOIBAAAVACDjAQAAFQAgA-EBAAAcACDiAQAAHAAg4wEAABwAIAPhAQAAIAAg4gEAACAAIOMBAAAgACACvwEBAAAAAcABAQAAAAEJAwAA2wIAIAoAANwCACC5AQAA2gIAMLoBAAAgABC7AQAA2gIAMLwBAQC8AgAhvwEBALwCACHAAQEAvAIAIcEBQAC-AgAhGAQAANMCACAFAADUAgAgBwAAvwIAIAsAANUCACAOAADWAgAgDwAA1wIAIBAAANgCACC5AQAAzgIAMLoBAAA0ABC7AQAAzgIAMLwBAQC8AgAhwQFAAL4CACHCAUAAvgIAIdABAADRAvkBIuABAQC8AgAh8wEBALwCACH0ASAAzwIAIfUBAQC9AgAh9wEAANAC9wEi-QEgAM8CACH6ASAAzwIAIfsBQADSAgAh_gEAADQAIP8BAAA0ACAZBgAA2wIAIAkAAOkCACALAADVAgAgDgAA1gIAIA8AANcCACAQAADYAgAguQEAAOYCADC6AQAACwAQuwEAAOYCADC8AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHQAQAA6ALbASLTAQEAvAIAIdQBAQC8AgAh1QEBALwCACHWAQEAvAIAIdcBAQC9AgAh2AEgAM8CACHZAQgA5wIAIdsBAQC9AgAh3AEBALwCACHdAQEAvAIAIf4BAAALACD_AQAACwAgAr8BAQAAAAHAAQEAAAABDgMAANsCACAKAADcAgAguQEAAN4CADC6AQAAHAAQuwEAAN4CADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIcIBQAC-AgAhzgECAN8CACHQAQAA4ALQASLRAQEAvAIAIdIBAQC9AgAhCMMBAgAAAAHEAQIAAAAExQECAAAABMYBAgAAAAHHAQIAAAAByAECAAAAAckBAgAAAAHKAQIAnQIAIQTDAQAAANABAsQBAAAA0AEIxQEAAADQAQjKAQAArALQASIOBgAA2wIAIAoAANwCACAMAADiAgAgDQAA1gIAILkBAADhAgAwugEAABUAELsBAADhAgAwvAEBALwCACG_AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHcAQEAvAIAId4BAQC8AgAh3wEBAL0CACEQBgAA2wIAIAoAANwCACAMAADiAgAgDQAA1gIAILkBAADhAgAwugEAABUAELsBAADhAgAwvAEBALwCACG_AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHcAQEAvAIAId4BAQC8AgAh3wEBAL0CACH-AQAAFQAg_wEAABUAIAK_AQEAAAABwAEBAAAAAQsDAADbAgAgCgAA3AIAILkBAADkAgAwugEAABEAELsBAADkAgAwvAEBALwCACG-AQAA5QK-ASK_AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIQTDAQAAAL4BAsQBAAAAvgEIxQEAAAC-AQjKAQAAoAK-ASIXBgAA2wIAIAkAAOkCACALAADVAgAgDgAA1gIAIA8AANcCACAQAADYAgAguQEAAOYCADC6AQAACwAQuwEAAOYCADC8AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHQAQAA6ALbASLTAQEAvAIAIdQBAQC8AgAh1QEBALwCACHWAQEAvAIAIdcBAQC9AgAh2AEgAM8CACHZAQgA5wIAIdsBAQC9AgAh3AEBALwCACHdAQEAvAIAIQjDAQgAAAABxAEIAAAABcUBCAAAAAXGAQgAAAABxwEIAAAAAcgBCAAAAAHJAQgAAAABygEIALYCACEEwwEAAADbAQLEAQAAANsBCMUBAAAA2wEIygEAALQC2wEiCwcAAL8CACC5AQAAuwIAMLoBAACSAQAQuwEAALsCADC8AQEAvAIAIcEBQAC-AgAhwgFAAL4CACHWAQEAvQIAIeABAQC8AgAh_gEAAJIBACD_AQAAkgEAIBEDAADbAgAguQEAAOoCADC6AQAABwAQuwEAAOoCADC8AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIecBAQC8AgAh6AEBALwCACHpAQEAvQIAIeoBAQC9AgAh6wEBAL0CACHsAUAA0gIAIe0BQADSAgAh7gEBAL0CACHvAQEAvQIAIQwDAADbAgAguQEAAOsCADC6AQAAAwAQuwEAAOsCADC8AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIeYBQAC-AgAh8AEBALwCACHxAQEAvQIAIfIBAQC9AgAhAAAAAYMCAQAAAAEBgwIAAAC-AQIBgwJAAAAAAQUdAACqBQAgHgAAsAUAIIACAACrBQAggQIAAK8FACCGAgAADQAgBR0AAKgFACAeAACtBQAggAIAAKkFACCBAgAArAUAIIYCAAABACADHQAAqgUAIIACAACrBQAghgIAAA0AIAMdAACoBQAggAIAAKkFACCGAgAAAQAgAAAABR0AAKAFACAeAACmBQAggAIAAKEFACCBAgAApQUAIIYCAAABACAFHQAAngUAIB4AAKMFACCAAgAAnwUAIIECAACiBQAghgIAAA0AIAMdAACgBQAggAIAAKEFACCGAgAAAQAgAx0AAJ4FACCAAgAAnwUAIIYCAAANACAAAAAAAAAFgwICAAAAAYkCAgAAAAGKAgIAAAABiwICAAAAAYwCAgAAAAEBgwIAAADQAQIBgwIBAAAAAQUdAACWBQAgHgAAnAUAIIACAACXBQAggQIAAJsFACCGAgAAAQAgBR0AAJQFACAeAACZBQAggAIAAJUFACCBAgAAmAUAIIYCAAANACADHQAAlgUAIIACAACXBQAghgIAAAEAIAMdAACUBQAggAIAAJUFACCGAgAADQAgAAAAAAABgwIgAAAAAQWDAggAAAABiQIIAAAAAYoCCAAAAAGLAggAAAABjAIIAAAAAQGDAgAAANsBAgUdAAD4BAAgHgAAkgUAIIACAAD5BAAggQIAAJEFACCGAgAAAQAgBR0AAPYEACAeAACPBQAggAIAAPcEACCBAgAAjgUAIIYCAACPAQAgCx0AAM0DADAeAADSAwAwgAIAAM4DADCBAgAAzwMAMIICAADQAwAggwIAANEDADCEAgAA0QMAMIUCAADRAwAwhgIAANEDADCHAgAA0wMAMIgCAADUAwAwCx0AALADADAeAAC1AwAwgAIAALEDADCBAgAAsgMAMIICAACzAwAggwIAALQDADCEAgAAtAMAMIUCAAC0AwAwhgIAALQDADCHAgAAtgMAMIgCAAC3AwAwCx0AAKQDADAeAACpAwAwgAIAAKUDADCBAgAApgMAMIICAACnAwAggwIAAKgDADCEAgAAqAMAMIUCAACoAwAwhgIAAKgDADCHAgAAqgMAMIgCAACrAwAwCx0AAJgDADAeAACdAwAwgAIAAJkDADCBAgAAmgMAMIICAACbAwAggwIAAJwDADCEAgAAnAMAMIUCAACcAwAwhgIAAJwDADCHAgAAngMAMIgCAACfAwAwBAMAAPsCACC8AQEAAAABwAEBAAAAAcEBQAAAAAECAAAAIgAgHQAAowMAIAMAAAAiACAdAACjAwAgHgAAogMAIAEWAACNBQAwCgMAANsCACAKAADcAgAguQEAANoCADC6AQAAIAAQuwEAANoCADC8AQEAAAABvwEBALwCACHAAQEAvAIAIcEBQAC-AgAh_AEAANkCACACAAAAIgAgFgAAogMAIAIAAACgAwAgFgAAoQMAIAe5AQAAnwMAMLoBAACgAwAQuwEAAJ8DADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIQe5AQAAnwMAMLoBAACgAwAQuwEAAJ8DADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIQO8AQEA7wIAIcABAQDvAgAhwQFAAPECACEEAwAA-QIAILwBAQDvAgAhwAEBAO8CACHBAUAA8QIAIQQDAAD7AgAgvAEBAAAAAcABAQAAAAHBAUAAAAABCQMAAIgDACC8AQEAAAABwAEBAAAAAcEBQAAAAAHCAUAAAAABzgECAAAAAdABAAAA0AEC0QEBAAAAAdIBAQAAAAECAAAAHgAgHQAArwMAIAMAAAAeACAdAACvAwAgHgAArgMAIAEWAACMBQAwDwMAANsCACAKAADcAgAguQEAAN4CADC6AQAAHAAQuwEAAN4CADC8AQEAAAABvwEBALwCACHAAQEAvAIAIcEBQAC-AgAhwgFAAL4CACHOAQIA3wIAIdABAADgAtABItEBAQAAAAHSAQEAvQIAIfwBAADdAgAgAgAAAB4AIBYAAK4DACACAAAArAMAIBYAAK0DACAMuQEAAKsDADC6AQAArAMAELsBAACrAwAwvAEBALwCACG_AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIc4BAgDfAgAh0AEAAOAC0AEi0QEBALwCACHSAQEAvQIAIQy5AQAAqwMAMLoBAACsAwAQuwEAAKsDADC8AQEAvAIAIb8BAQC8AgAhwAEBALwCACHBAUAAvgIAIcIBQAC-AgAhzgECAN8CACHQAQAA4ALQASLRAQEAvAIAIdIBAQC9AgAhCLwBAQDvAgAhwAEBAO8CACHBAUAA8QIAIcIBQADxAgAhzgECAIMDACHQAQAAhAPQASLRAQEA7wIAIdIBAQCFAwAhCQMAAIYDACC8AQEA7wIAIcABAQDvAgAhwQFAAPECACHCAUAA8QIAIc4BAgCDAwAh0AEAAIQD0AEi0QEBAO8CACHSAQEAhQMAIQkDAACIAwAgvAEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAc4BAgAAAAHQAQAAANABAtEBAQAAAAHSAQEAAAABCQYAAMkDACAMAADMAwAgDQAAygMAILwBAQAAAAHBAUAAAAABwgFAAAAAAdwBAQAAAAHeAQEAAAAB3wEBAAAAAQIAAAAXACAdAADLAwAgAwAAABcAIB0AAMsDACAeAAC6AwAgARYAAIsFADAOBgAA2wIAIAoAANwCACAMAADiAgAgDQAA1gIAILkBAADhAgAwugEAABUAELsBAADhAgAwvAEBAAAAAb8BAQC8AgAhwQFAAL4CACHCAUAAvgIAIdwBAQC8AgAh3gEBALwCACHfAQEAvQIAIQIAAAAXACAWAAC6AwAgAgAAALgDACAWAAC5AwAgCrkBAAC3AwAwugEAALgDABC7AQAAtwMAMLwBAQC8AgAhvwEBALwCACHBAUAAvgIAIcIBQAC-AgAh3AEBALwCACHeAQEAvAIAId8BAQC9AgAhCrkBAAC3AwAwugEAALgDABC7AQAAtwMAMLwBAQC8AgAhvwEBALwCACHBAUAAvgIAIcIBQAC-AgAh3AEBALwCACHeAQEAvAIAId8BAQC9AgAhBrwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdwBAQDvAgAh3gEBAO8CACHfAQEAhQMAIQkGAAC7AwAgDAAAvAMAIA0AAL0DACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHcAQEA7wIAId4BAQDvAgAh3wEBAIUDACEFHQAA_QQAIB4AAIkFACCAAgAA_gQAIIECAACIBQAghgIAAAEAIAcdAAD7BAAgHgAAhgUAIIACAAD8BAAggQIAAIUFACCEAgAAFQAghQIAABUAIIYCAAAXACALHQAAvgMAMB4AAMIDADCAAgAAvwMAMIECAADAAwAwggIAAMEDACCDAgAAtAMAMIQCAAC0AwAwhQIAALQDADCGAgAAtAMAMIcCAADDAwAwiAIAALcDADAJBgAAyQMAIAoAAMgDACANAADKAwAgvAEBAAAAAb8BAQAAAAHBAUAAAAABwgFAAAAAAdwBAQAAAAHeAQEAAAABAgAAABcAIB0AAMcDACADAAAAFwAgHQAAxwMAIB4AAMUDACABFgAAhAUAMAIAAAAXACAWAADFAwAgAgAAALgDACAWAADEAwAgBrwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIcIBQADxAgAh3AEBAO8CACHeAQEA7wIAIQkGAAC7AwAgCgAAxgMAIA0AAL0DACC8AQEA7wIAIb8BAQDvAgAhwQFAAPECACHCAUAA8QIAIdwBAQDvAgAh3gEBAO8CACEFHQAA_wQAIB4AAIIFACCAAgAAgAUAIIECAACBBQAghgIAAA0AIAkGAADJAwAgCgAAyAMAIA0AAMoDACC8AQEAAAABvwEBAAAAAcEBQAAAAAHCAUAAAAAB3AEBAAAAAd4BAQAAAAEDHQAA_wQAIIACAACABQAghgIAAA0AIAMdAAD9BAAggAIAAP4EACCGAgAAAQAgBB0AAL4DADCAAgAAvwMAMIICAADBAwAghgIAALQDADAJBgAAyQMAIAwAAMwDACANAADKAwAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB3AEBAAAAAd4BAQAAAAHfAQEAAAABAx0AAPsEACCAAgAA_AQAIIYCAAAXACAGAwAA9QIAILwBAQAAAAG-AQAAAL4BAsABAQAAAAHBAUAAAAABwgFAAAAAAQIAAAATACAdAADYAwAgAwAAABMAIB0AANgDACAeAADXAwAgARYAAPoEADAMAwAA2wIAIAoAANwCACC5AQAA5AIAMLoBAAARABC7AQAA5AIAMLwBAQAAAAG-AQAA5QK-ASK_AQEAvAIAIcABAQC8AgAhwQFAAL4CACHCAUAAvgIAIf0BAADjAgAgAgAAABMAIBYAANcDACACAAAA1QMAIBYAANYDACAJuQEAANQDADC6AQAA1QMAELsBAADUAwAwvAEBALwCACG-AQAA5QK-ASK_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_BAAwhQIAAL8EADCGAgAAvwQAMIcCAADBBAAwiAIAAMIEADALHQAAsgQAMB4AALYEADCAAgAAswQAMIECAAC0BAAwggIAALUEACCDAgAA6gMAMIQCAADqAwAwhQIAAOoDADCGAgAA6gMAMIcCAAC3BAAwiAIAAO0DADALHQAAqQQAMB4AAK0EADCAAgAAqgQAMIECAACrBAAwggIAAKwEACCDAgAA0QMAMIQCAADRAwAwhQIAANEDADCGAgAA0QMAMIcCAACuBAAwiAIAANQDADALHQAAoAQAMB4AAKQEADCAAgAAoQQAMIECAACiBAAwggIAAKMEACCDAgAAtAMAMIQCAAC0AwAwhQIAALQDADCGAgAAtAMAMIcCAAClBAAwiAIAALcDADALHQAAlwQAMB4AAJsEADCAAgAAmAQAMIECAACZBAAwggIAAJoEACCDAgAAqAMAMIQCAACoAwAwhQIAAKgDADCGAgAAqAMAMIcCAACcBAAwiAIAAKsDADALHQAAjgQAMB4AAJIEADCAAgAAjwQAMIECAACQBAAwggIAAJEEACCDAgAAnAMAMIQCAACcAwAwhQIAAJwDADCGAgAAnAMAMIcCAACTBAAwiAIAAJ8DADAECgAA_AIAILwBAQAAAAG_AQEAAAABwQFAAAAAAQIAAAAiACAdAACWBAAgAwAAACIAIB0AAJYEACAeAACVBAAgARYAAOoEADACAAAAIgAgFgAAlQQAIAIAAACgAwAgFgAAlAQAIAO8AQEA7wIAIb8BAQDvAgAhwQFAAPECACEECgAA-gIAILwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIQQKAAD8AgAgvAEBAAAAAb8BAQAAAAHBAUAAAAABCQoAAIkDACC8AQEAAAABvwEBAAAAAcEBQAAAAAHCAUAAAAABzgECAAAAAdABAAAA0AEC0QEBAAAAAdIBAQAAAAECAAAAHgAgHQAAnwQAIAMAAAAeACAdAACfBAAgHgAAngQAIAEWAADpBAAwAgAAAB4AIBYAAJ4EACACAAAArAMAIBYAAJ0EACAIvAEBAO8CACG_AQEA7wIAIcEBQADxAgAhwgFAAPECACHOAQIAgwMAIdABAACEA9ABItEBAQDvAgAh0gEBAIUDACEJCgAAhwMAILwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIcIBQADxAgAhzgECAIMDACHQAQAAhAPQASLRAQEA7wIAIdIBAQCFAwAhCQoAAIkDACC8AQEAAAABvwEBAAAAAcEBQAAAAAHCAUAAAAABzgECAAAAAdABAAAA0AEC0QEBAAAAAdIBAQAAAAEJCgAAyAMAIAwAAMwDACANAADKAwAgvAEBAAAAAb8BAQAAAAHBAUAAAAABwgFAAAAAAd4BAQAAAAHfAQEAAAABAgAAABcAIB0AAKgEACADAAAAFwAgHQAAqAQAIB4AAKcEACABFgAA6AQAMAIAAAAXACAWAACnBAAgAgAAALgDACAWAACmBAAgBrwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIcIBQADxAgAh3gEBAO8CACHfAQEAhQMAIQkKAADGAwAgDAAAvAMAIA0AAL0DACC8AQEA7wIAIb8BAQDvAgAhwQFAAPECACHCAUAA8QIAId4BAQDvAgAh3wEBAIUDACEJCgAAyAMAIAwAAMwDACANAADKAwAgvAEBAAAAAb8BAQAAAAHBAUAAAAABwgFAAAAAAd4BAQAAAAHfAQEAAAABBgoAAPQCACC8AQEAAAABvgEAAAC-AQK_AQEAAAABwQFAAAAAAcIBQAAAAAECAAAAEwAgHQAAsQQAIAMAAAATACAdAACxBAAgHgAAsAQAIAEWAADnBAAwAgAAABMAIBYAALAEACACAAAA1QMAIBYAAK8EACAFvAEBAO8CACG-AQAA8AK-ASK_AQEA7wIAIcEBQADxAgAhwgFAAPECACEGCgAA8gIAILwBAQDvAgAhvgEAAPACvgEivwEBAO8CACHBAUAA8QIAIcIBQADxAgAhBgoAAPQCACC8AQEAAAABvgEAAAC-AQK_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_QIAINsBAAD9AgAgBQYAAOAEACAKAADhBAAgDAAA4gQAIA0AAN0EACDfAQAA_QIAIAIHAADzAwAg1gEAAP0CACAHvAEBAAAAAcEBQAAAAAHCAUAAAAAB5gFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAQy8AQEAAAABwQFAAAAAAcIBQAAAAAHnAQEAAAAB6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBQAAAAAHtAUAAAAAB7gEBAAAAAe8BAQAAAAENvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAADbAQLTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBIAAAAAHZAQgAAAAB2wEBAAAAAd0BAQAAAAEFvAEBAAAAAb4BAAAAvgECvwEBAAAAAcEBQAAAAAHCAUAAAAABBrwBAQAAAAG_AQEAAAABwQFAAAAAAcIBQAAAAAHeAQEAAAAB3wEBAAAAAQi8AQEAAAABvwEBAAAAAcEBQAAAAAHCAUAAAAABzgECAAAAAdABAAAA0AEC0QEBAAAAAdIBAQAAAAEDvAEBAAAAAb8BAQAAAAHBAUAAAAABEgUAANQEACAHAADVBAAgCwAA1gQAIA4AANcEACAPAADYBAAgEAAA2QQAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA-QEC4AEBAAAAAfMBAQAAAAH0ASAAAAAB9QEBAAAAAfcBAAAA9wEC-QEgAAAAAfoBIAAAAAH7AUAAAAABAgAAAAEAIB0AAOsEACADAAAANAAgHQAA6wQAIB4AAO8EACAUAAAANAAgBQAAiAQAIAcAAIkEACALAACKBAAgDgAAiwQAIA8AAIwEACAQAACNBAAgFgAA7wQAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhEgUAAIgEACAHAACJBAAgCwAAigQAIA4AAIsEACAPAACMBAAgEAAAjQQAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhEgQAANMEACAHAADVBAAgCwAA1gQAIA4AANcEACAPAADYBAAgEAAA2QQAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA-QEC4AEBAAAAAfMBAQAAAAH0ASAAAAAB9QEBAAAAAfcBAAAA9wEC-QEgAAAAAfoBIAAAAAH7AUAAAAABAgAAAAEAIB0AAPAEACADAAAANAAgHQAA8AQAIB4AAPQEACAUAAAANAAgBAAAhwQAIAcAAIkEACALAACKBAAgDgAAiwQAIA8AAIwEACAQAACNBAAgFgAA9AQAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhEgQAAIcEACAHAACJBAAgCwAAigQAIA4AAIsEACAPAACMBAAgEAAAjQQAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhDbwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA2wEC0wEBAAAAAdQBAQAAAAHVAQEAAAAB1gEBAAAAAdcBAQAAAAHYASAAAAAB2QEIAAAAAdsBAQAAAAHcAQEAAAABBbwBAQAAAAHBAUAAAAABwgFAAAAAAdYBAQAAAAHgAQEAAAABAgAAAI8BACAdAAD2BAAgEgQAANMEACAFAADUBAAgCwAA1gQAIA4AANcEACAPAADYBAAgEAAA2QQAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA-QEC4AEBAAAAAfMBAQAAAAH0ASAAAAAB9QEBAAAAAfcBAAAA9wEC-QEgAAAAAfoBIAAAAAH7AUAAAAABAgAAAAEAIB0AAPgEACAFvAEBAAAAAb4BAAAAvgECwAEBAAAAAcEBQAAAAAHCAUAAAAABCgYAAMkDACAKAADIAwAgDAAAzAMAILwBAQAAAAG_AQEAAAABwQFAAAAAAcIBQAAAAAHcAQEAAAAB3gEBAAAAAd8BAQAAAAECAAAAFwAgHQAA-wQAIBIEAADTBAAgBQAA1AQAIAcAANUEACALAADWBAAgDwAA2AQAIBAAANkEACC8AQEAAAABwQFAAAAAAcIBQAAAAAHQAQAAAPkBAuABAQAAAAHzAQEAAAAB9AEgAAAAAfUBAQAAAAH3AQAAAPcBAvkBIAAAAAH6ASAAAAAB-wFAAAAAAQIAAAABACAdAAD9BAAgEwYAANkDACAJAADaAwAgCwAA2wMAIA8AAN0DACAQAADeAwAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAADbAQLTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBIAAAAAHZAQgAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAABAgAAAA0AIB0AAP8EACADAAAACwAgHQAA_wQAIB4AAIMFACAVAAAACwAgBgAAkgMAIAkAAJMDACALAACUAwAgDwAAlgMAIBAAAJcDACAWAACDBQAgvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh0AEAAJED2wEi0wEBAO8CACHUAQEA7wIAIdUBAQDvAgAh1gEBAO8CACHXAQEAhQMAIdgBIACPAwAh2QEIAJADACHbAQEAhQMAIdwBAQDvAgAh3QEBAO8CACETBgAAkgMAIAkAAJMDACALAACUAwAgDwAAlgMAIBAAAJcDACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAkQPbASLTAQEA7wIAIdQBAQDvAgAh1QEBAO8CACHWAQEA7wIAIdcBAQCFAwAh2AEgAI8DACHZAQgAkAMAIdsBAQCFAwAh3AEBAO8CACHdAQEA7wIAIQa8AQEAAAABvwEBAAAAAcEBQAAAAAHCAUAAAAAB3AEBAAAAAd4BAQAAAAEDAAAAFQAgHQAA-wQAIB4AAIcFACAMAAAAFQAgBgAAuwMAIAoAAMYDACAMAAC8AwAgFgAAhwUAILwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIcIBQADxAgAh3AEBAO8CACHeAQEA7wIAId8BAQCFAwAhCgYAALsDACAKAADGAwAgDAAAvAMAILwBAQDvAgAhvwEBAO8CACHBAUAA8QIAIcIBQADxAgAh3AEBAO8CACHeAQEA7wIAId8BAQCFAwAhAwAAADQAIB0AAP0EACAeAACKBQAgFAAAADQAIAQAAIcEACAFAACIBAAgBwAAiQQAIAsAAIoEACAPAACMBAAgEAAAjQQAIBYAAIoFACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIRIEAACHBAAgBQAAiAQAIAcAAIkEACALAACKBAAgDwAAjAQAIBAAAI0EACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIQa8AQEAAAABwQFAAAAAAcIBQAAAAAHcAQEAAAAB3gEBAAAAAd8BAQAAAAEIvAEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAc4BAgAAAAHQAQAAANABAtEBAQAAAAHSAQEAAAABA7wBAQAAAAHAAQEAAAABwQFAAAAAAQMAAACSAQAgHQAA9gQAIB4AAJAFACAHAAAAkgEAIBYAAJAFACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHWAQEAhQMAIeABAQDvAgAhBbwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdYBAQCFAwAh4AEBAO8CACEDAAAANAAgHQAA-AQAIB4AAJMFACAUAAAANAAgBAAAhwQAIAUAAIgEACALAACKBAAgDgAAiwQAIA8AAIwEACAQAACNBAAgFgAAkwUAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhEgQAAIcEACAFAACIBAAgCwAAigQAIA4AAIsEACAPAACMBAAgEAAAjQQAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACGBPkBIuABAQDvAgAh8wEBAO8CACH0ASAAjwMAIfUBAQCFAwAh9wEAAIUE9wEi-QEgAI8DACH6ASAAjwMAIfsBQAD6AwAhEwYAANkDACAJAADaAwAgCwAA2wMAIA4AANwDACAQAADeAwAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAADbAQLTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBIAAAAAHZAQgAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAABAgAAAA0AIB0AAJQFACASBAAA0wQAIAUAANQEACAHAADVBAAgCwAA1gQAIA4AANcEACAQAADZBAAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAAD5AQLgAQEAAAAB8wEBAAAAAfQBIAAAAAH1AQEAAAAB9wEAAAD3AQL5ASAAAAAB-gEgAAAAAfsBQAAAAAECAAAAAQAgHQAAlgUAIAMAAAALACAdAACUBQAgHgAAmgUAIBUAAAALACAGAACSAwAgCQAAkwMAIAsAAJQDACAOAACVAwAgEAAAlwMAIBYAAJoFACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAkQPbASLTAQEA7wIAIdQBAQDvAgAh1QEBAO8CACHWAQEA7wIAIdcBAQCFAwAh2AEgAI8DACHZAQgAkAMAIdsBAQCFAwAh3AEBAO8CACHdAQEA7wIAIRMGAACSAwAgCQAAkwMAIAsAAJQDACAOAACVAwAgEAAAlwMAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACRA9sBItMBAQDvAgAh1AEBAO8CACHVAQEA7wIAIdYBAQDvAgAh1wEBAIUDACHYASAAjwMAIdkBCACQAwAh2wEBAIUDACHcAQEA7wIAId0BAQDvAgAhAwAAADQAIB0AAJYFACAeAACdBQAgFAAAADQAIAQAAIcEACAFAACIBAAgBwAAiQQAIAsAAIoEACAOAACLBAAgEAAAjQQAIBYAAJ0FACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIRIEAACHBAAgBQAAiAQAIAcAAIkEACALAACKBAAgDgAAiwQAIBAAAI0EACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIRMGAADZAwAgCQAA2gMAIAsAANsDACAOAADcAwAgDwAA3QMAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA2wEC0wEBAAAAAdQBAQAAAAHVAQEAAAAB1gEBAAAAAdcBAQAAAAHYASAAAAAB2QEIAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAQIAAAANACAdAACeBQAgEgQAANMEACAFAADUBAAgBwAA1QQAIAsAANYEACAOAADXBAAgDwAA2AQAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA-QEC4AEBAAAAAfMBAQAAAAH0ASAAAAAB9QEBAAAAAfcBAAAA9wEC-QEgAAAAAfoBIAAAAAH7AUAAAAABAgAAAAEAIB0AAKAFACADAAAACwAgHQAAngUAIB4AAKQFACAVAAAACwAgBgAAkgMAIAkAAJMDACALAACUAwAgDgAAlQMAIA8AAJYDACAWAACkBQAgvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh0AEAAJED2wEi0wEBAO8CACHUAQEA7wIAIdUBAQDvAgAh1gEBAO8CACHXAQEAhQMAIdgBIACPAwAh2QEIAJADACHbAQEAhQMAIdwBAQDvAgAh3QEBAO8CACETBgAAkgMAIAkAAJMDACALAACUAwAgDgAAlQMAIA8AAJYDACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAkQPbASLTAQEA7wIAIdQBAQDvAgAh1QEBAO8CACHWAQEA7wIAIdcBAQCFAwAh2AEgAI8DACHZAQgAkAMAIdsBAQCFAwAh3AEBAO8CACHdAQEA7wIAIQMAAAA0ACAdAACgBQAgHgAApwUAIBQAAAA0ACAEAACHBAAgBQAAiAQAIAcAAIkEACALAACKBAAgDgAAiwQAIA8AAIwEACAWAACnBQAgvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh0AEAAIYE-QEi4AEBAO8CACHzAQEA7wIAIfQBIACPAwAh9QEBAIUDACH3AQAAhQT3ASL5ASAAjwMAIfoBIACPAwAh-wFAAPoDACESBAAAhwQAIAUAAIgEACAHAACJBAAgCwAAigQAIA4AAIsEACAPAACMBAAgvAEBAO8CACHBAUAA8QIAIcIBQADxAgAh0AEAAIYE-QEi4AEBAO8CACHzAQEA7wIAIfQBIACPAwAh9QEBAIUDACH3AQAAhQT3ASL5ASAAjwMAIfoBIACPAwAh-wFAAPoDACESBAAA0wQAIAUAANQEACAHAADVBAAgDgAA1wQAIA8AANgEACAQAADZBAAgvAEBAAAAAcEBQAAAAAHCAUAAAAAB0AEAAAD5AQLgAQEAAAAB8wEBAAAAAfQBIAAAAAH1AQEAAAAB9wEAAAD3AQL5ASAAAAAB-gEgAAAAAfsBQAAAAAECAAAAAQAgHQAAqAUAIBMGAADZAwAgCQAA2gMAIA4AANwDACAPAADdAwAgEAAA3gMAILwBAQAAAAHBAUAAAAABwgFAAAAAAdABAAAA2wEC0wEBAAAAAdQBAQAAAAHVAQEAAAAB1gEBAAAAAdcBAQAAAAHYASAAAAAB2QEIAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAQIAAAANACAdAACqBQAgAwAAADQAIB0AAKgFACAeAACuBQAgFAAAADQAIAQAAIcEACAFAACIBAAgBwAAiQQAIA4AAIsEACAPAACMBAAgEAAAjQQAIBYAAK4FACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIRIEAACHBAAgBQAAiAQAIAcAAIkEACAOAACLBAAgDwAAjAQAIBAAAI0EACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAhgT5ASLgAQEA7wIAIfMBAQDvAgAh9AEgAI8DACH1AQEAhQMAIfcBAACFBPcBIvkBIACPAwAh-gEgAI8DACH7AUAA-gMAIQMAAAALACAdAACqBQAgHgAAsQUAIBUAAAALACAGAACSAwAgCQAAkwMAIA4AAJUDACAPAACWAwAgEAAAlwMAIBYAALEFACC8AQEA7wIAIcEBQADxAgAhwgFAAPECACHQAQAAkQPbASLTAQEA7wIAIdQBAQDvAgAh1QEBAO8CACHWAQEA7wIAIdcBAQCFAwAh2AEgAI8DACHZAQgAkAMAIdsBAQCFAwAh3AEBAO8CACHdAQEA7wIAIRMGAACSAwAgCQAAkwMAIA4AAJUDACAPAACWAwAgEAAAlwMAILwBAQDvAgAhwQFAAPECACHCAUAA8QIAIdABAACRA9sBItMBAQDvAgAh1AEBAO8CACHVAQEA7wIAIdYBAQDvAgAh1wEBAIUDACHYASAAjwMAIdkBCACQAwAh2wEBAIUDACHcAQEA7wIAId0BAQDvAgAhCAQGAgUKAwcOBAgADQsoBw4pCA8qChArCwEDAAEBAwABBwYAAQgADAkABQsUBw4YCA8fChAjCwIHDwQIAAYBBxAAAgMAAQoABAUGAAEIAAkKAAQMGQgNGggBDRsAAgMAAQoABAIDAAEKAAQECyQADiUADyYAECcABwQsAAUtAAcuAAsvAA4wAA8xABAyAAAAAAMIABIjABMkABQAAAADCAASIwATJAAUAQMAAQEDAAEDCAAZIwAaJAAbAAAAAwgAGSMAGiQAGwEDAAEBAwABAwgAICMAISQAIgAAAAMIACAjACEkACIAAAADCAAoIwApJAAqAAAAAwgAKCMAKSQAKgAAAwgALyMAMCQAMQAAAAMIAC8jADAkADEDBgABCgAEDLIBCAMGAAEKAAQMuAEIAwgANiMANyQAOAAAAAMIADYjADckADgCBgABCQAFAgYAAQkABQUIAD0jAEAkAEGFAQA-hgEAPwAAAAAABQgAPSMAQCQAQYUBAD6GAQA_AgMAAQoABAIDAAEKAAQFCABGIwBJJABKhQEAR4YBAEgAAAAAAAUIAEYjAEkkAEqFAQBHhgEASAIDAAEKAAQCAwABCgAEAwgATyMAUCQAUQAAAAMIAE8jAFAkAFECAwABCgAEAgMAAQoABAMIAFYjAFckAFgAAAADCABWIwBXJABYEQIBEjMBEzYBFDcBFTgBFzoBGDwOGT0PGj8BG0EOHEIQH0MBIEQBIUUOJUgRJkkVJ0oCKEsCKUwCKk0CK04CLFACLVIOLlMWL1UCMFcOMVgXMlkCM1oCNFsONV4YNl8cN2ADOGEDOWIDOmMDO2QDPGYDPWgOPmkdP2sDQG0OQW4eQm8DQ3ADRHEORXQfRnUjR3ckSHgkSXskSnwkS30kTH8kTYEBDk6CASVPhAEkUIYBDlGHASZSiAEkU4kBJFSKAQ5VjQEnVo4BK1eQAQVYkQEFWZQBBVqVAQVblgEFXJgBBV2aAQ5emwEsX50BBWCfAQ5hoAEtYqEBBWOiAQVkowEOZaYBLmanATJnqAEIaKkBCGmqAQhqqwEIa6wBCGyuAQhtsAEObrEBM2-0AQhwtgEOcbcBNHK5AQhzugEIdLsBDnW-ATV2vwE5d8ABBHjBAQR5wgEEesMBBHvEAQR8xgEEfcgBDn7JATp_ywEEgAHNAQ6BAc4BO4IBzwEEgwHQAQSEAdEBDocB1AE8iAHVAUKJAdYBCooB1wEKiwHYAQqMAdkBCo0B2gEKjgHcAQqPAd4BDpAB3wFDkQHhAQqSAeMBDpMB5AFElAHlAQqVAeYBCpYB5wEOlwHqAUWYAesBS5kB7AELmgHtAQubAe4BC5wB7wELnQHwAQueAfIBC58B9AEOoAH1AUyhAfcBC6IB-QEOowH6AU2kAfsBC6UB_AELpgH9AQ6nAYACTqgBgQJSqQGCAgeqAYMCB6sBhAIHrAGFAgetAYYCB64BiAIHrwGKAg6wAYsCU7EBjQIHsgGPAg6zAZACVLQBkQIHtQGSAge2AZMCDrcBlgJVuAGXAlk"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var Role = {
  MEMBER: "MEMBER",
  ADMIN: "ADMIN"
};
var IdeaStatus = {
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var loadEnvVariables = () => {
  const env = process.env;
  const requireEnvVariable = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "FRONTEND_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
  ];
  const missingVariables = [];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      missingVariables.push(variable);
    }
  });
  if (missingVariables.length > 0) {
    const errorMsg = `\u274C Missing Environment Variables: ${missingVariables.join(", ")}. Please add them to your .env file or Vercel Project Settings.`;
    console.error(errorMsg);
    if (missingVariables.includes("DATABASE_URL") || missingVariables.includes("BETTER_AUTH_SECRET")) {
      throw new Error(errorMsg);
    }
  }
  return {
    NODE_ENV: env.NODE_ENV || "development",
    APP_NAME: env.APP_NAME || "EcoSpark",
    PORT: env.PORT || "5000",
    DATABASE_URL: env.DATABASE_URL,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET || "secret",
    ACCESS_TOKEN_EXPIRES_IN: env.ACCESS_TOKEN_EXPIRES_IN || "1d",
    REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET || "refresh_secret",
    REFRESH_TOKEN_EXPIRES_IN: env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    FRONTEND_URL: env.FRONTEND_URL,
    EMAIL_SENDER: {
      SMTP_USER: env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: env.EMAIL_SENDER_SMTP_FROM
    },
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      SECRET_KEY: env.STRIPE_SECRET_KEY,
      WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET
    },
    ADMIN_EMAIL: env.ADMIN_EMAIL,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD
  };
};
var envVars = loadEnvVariables();

// src/app/utils/email.ts
import status from "http-status";
import nodemailer from "nodemailer";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/templates/emailTemplate.ts
var generateEmailTemplate = ({
  templateName,
  appName,
  userName,
  otp,
  expierMinutes
}) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${templateName}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5e6f7;font-family:Arial,sans-serif;">
      
      <div style="max-width:600px;margin:40px auto;background:#dff9cb;border-radius:10px;padding:40px 30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);text-align:center;">
        
        <div style="font-size:22px;font-weight:bold;color:#2563eb;margin-bottom:20px;">
          ${appName}
        </div>

        <h2 style="color:#111827;margin-bottom:10px;">Email Verification</h2>

        <p style="color:#6b7280;font-size:15px;margin-bottom:25px;">
          Hello <strong>${userName}</strong>, <br />
          Use the following OTP to verify your email address.
        </p>

        <div style="display:inline-block;padding:15px 30px;font-size:28px;font-weight:bold;letter-spacing:8px;color:#ffffff;background:#62aafd;border-radius:8px;margin-bottom:25px;">
          ${otp}
        </div>

        <p style="color:#6b7280;font-size:15px;margin-bottom:25px;">
          This OTP is valid for <strong>${expierMinutes} minutes</strong>.
        </p>

        <div style="font-size:13px;color:#ef4444;margin-top:15px;">
          Do not share this code with anyone.
        </div>

        <div style="margin-top:30px;font-size:12px;color:#9ca3af;">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${appName}. All rights reserved.
        </div>

      </div>

    </body>
  </html>
  `;
};

// src/app/utils/email.ts
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to
}) => {
  try {
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html: generateEmailTemplate({
        templateName,
        appName: templateData.appName,
        userName: templateData.userName,
        otp: templateData.otp,
        expierMinutes: templateData.expierMinutes
      })
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/app/lib/auth.ts
import { bearer, emailOTP } from "better-auth/plugins";
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.MEMBER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`
            );
            return;
          }
          if (user && user.role === Role.ADMIN) {
            console.log(
              `User with email ${email} is a admin. Skipping sending verification OTP.`
            );
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "OTP",
              templateData: {
                userName: user.name,
                otp,
                expierMinutes: 3,
                appName: envVars.APP_NAME
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "OTP",
              templateData: {
                userName: user.name,
                otp,
                expierMinutes: 3,
                appName: envVars.APP_NAME
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
    envVars.FRONTEND_URL
  ],
  advanced: {
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/middlewares/globalErrorHandler.ts
import status3 from "http-status";
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
import status2 from "http-status";
var handleZodError = (err) => {
  const statusCode = status2.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middlewares/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status3.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status3.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middlewares/notFound.ts
import status4 from "http-status";
var notFound = (req, res) => {
  res.status(status4.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
import status16 from "http-status";

// src/app/routes/index.ts
import { Router as Router8 } from "express";

// src/app/modules/auth/auth.route.ts
import { Router } from "express";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/app/modules/auth/auth.service.ts
import status5 from "http-status";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const isEmailUsed = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });
  if (isEmailUsed) {
    throw new AppError_default(status5.UNAUTHORIZED, "This email already used");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password
    }
  });
  console.log("register data here", data);
  if (!data.user) {
    throw new AppError_default(status5.BAD_REQUEST, "Failed to register user");
  }
  try {
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    return {
      ...data,
      accessToken,
      refreshToken
    };
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: data.user.id
      }
    });
    throw error;
  }
};
var loginUser = async (payload) => {
  const data = await auth.api.signInEmail({
    body: {
      email: payload.email,
      password: payload.password
    }
  });
  console.log("login user data here ->", data);
  if (!data.user) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid email or password");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status5.UNAUTHORIZED, "User is deleted");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status5.UNAUTHORIZED, "User is blocked");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  console.log("\u2705 Login: All tokens created successfully");
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getMe = async (user) => {
  const result = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      ideas: {
        include: {
          comments: true,
          category: true,
          votes: true,
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  return result;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isExsistSessionToken = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isExsistSessionToken) {
    throw new AppError_default(status5.UNAUTHORIZED, "Session not found");
  }
  const verifyRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET
  );
  if (!verifyRefreshToken) {
    throw new AppError_default(status5.UNAUTHORIZED, "Refresh token not found");
  }
  const data = verifyRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status5.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    accessToken,
    refreshToken,
    ...result
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (payload) => {
  const { email, otp } = payload;
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.user && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        id: result.user.id
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status5.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (payload) => {
  const { email, otp, newPassword } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status5.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status5.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var AuthServices = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};
var sendResponse_default = sendResponse;

// src/app/modules/auth/auth.controller.ts
import status6 from "http-status";
var registerUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "User registered successfully and Check your email for verify",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var loginUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var getMe2 = catchAsync_default(async (req, res) => {
  const user = req.user;
  const result = await AuthServices.getMe(user);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result
  });
});
var getNewToken2 = catchAsync_default(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!refreshToken) {
    throw new AppError_default(status6.UNAUTHORIZED, "Refresh token not found");
  }
  const result = await AuthServices.getNewToken(
    refreshToken,
    betterAuthSessionToken
  );
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "New token generated successfully",
    data: result
  });
});
var changePassword2 = catchAsync_default(async (req, res) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthServices.changePassword(req.body, sessionToken);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Password changed successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var logoutUser2 = catchAsync_default(async (req, res) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthServices.logoutUser(sessionToken);
  CookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  CookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  CookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "User logged out successfully",
    data: result
  });
});
var verifyEmail2 = catchAsync_default(async (req, res) => {
  await AuthServices.verifyEmail(req.body);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Email verified successfully"
  });
});
var forgetPassword2 = catchAsync_default(async (req, res) => {
  await AuthServices.forgetPassword(req.body.email);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Password reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync_default(async (req, res) => {
  await AuthServices.resetPassword(req.body);
  sendResponse_default(res, {
    statusCode: status6.OK,
    success: true,
    message: "Password reset successfully"
  });
});
var handleOAuthError = catchAsync_default((req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  handleOAuthError
};

// src/app/modules/auth/auth.validation.ts
import { z as z2 } from "zod";
var registerValidationSchema = z2.object({
  name: z2.string("Name is required").trim().min(3, "Name must be at least 3 characters long"),
  email: z2.string("Email is required").trim().min(1, "Email is required").email("Invalid email address"),
  password: z2.string("Password is required").min(6, "Password must be at least 6 characters long")
});
var loginValidationSchema = z2.object({
  email: z2.string("Email is required").trim().min(1, "Email is required").email("Invalid email address"),
  password: z2.string("Password is required").min(6, "Password must be at least 6 characters long")
});
var AuthValidation = {
  registerValidationSchema,
  loginValidationSchema
};

// src/app/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      next(parseResult.error);
    }
    req.body = parseResult.data;
    next();
  };
};
var validateRequest_default = validateRequest;

// src/app/middlewares/checkAuth.ts
import status7 from "http-status";
var getSessionTokenFromRequest = (req) => {
  const cookieToken = CookieUtils.getCookie(req, "better-auth.session_token");
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return void 0;
};
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = getSessionTokenFromRequest(req);
    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided.");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
          throw new AppError_default(
            status7.UNAUTHORIZED,
            "Unauthorized access! User is not active."
          );
        }
        if (user.isDeleted) {
          throw new AppError_default(
            status7.UNAUTHORIZED,
            "Unauthorized access! User is deleted."
          );
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError_default(
            status7.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource."
          );
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email
        };
      }
      const accessToken2 = CookieUtils.getCookie(req, "accessToken");
      if (!accessToken2) {
        throw new AppError_default(
          status7.UNAUTHORIZED,
          "Unauthorized access! No access token provided."
        );
      }
    }
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(
        status7.UNAUTHORIZED,
        "Unauthorized access! No access token provided."
      );
    }
    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      envVars.ACCESS_TOKEN_SECRET
    );
    if (!verifiedToken.success) {
      throw new AppError_default(
        status7.UNAUTHORIZED,
        "Unauthorized access! Invalid access token."
      );
    }
    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
      throw new AppError_default(
        status7.FORBIDDEN,
        "Forbidden access! You do not have permission to access this resource."
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/auth/auth.route.ts
var router = Router();
router.post(
  "/register",
  validateRequest_default(AuthValidation.registerValidationSchema),
  AuthController.registerUser
);
router.post(
  "/login",
  validateRequest_default(AuthValidation.loginValidationSchema),
  AuthController.loginUser
);
router.get("/me", checkAuth(Role.MEMBER, Role.ADMIN), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth(Role.MEMBER, Role.ADMIN),
  AuthController.changePassword
);
router.post(
  "/logout",
  checkAuth(Role.MEMBER, Role.ADMIN),
  AuthController.logoutUser
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/oauth/error", AuthController.handleOAuthError);
var AuthRoutes = router;

// src/app/modules/category/category.route.ts
import { Router as Router2 } from "express";

// src/app/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(query) {
    this.query = query;
  }
  args = { where: {} };
  search(searchableFields) {
    const searchTerm = this.query.searchTerm;
    if (searchTerm) {
      this.args.where.OR = searchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" }
      }));
    }
    return this;
  }
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ["searchTerm", "sortBy", "sortOrder", "limit", "page", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    const andConditions = [];
    if (Object.keys(queryObj).length > 0) {
      for (const [key, value] of Object.entries(queryObj)) {
        if (value !== void 0 && value !== "") {
          if (value === "true" || value === "false") {
            andConditions.push({ [key]: value === "true" });
          } else {
            andConditions.push({ [key]: value });
          }
        }
      }
    }
    if (andConditions.length > 0) {
      this.args.where.AND = this.args.where.AND ? [...this.args.where.AND, ...andConditions] : andConditions;
    }
    return this;
  }
  sort() {
    let sortBy = "createdAt";
    let sortOrder = "desc";
    if (this.query.sortBy) sortBy = this.query.sortBy;
    if (this.query.sortOrder) sortOrder = this.query.sortOrder;
    this.args.orderBy = {
      [sortBy]: sortOrder
    };
    return this;
  }
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.args.skip = skip;
    this.args.take = limit;
    return this;
  }
  getArgs() {
    if (Object.keys(this.args.where).length === 0) {
      delete this.args.where;
    }
    return this.args;
  }
};
var QueryBuilder_default = QueryBuilder;

// src/app/modules/category/category.service.ts
var createCategory = async (payload) => {
  const category = await prisma.category.findUnique({
    where: {
      name: payload.name
    }
  });
  if (category) {
    throw new Error("Category already exists");
  }
  const result = await prisma.category.create({
    data: payload
  });
  return result;
};
var getCategories = async (query) => {
  const categoryQuery = new QueryBuilder_default(query).search(["name", "description"]).filter().sort().paginate();
  const args = categoryQuery.getArgs();
  const result = await prisma.category.findMany(args);
  const total = await prisma.category.count({
    where: args.where || {}
  });
  return {
    data: result,
    meta: {
      total,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 2,
      totalPage: Math.ceil(total / (Number(query.limit) || 10))
    }
  };
};
var CategoryServices = {
  createCategory,
  getCategories
};

// src/app/modules/category/category.controller.ts
var createCategory2 = catchAsync_default(async (req, res) => {
  const result = await CategoryServices.createCategory(req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category created successfully",
    data: result
  });
});
var getCategories2 = catchAsync_default(async (req, res) => {
  const result = await CategoryServices.getCategories(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result
  });
});
var CategoryController = {
  createCategory: createCategory2,
  getCategories: getCategories2
};

// src/app/modules/category/category.validation.ts
import z3 from "zod";
var createCategory3 = z3.object({
  name: z3.string("Name is required"),
  description: z3.string("Description is required")
});
var CategoryValidation = {
  createCategory: createCategory3
};

// src/app/modules/category/category.route.ts
var router2 = Router2();
router2.get("/", CategoryController.getCategories);
router2.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest_default(CategoryValidation.createCategory),
  CategoryController.createCategory
);
var CategoryRoutes = router2;

// src/app/modules/user/user.route.ts
import { Router as Router3 } from "express";

// src/app/modules/user/user.service.ts
import status8 from "http-status";
var getAllUsers = async (query) => {
  const userQuery = new QueryBuilder_default(query).search(["name", "email"]).filter().sort().paginate();
  const args = userQuery.getArgs();
  args.select = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true
  };
  const result = await prisma.user.findMany(args);
  const total = await prisma.user.count({ where: args.where });
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const totalPages = Math.ceil(total / limit);
  return {
    data: result,
    meta: { page, limit, total, totalPages }
  };
};
var updateUserRole = async (id, payload) => {
  const isExistUser = await prisma.user.findUnique({
    where: { id }
  });
  if (!isExistUser) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  const isValidRole = (role) => {
    return Object.values(Role).includes(role);
  };
  if (!isValidRole(payload.role)) {
    throw new AppError_default(status8.BAD_REQUEST, "Invalid role provided");
  }
  const result = await prisma.user.update({
    where: { id },
    data: {
      role: payload.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
  return result;
};
var UserService = {
  getAllUsers,
  updateUserRole
};

// src/app/modules/user/user.controller.ts
var getAllUsers2 = catchAsync_default(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data
  });
});
var updateUserRole2 = catchAsync_default(async (req, res) => {
  const result = await UserService.updateUserRole(req.params.id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "User role updated successfully",
    data: result
  });
});
var UserController = {
  getAllUsers: getAllUsers2,
  updateUserRole: updateUserRole2
};

// src/app/modules/user/user.route.ts
var router3 = Router3();
router3.get("/", checkAuth(Role.ADMIN), UserController.getAllUsers);
router3.patch("/:id/role", checkAuth(Role.ADMIN), UserController.updateUserRole);
var UserRoutes = router3;

// src/app/modules/idea/idea.route.ts
import { Router as Router4 } from "express";

// src/app/modules/idea/idea.service.ts
import status9 from "http-status";
var createIdea = async (payload, authorId) => {
  const result = await prisma.idea.create({
    data: {
      ...payload,
      authorId
    },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  return result;
};
var getAllIdeas = async (query) => {
  const ideaQuery = new QueryBuilder_default(query).search(["title", "problem", "solution", "description"]).filter().sort().paginate();
  const args = await ideaQuery.getArgs();
  if (args.orderBy) {
    if (args.orderBy.UPVOTE) {
      args.orderBy = {
        votes: {
          _count: args.orderBy.UPVOTE
        }
      };
    } else if (args.orderBy.COMMENT) {
      args.orderBy = {
        comments: {
          _count: args.orderBy.COMMENT
        }
      };
    }
  }
  args.include = {
    category: true,
    author: {
      select: {
        id: true,
        name: true
      }
    },
    _count: {
      select: {
        votes: true,
        comments: true
      }
    }
  };
  const result = await prisma.idea.findMany(args);
  const sanitizedResult = await Promise.all(
    result.map(async (idea) => {
      const upvotes = await prisma.vote.count({
        where: { ideaId: idea.id, type: "UPVOTE" }
      });
      const downvotes = await prisma.vote.count({
        where: { ideaId: idea.id, type: "DOWNVOTE" }
      });
      const processedIdea = {
        ...idea,
        _count: {
          ...idea._count,
          votes: upvotes - downvotes
        }
      };
      if (idea.isPaid) {
        return {
          ...processedIdea,
          problem: idea.problem.substring(0, 150) + "...",
          solution: "Hidden",
          description: idea.description.substring(0, 150) + "..."
        };
      }
      return processedIdea;
    })
  );
  const total = await prisma.idea.count({ where: args.where || {} });
  return {
    data: sanitizedResult,
    meta: {
      total,
      page: Number(query.page),
      limit: Number(query.limit)
    }
  };
};
var getIdeaById = async (id, userRole, userId) => {
  const result = await prisma.idea.findUnique({
    where: { id },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: { votes: true, comments: true }
      },
      comments: {
        include: {
          author: { select: { id: true, name: true } }
        }
      },
      votes: {
        where: { userId },
        select: { type: true }
      }
    }
  });
  if (!result) {
    throw new AppError_default(status9.NOT_FOUND, "Idea not found");
  }
  const upvotes = await prisma.vote.count({
    where: { ideaId: id, type: "UPVOTE" }
  });
  const downvotes = await prisma.vote.count({
    where: { ideaId: id, type: "DOWNVOTE" }
  });
  const finalResult = {
    ...result,
    _count: {
      ...result._count,
      votes: upvotes - downvotes
    }
  };
  if (result.isPaid) {
    let hasAccess = false;
    if (userRole === Role.ADMIN) {
      hasAccess = true;
    } else if (userId && result.authorId === userId) {
      hasAccess = true;
    } else if (userId) {
      const payment = await prisma.payment.findUnique({
        where: {
          userId_ideaId: { userId, ideaId: id }
        }
      });
      if (payment?.status === PaymentStatus.COMPLETED) {
        hasAccess = true;
      }
    }
    if (!hasAccess) {
      return {
        ...finalResult,
        problem: result.problem.substring(0, 150) + "...",
        solution: "Hidden",
        description: "Hidden",
        comments: [],
        isHidden: true,
        isPurchased: false
      };
    }
    return {
      ...finalResult,
      isHidden: false,
      isPurchased: true
    };
  }
  return {
    ...finalResult,
    isHidden: false,
    isPurchased: false
  };
};
var updateIdea = async (ideaId, payload, userId, userRole) => {
  const isExistIdea = await prisma.idea.findUnique({
    where: {
      id: ideaId
    },
    select: {
      id: true,
      authorId: true,
      status: true
    }
  });
  if (!isExistIdea) {
    throw new AppError_default(status9.NOT_FOUND, "Idea not found");
  }
  if (userRole !== Role.ADMIN && isExistIdea.authorId !== userId) {
    throw new AppError_default(
      status9.FORBIDDEN,
      "You are not authorized to update this idea"
    );
  }
  if (userRole === Role.MEMBER) {
    if (isExistIdea.status !== IdeaStatus.DRAFT) {
      throw new AppError_default(status9.FORBIDDEN, "You can only edit DRAFT ideas");
    }
    if (payload.status === IdeaStatus.APPROVED || payload.status === IdeaStatus.REJECTED) {
      throw new AppError_default(status9.FORBIDDEN, "You cannot set this status");
    }
  }
  const result = await prisma.idea.update({
    where: {
      id: ideaId
    },
    data: payload,
    include: {
      category: true
    }
  });
  return result;
};
var deleteIdea = async (ideaId, userId, userRole) => {
  const isExistIdea = await prisma.idea.findUnique({
    where: {
      id: ideaId
    },
    select: {
      id: true,
      authorId: true,
      status: true
    }
  });
  if (!isExistIdea) {
    throw new AppError_default(status9.NOT_FOUND, "Idea not found");
  }
  if (userRole !== Role.ADMIN && isExistIdea.authorId !== userId) {
    throw new AppError_default(
      status9.FORBIDDEN,
      "You are not authorized to delete this idea"
    );
  }
  if (userRole === Role.MEMBER) {
    if (isExistIdea.status !== IdeaStatus.DRAFT) {
      throw new AppError_default(status9.FORBIDDEN, "You can only delete DRAFT ideas");
    }
  }
  const result = await prisma.idea.delete({
    where: {
      id: ideaId
    }
  });
  return result;
};
var IdeaService = {
  getAllIdeas,
  createIdea,
  getIdeaById,
  updateIdea,
  deleteIdea
};

// src/app/modules/idea/idea.controller.ts
import { status as status10 } from "http-status";
var createIdea2 = catchAsync_default(async (req, res) => {
  const payload = req.body;
  const result = await IdeaService.createIdea(payload, req.user.userId);
  sendResponse_default(res, {
    statusCode: status10.CREATED,
    success: true,
    message: "Idea created successfully",
    data: result
  });
});
var getAllIdeas2 = catchAsync_default(async (req, res) => {
  const result = await IdeaService.getAllIdeas(req.query);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Ideas fetched successfully",
    data: result
  });
});
var getIdeaById2 = catchAsync_default(async (req, res) => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const result = await IdeaService.getIdeaById(
    req.params.id,
    userRole,
    userId
  );
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Idea fetched successfully",
    data: result
  });
});
var updateIdea2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const payload = req.body;
  const result = await IdeaService.updateIdea(
    id,
    payload,
    userId,
    userRole
  );
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Idea updated successfully",
    data: result
  });
});
var deleteIdea2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const result = await IdeaService.deleteIdea(id, userId, userRole);
  sendResponse_default(res, {
    statusCode: status10.OK,
    success: true,
    message: "Idea deleted successfully",
    data: result
  });
});
var IdeaController = {
  getAllIdeas: getAllIdeas2,
  createIdea: createIdea2,
  getIdeaById: getIdeaById2,
  updateIdea: updateIdea2,
  deleteIdea: deleteIdea2
};

// src/app/modules/idea/idea.validator.ts
import z4 from "zod";
var createIdeaValidator = z4.object({
  title: z4.string().min(1, "Title is required"),
  problem: z4.string().min(1, "Problem is required"),
  solution: z4.string().min(1, "Solution is required"),
  description: z4.string().min(1, "Description is required"),
  imageUrl: z4.string().optional(),
  isPaid: z4.boolean().optional(),
  price: z4.coerce.number().optional(),
  categoryId: z4.string().min(1, "Category is required")
});
var updateIdeaSchema = z4.object({
  title: z4.string().optional(),
  problem: z4.string().optional(),
  solution: z4.string().optional(),
  description: z4.string().optional(),
  imageUrl: z4.string().optional(),
  categoryId: z4.string().optional(),
  isPaid: z4.boolean().optional(),
  price: z4.number().optional(),
  status: z4.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional()
});
var IdeaValidator = {
  createIdeaValidator,
  updateIdeaSchema
};

// src/app/middlewares/extractAuthOptional.ts
var extractAuthOptional = async (req, res, next) => {
  try {
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (accessToken) {
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET
      );
      if (verifiedToken.success && verifiedToken.data) {
        req.user = {
          userId: verifiedToken.data.userId,
          role: verifiedToken.data.role,
          email: verifiedToken.data.email
        };
      }
    }
  } catch (error) {
    console.error(error);
  }
  next();
};

// src/app/modules/idea/idea.route.ts
var router4 = Router4();
router4.get("/", IdeaController.getAllIdeas);
router4.get("/:id", extractAuthOptional, IdeaController.getIdeaById);
router4.post(
  "/",
  checkAuth(Role.MEMBER),
  validateRequest_default(IdeaValidator.createIdeaValidator),
  IdeaController.createIdea
);
router4.patch(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest_default(IdeaValidator.updateIdeaSchema),
  IdeaController.updateIdea
);
router4.delete(
  "/:id",
  checkAuth(Role.MEMBER, Role.ADMIN),
  IdeaController.deleteIdea
);
var IdeaRoutes = router4;

// src/app/modules/vote/vote.route.ts
import { Router as Router5 } from "express";

// src/app/modules/vote/vote.service.ts
var castVote = async (ideaId, userId, type) => {
  const ExistingVote = await prisma.vote.findUnique({
    where: {
      ideaId_userId: {
        ideaId,
        userId
      }
    }
  });
  if (type === null) {
    if (ExistingVote) {
      await prisma.vote.delete({
        where: {
          ideaId_userId: {
            ideaId,
            userId
          }
        }
      });
      return null;
    }
  } else {
    if (ExistingVote) {
      if (ExistingVote.type !== type) {
        return await prisma.vote.update({
          where: { id: ExistingVote.id },
          data: { type }
        });
      }
      return ExistingVote;
    } else {
      return await prisma.vote.create({
        data: {
          ideaId,
          userId,
          type
        }
      });
    }
  }
};
var VoteService = {
  castVote
};

// src/app/modules/vote/vore.controller.ts
var castVote2 = catchAsync_default(async (req, res) => {
  const { ideaId } = req.params;
  const { type } = req.body;
  const userId = req.user?.userId;
  const vote = await VoteService.castVote(
    ideaId,
    userId,
    type
  );
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Vote cast successfully",
    data: vote
  });
});
var VoteController = {
  castVote: castVote2
};

// src/app/modules/vote/vote.route.ts
var router5 = Router5();
router5.post("/:ideaId/vote", checkAuth(Role.MEMBER, Role.ADMIN), VoteController.castVote);
var VoteRoutes = router5;

// src/app/modules/comment/comment.route.ts
import { Router as Router6 } from "express";

// src/app/modules/comment/comment.controller.ts
import { status as status12 } from "http-status";

// src/app/modules/comment/comment.service.ts
import status11 from "http-status";
var createComment = async (ideaId, userId, payload) => {
  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      ideaId,
      authorId: userId,
      ...payload.parentId && { parentId: payload.parentId }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return result;
};
var deleteComment = async (commentId, userId, role) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId
    }
  });
  if (!comment) {
    throw new AppError_default(status11.NOT_FOUND, "Comment not found");
  }
  if (comment.authorId !== userId && role !== Role.ADMIN) {
    throw new AppError_default(status11.FORBIDDEN, "You are not authorized to delete this comment");
  }
  const result = await prisma.comment.delete({
    where: {
      id: commentId
    }
  });
  return result;
};
var CommentService = {
  createComment,
  deleteComment
};

// src/app/modules/comment/comment.controller.ts
var createComment2 = catchAsync_default(async (req, res) => {
  const { ideaId } = req.params;
  const userId = req.user.userId;
  const result = await CommentService.createComment(ideaId, userId, req.body);
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Comment created successfully",
    data: result
  });
});
var deleteComment2 = catchAsync_default(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;
  const result = await CommentService.deleteComment(commentId, userId, role);
  sendResponse_default(res, {
    statusCode: status12.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result
  });
});
var CommentController = {
  createComment: createComment2,
  deleteComment: deleteComment2
};

// src/app/modules/comment/comment.validator.ts
import { z as z5 } from "zod";
var createComment3 = z5.object({
  content: z5.string("Content is required"),
  parentId: z5.string().nullable().optional()
});
var CommentValidation = {
  createComment: createComment3
};

// src/app/modules/comment/comment.route.ts
var router6 = Router6();
router6.post(
  "/:ideaId/comments",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest_default(CommentValidation.createComment),
  CommentController.createComment
);
router6.delete(
  "/:commentId",
  checkAuth(Role.MEMBER, Role.ADMIN),
  CommentController.deleteComment
);
var CommentRoutes = router6;

// src/app/modules/payment/payment.route.ts
import express from "express";

// src/app/modules/payment/payment.controller.ts
import status14 from "http-status";

// src/app/modules/payment/payment.service.ts
import status13 from "http-status";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.SECRET_KEY);

// src/app/modules/payment/payment.service.ts
var createPaymentIntent = async (userId, ideaId) => {
  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  if (!idea) throw new AppError_default(status13.NOT_FOUND, "Idea not found");
  if (!idea.isPaid) throw new AppError_default(status13.BAD_REQUEST, "Free idea");
  const existing = await prisma.payment.findUnique({
    where: { userId_ideaId: { userId, ideaId } }
  });
  if (existing?.status === PaymentStatus.COMPLETED) {
    throw new AppError_default(400, "Already paid");
  }
  const amount = Math.round((idea.price || 0) * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { userId, ideaId }
  });
  await prisma.payment.upsert({
    where: { userId_ideaId: { userId, ideaId } },
    update: {
      stripePaymentIntentId: paymentIntent.id,
      amount: idea.price ?? 0,
      status: PaymentStatus.PENDING
    },
    create: {
      userId,
      ideaId,
      amount: idea.price ?? 0,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id
    }
  });
  return { client_secret: paymentIntent.client_secret };
};
var checkPaymentStatus = async (userId, ideaId) => {
  const payment = await prisma.payment.findUnique({
    // Use findUnique if userId_ideaId is unique
    where: {
      userId_ideaId: { userId, ideaId }
    }
  });
  return payment?.status === PaymentStatus.COMPLETED;
};
var confirmWebhook = async (signature, payload) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError_default(400, err.message);
  }
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    await prisma.payment.update({
      where: { stripePaymentIntentId: intent.id },
      data: { status: PaymentStatus.COMPLETED }
    });
  }
  return { received: true };
};
var PaymentService = {
  createPaymentIntent,
  checkPaymentStatus,
  confirmWebhook
};

// src/app/modules/payment/payment.controller.ts
var createPayment = catchAsync_default(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId } = req.params;
  const data = await PaymentService.createPaymentIntent(
    userId,
    ideaId
  );
  console.log("create stripe payment ->", data);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Payment intent created",
    data: {
      client_secret: data.client_secret
    }
  });
});
var checkPaymentStatus2 = catchAsync_default(async (req, res) => {
  const userId = req.user.userId;
  const { ideaId } = req.params;
  const result = await PaymentService.checkPaymentStatus(
    userId,
    ideaId
  );
  sendResponse_default(res, {
    statusCode: status14.OK,
    success: true,
    message: "Payment intent created successfully",
    data: result
  });
});
var webhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const result = await PaymentService.confirmWebhook(
    signature,
    req.body
    // MUST be Buffer
  );
  res.status(200).json(result);
};
var PaymentController = {
  createPayment,
  checkPaymentStatus: checkPaymentStatus2,
  // handleWebhook,
  webhook
};

// src/app/modules/payment/payment.route.ts
var router7 = express.Router();
router7.post(
  "/:ideaId/pay",
  checkAuth(Role.ADMIN, Role.MEMBER),
  PaymentController.createPayment
);
router7.get(
  "/:ideaId/status",
  checkAuth(Role.ADMIN, Role.MEMBER),
  PaymentController.checkPaymentStatus
);
var PaymentRoutes = router7;

// src/app/modules/admin/admin.route.ts
import { Router as Router7 } from "express";

// src/app/modules/admin/admin.controller.ts
import status15 from "http-status";

// src/app/modules/admin/admin.service.ts
var getAdminStatsFromDB = async () => {
  const [totalUsers, totalIdeas, totalPayments] = await Promise.all([
    prisma.user.count({
      where: {
        isDeleted: false
      }
    }),
    prisma.idea.count(),
    prisma.payment.count({
      where: {
        status: "COMPLETED"
      }
    })
  ]);
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });
  const recentIdeas = await prisma.idea.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });
  const recentActivity = [
    ...recentUsers.map((u) => ({
      id: u.id,
      type: "USER_JOINED",
      message: `New user joined: ${u.name}`,
      timestamp: u.createdAt
    })),
    ...recentIdeas.map((i) => ({
      id: i.id,
      type: "IDEA_CREATED",
      message: `New idea created: ${i.title} by ${i.author.name}`,
      timestamp: i.createdAt
    })),
    ...recentPayments.map((p) => ({
      id: p.id,
      type: "PAYMENT_RECEIVED",
      message: `Payment received: $${p.amount / 100} from ${p.user.name}`,
      timestamp: p.createdAt
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  return {
    totalUsers,
    totalIdeas,
    totalPayments,
    recentActivity
  };
};
var AdminService = {
  getAdminStatsFromDB
};

// src/app/modules/admin/admin.controller.ts
var getAdminStats = catchAsync_default(async (req, res) => {
  const result = await AdminService.getAdminStatsFromDB();
  sendResponse_default(res, {
    statusCode: status15.OK,
    success: true,
    message: "Admin stats fetched successfully",
    data: result
  });
});
var AdminController = {
  getAdminStats
};

// src/app/modules/admin/admin.route.ts
var router8 = Router7();
router8.get(
  "/stats",
  checkAuth(Role.ADMIN),
  AdminController.getAdminStats
);
var AdminRoutes = router8;

// src/app/routes/index.ts
var router9 = Router8();
router9.use("/auth", AuthRoutes);
router9.use("/categories", CategoryRoutes);
router9.use("/users", UserRoutes);
router9.use("/ideas", IdeaRoutes);
router9.use("/votes", VoteRoutes);
router9.use("/comments", CommentRoutes);
router9.use("/payments", PaymentRoutes);
router9.use("/admin", AdminRoutes);
var ApplicationRoutes = router9;

// src/app.ts
import { toNodeHandler } from "better-auth/node";
var app = express2();
app.post(
  "/api/v1/webhook",
  express2.raw({ type: "application/json" }),
  PaymentController.webhook
);
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
      "https://ecospark-client-seven.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express2.json());
app.use(cookieParser());
app.use(express2.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(status16.OK).json({ success: true, message: "Welcome to EcoSpark_Hub API" });
});
app.all("/api/auth", toNodeHandler(auth));
app.use("/api/v1", ApplicationRoutes);
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
