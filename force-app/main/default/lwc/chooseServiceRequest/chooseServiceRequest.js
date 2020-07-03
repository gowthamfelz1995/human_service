import { LightningElement,wire,api } from 'lwc';
import getServiceRequest from '@salesforce/apex/AG_Human_Service_CL.getServiceRequest';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

export default class ChooseServiceRequest extends LightningElement {
    searchKey = '';
    // @api serviceRequestId;
    @wire(CurrentPageReference) pageRef;

    @wire(getServiceRequest, { searchKey: '$searchKey' })
    serviceRequestList;

    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        
            this.searchKey = searchKey;
       console.log(searchKey)
    }
    
    handleServiceRequestSelect(event){
        console.log(event.target.service.Id)
        fireEvent(this.pageRef, 'serviceRequestSelected', event.target.service.Id);
    }
}