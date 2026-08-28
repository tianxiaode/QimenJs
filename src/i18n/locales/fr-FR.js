/**
 * Pack de langue française
 *
 * Contient : traductions + configuration de format régional (date, heure, monnaie, nombre)
 */
__qimen_i18n_register__('fr-FR', {
    _locale: {
        date: {
            short: 'dd/MM/yyyy',
            medium: 'd MMM yyyy',
            long: 'd MMMM yyyy',
            full: 'EEEE d MMMM yyyy',
        },
        time: {
            short: 'HH:mm',
            medium: 'HH:mm:ss',
            long: 'HH:mm:ss z',
        },
        currency: {
            code: 'EUR',
            symbol: '€',
            position: 'suffix',
            decimalDigits: 2,
        },
        number: {
            decimalSeparator: ',',
            groupSeparator: ' ',
            groupSize: 3,
        },
        units: {
            length: 'metric',
            weight: 'metric',
            temperature: 'celsius',
            area: 'metric',
            volume: 'metric',
        },
        weekStart: 1,
        hourCycle: 'h23',
        weekdays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        weekdaysShort: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],
        months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        monthsShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    },
    common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        delete: 'Supprimer',
        edit: 'Modifier',
        add: 'Ajouter',
        search: 'Rechercher',
        reset: 'Réinitialiser',
        submit: 'Soumettre',
        close: 'Fermer',
        loading: 'Chargement...',
        noData: 'Aucune donnée',
        success: 'Opération réussie',
        error: 'Échec de l\'opération',
        failed: 'Échec de l\'opération',
        retry: 'Réessayer',
        back: 'Retour',
        yes: 'Oui',
        no: 'Non',
        ok: 'OK',
        all: 'Tout',
        selected: '{count} élément(s) sélectionné(s)',
        greeting: 'Bonjour, {name}',
    },
    validation: {
        required: '{field} est requis',
        minLength: '{field} doit comporter au moins {min} caractères',
        maxLength: '{field} doit comporter au plus {max} caractères',
        email: 'Veuillez entrer une adresse email valide',
        phone: 'Veuillez entrer un numéro de téléphone valide',
    },
    pagination: {
        total: '{total} éléments au total',
        pageSize: '{size} par page',
        page: 'Page {current}/{total}',
    },
    error: {
        network: 'Erreur réseau, veuillez réessayer plus tard',
        timeout: 'La requête a expiré, veuillez réessayer plus tard',
        unauthorized: 'Non autorisé, veuillez vous reconnecter',
        forbidden: 'Vous n\'avez pas la permission d\'effectuer cette action',
        notFound: 'La ressource demandée est introuvable',
        server: 'Erreur serveur, veuillez réessayer plus tard',
    },
});