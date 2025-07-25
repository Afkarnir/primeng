import { CommonModule } from '@angular/common';
import { AfterContentInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ContentChildren, EventEmitter, forwardRef, HostListener, inject, Input, NgModule, numberAttribute, Output, QueryList, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Ripple } from 'primeng/ripple';
import { Nullable } from 'primeng/ts-helpers';
import { ToggleButtonStyle } from './style/togglebuttonstyle';
import { ToggleButtonChangeEvent } from './togglebutton.interface';
import { BaseEditableHolder } from 'primeng/baseeditableholder';

export const TOGGLEBUTTON_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleButton),
    multi: true
};
/**
 * ToggleButton is used to select a boolean value using a button.
 * @group Components
 */
@Component({
    selector: 'p-togglebutton',
    standalone: true,
    imports: [CommonModule, SharedModule],
    hostDirectives: [{ directive: Ripple }],
    host: {
        '[class]': "cn(cx('root'), styleClass)",
        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled()',
        '[attr.aria-labelledby]': 'ariaLabelledBy',
        '[attr.aria-pressed]': 'checked',
        '[attr.data-p-checked]': 'active',
        '[attr.data-p-disabled]': 'disabled()',
        '[attr.required]': 'required()',
        '[attr.type]': '"button"'
    },
    template: `<span [class]="cx('content')">
        <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate; context: { $implicit: checked }"></ng-container>
        @if (!contentTemplate) {
            @if (!iconTemplate) {
                @if (onIcon || offIcon) {
                    <span [class]="cn(cx('icon'), checked ? this.onIcon : this.offIcon, iconPos === 'left' ? cx('iconLeft') : cx('iconRight'))" [attr.data-pc-section]="'icon'"></span>
                }
            } @else {
                <ng-container *ngTemplateOutlet="iconTemplate || _iconTemplate; context: { $implicit: checked }"></ng-container>
            }
            <span [class]="cx('label')" [attr.data-pc-section]="'label'">{{ checked ? (hasOnLabel ? onLabel : ' ') : hasOffLabel ? offLabel : ' ' }}</span>
        }
    </span>`,
    providers: [TOGGLEBUTTON_VALUE_ACCESSOR, ToggleButtonStyle],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleButton extends BaseEditableHolder implements AfterContentInit, ControlValueAccessor {
    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'Enter':
                this.toggle(event);
                event.preventDefault();
                break;
            case 'Space':
                this.toggle(event);
                event.preventDefault();
                break;
        }
    }

    @HostListener('click', ['$event']) toggle(event: Event) {
        if (!this.disabled() && !(this.allowEmpty === false && this.checked)) {
            this.checked = !this.checked;
            this.writeModelValue(this.checked);
            this.onModelChange(this.checked);
            this.onModelTouched();
            this.onChange.emit({
                originalEvent: event,
                checked: this.checked
            });

            this.cd.markForCheck();
        }
    }
    /**
     * Label for the on state.
     * @group Props
     */
    @Input() onLabel: string = 'Yes';
    /**
     * Label for the off state.
     * @group Props
     */
    @Input() offLabel: string = 'No';
    /**
     * Icon for the on state.
     * @group Props
     */
    @Input() onIcon: string | undefined;
    /**
     * Icon for the off state.
     * @group Props
     */
    @Input() offIcon: string | undefined;
    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Style class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Identifier of the focus input to match a label defined for the component.
     * @group Props
     */
    @Input() inputId: string | undefined;
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input({ transform: numberAttribute }) tabindex: number | undefined = 0;
    /**
     * Position of the icon.
     * @group Props
     */
    @Input() iconPos: 'left' | 'right' = 'left';
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autofocus: boolean | undefined;
    /**
     * Defines the size of the component.
     * @group Props
     */
    @Input() size: 'large' | 'small';
    /**
     * Whether selection can not be cleared.
     * @group Props
     */
    @Input() allowEmpty: boolean | undefined;
    /**
     * Callback to invoke on value change.
     * @param {ToggleButtonChangeEvent} event - Custom change event.
     * @group Emits
     */
    @Output() onChange: EventEmitter<ToggleButtonChangeEvent> = new EventEmitter<ToggleButtonChangeEvent>();
    /**
     * Custom icon template.
     * @group Templates
     */
    @ContentChild('icon', { descendants: false }) iconTemplate: Nullable<TemplateRef<any>>;
    /**
     * Custom content template.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: Nullable<TemplateRef<any>>;

    @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

    checked: boolean = false;

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    _componentStyle = inject(ToggleButtonStyle);

    onBlur() {
        this.onModelTouched();
    }

    writeValue(value: any): void {
        this.checked = value;
        this.writeModelValue(value);
        this.cd.markForCheck();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    get hasOnLabel(): boolean {
        return (this.onLabel && this.onLabel.length > 0) as boolean;
    }

    get hasOffLabel(): boolean {
        return (this.onLabel && this.onLabel.length > 0) as boolean;
    }

    get active() {
        return this.checked === true;
    }

    _iconTemplate: TemplateRef<any> | undefined;

    _contentTemplate: TemplateRef<any> | undefined;

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._iconTemplate = item.template;
                    break;
                case 'content':
                    this._contentTemplate = item.template;
                    break;
                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [ToggleButton, SharedModule],
    exports: [ToggleButton, SharedModule]
})
export class ToggleButtonModule {}
