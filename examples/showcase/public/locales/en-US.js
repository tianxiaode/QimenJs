/**
 * English (US) language pack
 *
 * Includes: translations + locale format configuration (date, time, currency, number)
 */
__qimen_i18n_register__('en-US', {
    _locale: {
        date: {
            short: 'M/d/yyyy',
            medium: 'MMM d, yyyy',
            long: 'MMMM d, yyyy',
            full: 'EEEE, MMMM d, yyyy',
        },
        time: {
            short: 'h:mm a',
            medium: 'h:mm:ss a',
            long: 'h:mm:ss a z',
        },
        currency: {
            code: 'USD',
            symbol: '$',
            position: 'prefix',
            decimalDigits: 2,
        },
        number: {
            decimalSeparator: '.',
            groupSeparator: ',',
            groupSize: 3,
        },
        units: {
            length: 'imperial',
            weight: 'imperial',
            temperature: 'fahrenheit',
            area: 'imperial',
            volume: 'imperial',
        },
        weekStart: 0,
        hourCycle: 'h12',
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        reset: 'Reset',
        submit: 'Submit',
        close: 'Close',
        loading: 'Loading...',
        noData: 'No data',
        success: 'Operation successful',
        error: 'Operation failed',
        failed: 'Operation failed',
        retry: 'Retry',
        back: 'Back',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
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