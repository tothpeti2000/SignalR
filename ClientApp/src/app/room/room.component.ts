import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Message, User } from "../models";
import { HubBuilderService } from "../services/hub-builder.service";

@Component({
  selector: "app-room",
  templateUrl: "./room.component.html",
  styleUrls: ["./room.component.css"],
})
export class RoomComponent {
  id: string;
  members: User[];

  roomMessages: Message[];
  roomLoading = false;

  chatMessage: string;

  connection: signalR.HubConnection;

  constructor(
    private route: ActivatedRoute,
    private hubBuilder: HubBuilderService
  ) {
    this.route.params.subscribe((p) => {
      this.id = p["id"];
    });

    this.connection = this.hubBuilder.getConnection();

    // Register the server-sent event handlers
    this.connection.on("SetUsers", (users) => this.setUsers(users));
    this.connection.on("UserEntered", (user) => this.userEntered(user));
    this.connection.on("UserLeft", (userId) => this.userLeft(userId));
    this.connection.on("SetMessages", (messages) => this.setMessages(messages));
    this.connection.on("RecieveMessage", (message) =>
      this.recieveMessage(message)
    );

    this.members = [];
    this.roomMessages = [];

    this.connection
      .start()
      .then(() => this.connection.invoke("EnterRoom", this.id));
  }

  ngOnDestroy() {
    // Unsubscribe the event handlers to avoid memory leak
    this.connection.off("SetUsers");
    this.connection.off("UserEntered");
    this.connection.off("UserLeft");
    this.connection.off("SetMessages");
    this.connection.off("RecieveMessage");
    this.connection.off("RoomCreated");

    this.connection.stop();
  }

  recieveMessage(message: Message) {
    console.log(`receiveMessage ${this.id}`, message);

    this.roomMessages.splice(0, 0, message);
  }

  userEntered(user: User) {
    // A new user entered the current room
    console.log(`userEntered ${this.id}`, user);

    this.members.push(user);
  }

  userLeft(userId: string) {
    // The user with the given ID left the room
    console.log(`userLeft ${this.id}`, userId);

    const idx = this.members.findIndex((user) => user.id === userId);
    this.members.splice(idx, 1);
  }

  setUsers(users: User[]) {
    // After entering the lobby, the server sends the list of all users
    console.log(`setUsers ${this.id}`, users);

    this.members = users;
  }

  setMessages(messages: Message[]) {
    // After entering the lobby, the server sends the list of all messages
    console.log(`setMessages ${this.id}`, messages);

    this.roomMessages = messages.reverse();
  }

  sendMessage() {
    console.log(`sendMessage ${this.id}`);

    this.connection.invoke("SendMessageToRoom", this.chatMessage, this.id);
    this.chatMessage = "";
  }
}
