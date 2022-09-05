import { Injectable } from "@angular/core";
import * as signalR from "@microsoft/signalr";

@Injectable({
  providedIn: "root",
})
export class HubBuilderService {
  getConnection() {
    return new signalR.HubConnectionBuilder()
      .withUrl("/chattrhub")
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
}
