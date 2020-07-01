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
    public static string createSurveyInvitationLink(Id recordId){
        try{
            AG_Service_Request__c serviceRequest = [SELECT Id,AG_Intake__c,AG_Service_Type__c  FROM AG_Service_Request__c WHERE Id =: recordId];
            String assessmentType = '' ;
            if(serviceRequest.AG_Service_Type__c == 'Adults'){
              assessmentType = 'Adults Assessment';
            }else{
             assessmentType = 'Adults Assessment' ;
            }
            Survey surveyRecord = [SELECT Id,Name FROM Survey WHERE Name =: assessmentType];
            System.debug(surveyRecord);
            SurveyInvitation newSurveyInvitation = new SurveyInvitation(AG_Intake__c = serviceRequest.AG_Intake__c,SurveyId=surveyRecord.Id,Name=surveyRecord.Name);
            insert newSurveyInvitation;
            SurveyInvitation getSurveyInvite = [SELECT Id,SurveyId,InvitationLink,AG_Intake__c,Name FROM SurveyInvitation WHERE Id =: newSurveyInvitation.Id];
            return '{"success" : true, "data" : '+JSON.serialize(getSurveyInvite)+'}';
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

            return '{"success" : true, "data" : '+JSON.serialize(lead)+'}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }
}
