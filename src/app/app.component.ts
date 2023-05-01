import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Musical Genealogy';

  constructor(){
    localStorage.setItem("settingDefaultPerson", "1");
  }
}
