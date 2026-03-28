import { IdeaStatus } from "../../../generated/prisma/enums";

export interface CreateIdeaPayload {
  title: string;
  problem: string;
  solution: string;
  description: string;
  imageUrl?: string;
  isPaid?: boolean;
  price?: number;
  categoryId: string;
}

export interface UpdateIdeaPayload {
  title?: string;
  problem?: string;
  solution?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  isPaid?: boolean;
  price?: number;
  status?: IdeaStatus;
}
