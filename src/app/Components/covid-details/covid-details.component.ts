import { Component, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import tt from '@tomtom-international/web-sdk-maps';
import srvc from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';

import { GetCovidDataService } from '../../Services/get-covid-data.service';	
import { UtilitiesService } from '../../Services/utilities.service';
  
import { Foldable } from '../../Classes/foldable';
import { Infohint } from '../../Classes/infohint';

@Component({
  selector: 'app-covid-details',
  templateUrl: './covid-details.component.html',
  styleUrls: ['./covid-details.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class CovidDetailsComponent implements AfterViewInit {
	
  constructor(private getcvdsrvc: GetCovidDataService, private utilsrvc: UtilitiesService){ }
  
	@ViewChild("foldable", {static: false}) fold: ElementRef;
	@ViewChild("searchBoxPlaceholder", {static: false}) searchplaceholder: ElementRef;

	title = 'covid19map';
	httpdata = [];
	mapval = null;
	popup = null;
	errorHint = null;
	roundLatLng = {};
	srvcobj = srvc;
	NO_POLYGON_MESSAGE = 'For the given result there is no polygon attached.';
	POLYGON_ID = 'searchResultPolygon';
	OUTLINE_ID = 'searchResultOutline';
	searchResult = {};
	selectedCountryData = {};

  
  ngAfterViewInit() {
	  
    this.getcvdsrvc.getConfig().subscribe(data => { this.displaydata(data); })
  
    let foldable  = new Foldable(this.fold.nativeElement, 'top-right');
    foldable.addFoldable();
    // this.roundLatLng = this.utilsrvc.roundLatLng();
    
    this.mapval = tt.map({      
      key: 'FPM16D61wnehiNcf7YdljWR2RtMRZxjG',
      container: 'covidmap',
      style: 'tomtom://vector/1/basic-main',
      zoom: 2,
      center: [4.952129606368089, 52.31404857051368],
      dragPan: !this.utilsrvc.isMobileOrTablet()
    });
  
    this.popup = new tt.Popup({ className: 'tt-popup', closeOnClick: false });
    this.utilsrvc.showStartSearchingPopup(this.mapval, this.popup, this.errorHint);
  
    this.mapval.addControl(new tt.FullscreenControl());
    this.mapval.addControl(new tt.NavigationControl());

    this.errorHint = new Infohint('error', 'bottom-center', 5000).addTo(this.mapval.getContainer());
  
    var ttSearchBox = new SearchBox(this.srvcobj.services, {
        searchOptions: {
            key: 'FPM16D61wnehiNcf7YdljWR2RtMRZxjG',
            language: 'en-US'
        },
        filterSearchResults: (searches) => {
            //we want to filter out search results that don't have polygons attached
            return Boolean(searches['dataSources'] && searches['dataSources']['geometry'] &&
                searches['dataSources']['geometry']['id'] && searches['entityType'] === 'Country');
        },
        noResultsMessage: 'No results found.'
    });

    this.searchplaceholder.nativeElement.appendChild(ttSearchBox.getSearchBoxHTML());
    ttSearchBox.on('tomtom.searchbox.resultselected', (event) => {
        event.origin.preventDefault();
        this.searchResult = event.data.result;
        this.setSelectedData();
        return this.utilsrvc.loadPolygon();
    });
    ttSearchBox.on('tomtom.searchbox.resultscleared', () => {
        this.searchResult = null;
        this.utilsrvc.clearLayer(this.POLYGON_ID);
        this.utilsrvc.clearLayer(this.OUTLINE_ID);
        this.utilsrvc.showStartSearchingPopup(this.mapval, this.popup, this.errorHint);
      });
  }

    getSelectedCountry(data) {
      this.selectedCountryData = data;
      this.utilsrvc.setCountryData(this.selectedCountryData, '');
      this.utilsrvc.doSearchCall(data);
      console.log('selected country -->', data);
    }  

	displaydata(data) {
    let blockedCountries = ['', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'];
		this.httpdata = data.filter(el => {
			if(!blockedCountries.includes(el.country)) return true;
		})
		console.log(this.httpdata);
	}
	
	setSelectedData() {
		let selectedData = this.httpdata.filter(data => {
			if(data.countryCode === this.searchResult['address']['countryCode']) return true;
		});
    this.selectedCountryData = selectedData[0];
    this.utilsrvc.setCountryData(this.selectedCountryData, this.searchResult);
	}
}
