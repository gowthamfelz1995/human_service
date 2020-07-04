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

import findServiceRequestForPlanning from '@salesforce/apex/AG_Human_Service_CL.findServiceRequestForPlanning';

import saveServiceLineItem from '@salesforce/apex/AG_Human_Service_CL.saveServiceLineItem';

export default class ServicePlanning extends NavigationMixin(LightningElement) {

    @api recordId;

    @api intake;

    @api serviceRequest = SERVICE_REQUEST_OBJECT;

    @api serviceType;

    @api services;

    @api filteredServices = [];

    @api serviceObjectList = [];

    connectedCallback() {
        findServiceRequestForPlanning({
                recordId: this.recordId
            })
            .then((result) => {
                const response = JSON.parse(result);
                this.intake = response.serviceRequest.AG_Intake__c;
                this.serviceType = response.serviceRequest.AG_Service_Type__c;
                this.services = response.services;
                this.services.forEach((service) => {
                    var serviceObject = {
                        Id: service.Id,
                        name: service.AG_Service_Name__c,
                        fromDate: '',
                        toDate: '',
                    }
                    this.serviceObjectList.push(serviceObject);
                })
            })
            .catch((error) => {
                this.error = response.message;
            })
    }

    getFromDate(event) {
        this.serviceObjectList[event.target.dataset.name]['fromDate'] = event.detail.value;
    }

    getToDate(event) {
        this.serviceObjectList[event.target.dataset.name]['toDate'] = event.detail.value;
    }

    handleChange(event) {
        var selectedService = event.target.dataset.name;
        this.filteredServices.push(this.serviceObjectList[selectedService]);
    }

    handleSave(event) {
        if (this.filteredServices == null || this.filteredServices == undefined) {
            const errorEvent = new ShowToastEvent({
                title: "Error",
                message: "Please choose a service to proceed",
                variant: "error"
            });
            this.dispatchEvent(errorEvent);

        } else {
            saveServiceLineItem({
                    intakeId: this.intake,
                    serviceRequestId: this.recordId,
                    services: JSON.stringify(this.filteredServices)
                })
                .then((result) => {
                    const response = JSON.parse(result);
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
            this.handleCancel();
        }
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
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'AG_Service_Line_Item__c',
                actionName: 'home'
            }
        });
    }
}