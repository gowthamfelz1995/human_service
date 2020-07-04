import { LightningElement, wire, api,track } from 'lwc';
import getAssessmentTemplatesList from '@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplatesList';
import getAssessmentQuestions from "@salesforce/apex/AG_Human_Service_CL.getAssessmentQuestions";
import { CurrentPageReference } from 'lightning/navigation';
import saveAssessmentList from "@salesforce/apex/AG_Human_Service_CL.saveAssessmentList";
import {
  ShowToastEvent
} from 'lightning/platformShowToastEvent';

import {
  NavigationMixin
} from 'lightning/navigation';
import SERVICE_REQUEST from '@salesforce/schema/AG_Service_Request__c';

export default class AssessmentTemplateList extends NavigationMixin(LightningElement){
    @track templateList = [];
    @api recordId ;
    selectedTemplate ;
    @track showListTemplate = true ;
    assessmentId = "";
    assessmentName = '';
    showSaveBtn = true;
    @track questionList = [];
    serviceRequestObj = SERVICE_REQUEST;
    textValue = '';
    @track totalMarks = 0 ;
    @track showScore = false ;

    @wire(getAssessmentTemplatesList)
    assessmentTemplateLists({ error, data }) {
        if (data) {
            var  dataList = data ;
            dataList.forEach(element => {
                var obj = {
                    Id : element.Id,
                    Name : element.Name,
                    isChecked : false
                }
                this.templateList.push(obj);
            });
           console.log('data',JSON.stringify(this.templateList))
        } else if (error) {
            console.log('error',error)
        }
    }
    connectedCallback(){
        // console.log("assessmentTemplateList-->"+JSON.stringify(assessmentTemplateList))
    }
    handleCheckboxChange(event){
        this.selectedTemplate = this.templateList[event.target.dataset.value];
        console.log("index==>",JSON.stringify(this.selectedTemplate));
        this.templateList.forEach(element => {
            element.isChecked = false;
        });
        console.log("index==>",JSON.stringify(this.templateList));
        this.templateList[event.target.dataset.value]['isChecked'] = true ;
        this.assessmentId = this.templateList[event.target.dataset.value]['Id'];
        this.serviceRequestId = this.recordId;
        this.assessmentName = this.templateList[event.target.dataset.value]['Name'];
        
    }
    handleCancel(){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
              recordId: this.recordId,
              objectApiName: this.serviceRequestObj,
              actionName: 'view'
            }
          });
    }
    handleback(){
        this.showListTemplate = true;
        this.templateList.forEach(element => {
            element.isChecked = false;
        });
        this.questionList = [];
    }
    handleNext() {
        getAssessmentQuestions({
            assessmentId: this.assessmentId
          })
          .then((result) => {
            var res = JSON.parse(result);
            const quesList = res.data;
            this.showListTemplate = false;
            console.log("resnew==>" + JSON.stringify(res))
            quesList.forEach((questionObj) => {
              var pickValuesToAdd = []
              
              if (questionObj['AG_Question_Type__c'] == 'Picklist') {
                var pickListValues = questionObj['Questionaire_Picklist_Values__r']['records']
    
                pickListValues.forEach((pickValues) => {
                  console.log("pickValues==>" + JSON.stringify(pickValues))
                  var pickList = {
                    label: pickValues.AG_Picklist_Value__c,
                    value: pickValues.AG_Picklist_Value__c,
                    score : pickValues.AG_Score__c,
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
                isTextArea : questionObj['AG_Question_Type__c'] == 'Text Area',
                isPhone : questionObj['AG_Question_Type__c'] == 'Phone',
                pickListValues: pickValuesToAdd,
                answer: ''
              }
              console.log("newObj==>" + JSON.stringify(newObj))
              this.questionList.push(newObj);
    
            });
          })
          .catch((error) => {
            console.log("Error" + error);
          });
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
        console.log("questionList==>" + JSON.stringify(templateObj));
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
            console.log("res==>" + JSON.stringify(res));
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
            console.log("Error" +JSON.stringify(error));
          });
      }
      handleChange(event) {
        this.questionList[event.target.dataset.name]['answer'] = event.detail.value
        console.log(this.questionList[event.target.dataset.name])
        if(this.questionList[event.target.dataset.name]['isPickList']){
          var selectedPickListScore = 0
          this.questionList[event.target.dataset.name]['pickListValues'].forEach(x => {
            if(x.value == event.detail.value){
              this.questionList[event.target.dataset.name]['questions']['AG_Score__c'] = x.score
            }
          });
          
        }
        // this.totalMarks = this.totalMarks + this.questionList[event.target.dataset.name]['questions']['AG_Score__c'] ;
      }
      calculateTotalScore(){
        this.totalMarks = 0
        this.showScore = true ; 
        this.questionList.forEach(x => {
          if(x['answer'] != ''){
            this.totalMarks = this.totalMarks + x['questions']['AG_Score__c'] ;
          }
          
        });
      }
}