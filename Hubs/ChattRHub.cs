using ChattR.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChattR.Hubs
{
    [Authorize]
    public class ChattRHub : Hub<IChattRClient>
    {
        public const string LobbyName = "ChattRLobby";

        public static HubRoom Lobby { get; } = new()
        {
            Name = LobbyName
        };

        public static Dictionary<string, HubRoom> Rooms { get; } = new();

        // TODO: a szobakezelést érdemes a beépített Group mechanizmus segítségével kezelni, de az
        // kizárólag a klienseknek történő válaszok küldésére használható. A Group ID alapján
        // automatikusan "létrejön", ha egy felhasználó belép, és "megszűnik", ha az utolsó is kilép.
        // Ezért szükséges egy saját adatstruktúrában is eltárolnunk a szobákat, hogy a felhasználók
        // adatait és a korábbi üzeneteket meg tudjuk jegyezni. A ChattRHub nem singleton, minden
        // kéréshez egy ChattRHub objektum példányosodik. A legegyszerűbb megoldás egy statikus
        // objektumban tárolni itt az adatokat, de ez éles környezetben nem lenne optimális, helyette
        // egy singleton service-ben kellene az adatokat kezelnünk. A laboron a statikus megoldás
        // teljesen megfelel, de legyünk tisztában a "static smell" jelenséggel; állapotot megosztani
        // explicit érdemes, tehát függőséginjektálással, nem "láthatatlan" statikus függőségekkel.
        public async Task EnterLobby()
        {
            var user = new User
            {
                Id = GetUserIdFromContext(),
                Username = Context.User.Identity.Name
            };

            Lobby.Users.Add(user);

            await Clients.Group(LobbyName)
                .UserEntered(user);

            await Groups.AddToGroupAsync(Context.ConnectionId, LobbyName);

            await Clients.Caller.SetUsers(Lobby.Users);
            await Clients.Caller.SetMessages(Lobby.Messages);
            await Clients.Caller.SetRooms(Lobby.Rooms);
        }

        public async Task SendMessageToLobby(string message)
        {
            var messageInstance = new Message
            {
                SenderId = GetUserIdFromContext(),
                SenderName = Context.User.Identity.Name,
                Text = message,
                PostedDate = DateTimeOffset.Now
            };

            Lobby.Messages.Add(messageInstance);

            await Clients.Group(LobbyName)
                .RecieveMessage(messageInstance);
        }

        public async Task SendMessageToRoom(string message, string roomId)
        {
            var messageInstance = new Message
            {
                SenderId = GetUserIdFromContext(),
                SenderName = Context.User.Identity.Name,
                Text = message,
                PostedDate = DateTimeOffset.Now
            };

            Rooms[roomId].Messages.Add(messageInstance);

            await Clients.Group(roomId)
                .RecieveMessage(messageInstance);
        }

        public async Task CreateRoom(RoomDto roomDto)
        {
            // The room names must be unique
            if (Rooms.ContainsKey(roomDto.Name))
            {
                throw new HubException("A room with the given name already exists");
            }

            var room = new HubRoom
            {
                Name = roomDto.Name,
                CreatorId = GetUserIdFromContext(),
                Passkey = roomDto.Passkey,
            };

            Rooms.Add(room.Name, room);

            var createdRoom = new Room
            {
                Name = room.Name,
                CreationDate = DateTimeOffset.Now,
                RequiresPasskey = !string.IsNullOrEmpty(room.Passkey)
            };

            Lobby.Rooms.Add(createdRoom);

            await Clients.Group(LobbyName)
                .RoomCreated(createdRoom);

            await Clients.Caller
                .NavigateToRoom(createdRoom);
        }

        public async Task<bool> CheckRoomPasskey(string roomId, string passkey)
        {
            var room = Rooms[roomId];
            return room.Passkey == passkey;
        }

        public async Task EnterRoom(string roomName)
        {
            var user = new User
            {
                Id = GetUserIdFromContext(),
                Username = Context.User.Identity.Name
            };

            var room = Rooms[roomName];

            room.Users.Add(user);

            await Clients.Group(roomName)
                .UserEntered(user);

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

            await Clients.Caller.SetUsers(room.Users);
            await Clients.Caller.SetMessages(room.Messages);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            // Lobby
            var user = Lobby.Users
                .FirstOrDefault(u => u.Id == GetUserIdFromContext());

            if (user != null)
            {
                Lobby.Users.Remove(user);

                Clients.Group(LobbyName)
                    .UserLeft(user.Id);
            }

            // Room
            foreach (var roomId in Rooms.Keys)
            {
                var room = Rooms[roomId];

                var roomContainsUser = room.Users
                    .Any(user => user.Id == GetUserIdFromContext());

                if (roomContainsUser)
                {
                    LeaveRoom(room.Name);
                }
            }

            return base.OnDisconnectedAsync(exception);
        }

        private void LeaveRoom(string roomId)
        {
            var room = Rooms[roomId];
            var user = room.Users
                .FirstOrDefault(u => u.Id == GetUserIdFromContext());

            if (user != null)
            {
                room.Users.Remove(user);

                Clients.Group(roomId)
                    .UserLeft(user.Id);
            }

            if (room.Users.Count == 0)
            {
                var lobbyRoom = Lobby.Rooms
                    .FirstOrDefault(r => r.Name == room.Name);

                if (lobbyRoom != null)
                {
                    Lobby.Rooms.Remove(lobbyRoom);
                    Rooms.Remove(room.Name);

                    Clients.Group(LobbyName)
                        .RoomAbandoned(room.Name);
                }
            }
        }

        private string GetUserIdFromContext()
        {
            return Context.User.Claims.ElementAt(0).Value;
        }
    }

    public class HubRoom
    {
        public string Name { get; set; }
        public string CreatorId { get; set; }
        public string Passkey { get; set; }
        public List<Message> Messages { get; } = new();
        public List<User> Users { get; } = new();
        public List<Room> Rooms { get; } = new();
    }
}
