import {
    LightningElement,
    wire,
    api
} from 'lwc';

import getAssessmentTemplates from '@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplates';

import {
    CurrentPageReference
} from 'lightning/navigation';

import {
    registerListener,
    unregisterAllListeners,
    fireEvent
} from 'c/pubsub';

const DELAY = 300;
export default class Assessment extends LightningElement {

    searchKey = '';

    @wire(CurrentPageReference) pageRef;

    @wire(getAssessmentTemplates, {
        searchKey: '$searchKey'
    })

    assessmentTemplateList;

    connectedCallback() {
    }

    handleKeyChange(event) {
        const searchKey = event.target.value;

        this.searchKey = searchKey;
    }

    getAssessmentKey(event) {}

    handleAssessmentSelect(event) {
        fireEvent(this.pageRef, 'assessmentSelected', event.target.assessment.Id);
    }
}