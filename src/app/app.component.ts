import { Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import tt from '@tomtom-international/web-sdk-maps';
import srvc from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';

import { GetCovidDataService } from './get-covid-data.service';	
import { UtilitiesService } from './utilities.service';
  
import { Foldable } from './foldable';
import { Infohint } from './infohint';
import { Antimeridianhandler } from './antimeridianhandler';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit {
	
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
	page = 1;
    pageSize = 12;

  
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
    this.showStartSearchingPopup();
	
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
        return this.loadPolygon();
    });
    ttSearchBox.on('tomtom.searchbox.resultscleared', () => {
        this.searchResult = null;
        this.clearLayer(this.POLYGON_ID);
        this.clearLayer(this.OUTLINE_ID);
        this.showStartSearchingPopup();
    });
  }
  
  
      clearLayer(layerID) {
        if (this.mapval.getLayer(layerID)) {
            this.mapval.removeLayer(layerID);
            this.mapval.removeSource(layerID);
        }
    }

     clearPopup() {
        this.popup.remove();
    }

     renderPolygon(additionalDataResult) {
        var geoJson = additionalDataResult && additionalDataResult.geometryData;
        if (!geoJson) {
            throw Error(this.NO_POLYGON_MESSAGE);
        }

        this.mapval.addLayer({
            id: this.POLYGON_ID,
            type: 'fill',
            source: {
                type: 'geojson',
                data: geoJson
            },
            paint: {
                'fill-color': 'brown',
                'fill-opacity': 0.1
            }
        });

        this.mapval.addLayer({
            id: this.OUTLINE_ID,
            type: 'line',
            source: {
                type: 'geojson',
                data: geoJson
            },
            paint: {
                'line-color': '#004B7F',
                'line-width': 2
            }
        });

        var boundingBox = this.searchResult['boundingBox'] || this.searchResult['viewport'];
        boundingBox = new tt.LngLatBounds([
            [boundingBox.topLeftPoint.lng, boundingBox.btmRightPoint.lat],
            [boundingBox.btmRightPoint.lng, boundingBox.topLeftPoint.lat]
        ]);
         boundingBox = new Antimeridianhandler()
            .normalizeBoundingBox(boundingBox, tt);
        this.mapval.fitBounds(boundingBox, { padding: 100, linear: true });
    }

     showPopup() {
        var resultName = this.searchResult['address'] && this.searchResult['address']['freeformAddress'];

        var resultObj = {
            lng: this.utilsrvc.roundLatLng(this.searchResult['position']['lng']),
            lat: this.utilsrvc.roundLatLng(this.searchResult['position']['lat']),
			totalCases : this.selectedCountryData['totalCases'],
			newCases: this.selectedCountryData['newCases'],
			totalDeaths: this.selectedCountryData['totalDeaths'],
			newDeaths: this.selectedCountryData['newDeaths'],
			activeCases: this.selectedCountryData['activeCases'],
			totalRecovered: this.selectedCountryData['totalRecovered'],
			criticalCases: this.selectedCountryData['criticalCases']
        };

        var popupResultName = '<strong>' + resultName + '</strong>';		
		var totalCases = '<div> TotalCases : ' + resultObj.totalCases + '</div>';
		var totalDeaths = '<div> TotalDeaths : ' + resultObj.totalDeaths + '</div>';
		var newCases = '<div> NewCases : ' + resultObj.newCases + '</div>';
		var newDeaths = '<div> NewDeaths : ' + resultObj.newDeaths + '</div>';
		var activeCases = '<div> ActiveCases : ' + resultObj.activeCases + '</div>';
		var totalRecovered = '<div> TotalRecovered : ' + resultObj.totalRecovered + '</div>';
		var criticalCases = '<div> CriticalCases : ' + resultObj.criticalCases + '</div>';
		
        this.popup.setHTML('<div>' + popupResultName + totalCases + totalDeaths +
					newCases + newDeaths + activeCases + totalRecovered + criticalCases + '</div>');
        this.popup.setLngLat([resultObj.lng, resultObj.lat]);
        this.popup.addTo(this.mapval);
    }

     showLoadingPopup() {
        this.popup.setHTML('<strong>Loading...</strong>');
        if (!this.popup.isOpen()) {
            this.popup.setLngLat(this.mapval.getCenter());
            this.popup.addTo(this.mapval);
        }
    }

     showStartSearchingPopup() {
        this.popup.setLngLat(this.mapval.getCenter())
            .setHTML('<strong>Start searching.</strong>');
        if (!this.popup.isOpen()) {
            this.popup.addTo(this.mapval);
        }
    }

     loadPolygon() {
        if (!this.searchResult) {
            return;
        }

        return new Promise((resolve) => {
            this.clearLayer(this.POLYGON_ID);
            this.clearLayer(this.OUTLINE_ID);
            this.showLoadingPopup();
            resolve();
        }).then(() => {
            var polygonId = this.searchResult && this.searchResult['dataSources'] 
			&& this.searchResult['dataSources']['geometry']['id'];
            if (!polygonId) {
                throw Error(this.NO_POLYGON_MESSAGE);
            }

            return this.srvcobj.services.additionalData({
                key: 'FPM16D61wnehiNcf7YdljWR2RtMRZxjG',
                geometries: [polygonId],
                geometriesZoom: 4
            }).go();
        }).then((additionalDataResponse) => {
            var additionalDataResult = additionalDataResponse && additionalDataResponse.additionalData &&
                additionalDataResponse.additionalData[0];
            this.renderPolygon(additionalDataResult);
            this.showPopup();
        }).catch((error) => {
            this.clearPopup();
            if (error.message) {
                this.errorHint.setMessage(error.message);
            }
        });
    }

	displaydata(data) {
		this.httpdata = data.filter(el => {
			if(el.country !== '' && el.country !== 'Europe' 
			&& el.country !== 'Asia' && el.country !== 'North America' && el.country !== 'South America') return true;
		})
		console.log(this.httpdata);
	}
	
	showCountry(data) {
		this.submitForm(data);
		console.log('selected country -->', data);
	}
	
	/*
     * Prepare parameters for the search call
     */
    prepareServiceCall = (country, searchName, callFlag) => {
        let selectedLangCode = 'en-US';
        let minFuzzyValue = '1';
        let maxFuzzyValue = '2';
        let limitValue = '10';
        let viewValue = 'IN';
        let servicecall, callparameters = {};

        servicecall = this.srvcobj.services[searchName];
		callparameters['key'] =  'FPM16D61wnehiNcf7YdljWR2RtMRZxjG',
		callparameters['query'] = country;
        callparameters['minFuzzyLevel'] = minFuzzyValue;
        callparameters['maxFuzzyLevel'] = maxFuzzyValue;
        callparameters['language'] = selectedLangCode;
		callparameters['view'] = viewValue;
		callparameters['limit'] = limitValue;

        return servicecall(callparameters);
    }
	
	submitForm(placeVal) {

        let selectedSearch = 'fuzzySearch';
        let callFlag = false;
        let searchCall = this.prepareServiceCall(placeVal.country, selectedSearch, callFlag);
		this.selectedCountryData = placeVal;
        if (!searchCall) {
            return false;
        }
        searchCall.go().then(this.handleResponse.bind(this))
                .catch(this.handleError.bind(this));
    };
	
	setSelectedData(){
		let selectedData = this.httpdata.filter(data => {
			if(data.countryCode === this.searchResult['address']['countryCode']) return true;
		});
		this.selectedCountryData = selectedData[0];
	}
	
	handleResponse(response){
		console.log('response data ------->', response);
		let respdata = response.results.filter(data => { if(data.entityType === 'Country') return true} );
		this.searchResult = respdata[0];
		console.log(this.searchResult);
		return this.loadPolygon();
	}
	
	handleError(error){
		console.log('response error data ------->', error);
	}
}	