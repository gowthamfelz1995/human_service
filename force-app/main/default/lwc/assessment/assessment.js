import { LightningElement, wire } from 'lwc';
import getAssessmentTemplates from '@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplates';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

const DELAY = 300;
export default class Assessment extends LightningElement {
    searchKey = '';
    @wire(CurrentPageReference) pageRef;

    @wire(getAssessmentTemplates, { searchKey: '$searchKey' })
    assessmentTemplateList;

    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
        }, DELAY);
    }
    getAssessmentKey(event){
    console.log(event.target.key)
    }
    handleAssessmentSelect(event) {
        console.log(event.target.assessment.Id)
        // fire contactSelected event
        fireEvent(this.pageRef, 'assessmentSelected', event.target.assessment.Id);
    }
}