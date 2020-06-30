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

import changeStatus from '@salesforce/apex/AG_Human_Service_CL.changeStatus';

export default class Discharge extends NavigationMixin(LightningElement) {
    @api recordId;

    @api status = "Discharged";

    connectedCallback() {
        changeStatus({
                recordId: this.recordId,
                status: this.status
            })
            .then((result) => {
                const successEvent = new ShowToastEvent({
                    title: "Success",
                    message: "Lead discharged successfully",
                    variant: "success"
                });
                this.dispatchEvent(successEvent);
            })
            .catch((error) => {
                this.message = "something went wrong";
                this.error = error;
            });
        this.handleCancel();
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Lead',
                actionName: 'view'
            }
        });

    }
}