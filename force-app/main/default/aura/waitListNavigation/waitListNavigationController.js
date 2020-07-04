({
    doInit: function (component, event, helper) {
        let recordId = component.get("v.recordId") || false;
        console.log(recordId);
        component.set("v.isModal", true);
    },
    handleSave : function (component, event, helper) {
        var action = component.get("c.waitListLead");
        var recordId = component.get("v.recordId");
        var commentValue = component.get("v.commentValue");
         var waitUntilDate = component.get("v.waitUntil");
        console.log("ENTERS");
        action.setParams ({ "comment" : commentValue,"waitUntil":waitUntilDate,"recordId" : recordId });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS"){
                 var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "type": "success",
                    "message": "Waitlisted successfully!"
                });
                toastEvent.fire();
                var navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                    "recordId": recordId,
                    "slideDevName": "related"
                });
                navEvt.fire();
                var dismissActionPanel = $A.get("e.force:closeQuickAction");
                 dismissActionPanel.fire();
                 $A.get('e.force:refreshView').fire();
            }
        });
        $A.enqueueAction(action);
    },
     closeModal : function(component,event,helper) {
         var dismissActionPanel = $A.get("e.force:closeQuickAction");
         dismissActionPanel.fire();
    },
})