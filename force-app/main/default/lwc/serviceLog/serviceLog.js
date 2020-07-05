import {
  LightningElement,
  wire,
  api,
  track
} from 'lwc';

import {
  CurrentPageReference
} from 'lightning/navigation';

import {
  NavigationMixin
} from 'lightning/navigation';

import {
  ShowToastEvent
} from 'lightning/platformShowToastEvent';

import getServiceQuestions from "@salesforce/apex/AG_Human_Service_CL.getServiceQuestions";

import saveServiceLogList from "@salesforce/apex/AG_Human_Service_CL.saveServiceLogList";

import SERVICE_LINE_ITEM from '@salesforce/schema/AG_Service_Line_Item__c';

export default class ServiceLog extends NavigationMixin(LightningElement) {

  @track questionList = [];

  @api recordId;

  serviceLineItemObj = SERVICE_LINE_ITEM;

  @wire(getServiceQuestions)
  serviceQuestionList({
    error,
    data
  }) {
    if (data) {
      var res = JSON.parse(data);
      const quesList = res.data;
      quesList.forEach((questionObj) => {
        var pickValuesToAdd = []

        if (questionObj['AG_Question_Type__c'] == 'Picklist') {
          var pickListValues = questionObj['Questionaire_Picklist_Values__r']['records']

          pickListValues.forEach((pickValues) => {
            var pickList = {
              label: pickValues.AG_Picklist_Value__c,
              value: pickValues.AG_Picklist_Value__c,
            }
            pickValuesToAdd.push(pickList);
          });

        }

        var newObj = {
          questions: questionObj,
          isPickList: questionObj['AG_Question_Type__c'] == 'Picklist',
          isNumber: questionObj['AG_Question_Type__c'] == 'Number',
          isCheckBox: questionObj['AG_Question_Type__c'] == 'Checkbox',
          isText: questionObj['AG_Question_Type__c'] == 'Text',
          isTextArea: questionObj['AG_Question_Type__c'] == 'Text Area',
          isPhone: questionObj['AG_Question_Type__c'] == 'Phone',
          pickListValues: pickValuesToAdd,
          answer: ''
        }
        this.questionList.push(newObj);

      });
    } else if (error) {
      console.log('error', error)
    }
  }

  handleChange(event) {
    this.questionList[event.target.dataset.name]['answer'] = event.detail.value
  }

  handleback() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.recordId,
        objectApiName: this.serviceLineItemObj,
        actionName: 'view'
      }
    });
  }
  saveLogs() {
    var finalList = []

    this.questionList.forEach((x) => {
      var newObj = {
        question: x.questions.Name,
        answer: x.answer,
      }
      finalList.push(newObj);

    });
    var templateObj = {
      serviceLineItemtId: this.recordId,
      serviceAnswerList: finalList
    }
    saveServiceLogList({
        logObjList: JSON.stringify(templateObj)
      })
      .then((result) => {
        var res = JSON.parse(result);
        const successEvent = new ShowToastEvent({
          title: "Success",
          message: "Saved Log successfully",
          variant: "success"
        });
        this.dispatchEvent(successEvent);
        console.log("res==>" + JSON.stringify(res));
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
            recordId: this.recordId,
            objectApiName: this.serviceLineItemObj,
            actionName: 'view'
          }
        });

      })
      .catch((error) => {
        console.log("Error" + JSON.stringify(error));
      });
  }
}