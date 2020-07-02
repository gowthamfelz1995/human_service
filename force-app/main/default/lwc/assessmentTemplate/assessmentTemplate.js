import { LightningElement, wire} from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';

export default class AssessmentTemplate extends LightningElement {

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        // subscribe to searchKeyChange event
        registerListener('assessmentSelected', this.handleAssessmentChange, this);
    }

    disconnectedCallback() {
        // unsubscribe from searchKeyChange event
        unregisterAllListeners(this);
    }
    handleAssessmentChange(assessmentId) {
        console.log("searchKey==>"+assessmentId);
    }
}