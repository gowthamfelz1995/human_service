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

import waitListLead from '@salesforce/apex/AG_Human_Service_CL.waitListLead';

export default class WaitList extends NavigationMixin(LightningElement) {

    @api recordId;

    @api status = 'Waitlisted';

    @api isWaitListed = false;

    @api comments;

    connectedCallback() {
        this.isWaitListed = true;
    }

    saveComments() {
        waitListLead({
                recordId: this.recordId,
                status: this.status,
                comments: this.comments
            })
            .then((result) => {
                const response = JSON.parse(response);
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
                objectApiName: 'Lead',
                actionName: 'view'
            }
        });
    }
}