import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { GetCovidDataService } from './Services/get-covid-data.service';
import { UtilitiesService } from './Services/utilities.service';

import { CovidTableComponent } from './Components/covid-table/covid-table.component';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CovidDetailsComponent } from './Components/covid-details/covid-details.component';
import { CovidMapComponent } from './Components/covid-map/covid-map.component';



@NgModule({
  declarations: [
    AppComponent,
    CovidTableComponent,
    CovidDetailsComponent,
    CovidMapComponent
  ],
  imports: [
    BrowserModule,
	  HttpClientModule,
	  NgbPaginationModule
  ],
  providers: [
	  GetCovidDataService,
	  UtilitiesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
