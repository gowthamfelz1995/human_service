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
    public static string waitListReferral( Id recordId){
        try{
            AG_Referral__c referral = [SELECT Id, AG_Status__c  FROM AG_Referral__c WHERE Id =: recordId];
            referral.AG_Status__c = 'WaitListed';
            update referral;
            return '{"success" : true, "message" : "The referral record waitlisted successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
        }
    }

    @AuraEnabled
    public static string dischargeReferral( Id recordId){
        try{
            AG_Referral__c referral = [SELECT Id, AG_Status__c  FROM AG_Referral__c WHERE Id =: recordId];
            referral.AG_Status__c = 'Discharged';
            update referral;
            return '{"success" : true, "message" : "The referral record discharged successfully"}';
        }
        catch(Exception e){
            System.debug(e.getLineNumber());
            System.debug(e.getMessage());
            return '{"success": false, "message": "'+e.getMessage()+'"}';
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
            Lead lead = [SELECT Id, Status  FROM Lead WHERE Id =: recordId];
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
}
