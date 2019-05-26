import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { AutoCompleteGeoService } from '../_providers/auto-complete.service';
import { Subscription, Subject } from 'rxjs';
import { GeoApiService } from '../_providers/geo-api.service';

@Component({
	selector: 'app-simple-map',
	templateUrl: './simple-map.component.html',
	styleUrls: ['./simple-map.component.scss']
})
export class SimpleMapComponent implements OnInit {

	/// default settings
	map: mapboxgl.Map;
	style: string = 'mapbox://styles/mapbox/streets-v11?optimize=true';
	pitch: number = 50;

	myBbox: any;

	data: any = [];
	tempData: any;

	geoSelected: any = [];

	addLayerFill: any[] = []
	addLayerBorder: any[] = []
	layerFill: any = {};
	layerBorder: any = {};

	geoGetSubscription: Subscription;
	geoApiSubscription: Subscription;

	constructor (private autoCompleteGeoService: AutoCompleteGeoService, private geoApiService: GeoApiService) {
		(mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
		this.geoGetSubscription = this.autoCompleteGeoService.getYandexGeo().subscribe((data) => {

			let dataLength = data.length - 1;
			(dataLength > 0) ? this.geoSelected = data[dataLength] : this.geoSelected = data[0];

			let lat = this.geoSelected.point.lat;
			let lng = this.geoSelected.point.lng;
			let level = this.geoSelected.level;

			// build map with new data
			this.buildMap(lat, lng, level);

			// builds poligon with bounds
			this.loadBounds();

		});

	}

	ngOnInit() {
		let lat = 40.985628;
		let lng = 29.025591;
		let level = 1;

		this.buildMap(lat, lng, level);
		this.loadBounds();
	}


	buildMap(lat: number, lng: number, level: number) {

		//initialize map
		this.map = new mapboxgl.Map({
			container: 'map',
			style: this.style,
			zoom: 10, //13
			center: [lng, lat],
			pitch: this.pitch
		});

		// Add map controls
		this.map.addControl(new mapboxgl.NavigationControl());

		// geoJSON data
		this.geoApiSubscription = this.geoApiService.getYandexGeoApi(lat, lng, level).subscribe(
			(response) => {
				this.tempData = JSON.parse(response);

				this.data = [];
				this.data.push(this.tempData);

				this.map.addSource('geoData', {
					"type": "geojson",
					data: this.data[0]
				});

				// build layers
				for (let i = 0; i < this.tempData.features.length; i++)
				{

					this.layerFill = {
						id: 'mapFill' + i,
						type: 'fill',
						source: 'geoData',
						layout: {},
						paint: {
							'fill-color': '#D3B99F',
							'fill-opacity': 0.6
						}
					}

					this.layerBorder = {
						id: 'mapBorder' + i,
						type: 'line',
						source: 'geoData',
						layout: {},
						paint: {
							'line-color': '#C17767',
							'line-width': 2
						}
					}

					this.addLayerFill.push(this.layerFill);
					this.addLayerBorder.push(this.layerBorder);

				}
			}
		)
	}

	loadBounds() {
		this.map.on('load', (event) => {
			for (let i = 0; i < this.addLayerFill.length; i++)
			{
				// add layers
				this.map.addLayer(this.addLayerFill[i]);
				this.map.addLayer(this.addLayerBorder[i]);
			}
			this.myBbox = turf.bbox(this.data[0]);
			// fit map to geoBounds
			this.map.fitBounds(this.myBbox, { padding: 20 });
		});
	}

	ngOnDestroy() {
		this.geoGetSubscription.unsubscribe();
		this.geoApiSubscription.unsubscribe();
	}
}
