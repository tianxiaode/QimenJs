/**
 * English (US) language pack
 *
 * Includes: translations + locale format config (date, time, currency, number)
 */
__qimen_i18n_register__('en-US', {
    // ---- Locale format config ----
    _locale: {
        // Date formats
        date: {
            short: 'M/d/yyyy',          // 1/5/2024
            medium: 'MMM d, yyyy',      // Jan 5, 2024
            long: 'MMMM d, yyyy',       // January 5, 2024
            full: 'EEEE, MMMM d, yyyy', // Friday, January 5, 2024
        },
        // Time formats
        time: {
            short: 'h:mm a',            // 9:30 AM
            medium: 'h:mm:ss a',        // 9:30:00 AM
            long: 'h:mm:ss a z',        // 9:30:00 AM CST
        },
        // Currency formats
        currency: {
            code: 'USD',
            symbol: '$',
            position: 'prefix',         // $1,234.56
            decimalDigits: 2,
        },
        // Number formats
        number: {
            decimalSeparator: '.',
            groupSeparator: ',',
            groupSize: 3,
        },
        // Unit conventions
        units: {
            length: 'imperial',         // imperial (miles, feet, etc.)
            weight: 'imperial',         // imperial (pounds, ounces)
            temperature: 'fahrenheit',
            area: 'imperial',
            volume: 'imperial',
        },
        // Week start day
        weekStart: 0, // Sunday
        // 12/24 hour cycle
        hourCycle: 'h12',
    },

    // ---- Common translations ----
    common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        noData: 'No data',
        success: 'Success',
        error: 'Error',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
    },
});
