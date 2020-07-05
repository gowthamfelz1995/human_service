import {
    LightningElement,
    api
} from 'lwc';

export default class ObjListItem extends LightningElement {
    @api service;

    handleSelect(event) {
        event.preventDefault();
        const selectNewEvent = new CustomEvent('objectselect', {
            bubbles: true
        });
        this.dispatchEvent(selectNewEvent);
    }
}