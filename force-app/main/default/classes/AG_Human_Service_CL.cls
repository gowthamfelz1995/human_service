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
    public static string waitListLead( Id recordId, String status){
        try{
            Lead lead = [SELECT Id, Name, Status  FROM Lead WHERE Id =: recordId];
            lead.status = status;
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

            Account account = [SELECT Id, AG_Status__c, (SELECT Id FROM Intakes2__r WHERE Id =: serviceRequest.AG_Intake__c) FROM Account];
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
    public static string saveServiceLineItem(Id intakeId, String services){
        try {
            List<AG_Service_Line_Item__c> serviceLineItemList = new List<AG_Service_Line_Item__c>();

            List<ServiceWrapper> serviceWrapperList = (List<ServiceWrapper>) JSON.deserialize(services, List<ServiceWrapper>.class);

            for (ServiceWrapper serviceWrapper : serviceWrapperList) {
                AG_Service_Line_Item__c serviceLineItem = new AG_Service_Line_Item__c();
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

            return '{"success": true, "data" : '+JSON.serialize(serviceLineItemList)+', "message": "Service line item created successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<AG_Assessment_Template__c>  getAssessmentTemplates(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name FROM AG_Assessment_Template__c WHERE Name LIKE :key LIMIT 10
        ];
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
        List<AG_Template_Questionnaires__c> assessmentTempList = [SELECT Id,AG_Assessment_Question__c,AG_Assessment_Template__c FROM AG_Template_Questionnaires__c WHERE AG_Assessment_Template__c =: assessmentId];
        Set<String> questionIdList = new Set<String>();

        for (AG_Template_Questionnaires__c assessmentTemp : assessmentTempList) {
            questionIdList.add(assessmentTemp.AG_Assessment_Question__c);
        }

        List<AG_Assessment_Questions__c> questionList = [SELECT Id,Name,AG_Question_Type__c,AG_Score__c,(SELECT Id,Name,AG_Picklist_Value__c FROM Questionaire_Picklist_Values__r) FROM AG_Assessment_Questions__c WHERE Id IN: questionIdList];
        return '{"success": true, "data" : '+JSON.serialize(questionList)+'}';
    }

    @AuraEnabled
    public static string saveAssessmentList(String assessmentObj){
        assessmentWrapper wrapperList = (assessmentWrapper) JSON.deserialize(assessmentObj,assessmentWrapper.class);
        System.debug('assessmentTempList==>'+wrapperList);
        AG_Assessment__c newAssessment = new AG_Assessment__c(AG_Service_Request__c =wrapperList.serviceRequestId,AG_Assessment_Template__c=wrapperList.assessmentTemplateId, AG_Assessment_Date__c=date.today());
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
        return '{"success": true, "data" : '+JSON.serialize(newAssessment)+'}';

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
