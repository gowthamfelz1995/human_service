declare module "@salesforce/apex/AG_Human_Service_CL.findServiceRequest" {
  export default function findServiceRequest(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.waitListLead" {
  export default function waitListLead(param: {recordId: any, status: any, comments: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.dischargeClient" {
  export default function dischargeClient(param: {recordId: any, status: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.changeStatusForLead" {
  export default function changeStatusForLead(param: {recordId: any, status: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getServiceRequest" {
  export default function getServiceRequest(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getServicesForServiceType" {
  export default function getServicesForServiceType(param: {searchKey: any, serviceType: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.saveServiceLineItem" {
  export default function saveServiceLineItem(param: {intakeId: any, serviceId: any, fromDate: any, toDate: any}): Promise<any>;
}
