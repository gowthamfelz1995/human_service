import {
    LightningElement,
    api,
} from 'lwc';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
    NavigationMixin
} from 'lightning/navigation';

import INTAKE_OBJECT from '@salesforce/schema/AG_Intake__c';

import changeStatusForLead from '@salesforce/apex/AG_Human_Service_CL.changeStatusForLead';

export default class Intake extends NavigationMixin(LightningElement) {

    intake = INTAKE_OBJECT;

    @api recordId;

    @api status = 'Account - converted';

    handleSuccess(event) {
        const successEvent = new ShowToastEvent({
            title: "Success",
            message: "Intake process completed successfully",
            variant: "success"
        });
        this.dispatchEvent(successEvent);
        this.changeStatusForReferral();
        this.handleCancel(event);
    }

    changeStatusForReferral() {
        changeStatusForLead({
                recordId: this.recordId,
                status: this.status
            })
            .then((result) => {
                console.log("Status changed");
            })
            .catch((error) => {
                console.log("Error");
            })
    }

    handleCancel(event) {
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