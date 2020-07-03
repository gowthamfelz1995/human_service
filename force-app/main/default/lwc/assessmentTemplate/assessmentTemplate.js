import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners, fireEvent } from "c/pubsub";
import getAssessmentQuestions from "@salesforce/apex/AG_Human_Service_CL.getAssessmentQuestions";
import saveAssessmentList from "@salesforce/apex/AG_Human_Service_CL.saveAssessmentList";

export default class AssessmentTemplate extends LightningElement {
  assessmentId = "";
  serviceRequestId = "";
  showSaveBtn = false ;
  @track questionList = [];

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    // subscribe to searchKeyChange event
    registerListener("assessmentSelected", this.handleAssessmentChange, this);
    registerListener("serviceRequestSelected", this.handleServiceChange, this);
  }
  handleServiceChange(serviceRequest) {
    console.log("searchKey==>" + serviceRequest);
    this.serviceRequestId = serviceRequest ;
  }

  disconnectedCallback() {
    // unsubscribe from searchKeyChange event
    unregisterAllListeners(this);
  }
  handleAssessmentChange(objToFire) {
    console.log("searchKey==>" + objToFire);
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
        this.showSaveBtn = true ;
        quesList.forEach((questionObj) => {
          var pickValuesToAdd = []
          var pickListValues = questionObj['Questionaire_Picklist_Values__r']['records']
          
          if(questionObj['AG_Question_Type__c'] == 'Picklist'){
          pickListValues.forEach((pickValues)=>{
            console.log("pickValues==>"+JSON.stringify(pickValues))
                 var pickList =  { label: pickValues.AG_Picklist_Value__c, value: pickValues.AG_Picklist_Value__c }
                 pickValuesToAdd.push(pickList);
          });

           }
          
            var newObj = {
                    questions: questionObj,
                    isPickList: questionObj['AG_Question_Type__c'] == 'Picklist',
                    isNumber : questionObj['AG_Question_Type__c'] == 'Number',
                    isCheckBox : questionObj['AG_Question_Type__c'] == 'Checkbox',
                    isText : questionObj['AG_Question_Type__c'] == 'Text',
                    pickListValues : pickValuesToAdd,
                    answer : ''
                    }
            this.questionList.push(newObj);
            console.log("questionList==>"+JSON.stringify(this.questionList))
           });
       })
      .catch((error) => {
        console.log("Error"+error);
      });
  }
  handleChange(event){
    this.questionList[event.target.dataset.name]['answer'] = event.detail.value
    console.log("questionList==>"+JSON.stringify(this.questionList));
    console.log("questionList==>"+JSON.stringify(event.detail.value));
  }
  saveAssessment(){
    var finalList = []
    
    this.questionList.forEach((x)=>{
      var newObj = {
        question: x.questions.Name,
        answer : x.answer,
        }
        finalList.push(newObj);
        
    });
    var templateObj = {
      serviceRequestId : this.serviceRequestId,
      assessmentTemplateId : this.assessmentId,
      assessmentAnswerList : finalList
    }
    console.log("questionList==>"+JSON.stringify(templateObj));
    saveAssessmentList({
      assessmentObj: JSON.stringify(templateObj)
    })
      .then((result) => {
        var res = JSON.parse(result);
        console.log("res==>"+JSON.stringify(res));
        
       })
      .catch((error) => {
        console.log("Error"+error);
      });
  }
}
