import { Injectable } from "@angular/core";

type ToastType = "success" | "warning" | "error";

interface ToastOptions {
  type: ToastType;
  message: string;
  visible: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AlertService {
  options: ToastOptions = {
    type: "success",
    message: "",
    visible: false,
  };

  showToast(type: ToastType, message: string) {
    this.options = {
      ...this.options,
      type: type,
      message: message,
    };

    console.log(this.options);
  }
}
