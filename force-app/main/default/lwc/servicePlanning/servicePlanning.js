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

import getServiceRequest from '@salesforce/apex/AG_Human_Service_CL.getServiceRequest';

import getServicesForServiceType from '@salesforce/apex/AG_Human_Service_CL.getServicesForServiceType';

const DELAY = 350;
export default class ServicePlanning extends NavigationMixin(LightningElement) {

    @api recordId;

    @api serviceRequest = SERVICE_REQUEST_OBJECT;

    @api serviceRequestId;

    @api serviceRequestName;

    @api serviceType;

    @api services;

    connectedCallback() {
        getServiceRequest({
                intakeId: this.recordId
            })
            .then((result) => {
                const response = JSON.parse(result);
                this.serviceRequestId = response.data.Id
                this.serviceRequestName = response.data.Name;
                this.serviceType = response.data.AG_Service_Type__c;
            })
            .catch((error) => {
                this.error = error;
            })
    }

    handleService(event) {
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        this.delayTimeout = setTimeout(() => {
            getServicesForServiceType({
                    searchKey,
                    serviceType: this.serviceType
                })
                .then((result) => {
                    const response = JSON.parse(result);
                    this.services = response.data;
                    this.error = undefined;
                })
                .catch((error) => {
                    this.error = error;
                    this.contacts = undefined;
                });
        }, DELAY);
    }

    handleCancel(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'AG_Intake__c',
                actionName: 'view'
            }
        });
    }
}