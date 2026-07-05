/**
 * Français (France) language pack
 *
 * Contient : traductions + configuration de format locale (date, heure, monnaie, nombre)
 */
__qimen_i18n_register__('fr-FR', {
    // ---- Configuration de format locale ----
    _locale: {
        // Formats de date
        date: {
            short: 'dd/MM/yyyy',           // 05/01/2024
            medium: 'd MMM yyyy',          // 5 janv. 2024
            long: 'd MMMM yyyy',           // 5 janvier 2024
            full: 'EEEE d MMMM yyyy',      // vendredi 5 janvier 2024
        },
        // Formats d'heure
        time: {
            short: 'HH:mm',                // 09:30
            medium: 'HH:mm:ss',            // 09:30:00
            long: 'HH:mm:ss z',            // 09:30:00 CST
        },
        // Formats de monnaie
        currency: {
            code: 'EUR',
            symbol: '€',
            position: 'suffix',            // 1 234,56 €
            decimalDigits: 2,
        },
        // Formats de nombre
        number: {
            decimalSeparator: ',',         // virgule pour les décimales
            groupSeparator: '\u202f',      // espace fine insécable (U+202F)
            groupSize: 3,
        },
        // Conventions d'unités
        units: {
            length: 'metric',              // métrique
            weight: 'metric',
            temperature: 'celsius',
            area: 'metric',
            volume: 'metric',
        },
        // Premier jour de la semaine
        weekStart: 1, // Lundi
        // Cycle 12/24 heures
        hourCycle: 'h23',
    },

    // ---- Traductions courantes ----
    common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        delete: 'Supprimer',
        edit: 'Modifier',
        add: 'Ajouter',
        search: 'Rechercher',
        loading: 'Chargement...',
        noData: 'Aucune donnée',
        success: 'Succès',
        error: 'Erreur',
        yes: 'Oui',
        no: 'Non',
        ok: 'OK',
    },
});
