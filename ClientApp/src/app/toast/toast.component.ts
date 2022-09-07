import { Component } from "@angular/core";
import { AlertService } from "../services/alert.service";

@Component({
  selector: "app-toast",
  templateUrl: "./toast.component.html",
  styleUrls: ["./toast.component.css"],

  host: {
    class: "toast-container",
    style: "z-index: 1200",
  },
})
export class ToastComponent {
  get bgColor() {
    const type = this.alertService.options.type;
    return `bg-${type}`;
  }

  get message() {
    return this.alertService.options.message;
  }

  constructor(private alertService: AlertService) {}
}
