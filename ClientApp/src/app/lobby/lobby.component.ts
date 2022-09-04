import { Component, OnInit, OnDestroy } from '@angular/core';
import { Room, User, Message } from '../models';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  activeTab: 'rooms' | 'peeps' = 'peeps';

  rooms: Room[];
  peeps: User[];

  newRoomName: string;
  newRoomIsPrivate: boolean = false;
  newRoomPasskey: string;

  lobbyMessages: Message[];
  lobbyLoading: boolean = false;

  chatMessage: string;

  constructor() {
    // TODO: felépíteni a SignalR kapcsolatot
    // TODO: bekötni a szerverről érkező lobby üzenetek érkezését
  }

  ngOnInit() {
    setTimeout(() => {
      this.lobbyMessages = [
        { postedDate: "2018-10-08T10:12:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:13:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:13:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello! This message is quite a little bit longer than the others just like this." },
        { postedDate: "2018-10-08T10:13:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "57d7e0a3-94ad-4f06-8340-82ce874f7087", senderName: "Jamie Doe", text: "Hello!" },
        { postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" }
      ].reverse();
    }, 1000);

    setTimeout(() => {
      this.recieveMessage({ postedDate: "2018-10-08T10:14:28.779Z", senderId: "asdasd", senderName: "Johnny Doe", text: "Hello!" });
    }, 3000);
  }

  ngOnDestroy() {
  }

  recieveMessage(message: Message) {
    // TODO: beérkező üzenet kezelése
  }

  userEntered(user: User) {
    // TODO: felhasználók frissítése
  }

  userLeft(userId: string) {
    // TODO: felhasználók frissítése
  }

  setUsers(users: User[]) {
    // TODO: a felhasználók beállítása
  }

  setMessages(messages: Message[]) {
    // TODO: az üzenetek beállítása
  }

  sendMessage() {
    // TODO: üzenet küldése a szerverre
  }

  createRoom() {
    // TODO: szoba létrehozása szerveren, majd navigáció a szoba útvonalára, szükség esetén megadni a passkey-t
  }

  roomCreated(room: Room) {
    // TODO: szobalista frissítése
  }

  roomAbandoned(roomName: string) {
    // TODO: szobalista frissítése
  }

  enterRoom(room: Room) {
    // TODO: navigáció a szoba útvonlára, figyelve, hogy kell-e megadni passkey-t
  }
}
