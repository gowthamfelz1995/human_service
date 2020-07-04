import { LightningElement, wire, api,track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import {
    ShowToastEvent
  } from 'lightning/platformShowToastEvent';

export default class ServiceLog extends LightningElement {
    @track questionList = [];
} 