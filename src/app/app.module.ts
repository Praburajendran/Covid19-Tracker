import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { GetCovidDataService } from './get-covid-data.service';
import { UtilitiesService } from './utilities.service';

import { CovidTableComponent } from './covid-table/covid-table.component';

import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AppComponent,
    CovidTableComponent
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
