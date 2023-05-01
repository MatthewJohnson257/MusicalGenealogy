import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { ExploreComponent } from './explore/explore.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', title: "Musical Genealogy", pathMatch: 'full'},
  { path: 'home', title: "Musical Genealogy", component: HomeComponent },
  { path: 'search', title: "Musical Genealogy", component: SearchComponent },
  { path: 'explore', title: "Musical Genealogy", component: ExploreComponent },
  { path: 'explore/:id', title: "Musical Genealogy", component: ExploreComponent },
  { path: 'explore/:id/:isRefresh', title: "Musical Genealogy", component: ExploreComponent },
  { path: 'settings', title: "Musical Genealogy", component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
