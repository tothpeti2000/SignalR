import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";
import { ApiAuthorizationModule } from "src/api-authorization/api-authorization.module";
import { AuthorizeGuard } from "src/api-authorization/authorize.guard";
import { AuthorizeInterceptor } from "src/api-authorization/authorize.interceptor";
import { LobbyComponent } from "./lobby/lobby.component";
import { ChatStreamComponent } from "./chat-stream/chat-stream.component";
import { RoomComponent } from "./room/room.component";
import { ToastComponent } from "./toast/toast.component";
import { PasskeyModalComponent } from './passkey-modal/passkey-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LobbyComponent,
    ChatStreamComponent,
    RoomComponent,
    ToastComponent,
    PasskeyModalComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: "ng-cli-universal" }),
    HttpClientModule,
    FormsModule,
    ApiAuthorizationModule,
    RouterModule.forRoot([
      { path: "", component: HomeComponent, pathMatch: "full" },
      {
        path: "lobby",
        component: LobbyComponent,
        canActivate: [AuthorizeGuard],
      },
      { path: "room/:id", component: RoomComponent },
    ]),
    NgbModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
