import { Platform } from 'react-native';

// Create dynamic imports for PDF components
const getPDFComponents = () => {
  if (Platform.OS !== 'web') {
    try {
      // Use Function constructor to prevent Metro from analyzing the require
      const dynamicRequire = new Function('moduleName', 'return require(moduleName)');
      
      const pdfModule = dynamicRequire('react-native-pdf');
      const rnFetchBlobModule = dynamicRequire('rn-fetch-blob');
      return {
        Pdf: pdfModule.default || pdfModule,
        RNFetchBlob: rnFetchBlobModule.default || rnFetchBlobModule
      };
    } catch (error) {
      console.warn('PDF modules not available:', error);
      return { Pdf: null, RNFetchBlob: null };
    }
  } else {
    // For web, return null since we'll handle PDFs differently
    return { Pdf: null, RNFetchBlob: null };
  }
};

export { getPDFComponents };