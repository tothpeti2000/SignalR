import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  id: string;
  constructor(private route: ActivatedRoute) {
    route.params.subscribe(p => {
      this.id = p["id"];
    });
  }

  ngOnInit() {
  }

}
