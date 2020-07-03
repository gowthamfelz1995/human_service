import {
    LightningElement,
    api
} from 'lwc';

import SERVICE_REQUEST from '@salesforce/schema/AG_Service_Request__c';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
    NavigationMixin
} from 'lightning/navigation';

export default class Assessment extends NavigationMixin(LightningElement) {

    @api recordId;

    @api serviceRequestId;

    serviceRequest = SERVICE_REQUEST;

    handleSuccess(event) {
        const successEvent = new ShowToastEvent({
            title: "Success",
            message: "Service Request created successfully",
            variant: "success"
        });
        this.serviceRequestId = event.detail.id;
        this.returnToServiceRequest(this.serviceRequestId);
        this.dispatchEvent(successEvent);
    }

    handleCancel(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'AG_Intake__c',
                actionName: 'view'
            }
        });
    }

    returnToServiceRequest(serviceRequestId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.serviceRequestId,
                objectApiName: 'AG_Service_Request__c',
                actionName: 'view'
            }
        });
    }
}