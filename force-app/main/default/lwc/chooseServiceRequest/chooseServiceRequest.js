import {
    LightningElement,
    wire,
    api
} from 'lwc';

import getServiceRequest from '@salesforce/apex/AG_Human_Service_CL.getServiceRequest';

import {
    CurrentPageReference
} from 'lightning/navigation';

import {
    registerListener,
    unregisterAllListeners,
    fireEvent
} from 'c/pubsub';

export default class ChooseServiceRequest extends LightningElement {

    searchKey = '';

    @wire(CurrentPageReference) pageRef;

    @wire(getServiceRequest, {
        searchKey: '$searchKey'
    })

    serviceRequestList;

    handleKeyChange(event) {
        const searchKey = event.target.value;
        this.searchKey = searchKey;
    }

    handleServiceRequestSelect(event) {
        fireEvent(this.pageRef, 'serviceRequestSelected', event.target.service.Id);
    }
}