export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  
  // Backward compatibility fields
  name?: string;
  email?: string;
  avatarUrl?: string;
}

