export type Role = "ops_user" | "admin";

export interface User {
  user_id: string;
  email: string;
  role: Role;
}


