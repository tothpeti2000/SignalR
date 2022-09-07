import { Component, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import * as signalR from "@microsoft/signalr";
import { Message, Room, User } from "../models";
import { RoomDto } from "../models/room";
import { AlertService } from "../services/alert.service";
import { HubBuilderService } from "../services/hub-builder.service";

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.css"],
})
export class LobbyComponent implements OnDestroy {
  activeTab: "rooms" | "peeps" = "peeps";

  rooms: Room[];
  peeps: User[];

  newRoomName: string;
  newRoomIsPrivate = false;
  newRoomPasskey: string;
  duplicateRoomName = false;

  lobbyMessages: Message[];
  lobbyLoading = false;

  chatMessage: string;

  connection: signalR.HubConnection;

  constructor(
    private hubBuilder: HubBuilderService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.connection = this.hubBuilder.getConnection();

    // Register the server-sent event handlers
    this.connection.on("SetUsers", (users) => this.setUsers(users));
    this.connection.on("UserEntered", (user) => this.userEntered(user));
    this.connection.on("UserLeft", (userId) => this.userLeft(userId));
    this.connection.on("SetMessages", (messages) => this.setMessages(messages));
    this.connection.on("RecieveMessage", (message) =>
      this.recieveMessage(message)
    );
    this.connection.on("RoomCreated", (room) => this.roomCreated(room));
    this.connection.on("SetRooms", (rooms) => this.setRooms(rooms));
    this.connection.on("EnterRoom", (room) => this.enterRoom(room));
    this.connection.on("RoomAbandoned", (roomName) =>
      this.roomAbandoned(roomName)
    );

    this.rooms = [];
    this.peeps = [];
    this.lobbyMessages = [];

    this.connection.start().then(() => this.connection.invoke("EnterLobby"));
  }

  ngOnDestroy() {
    // Unsubscribe the event handlers to avoid memory leak
    this.connection.off("SetUsers");
    this.connection.off("UserEntered");
    this.connection.off("UserLeft");
    this.connection.off("SetMessages");
    this.connection.off("RecieveMessage");
    this.connection.off("RoomCreated");
    this.connection.on("SetRooms", (rooms) => this.setRooms(rooms));
    this.connection.on("EnterRoom", (room) => this.enterRoom(room));
    this.connection.off("RoomAbandoned");

    this.connection.stop();
  }

  recieveMessage(message: Message) {
    console.log("receiveMessage lobby", message);

    this.lobbyMessages.splice(0, 0, message);
  }

  userEntered(user: User) {
    // A new user entered the current room
    console.log("userEntered lobby", user);

    this.peeps.push(user);
  }

  userLeft(userId: string) {
    // The user with the given ID left the room
    console.log("userLeft lobby", userId);

    const idx = this.peeps.findIndex((user) => user.id === userId);
    this.peeps.splice(idx, 1);
  }

  setRooms(rooms: Room[]) {
    console.log("setRooms lobby", rooms);

    this.rooms = rooms;
  }

  setUsers(users: User[]) {
    // After entering the lobby, the server sends the list of all users
    console.log("setUsers lobby", users);

    this.peeps = users;
  }

  setMessages(messages: Message[]) {
    // After entering the lobby, the server sends the list of all messages
    console.log("setMessages lobby", messages);

    this.lobbyMessages = messages.reverse();
  }

  sendMessage() {
    console.log("sendMessage lobby");

    this.connection.invoke("SendMessageToLobby", this.chatMessage);
    this.chatMessage = "";
  }

  createRoom() {
    console.log("createRoom lobby");

    const newRoom: RoomDto = {
      name: this.newRoomName,
      passkey: this.newRoomPasskey,
    };

    this.connection
      .invoke("CreateRoom", newRoom)
      .catch(() => (this.duplicateRoomName = true));

    this.newRoomName = "";
  }

  roomCreated(room: Room) {
    console.log("roomCreated lobby", room);

    this.rooms.push(room);
  }

  roomAbandoned(roomName: string) {
    console.log("roomAbandoned lobby", roomName);

    const idx = this.rooms.findIndex((room) => room.name === roomName);
    this.rooms.splice(idx, 1);
  }

  enterRoom(room: Room) {
    console.log("enterRoom lobby", room);
    // TODO: navigáció a szoba útvonlára, figyelve, hogy kell-e megadni passkey-t

    this.router.navigate(["room", room.name]);
  }
}
