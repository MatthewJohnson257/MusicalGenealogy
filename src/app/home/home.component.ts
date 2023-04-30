import { Component } from '@angular/core';
import { UPDATEDPLAYERS } from '../pianist';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  numMusicians : number = UPDATEDPLAYERS.length;
}
