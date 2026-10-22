import { InputComponent } from './InputComponent';
import { IconComponent } from '../icon/IconComponent';
import { Definitions } from '@/composable';
import './search-bar.css';

const SearchBarComponentDefs: Definitions = {
    options: {
        clearable: true,
    },
} as const;

class SearchBarComponent extends InputComponent {
    static type = 'search-bar';

    get defaultOptions(): Record<string, any> {
        return {
            ...super.defaultOptions,
            prefix: { type: IconComponent, iconCls: 'q-icon-search' },
            placeholder: '搜索...',
        };
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-search-bar');
    }

    onFieldInput(): void {
        super.onFieldInput();
        this.emit('search', { value: this.value });
    }
}

SearchBarComponent.define(SearchBarComponentDefs);

export { SearchBarComponent };
export type SearchBarComponentInstance = InstanceType<typeof SearchBarComponent>;
