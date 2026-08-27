import { Component } from '../Component';
import type { Definitions } from '@/composable/types';

const FloatingComponentDefs: Definitions = {
    options: {
        anchor: null,
        placement: null,
        offset: null,
        showDelay: null,
        hideDelay: null,
        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,
        position: null,
        zIndex: null,
    },
    property: {
        _overlayOpen: false,
    },
};

export class FloatingComponent extends Component {}

FloatingComponent.define(FloatingComponentDefs);
