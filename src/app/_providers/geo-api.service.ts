import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class GeoApiService {

	apiEndPoint: string = environment.baseURL;

	queryGet: Object;
	queryGetById: Object;

	responseGetAll: Object;
	responseGetById: Object;
	getError: Object;

	token: string = null;

	constructor (private httpClient: HttpClient) { }

	getYandexGeoApi(lat: number, lng: number, level: number): Observable<any> {

		this.queryGet = {
			Lat: lat,
			Long: lng,
			Level: level
		}

		const urlAPI = this.apiEndPoint + '/geomap';
		const headers = new HttpHeaders().set('Authorization', 'Bearer UmkyxkSn8YDnu-uPk5OT42Z47j1AU-fMnNY3jfapYfLeZB2GMOtcNosjSvZzNse0uQ-h3tPvobcpuhrngeASx7XJ9c-4X9DwBi_JpN0-FZubWkUdmRXsq5dhsxQKORUN-RPnmdKEd0w0RMzk_MOfc_yEXoDTtdXV7ucB-a4ewdwnlqLG1cfVXcUD4QKFXe5OMpPfnPMs-_-oF8j2rItYglsUl_F6Gx_fO3AjxJzekmcHWiBZcQW8kaW-iH_ueNRF4hRn2_KqH_LB3g8hURSt3uD2vRj8nhjP8ON3C6laCdZgnj_7PqR_4s6T109qHB2v1G1rExDgjhxKUv3lkOYjY_-lnblyIov00ryUPyilncZekuAopsiJJPWOn-AdY7CaBKsDPOOIxGIc_KZGWyoBqy667YHpjuNrSz_jK1kG6wTuVH1IBXtCwfkQ0816I6_tmGC1MUePeWV1eINp4BunzE6AyX76XnUNX61jzpbWCHRR32AaM0dPvhVFjqLaLmbSwcAjw-52WKiFRu8CjsXPC7ODPZs');

		return this.httpClient.post<any>(urlAPI, this.queryGet, {
			headers: headers,
			observe: 'body'
		}).pipe(map((data) => {
			return data
		}))

	}

}
