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
        public const string LobbyRoomName = "ChattRLobby";
        public static HubRoom Lobby { get; } = new()
        {
            Name = LobbyRoomName
        };

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
            var user = new User { 
                Id = Context.UserIdentifier, 
                Username = Context.User.Identity.Name 
            };

            Lobby.Users.Add(user);

            // Megvizsgálhatjuk a Client objekumot: ezen keresztül érjük el a hívó klienst (Caller),
            // adott klienseket tudunk megszólítani pl. ConnectionId vagy UserIdentifier alapján, vagy
            // használhatjuk a beépített csoport (Group) mechanizmust felhasználói csoportok kezelésére.
            await Clients
                .Group(LobbyRoomName)
                // A Client típusunk a fent megadott típusparaméter, ezeket a függvényeket tudjuk
                // meghívni a kliense(ke)n.
                .UserEntered(user);

            await Groups.AddToGroupAsync(Context.ConnectionId, LobbyRoomName);
            await Clients.Caller.SetUsers(Lobby.Users);
            await Clients.Caller.SetMessages(Lobby.Messages);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var user = Lobby.Users
                .FirstOrDefault(u => u.Id == Context.UserIdentifier);

            if (user != null)
            {
                Lobby.Users.Remove(user);
            }
                
            // TODO: később a saját szobakezelés kapcsán is kezelni kell a kilépő klienseket
            Clients.Group(LobbyRoomName).UserLeft(Context.UserIdentifier);

            return base.OnDisconnectedAsync(exception);
        }
    }

    public class HubRoom
    {
        public string Name { get; set; }
        public string CreatorId { get; set; }
        public string Passkey { get; set; }
        public List<Message> Messages { get; } = new List<Message>();
        public List<User> Users { get; } = new List<User>();
    }
}
