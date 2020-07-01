import { LightningElement, api } from 'lwc';
import SERVICE_REQUEST from '@salesforce/schema/AG_Service_Request__c';
import createSurveyInvitationLink from '@salesforce/apex/AG_Human_Service_CL.createSurveyInvitationLink';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
    NavigationMixin
} from 'lightning/navigation';

export default class Assessment extends NavigationMixin(LightningElement) {
    @api recordId;
    serviceRequest = SERVICE_REQUEST;

    handleSuccess(event) {
        const successEvent = new ShowToastEvent({
            title: "Success",
            message: "Service Request created successfully",
            variant: "success"
        });
        const serviceRequestId = event.detail.id ;
        this.createInvitationLink(serviceRequestId);
        this.dispatchEvent(successEvent);
        this.handleCancel(event);
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

    createInvitationLink(serviceRequestId){
        createSurveyInvitationLink({
            recordId: serviceRequestId
    })
        .then((result) => {
            const newSurveyInvitation = JSON.parse(result)
            console.log("Status changed"+JSON.stringify(newSurveyInvitation));
            // var urlEvent = $A.get("e.force:navigateToURL");
            // urlEvent.setParams({
            //   "url": newSurveyInvitation.data.InvitationLink
            // });
            // urlEvent.fire();
            window.open(newSurveyInvitation.data.InvitationLink); 
        })
        .catch((error) => {
            console.log("Error");
        })
    }
}