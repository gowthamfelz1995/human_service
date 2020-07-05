import {
    LightningElement,
    api
} from 'lwc';

import {
    NavigationMixin
} from 'lightning/navigation';

export default class NavigateToTab extends NavigationMixin(LightningElement) {
    @api recordId;
    connectedCallback() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Assessment'
            },
            state: {
                recordId: this.recordId
            }
        });
    }
}