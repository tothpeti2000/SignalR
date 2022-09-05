import { Component, OnDestroy, OnInit } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { Message, Room, User } from "../models";
import { HubBuilderService } from "../services/hub-builder.service";

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.css"],
})
export class LobbyComponent implements OnInit, OnDestroy {
  activeTab: "rooms" | "peeps" = "peeps";

  rooms: Room[];
  peeps: User[];

  newRoomName: string;
  newRoomIsPrivate = false;
  newRoomPasskey: string;

  lobbyMessages: Message[];
  lobbyLoading = false;

  chatMessage: string;

  connection: signalR.HubConnection;

  constructor(hubBuilder: HubBuilderService) {
    this.connection = hubBuilder.getConnection();

    // Register the server-sent event handlers
    this.connection.on("SetUsers", (users) => this.setUsers(users));
    this.connection.on("UserEntered", (user) => this.userEntered(user));
    this.connection.on("UserLeft", (userId) => this.userLeft(userId));
    this.connection.on("SetMessages", (messages) => this.setMessages(messages));
    this.connection.on("RecieveMessage", (message) =>
      this.recieveMessage(message)
    );
    // TODO: Add additional event handlers

    this.peeps = [];
    this.lobbyMessages = [];

    this.connection.start().then(() => this.connection.invoke("EnterLobby"));
  }

  ngOnInit() {}

  ngOnDestroy() {
    // Unsubscribe the event handlers to avoid memory leak
    this.connection.off("SetUsers");
    this.connection.off("UserEntered");
    this.connection.off("UserLeft");
    this.connection.off("SetMessages");
    this.connection.off("RecieveMessage");
    // TODO: Unsubscribe additional event handlers

    this.connection.stop();
  }

  recieveMessage(message: Message) {
    this.lobbyMessages.splice(0, 0, message);
  }

  userEntered(user: User) {
    // a szerver azt jelezte, hogy az aktuális szobába csatlakozott egy user. Ezt el kell
    // tárolnunk a felhasználókat tároló tömbben.
    this.peeps.push(user);
  }

  userLeft(userId: string) {
    // a szerver azt jelezte, hogy a megadott ID-jú felhasználó elhagyta a szobát, így ki kell
    // vennünk a felhasználót a felhasználók tömbjéből ID alapján.
    delete this.peeps[userId];
  }

  setUsers(users: User[]) {
    // A szerver belépés után leküldi nekünk a teljes user listát:
    this.peeps = users;
  }

  setMessages(messages: Message[]) {
    // A szerver belépés után leküldi nekünk a korábban érkezett üzeneteket:
    this.lobbyMessages = messages;
  }

  sendMessage() {
    // A szervernek az invoke függvény meghívásával tudunk küldeni üzenetet.
    this.connection.invoke("SendMessageToLobby", this.chatMessage);
    // A kérés szintén egy Promise, tehát feliratkoztathatnánk rá eseménykezelőt, ami akkor sül el, ha
    // a szerver jóváhagyta a kérést (vagy esetleg hibára futott). A szerver egyes metódusai Task
    // helyett Task<T>-vel is visszatérhetnek, ekkor a válasz eseménykezelőjében megkapjuk a válasz
    // objektumot is:
    // this.connection.invoke("SendMessageToLobby", this.chatMessage)
    // .then((t: T) => {
    // console.log(t);
    // })
    // .catch(console.error);
    this.chatMessage = "";
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
