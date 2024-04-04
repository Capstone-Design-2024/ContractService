export interface UserAuthInfo {
  name: string;
  email: string;
  pwd: string;
  address: string;
  profile_url: string;
  member_id: number;
}

export interface UserSignInInfo {
  email: string;
  pwd: string;
}

export interface UserInfo {
  member_id: number;
}
