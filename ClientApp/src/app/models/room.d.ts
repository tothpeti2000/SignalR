export interface Room {
  name: string;
  creationDate: string;
  requiresPasskey: boolean;
}

export interface RoomDto {
  name: string;
  passkey?: string;
}
