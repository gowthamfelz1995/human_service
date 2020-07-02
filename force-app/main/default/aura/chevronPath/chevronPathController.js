({
    doInit: function (component, event, helper) {
        let recordId = component.get("v.recordId") || false;
        if (recordId) {
            helper.getServiceRequestDetails(component);
        } else {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type": "Error",
                "message": "Something went wrong"
            });
            toastEvent.fire();
        }
    }
})