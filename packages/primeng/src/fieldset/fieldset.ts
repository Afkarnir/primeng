import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AfterContentInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ContentChildren, EventEmitter, inject, Input, NgModule, Output, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { uuid } from '@primeuix/utils';
import { BlockableUI, PrimeTemplate, SharedModule } from 'primeng/api';
import { BaseComponent } from 'primeng/basecomponent';
import { ButtonModule } from 'primeng/button';
import { MinusIcon, PlusIcon } from 'primeng/icons';
import { Nullable } from 'primeng/ts-helpers';
import { FieldsetAfterToggleEvent, FieldsetBeforeToggleEvent } from './fieldset.interface';
import { FieldsetStyle } from './style/fieldsetstyle';

/**
 * Fieldset is a grouping component with the optional content toggle feature.
 * @group Components
 */
@Component({
    selector: 'p-fieldset',
    standalone: true,
    imports: [CommonModule, ButtonModule, MinusIcon, PlusIcon, SharedModule],
    template: `
        <fieldset [attr.id]="id" [style]="sx('root')" [class]="cx('root')" [attr.data-pc-name]="'fieldset'" [attr.data-pc-section]="'root'">
            <legend [class]="cx('legend')" [attr.data-pc-section]="'legend'">
                <ng-container *ngIf="toggleable; else legendContent">
                    <button
                        [attr.id]="id + '_header'"
                        tabindex="0"
                        role="button"
                        [attr.aria-controls]="id + '_content'"
                        [attr.aria-expanded]="!collapsed"
                        [attr.aria-label]="buttonAriaLabel"
                        (click)="toggle($event)"
                        (keydown)="onKeyDown($event)"
                        [class]="cx('toggleButton')"
                    >
                        <ng-container *ngIf="collapsed">
                            <PlusIcon *ngIf="!expandIconTemplate && !_expandIconTemplate" [styleClass]="cx('toggleIcon')" [attr.data-pc-section]="'togglericon'" />
                            <span *ngIf="expandIconTemplate || _expandIconTemplate" [class]="cx('toggleIcon')" [attr.data-pc-section]="'togglericon'">
                                <ng-container *ngTemplateOutlet="expandIconTemplate || _expandIconTemplate"></ng-container>
                            </span>
                        </ng-container>
                        <ng-container *ngIf="!collapsed">
                            <MinusIcon *ngIf="!collapseIconTemplate && !_collapseIconTemplate" [styleClass]="cx('toggleIcon')" [attr.aria-hidden]="true" [attr.data-pc-section]="'togglericon'" />
                            <span *ngIf="collapseIconTemplate || _collapseIconTemplate" [class]="cx('toggleIcon')" [attr.data-pc-section]="'togglericon'">
                                <ng-container *ngTemplateOutlet="collapseIconTemplate || _collapseIconTemplate"></ng-container>
                            </span>
                        </ng-container>
                        <ng-container *ngTemplateOutlet="legendContent"></ng-container>
                    </button>
                </ng-container>
                <ng-template #legendContent>
                    <span [class]="cx('legendLabel')" [attr.data-pc-section]="'legendtitle'">{{ legend }}</span>
                    <ng-content select="p-header"></ng-content>
                    <ng-container *ngTemplateOutlet="headerTemplate || _headerTemplate"></ng-container>
                </ng-template>
            </legend>
            <div
                [attr.id]="id + '_content'"
                role="region"
                [class]="cx('contentContainer')"
                [@fieldsetContent]="collapsed ? { value: 'hidden', params: { transitionParams: transitionOptions, height: '0' } } : { value: 'visible', params: { transitionParams: animating ? transitionOptions : '0ms', height: '*' } }"
                [attr.aria-labelledby]="id + '_header'"
                [attr.aria-hidden]="collapsed"
                [attr.data-pc-section]="'toggleablecontent'"
                (@fieldsetContent.done)="onToggleDone()"
            >
                <div [class]="cx('content')" [attr.data-pc-section]="'content'">
                    <ng-content></ng-content>
                    <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
                </div>
            </div>
        </fieldset>
    `,
    animations: [
        trigger('fieldsetContent', [
            state(
                'hidden',
                style({
                    height: '0',
                    overflow: 'hidden'
                })
            ),
            state(
                'visible',
                style({
                    height: '*'
                })
            ),
            transition('visible <=> hidden', [animate('{{transitionParams}}')]),
            transition('void => *', animate(0))
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FieldsetStyle]
})
export class Fieldset extends BaseComponent implements AfterContentInit, BlockableUI {
    /**
     * Header text of the fieldset.
     * @group Props
     */
    @Input() legend: string | undefined;
    /**
     * When specified, content can toggled by clicking the legend.
     * @group Props
     * @defaultValue false
     */
    @Input({ transform: booleanAttribute }) toggleable: boolean | undefined;
    /**
     * Defines the default visibility state of the content.
     * * @group Props
     */
    @Input({ transform: booleanAttribute }) collapsed: boolean | undefined = false;
    /**
     * Inline style of the component.
     * @group Props
     */
    @Input() style: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the component.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Transition options of the panel animation.
     * @group Props
     */
    @Input() transitionOptions: string = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
    /**
     * Emits when the collapsed state changes.
     * @param {boolean} value - New value.
     * @group Emits
     */
    @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    /**
     * Callback to invoke before panel toggle.
     * @param {PanelBeforeToggleEvent} event - Custom toggle event
     * @group Emits
     */
    @Output() onBeforeToggle: EventEmitter<FieldsetBeforeToggleEvent> = new EventEmitter<FieldsetBeforeToggleEvent>();
    /**
     * Callback to invoke after panel toggle.
     * @param {PanelAfterToggleEvent} event - Custom toggle event
     * @group Emits
     */
    @Output() onAfterToggle: EventEmitter<FieldsetAfterToggleEvent> = new EventEmitter<FieldsetAfterToggleEvent>();

    get id() {
        return uuid('pn_id_');
    }

    get buttonAriaLabel() {
        return this.legend;
    }

    public animating: Nullable<boolean>;

    _componentStyle = inject(FieldsetStyle);

    /**
     * Defines the header template.
     * @group Templates
     */
    @ContentChild('header', { descendants: false }) headerTemplate: TemplateRef<any> | undefined;

    /**
     * Defines the expandicon template.
     * @group Templates
     */
    @ContentChild('expandicon', { descendants: false }) expandIconTemplate: TemplateRef<any> | undefined;

    /**
     * Defines the collapseicon template.
     * @group Templates
     */
    @ContentChild('collapseicon', { descendants: false }) collapseIconTemplate: TemplateRef<any> | undefined;

    /**
     * Defines the content template.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: TemplateRef<any> | undefined;

    toggle(event: MouseEvent) {
        if (this.animating) {
            return false;
        }

        this.animating = true;
        this.onBeforeToggle.emit({ originalEvent: event, collapsed: this.collapsed });

        if (this.collapsed) this.expand();
        else this.collapse();

        this.onAfterToggle.emit({ originalEvent: event, collapsed: this.collapsed });
        event.preventDefault();
    }

    onKeyDown(event) {
        if (event.code === 'Enter' || event.code === 'Space') {
            this.toggle(event);
            event.preventDefault();
        }
    }

    expand() {
        this.collapsed = false;
        this.collapsedChange.emit(this.collapsed);
    }

    collapse() {
        this.collapsed = true;
        this.collapsedChange.emit(this.collapsed);
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    onToggleDone() {
        this.animating = false;
    }

    _headerTemplate: TemplateRef<any> | undefined;

    _expandIconTemplate: TemplateRef<any> | undefined;

    _collapseIconTemplate: TemplateRef<any> | undefined;

    _contentTemplate: TemplateRef<any> | undefined;

    @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'expandicon':
                    this._expandIconTemplate = item.template;
                    break;

                case 'collapseicon':
                    this._collapseIconTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Fieldset, SharedModule],
    exports: [Fieldset, SharedModule]
})
export class FieldsetModule {}
