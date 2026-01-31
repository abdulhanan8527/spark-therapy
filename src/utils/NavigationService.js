import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  }
}

export function resetToRole(role) {
  if (navigationRef.isReady()) {
    let routeName;
    switch (role) {
      case 'admin':
        routeName = 'AdminApp';
        break;
      case 'therapist':
        routeName = 'TherapistApp';
        break;
      case 'parent':
        routeName = 'ParentApp';
        break;
      default:
        routeName = 'ParentApp';
    }
    
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  }
}

export default {
  navigate,
  resetToAuth,
  resetToRole,
  navigationRef,
};