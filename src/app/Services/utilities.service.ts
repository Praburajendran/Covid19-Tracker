import { Injectable } from '@angular/core';
import srvc from '@tomtom-international/web-sdk-services';
import tt from '@tomtom-international/web-sdk-maps';

import { Antimeridianhandler } from '../Classes/antimeridianhandler';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  srvcobj = srvc;
  searchResult = {};
  POLYGON_ID = 'searchResultPolygon';
  OUTLINE_ID = 'searchResultOutline';
  NO_POLYGON_MESSAGE = 'For the given result there is no polygon attached.';
  tt = null;
  mapval = null;
  popup = null;
  errorHint = null;
  selectedCountryData = {};

  constructor() { }
  
  	public isMobileOrTablet() {
		var check = false;
		// eslint-disable-next-line
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
		
		return check;
	}
	
	public roundLatLng(num) {
		return Math.round(num * 1000000) / 1000000;
	}

	showLoadingPopup() {
        this.popup.setHTML('<strong>Loading...</strong>');
        if (!this.popup.isOpen()) {
            this.popup.setLngLat(this.mapval.getCenter());
            this.popup.addTo(this.mapval);
        }
    }

     showStartSearchingPopup(mapval, popup, errorHint) {
		this.mapval = mapval;
		this.popup = popup;
		this.errorHint = errorHint;

        this.popup.setLngLat(this.mapval.getCenter())
            .setHTML('<strong>Start searching.</strong>');
        if (!this.popup.isOpen()) {
            this.popup.addTo(this.mapval);
        }
	}
	
	  
    clearLayer(layerID) {
        if (this.mapval.getLayer(layerID)) {
            this.mapval.removeLayer(layerID);
            this.mapval.removeSource(layerID);
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

	showPopup() {
        var resultName = this.searchResult['address'] && this.searchResult['address']['freeformAddress'];

        var resultObj = {
            lng: this.roundLatLng(this.searchResult['position']['lng']),
            lat: this.roundLatLng(this.searchResult['position']['lat']),
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

	/*
     * Prepare parameters for the search call
     */
    prepareServiceCall = (country, searchName) => {
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
	
	doSearchCall(placeVal) {
		let selectedSearch = 'fuzzySearch';
		let callFlag = false;
		let searchCall = this.prepareServiceCall(placeVal.country, selectedSearch);
		if (!searchCall) {
			return false;
		}
		searchCall.go().then(this.handleResponse.bind(this))
				.catch(this.handleError.bind(this));
	  };
	  
	handleResponse(response) {
		console.log('response data ------->', response);
		let respdata = response.results.filter(data => { if(data.entityType === 'Country') return true} );
		this.searchResult = respdata[0];
		console.log(this.searchResult);
		return this.loadPolygon();
	}

	setCountryData(selectedCountry, searchResult) {
		this.selectedCountryData = selectedCountry;
		if(searchResult !== '') this.searchResult = searchResult;
	}
	
	handleError(error){
		console.log('response error data ------->', error);
	}
}
