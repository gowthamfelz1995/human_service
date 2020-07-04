declare module "@salesforce/apex/AG_Human_Service_CL.findServiceRequest" {
  export default function findServiceRequest(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.waitListLead" {
  export default function waitListLead(param: {recordId: any, comment: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.dischargeClient" {
  export default function dischargeClient(param: {recordId: any, status: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.changeStatusForLead" {
  export default function changeStatusForLead(param: {recordId: any, status: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.findServiceRequestForPlanning" {
  export default function findServiceRequestForPlanning(param: {recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getServicesForServiceType" {
  export default function getServicesForServiceType(param: {searchKey: any, serviceType: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.saveServiceLineItem" {
  export default function saveServiceLineItem(param: {intakeId: any, serviceRequestId: any, services: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplates" {
  export default function getAssessmentTemplates(param: {searchKey: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getAssessmentTemplatesList" {
  export default function getAssessmentTemplatesList(): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getServiceRequest" {
  export default function getServiceRequest(param: {searchKey: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getAssessmentQuestions" {
  export default function getAssessmentQuestions(param: {assessmentId: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.getServiceQuestions" {
  export default function getServiceQuestions(): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.saveAssessmentList" {
  export default function saveAssessmentList(param: {assessmentObj: any}): Promise<any>;
}
declare module "@salesforce/apex/AG_Human_Service_CL.saveServiceLogList" {
  export default function saveServiceLogList(param: {logObjList: any}): Promise<any>;
}
