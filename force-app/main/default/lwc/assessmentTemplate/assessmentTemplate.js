import { LightningElement, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { registerListener, unregisterAllListeners, fireEvent } from "c/pubsub";
import getAssessmentQuestions from "@salesforce/apex/AG_Human_Service_CL.getAssessmentQuestions";

export default class AssessmentTemplate extends LightningElement {
  assessmentId = "";
  @track questionList = [];

  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    // subscribe to searchKeyChange event
    registerListener("assessmentSelected", this.handleAssessmentChange, this);
  }

  disconnectedCallback() {
    // unsubscribe from searchKeyChange event
    unregisterAllListeners(this);
  }
  handleAssessmentChange(assessmentId) {
    console.log("searchKey==>" + assessmentId);
    this.assessmentId = assessmentId;
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
                    pickListValues : pickValuesToAdd
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
    console.log("questionList==>"+JSON.stringify(event));
  }
}
