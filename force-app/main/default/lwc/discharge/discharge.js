import {
    LightningElement,
    api
} from 'lwc';

import {
    NavigationMixin
} from 'lightning/navigation';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';


import dischargeClient from '@salesforce/apex/AG_Human_Service_CL.dischargeClient';

import SERVICE_REQUEST from '@salesforce/schema/AG_Service_Request__c';

export default class Discharge extends NavigationMixin(LightningElement) {
    @api recordId;

    @api status = "Discharged";
    serviceRequestObj = SERVICE_REQUEST;

    connectedCallback() {
        dischargeClient({
                recordId: this.recordId,
                status: this.status
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
                this.message = response.message;
                this.error = error;
            });
        this.handleCancel();
       
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.serviceRequestObj,
                actionName: 'view'
            }
        });

    }
}