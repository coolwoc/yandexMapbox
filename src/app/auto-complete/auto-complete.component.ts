import { Component, OnInit, Injectable, OnDestroy } from '@angular/core';
import { AutoCompleteGeoService } from '../_providers/auto-complete.service'
import { Subscription, Subject } from 'rxjs';

@Injectable()
@Component({
	selector: 'app-auto-complete',
	templateUrl: './auto-complete.component.html',
	styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent implements OnInit, OnDestroy {

	addressInput: any;
	predictions: Object[];
	queryOptions: any = {};
	selectedAddress: any;
	errorMessage: string;
	geoLatLng: Object;
	showNoData: string;

	geoSubscription: Subscription;

	selected: boolean = false; // result panels

	constructor (
		private autoCompleteGeoService: AutoCompleteGeoService) { }

	ngOnInit() {
	}

	submitForm() {
		if (this.predictions && this.predictions.length > 0)
		{
			this.selectedAddress = this.predictions[0];
			this.showErrorMessage(false);
		} else
		{
			this.showErrorMessage(true);
		}
	}

	keyUpHandler() {
		this.selectedAddress = null;

		if (this.addressInput.length >= 3)
		{
			const address = this.addressInput;
			setTimeout(() => {
				if (this.addressInput)
				{
					this.makeApiCallAutoComplete(address);
				} else
				{
					this.showErrorMessage(true);
				}
			}, 1000);
		}
	}
	makeApiCallAutoComplete(address: string) {
		this.geoSubscription = this.autoCompleteGeoService.geoYandex(address).subscribe(
			(response) => {
				this.responseHandlerAuto(response);
			}
		)
	}

	suggestedSelected(suggestion: any) {
		// create obj and prepare data to parse on view
		this.selectedAddress = {};
		this.selectedAddress['name'] = suggestion.name + ', ' + suggestion.description;
		this.selectedAddress['lat'] = suggestion.point.lat;
		this.selectedAddress['lng'] = suggestion.point.lng;

		// we pass data to service so we can call in other modules
		this.autoCompleteGeoService.geoYandexSelected(suggestion);

		// clear fields
		this.addressInput = null;
		this.predictions = null;
	}

	responseHandlerAuto(response: any) {
		if (response && response.length > 0)
		{
			this.predictions = response;
			this.showErrorMessage(false);
		} else
		{
			this.showErrorMessage(true);
		}
	}

	showErrorMessage(boo: boolean) {
		if (boo)
		{
			this.errorMessage = 'Please inser a valid address'
		} else
		{
			this.errorMessage = null;
		}
	}

	ngOnDestroy() {
		this.geoSubscription.unsubscribe();
	}

}
