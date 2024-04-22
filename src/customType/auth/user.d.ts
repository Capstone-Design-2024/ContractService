export interface UserAuthInfo {
  name: string;
  email: string;
  password: string;
  address: string;
  profile_url: string;
  member_id: number;
  role: string;
}

export interface UserSignInInfo {
  email: string;
  password: string;
}

export interface UserInfo {
  member_id: number;
}
