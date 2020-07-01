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

import saveServiceLineItem from '@salesforce/apex/AG_Human_Service_CL.saveServiceLineItem';

export default class SubService extends NavigationMixin(LightningElement) {

    @api intake;

    @api service;

    @api fromDate;

    @api toDate;

    @api serviceLineItemId;

    getFromDate(event) {
        this.fromDate = event.target.value;
    }

    getToDate(event) {
        this.toDate = event.target.value;
    }

    saveServiceLineItem(event) {
        saveServiceLineItem({
                intakeId: this.intake,
                serviceId: this.service.Id,
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
                objectApiName: 'AG_Intake__c',
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