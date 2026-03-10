export interface RegistrationFormData {
  // Maps to registrants table columns
  email: string;                                    
  agreedToPrivacy: boolean;                      
  firstName: string;                              
  lastName: string;                               
  dynamicAnswers: Record<string, string | File>; 
}

export const INITIAL_DATA: RegistrationFormData = {
  email: '',
  agreedToPrivacy: false,
  firstName: '',
  lastName: '',
  dynamicAnswers: {}
};
