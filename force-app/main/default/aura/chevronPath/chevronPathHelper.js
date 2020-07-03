({
    getServiceRequestDetails: function (component) {
        var toastEvent = $A.get("e.force:showToast");
        let action = component.get("c.findServiceRequest");
        action.setParams({
            "recordId": component.get("v.recordId")
        });
        action.setCallback(this, function (response) {
            if (response.getState() == 'SUCCESS') {
                let res = JSON.parse(response.getReturnValue());
                if (res.success) {
                    component.set("v.serviceRequest", res.data);
                    this.changeStatusPath(component);
                }
            } else {
                toastEvent.setParams({
                    "title": "Error!",
                    "type": "Error",
                    "message": "Something went wrong"
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },

    changeStatusPath: function (component) {
        let serviceRequestRecord = component.get("v.serviceRequest");
        let status = serviceRequestRecord.AG_Status__c;
        let currentStatus = '';

        if (status == 'Started') {
            currentStatus = 'started';
        } else if (status == 'In Assessment') {
            currentStatus = 'assessment';
        } else if (status == 'In Service') {
            currentStatus = 'service';
        } else if (status == 'Discharged') {
            currentStatus = 'AllDone';
        }
        component.set("v.pathValue", currentStatus);
    }
})