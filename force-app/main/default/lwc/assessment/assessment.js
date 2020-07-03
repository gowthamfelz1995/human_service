import { LightningElement, wire, api } from 'lwc';
import getAssessmentTemplates from '@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplates';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

const DELAY = 300;
export default class Assessment extends LightningElement {
    searchKey = '';
    // @api serviceRequestId;
    @wire(CurrentPageReference) pageRef;

    @wire(getAssessmentTemplates, { searchKey: '$searchKey' })
    assessmentTemplateList;
    connectedCallback() {
        console.log("entersassessment==>"+this.pageRef.state.recordId)
        // console.log("serviceRequestId==>"+serviceRequestId)
    }

    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        
            this.searchKey = searchKey;
       console.log(searchKey)
    }
    getAssessmentKey(event){
    console.log(event.target.key)
    }
    handleAssessmentSelect(event) {
        // fire contactSelected event
        fireEvent(this.pageRef, 'assessmentSelected', event.target.assessment.Id);
    }
}