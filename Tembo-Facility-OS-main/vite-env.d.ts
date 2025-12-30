
/// <reference types="vite/client" />

import { RecaptchaVerifier, GreCAPTCHA as Grecaptcha } from 'firebase/auth';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    grecaptcha?: Grecaptcha;
  }
}
