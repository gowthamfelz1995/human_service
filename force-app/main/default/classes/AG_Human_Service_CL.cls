public with sharing class AG_Human_Service_CL {

    @AuraEnabled
    public static String findServiceRequest(Id recordId){
        try{
            AG_Service_Request__c serviceRequest = getServiceRequestDetails(recordId);
            return '{"success": true, "data": '+JSON.serialize(serviceRequest)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    public static AG_Service_Request__c getServiceRequestDetails(Id recordId){
        try{
            String query = 'SELECT Id, AG_Status__c FROM AG_Service_Request__c WHERE Id =: recordId';
            return Database.query(query);
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static string waitListLead(Id recordId,Date waitUntil,String comment){
        try{
            Lead lead = [SELECT Id, Name, Status,AG_Wait_Until__c ,AG_Comment__c   FROM Lead WHERE Id =: recordId];
            lead.status = 'Waitlisted';
            lead.AG_Wait_Until__c = waitUntil;
            lead.AG_Comment__c  = comment ;
            update lead;

            return '{"success" : true, "message" : "Lead waitlisted successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string dischargeClient( Id recordId, String status){
        try{
            AG_Service_Request__c serviceRequest = [SELECT Id, Name, AG_Intake__c, AG_Status__c  FROM AG_Service_Request__c WHERE Id =: recordId];
            serviceRequest.AG_Status__c = status;
            update serviceRequest;

            AG_Intake__c intake = [SELECT Id, AG_Client__c FROM AG_Intake__c WHERE Id =: serviceRequest.AG_Intake__c];

            Account account = [SELECT Id, AG_Status__c FROM Account WHERE Id =: intake.AG_Client__c];
            account.AG_Status__c = status;
            update account;

            return '{"success" : true, "message" : "Client discharged successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string changeStatusForLead( Id recordId, String status){
        try{
            Lead lead = [SELECT Id, Name, Phone, Status  FROM Lead WHERE Id =: recordId];
            lead.status = status;
            update lead;

            Account account = new Account();
            account.Name = lead.Name;
            account.Phone = lead.Phone;
            account.AG_Lead__c = lead.Id;
            account.Type = 'Customer - Direct';
            account.AG_Status__c = 'Intake';
            insert account;

            AG_Intake__c intake = [SELECT Id, AG_Client__c FROM AG_Intake__c ORDER BY createdDate DESC LIMIT 1];
            intake.AG_Client__c = account.Id;
            update intake;

            Task task = new Task();
            task.Description = 'A lead has been converted to account and was intaken';
            task.Subject = 'Lead intaken process done by' +' '+UserInfo.getName();
            task.ActivityDate = System.today();
            task.Status = 'Completed';
            task.WhatId = account.Id;
            task.Priority = 'High';
            insert task;

            return '{"success" : true, "data" : '+JSON.serialize(intake)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string findServiceRequestForPlanning(Id recordId){
        try {
            List<AG_Service__c> services = new List<AG_Service__c>();

            AG_Service_Request__c serviceRequest = [SELECT Id, Name, AG_Intake__c, AG_Service_Type__c FROM AG_Service_Request__c WHERE Id =: recordId];

            for (AG_Service__c service : [SELECT Id, AG_Service_Name__c, AG_Service_Type__c FROM AG_Service__c WHERE AG_Service_Type__c =: serviceRequest.AG_Service_Type__c]) {
                services.add(service);
            }

            return '{"success" : true, "serviceRequest" : '+JSON.serialize(serviceRequest)+' , "services" : '+JSON.serialize(services)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string getServicesForServiceType(String searchKey, String serviceType){
        try {
            String key = '%' + searchKey + '%';
            List<AG_Service__c> services = [SELECT Id, Name, AG_Service_Name__c, AG_Service_Type__c FROM AG_Service__c WHERE AG_Service_Name__c LIKE : key AND AG_Service_Type__c = : serviceType];
            return '{"success" : true, "data" : '+JSON.serialize(services)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string saveServiceLineItem(Id intakeId, Id serviceRequestId, String services){
        try {
            List<AG_Service_Line_Item__c> serviceLineItemList = new List<AG_Service_Line_Item__c>();

            List<Task> taskList = new List<Task>();

            List<Event> eventList = new List<Event>();

            List<ServiceWrapper> serviceWrapperList = (List<ServiceWrapper>) JSON.deserialize(services, List<ServiceWrapper>.class);

            AG_Intake__c intake = [SELECT Id, AG_Client__c FROM AG_Intake__c WHERE Id = : intakeId];

            Account account = [SELECT Id, Name FROM Account WHERE Id = : intake.AG_Client__c];

            Contact contact = [SELECT Id, Name FROM Contact WHERE AccountId = : account.Id];

            for (ServiceWrapper serviceWrapper : serviceWrapperList) {
                AG_Service_Line_Item__c serviceLineItem = new AG_Service_Line_Item__c();
                serviceLineItem.AG_Service_Request__c = serviceRequestId;
                serviceLineItem.AG_Intake__c = intakeId;
                serviceLineItem.AG_Service__c = serviceWrapper.Id;
                serviceLineItem.AG_From_Date__c = serviceWrapper.fromDate;
                serviceLineItem.AG_To_Date__c = serviceWrapper.toDate;
                serviceLineItemList.add(serviceLineItem);
            }

            insert serviceLineItemList;

            AG_Service_Request__c serviceRequest = [SELECT Id, AG_Status__c FROM AG_Service_Request__c WHERE AG_Intake__c =: intakeId];
            serviceRequest.AG_Status__c = 'In Service';
            update serviceRequest;

            for (AG_Service_Line_Item__c serviceLineItem : serviceLineItemList) {
                Task task = new Task();
                task.Description = 'A service line item has been created';
                task.Subject = 'A service line item has been created by' +' '+UserInfo.getName();
                task.ActivityDate = System.today();
                task.Status = 'Completed';
                task.WhatId = serviceLineItem.Id;
                task.WhoId = contact.Id;
                task.Priority = 'High';
                taskList.add(task);

                Event event = new Event();
                event.OwnerId = UserInfo.getUserId();
                event.Location = 'Pittsburg';
                event.Subject = 'Service';
                event.StartDateTime = System.today();
                event.EndDateTime = System.today() + 1;
                event.ActivityDateTime = System.today();
                event.ActivityDate = System.today();
                event.WhoId = contact.Id;
                event.WhatId = serviceLineItem.Id;
                event.Description = 'A service assigned to the user' +' '+UserInfo.getName();
                eventList.add(event);
            }

            insert taskList;

            insert eventList;

            return '{"success": true, "data" : '+JSON.serialize(serviceLineItemList)+', "message": "Service line item created successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<AG_Template__c>  getAssessmentTemplates(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name FROM AG_Template__c  WHERE Name LIKE :key LIMIT 10
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<AG_Template__c>  getAssessmentTemplatesList() {
       return  [SELECT Id, Name FROM AG_Template__c  WHERE AG_Template_Type__c =: 'Assessment' LIMIT 10 ];
    }

    @AuraEnabled(cacheable=true)
    public static List<AG_Service_Request__c>  getServiceRequest(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name FROM AG_Service_Request__c WHERE Name LIKE :key LIMIT 10
        ];
    }

   @AuraEnabled(cacheable=true)
    public static string getAssessmentQuestions(Id assessmentId){
        List<AG_Questionnaire_Template__c> assessmentTempList = [SELECT Id,AG_Question__c,AG_Template__c  FROM AG_Questionnaire_Template__c WHERE AG_Template__c  =: assessmentId];
        Set<String> questionIdList = new Set<String>();

        for (AG_Questionnaire_Template__c assessmentTemp : assessmentTempList) {
            questionIdList.add(assessmentTemp.AG_Question__c);
        }

        List<AG_Question__c> questionList = [SELECT Id,Name,AG_Question_Type__c,AG_Score__c,(SELECT Id,Name,AG_Picklist_Value__c,AG_Score__c FROM Questionaire_Picklist_Values__r) FROM AG_Question__c  WHERE Id IN: questionIdList];
        return '{"success": true, "data" : '+JSON.serialize(questionList)+'}';
    }

    @AuraEnabled(cacheable=true)
    public static string getServiceQuestions(){
        AG_Template__c serviceTemplate = [SELECT Id,Name,AG_Template_Type__c FROM AG_Template__c WHERE AG_Template_Type__c =: 'Service' LIMIT 1];
        List<AG_Questionnaire_Template__c> serviceTempList = [SELECT Id,AG_Question__c,AG_Template__c  FROM AG_Questionnaire_Template__c WHERE AG_Template__c  =: serviceTemplate.Id];
        Set<String> questionIdList = new Set<String>();
        for (AG_Questionnaire_Template__c assessmentTemp : serviceTempList) {
            questionIdList.add(assessmentTemp.AG_Question__c);
        }
        List<AG_Question__c> questionList = [SELECT Id,Name,AG_Question_Type__c,AG_Score__c,(SELECT Id,Name,AG_Picklist_Value__c FROM Questionaire_Picklist_Values__r) FROM AG_Question__c  WHERE Id IN: questionIdList];
        return '{"success": true, "data" : '+JSON.serialize(questionList)+'}';
    }

    @AuraEnabled
    public static string saveAssessmentList(String assessmentObj){
        assessmentWrapper wrapperList = (assessmentWrapper) JSON.deserialize(assessmentObj,assessmentWrapper.class);
        System.debug('assessmentTempList==>'+wrapperList);
        AG_Assessment__c newAssessment = new AG_Assessment__c(AG_Service_Request__c =wrapperList.serviceRequestId,AG_Template__c=wrapperList.assessmentTemplateId, AG_Assessment_Date__c=date.today());
        insert newAssessment;

        List<AG_Assessment_Value__c> newAssessmentValueList = new List<AG_Assessment_Value__c>();
        Integer totalScore = 0 ;

        for(assessmentAnswerWrapper assessmentAnwser : wrapperList.assessmentAnswerList){
            Integer scoreValue = 0 ;
            if(assessmentAnwser.answer != ''){
                scoreValue = assessmentAnwser.score ;
                totalScore = totalScore + assessmentAnwser.score ;
            }
            AG_Assessment_Value__c  newAssessmentValue = new AG_Assessment_Value__c(AG_Assessment__c=newAssessment.Id,Name=assessmentAnwser.question,AG_Answer__c=assessmentAnwser.answer, AG_Score__c =scoreValue);
            newAssessmentValueList.add(newAssessmentValue);
        }
        insert newAssessmentValueList;
        newAssessment.AG_Total_Score__c =  totalScore;
        update newAssessment;
        AG_Service_Request__c serviceRequest = [SELECT Id,AG_Status__c,AG_Total_Score__c FROM AG_Service_Request__c WHERE Id = : wrapperList.serviceRequestId];
        serviceRequest.AG_Status__c = 'In Assessment';
        serviceRequest.AG_Total_Score__c = totalScore;
        update serviceRequest;
        return '{"success": true, "data" : '+JSON.serialize(newAssessment)+'}';
    }
    @AuraEnabled
    public static string saveServiceLogList(String logObjList){
        logWrapper logWrapperList = (logWrapper) JSON.deserialize(logObjList,logWrapper.class);
        AG_Log__c  newLog = new AG_Log__c(AG_Service_Line_Item__c=logWrapperList.serviceLineItemtId);
        insert newLog;
        List<AG_Log_Values__c> logValueList = new List<AG_Log_Values__c>();
        for(logAnswerWrapper logAnwser : logWrapperList.serviceAnswerList){
            AG_Log_Values__c  newLogValues = new AG_Log_Values__c(Name = logAnwser.question,AG_Answer__c = logAnwser.answer,AG_Log__c=newLog.id);
            logValueList.add(newLogValues);
        }
        insert logValueList;
        return '{"success": true, "data" : '+JSON.serialize(logValueList)+'}';
    }
    

    public class assessmentWrapper{
        public String serviceRequestId {get;set;}
        public String assessmentTemplateId {get;set;}
        public List<assessmentAnswerWrapper> assessmentAnswerList {get;set;}
    }

    public class assessmentAnswerWrapper{
        public String question {get;set;}
        public String answer {get;set;}
        public Integer score {get;set;}
    }
    public class logWrapper{
        public String serviceLineItemtId {get;set;}
        public List<logAnswerWrapper> serviceAnswerList {get;set;}
    }

    public class logAnswerWrapper{
        public String question {get;set;}
        public String answer {get;set;}
    }

    public class ServiceWrapper{
        public Id Id;
        public String name;
        public Date fromDate;
        public Date toDate;

        public ServiceWrapper(Id Id, String name, Date fromDate, Date toDate){
            this.Id = Id;
            this.name = name;
            this.fromDate = fromDate;
            this.toDate = toDate;
        }
    }
}