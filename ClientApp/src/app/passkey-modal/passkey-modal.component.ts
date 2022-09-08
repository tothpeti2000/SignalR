import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PasskeyData } from ".";
import { Room } from "../models";

@Component({
  selector: "app-passkey-modal",
  templateUrl: "./passkey-modal.component.html",
  styleUrls: ["./passkey-modal.component.css"],
})
export class PasskeyModalComponent {
  roomName: string;

  passkey: string;
  passkeyValid = true;

  @Output() passkeyEntered = new EventEmitter();

  constructor(private modalService: NgbModal) {}

  @ViewChild("modal", { static: false }) modal: any;

  openModal(room: Room) {
    this.roomName = room.name;
    this.modalService.open(this.modal);
  }

  checkPasskey() {
    if (this.passkey) {
      this.passkeyEntered.emit({
        roomName: this.roomName,
        passkey: this.passkey,
      } as PasskeyData);
    }
  }
}
