public with sharing class AG_Human_Service_CL {

    /*@AuraEnabled
    public static String findReferral(Id recordId){
        try{
            AG_Referral__c referral = getReferralDetails(recordId);
            return '{"success": true, "data": '+JSON.serialize(referral)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    public static AG_Referral__c getReferralDetails(Id recordId){
        try{
            String query = 'SELECT Id,Name,AG_Contact_Person__c,AG_Date_Of_Referral__c,AG_Phone_Number__c,AG_Reffered_By__c,AG_Source_Name__c,AG_Status__c FROM AG_Referral__c WHERE Id =: recordId';
            return Database.query(query);
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static string getServiceProviderForAssessment( Id recordId){
        try{
            AG_Intake__c intake = [SELECT AG_Service_Provider__c  FROM AG_Intake__c WHERE AG_Referral__c =: recordId];
            return '{"success" : true, "data" : '+JSON.serialize(intake)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }*/

    @AuraEnabled
    public static string changeStatus( Id recordId, String status){
        try{
            Lead lead = [SELECT Id, Name, Status  FROM Lead WHERE Id =: recordId];
            lead.status = status;
            update lead;

            return '{"success" : true, "data" : '+JSON.serialize(lead)+'}';
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
    public static string getServiceRequest(Id intakeId){
        try {
            AG_Service_Request__c serviceRequest = [SELECT Id, Name, AG_Service_Type__c FROM AG_Service_Request__c WHERE AG_Intake__c =: intakeId];
            return '{"success" : true, "data" : '+JSON.serialize(serviceRequest)+'}';
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
}
