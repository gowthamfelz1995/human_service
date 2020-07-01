import {
    LightningElement,
    api
} from 'lwc';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
    NavigationMixin
} from 'lightning/navigation';

import SERVICE_REQUEST_OBJECT from '@salesforce/schema/AG_Service_Request__c';

export default class ServicePlanning extends NavigationMixin(LightningElement) {

    @api recordId;

    @api serviceRequest = SERVICE_REQUEST_OBJECT;
}