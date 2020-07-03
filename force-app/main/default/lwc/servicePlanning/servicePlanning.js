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

import saveServiceLineItem from '@salesforce/apex/AG_Human_Service_CL.saveServiceLineItem';

export default class ServicePlanning extends NavigationMixin(LightningElement) {

    @api recordId;

    @api intake;

    @api serviceRequest = SERVICE_REQUEST_OBJECT;

    @api serviceType;

    @api services;

    @api serviceLineItemId;

    @api checkedValue;

    @api fromDate;

    @api toDate;

    @api filteredServices;

    connectedCallback() {
        getServiceRequest({
                recordId: this.recordId
            })
            .then((result) => {
                const response = JSON.parse(result);
                this.intake = response.serviceRequest.AG_Intake__c;
                this.serviceType = response.serviceRequest.AG_Service_Type__c;
                this.services = response.serviceWrapperList;
            })
            .catch((error) => {
                this.error = response.message;
            })
    }

    getFromDate(event) {
        this.fromDate = event.target.value;
    }

    getToDate(event) {
        this.toDate = event.target.value;
    }

    handleChange(event) {
        this.checkedValue = event.target.checked;
        console.log('checkedValue--->' + this.checkedValue);
        for (var service of this.services) {
            console.log('service------->' + JSON.stringify(service));
            var checkedService = this.services[this.checkedValue];
            console.log('checkedService------->' +checkedService);

        }
    }

    handleSave(event) {
        saveServiceLineItem({
                intakeId: this.intake,
                services: this.filteredServices,
                fromDate: this.fromDate,
                toDate: this.toDate
            })
            .then((result) => {
                const response = JSON.parse(result);
                this.serviceLineItemId = response.data.Id;
                const successEvent = new ShowToastEvent({
                    title: "Success",
                    message: response.message,
                    variant: "success"
                });
                this.dispatchEvent(successEvent);
            })
            .catch((error) => {
                this.error = response.message;
            })
        this.returnToServiceLineItem();
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'AG_Service_Request__c',
                actionName: 'view'
            }
        });
    }

    returnToServiceLineItem() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.serviceLineItemId,
                objectApiName: 'AG_Service_Line_Item__c',
                actionName: 'view'
            }
        });
    }
}