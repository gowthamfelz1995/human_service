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
    public static string getServiceRequest(Id recordId){
        try {
            List<ServiceWrapper> serviceWrapperList = new List<ServiceWrapper>();

            AG_Service_Request__c serviceRequest = [SELECT Id, Name, AG_Intake__c, AG_Service_Type__c FROM AG_Service_Request__c WHERE Id =: recordId];

            for (AG_Service__c service : [SELECT Id, AG_Service_Name__c, AG_Service_Type__c FROM AG_Service__c WHERE AG_Service_Type__c =: serviceRequest.AG_Service_Type__c]) {
                serviceWrapperList.add(new ServiceWrapper(false, service));
            }

            return '{"success" : true, "serviceRequest" : '+JSON.serialize(serviceRequest)+' , "serviceWrapperList" : '+JSON.serialize(serviceWrapperList)+'}';
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
    public static string saveServiceLineItem(Id intakeId, Id serviceId, Date fromDate, Date toDate){
        try {
            AG_Service_Line_Item__c serviceLineItem = new AG_Service_Line_Item__c();
            serviceLineItem.AG_Intake__c = intakeId;
            serviceLineItem.AG_Service__c = serviceId;
            serviceLineItem.AG_From_Date__c = fromDate;
            serviceLineItem.AG_To_Date__c = toDate;
            insert serviceLineItem;
            return '{"success": true, "data" : '+JSON.serialize(serviceLineItem)+', "message": "Service line item created successfully"}';
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
            System.debug('assessmentTempList==>'+assessmentTemp.AG_Assessment_Question__c);
            questionIdList.add(assessmentTemp.AG_Assessment_Question__c);
        }

        List<AG_Assessment_Questions__c> questionList = [SELECT Id,Name,AG_Question_Type__c,(SELECT Id,Name,AG_Picklist_Value__c FROM Questionaire_Picklist_Values__r) FROM AG_Assessment_Questions__c WHERE Id IN: questionIdList];
        System.debug('assessmentTempList==>'+questionList);
        return '{"success": true, "data" : '+JSON.serialize(questionList)+'}';
    }

    @AuraEnabled
    public static string saveAssessmentList(String assessmentObj){
        assessmentWrapper wrapperList = (assessmentWrapper) JSON.deserialize(assessmentObj,assessmentWrapper.class);
        system.debug('assessmentWrapper-->'+wrapperList);
        return 'Success';
        
    }
    public class assessmentWrapper{
        public String serviceRequestId {get;set;}
        public String assessmentTemplateId {get;set;}
        public List<assessmentAnswerWrapper> assessmentAnswerList {get;set;}
    }
    public class assessmentAnswerWrapper{
        public String question {get;set;}
        public String answer {get;set;}
    }
    public class ServiceWrapper{
        public Boolean isSelected;
        public AG_Service__c service;

        public ServiceWrapper(Boolean isSelected, AG_Service__c service){
            this.isSelected = isSelected;
            this.service = service;
        }
    }
}
