import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  public isCollapsed = true;
  settingMaxGrandchildren : number;

  constructor (private router : Router) {
    if (localStorage.getItem("settingMaxGrandchildren") === null){
      localStorage.setItem("settingMaxGrandchildren", "3");
    }
    var tempSetting = localStorage.getItem("settingMaxGrandchildren");

    this.settingMaxGrandchildren = tempSetting !== null ? parseInt(tempSetting) : 3;
  }

  setSlider(stuff : Event){
    if(stuff && stuff.target){
      const element = stuff.currentTarget as HTMLInputElement;
      this.settingMaxGrandchildren = parseInt(element.value);
      localStorage.setItem("settingMaxGrandchildren", element.value);
    }
  }
}
