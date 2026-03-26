import { auth } from "../../lib/auth";

interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

const registerUser = async (payload: IRegisterUser) => {
  const user = await auth.api.signUpEmail({
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    },
  });
  return user;
};

const getAllUsers = async () => {
  return "All users";
};

export const AuthServices = {
  registerUser,
  getAllUsers,
};
