
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userTag: string;
      image?: string;
      isAdmin?: boolean;
      adminRole?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    userTag: string;
    image?: string;
    isAdmin?: boolean;
    adminRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userTag: string;
    isAdmin?: boolean;
    adminRole?: string;
  }
}
