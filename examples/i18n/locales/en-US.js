/**
 * English (US) language pack example
 *
 * Usage: Copy this file to public/locales/en-US.js
 * Load synchronously in HTML:
 *   <script src="/orbit-i18n.js"></script>
 *   <script src="/locales/en-US.js"></script>
 */
__orbit_i18n_register__('en-US', {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    loading: 'Loading...',
    noData: 'No data',
    success: 'Operation successful',
    failed: 'Operation failed',
    retry: 'Retry',
    back: 'Back',
    search: 'Search',
    reset: 'Reset',
    submit: 'Submit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    selected: '{count} item(s) selected',
    greeting: 'Hello, {name}',
  },
  validation: {
    required: '{field} is required',
    minLength: '{field} must be at least {min} characters',
    maxLength: '{field} must be at most {max} characters',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
  },
  pagination: {
    total: 'Total {total} items',
    pageSize: '{size} per page',
    page: 'Page {current}/{total}',
  },
  error: {
    network: 'Network error, please try again later',
    timeout: 'Request timed out, please try again later',
    unauthorized: 'Unauthorized, please log in again',
    forbidden: 'You do not have permission to perform this action',
    notFound: 'The requested resource was not found',
    server: 'Server error, please try again later',
  },
});
