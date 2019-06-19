import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})

export class AutoCompleteGeoService {

	geoObjResult: any;

	queryPredictions = {
		code: 'ru',
		language: 'tr_TR',
		address: null,
		results: 5
	}

	data: any[] = [];
	geoSubject = new Subject<any>();

	constructor (
		private httpClient: HttpClient) { }

	geoYandex(address: string): Observable<any> {

		this.queryPredictions.address = address;

		//query Adress in YandexAPI
		const apiURL = 'https://geocode-maps.yandex.' + this.queryPredictions.code + '/1.x/?results= ' + this.queryPredictions.results + ' &geocode=' + this.queryPredictions.address + '&lang=' + this.queryPredictions.language + '&format=json&bbox=24.125977,34.452218~45.109863,42.601620';

		return this.httpClient.get<any>(apiURL).pipe(  // we return an observable
			map((data) => {
				let geoObj: any = [];
				let geoObjTemp: any = {};
				let tempData = data.response.GeoObjectCollection.featureMember;
				// create a new obj with the properties we need
				for (let i = 0; i < tempData.length; i++)
				{
					geoObjTemp[i] = {
						name: tempData[i].GeoObject.name,
						description: (tempData[i].GeoObject.description == undefined) ? tempData[i].GeoObject.name : tempData[i].GeoObject.description,
						point: tempData[i].GeoObject.Point,
						kind: tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind,
					}
					// filter if results are in Turkey
					if (!(geoObjTemp[i]) || !(geoObjTemp[i].description.indexOf('Türkiye') === -1) || !(geoObjTemp[i].description.indexOf('Turkey') === -1))
					{
						geoObj[i] = geoObjTemp[i]; //push new obj turkey results
					}

					// set format Lat & Long
					let latLong = geoObjTemp[i].point.pos.split(' ');
					geoObjTemp[i].point['lat'] = parseFloat(latLong[1]);
					geoObjTemp[i].point['lng'] = parseFloat(latLong[0]);
					delete geoObjTemp[i].point.pos;

					// set kind & level
					let tempKind = (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'street') ? 'street' : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'neighbouhood') ? 'neighbourhood' : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'area') ? 'county' : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'city') ? 'city' : 'other';

					let tempLevel = (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'street') ? 0 : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'neighbouhood') ? 3 : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'area') ? 2 : (tempData[i].GeoObject.metaDataProperty.GeocoderMetaData.kind === 'city') ? 1 : 0;

					geoObjTemp[i]['kind'] = tempKind;
					geoObjTemp[i]['level'] = tempLevel;
				}
				return geoObj;
			})
		)
	}

	geoYandexSelected(suggest: object) {
		let tempData = suggest;
		this.data.push(tempData);
		this.geoSubject.next(this.data);
	}

	getYandexGeo(): Observable<any> {
		return this.geoSubject.asObservable();
	}

}
