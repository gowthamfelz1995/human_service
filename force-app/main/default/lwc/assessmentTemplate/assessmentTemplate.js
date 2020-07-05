import {
  LightningElement,
  wire,
  track
} from "lwc";

import {
  CurrentPageReference
} from "lightning/navigation";

import {
  registerListener,
  unregisterAllListeners,
  fireEvent
} from "c/pubsub";

import getAssessmentQuestions from "@salesforce/apex/AG_Human_Service_CL.getAssessmentQuestions";

import saveAssessmentList from "@salesforce/apex/AG_Human_Service_CL.saveAssessmentList";

import {
  ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
  NavigationMixin
} from 'lightning/navigation';

import SERVICE_REQUEST from '@salesforce/schema/AG_Service_Request__c';

export default class AssessmentTemplate extends NavigationMixin(LightningElement) {

  assessmentId = "";

  serviceRequestId = "";

  showSaveBtn = true;

  @track questionList = [];

  serviceRequestObj = SERVICE_REQUEST;

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    registerListener("assessmentSelected", this.handleAssessmentChange, this);
    registerListener("serviceRequestSelected", this.handleServiceChange, this);
  }

  handleServiceChange(serviceRequest) {
    this.serviceRequestId = serviceRequest;
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handleAssessmentChange(objToFire) {
    this.assessmentId = objToFire;
    this.questionList = [];
    this.getQuestions();
  }

  getQuestions() {
    getAssessmentQuestions({
        assessmentId: this.assessmentId
      })
      .then((result) => {
        var res = JSON.parse(result);
        const quesList = res.data;
        this.showSaveBtn = false;
        quesList.forEach((questionObj) => {
          var pickValuesToAdd = []
          var pickListValues = questionObj['Questionaire_Picklist_Values__r']['records']

          if (questionObj['AG_Question_Type__c'] == 'Picklist') {
            pickListValues.forEach((pickValues) => {
              var pickList = {
                label: pickValues.AG_Picklist_Value__c,
                value: pickValues.AG_Picklist_Value__c
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
            pickListValues: pickValuesToAdd,
            answer: ''
          }
          this.questionList.push(newObj);

        });
      })
      .catch((error) => {
        console.log("Error" + error);
      });
  }
  handleChange(event) {
    this.questionList[event.target.dataset.name]['answer'] = event.detail.value
  }
  saveAssessment() {
    var finalList = []

    this.questionList.forEach((x) => {
      var newObj = {
        question: x.questions.Name,
        answer: x.answer,
        score: x.questions.AG_Score__c
      }
      finalList.push(newObj);

    });
    var templateObj = {
      serviceRequestId: this.serviceRequestId,
      assessmentTemplateId: this.assessmentId,
      assessmentAnswerList: finalList
    }
    saveAssessmentList({
        assessmentObj: JSON.stringify(templateObj)
      })
      .then((result) => {
        var res = JSON.parse(result);
        const successEvent = new ShowToastEvent({
          title: "Success",
          message: "Assessment process completed successfully",
          variant: "success"
        });
        this.dispatchEvent(successEvent);
        this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
            recordId: res.data['AG_Service_Request__c'],
            objectApiName: this.serviceRequestObj,
            actionName: 'view'
          }
        });

      })
      .catch((error) => {
        console.log("Error" + error);
      });
  }
}