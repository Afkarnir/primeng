import { animate, AnimationEvent, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    inject,
    Input,
    NgModule,
    numberAttribute,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    signal,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
    appendChild,
    calculateScrollbarWidth,
    findLastIndex,
    findSingle,
    focus,
    getHiddenElementOuterHeight,
    getHiddenElementOuterWidth,
    getOffset,
    getOuterWidth,
    getViewport,
    isAndroid,
    isEmpty,
    isIOS,
    isNotEmpty,
    isPrintableCharacter,
    removeChild,
    resolve,
    uuid
} from '@primeuix/utils';
import { MenuItem, OverlayService, PrimeTemplate, SharedModule } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { BaseComponent } from 'primeng/basecomponent';
import { AngleRightIcon } from 'primeng/icons';
import { Ripple } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { VoidListener } from 'primeng/ts-helpers';
import { ZIndexUtils } from 'primeng/utils';
import { ContextMenuStyle } from './style/contextmenustyle';

@Component({
    selector: 'p-contextMenuSub, p-contextmenu-sub',
    standalone: true,
    imports: [CommonModule, RouterModule, Ripple, TooltipModule, AngleRightIcon, BadgeModule, SharedModule],
    template: `
        <ul
            *ngIf="root ? true : visible"
            #sublist
            role="menu"
            [class]="root ? cx('rootList') : cx('submenu')"
            [@overlayAnimation]="visible"
            (@overlayAnimation.start)="onEnter($event, sublist)"
            [attr.id]="menuId + '_list'"
            [tabindex]="tabindex"
            [attr.aria-label]="ariaLabel"
            [attr.aria-labelledBy]="ariaLabelledBy"
            [attr.aria-activedescendant]="focusedItemId"
            [attr.aria-orientation]="'vertical'"
            [attr.data-pc-section]="'menu'"
            (keydown)="menuKeydown.emit($event)"
            (focus)="menuFocus.emit($event)"
            (blur)="menuBlur.emit($event)"
        >
            <ng-template ngFor let-processedItem [ngForOf]="items" let-index="index">
                <li
                    *ngIf="isItemVisible(processedItem) && getItemProp(processedItem, 'separator')"
                    [attr.id]="getItemId(processedItem)"
                    [style]="getItemProp(processedItem, 'style')"
                    [class]="cn(cx('separator'), getItemProp(processedItem, 'styleClass'))"
                    role="separator"
                    [attr.data-pc-section]="'separator'"
                ></li>
                <li
                    #listItem
                    *ngIf="isItemVisible(processedItem) && !getItemProp(processedItem, 'separator')"
                    role="menuitem"
                    [attr.id]="getItemId(processedItem)"
                    [attr.data-pc-section]="'menuitem'"
                    [attr.data-p-highlight]="isItemActive(processedItem)"
                    [attr.data-p-focused]="isItemFocused(processedItem)"
                    [attr.data-p-disabled]="isItemDisabled(processedItem)"
                    [attr.aria-label]="getItemLabel(processedItem)"
                    [attr.aria-disabled]="isItemDisabled(processedItem) || undefined"
                    [attr.aria-haspopup]="isItemGroup(processedItem) && !getItemProp(processedItem, 'to') ? 'menu' : undefined"
                    [attr.aria-expanded]="isItemGroup(processedItem) ? isItemActive(processedItem) : undefined"
                    [attr.aria-level]="level + 1"
                    [attr.aria-setsize]="getAriaSetSize()"
                    [attr.aria-posinset]="getAriaPosInset(index)"
                    [style]="getItemProp(processedItem, 'style')"
                    [class]="cn(cx('item', { instance: this, processedItem }), processedItem?.styleClass)"
                    pTooltip
                    [tooltipOptions]="getItemProp(processedItem, 'tooltipOptions')"
                >
                    <div [attr.data-pc-section]="'content'" [class]="cx('itemContent')" (click)="onItemClick($event, processedItem)" (mouseenter)="onItemMouseEnter({ $event, processedItem })">
                        <ng-container *ngIf="!itemTemplate">
                            <a
                                *ngIf="!getItemProp(processedItem, 'routerLink')"
                                [attr.href]="getItemProp(processedItem, 'url')"
                                [attr.aria-hidden]="true"
                                [attr.data-automationid]="getItemProp(processedItem, 'automationId')"
                                [attr.data-pc-section]="'action'"
                                [target]="getItemProp(processedItem, 'target')"
                                [class]="cx('itemLink')"
                                [attr.tabindex]="-1"
                                pRipple
                            >
                                <span
                                    *ngIf="getItemProp(processedItem, 'icon')"
                                    [class]="cn(cx('itemIcon'), getItemProp(processedItem, 'icon'))"
                                    [ngStyle]="getItemProp(processedItem, 'iconStyle')"
                                    [attr.data-pc-section]="'icon'"
                                    [attr.aria-hidden]="true"
                                    [attr.tabindex]="-1"
                                >
                                </span>
                                <span *ngIf="getItemProp(processedItem, 'escape'); else htmlLabel" [class]="cx('itemLabel')" [attr.data-pc-section]="'label'">
                                    {{ getItemLabel(processedItem) }}
                                </span>
                                <ng-template #htmlLabel> <span [class]="cx('itemLabel')" [innerHTML]="getItemLabel(processedItem)" [attr.data-pc-section]="'label'"></span> </ng-template>
                                <p-badge *ngIf="getItemProp(processedItem, 'badge')" [class]="getItemProp(processedItem, 'badgeStyleClass')" [value]="getItemProp(processedItem, 'badge')" />
                                <ng-container *ngIf="isItemGroup(processedItem)">
                                    <AngleRightIcon *ngIf="!contextMenu.submenuIconTemplate && !contextMenu._submenuIconTemplate" [class]="cx('itemIcon')" [attr.data-pc-section]="'submenuicon'" [attr.aria-hidden]="true" />
                                    <ng-template
                                        *ngTemplateOutlet="contextMenu.submenuIconTemplate || contextMenu._submenuIconTemplate; context: { class: 'p-contextmenu-submenu-icon' }"
                                        [attr.data-pc-section]="'submenuicon'"
                                        [attr.aria-hidden]="true"
                                    ></ng-template>
                                </ng-container>
                            </a>
                            <a
                                *ngIf="getItemProp(processedItem, 'routerLink')"
                                [routerLink]="getItemProp(processedItem, 'routerLink')"
                                [attr.data-automationid]="getItemProp(processedItem, 'automationId')"
                                [attr.tabindex]="-1"
                                [attr.aria-hidden]="true"
                                [attr.data-pc-section]="'action'"
                                [queryParams]="getItemProp(processedItem, 'queryParams')"
                                [routerLinkActiveOptions]="getItemProp(processedItem, 'routerLinActiveOptions') || { exact: false }"
                                [target]="getItemProp(processedItem, 'target')"
                                [class]="cx('itemLink')"
                                [fragment]="getItemProp(processedItem, 'fragment')"
                                [queryParamsHandling]="getItemProp(processedItem, 'queryParamsHandling')"
                                [preserveFragment]="getItemProp(processedItem, 'preserveFragment')"
                                [skipLocationChange]="getItemProp(processedItem, 'skipLocationChange')"
                                [replaceUrl]="getItemProp(processedItem, 'replaceUrl')"
                                [state]="getItemProp(processedItem, 'state')"
                                pRipple
                            >
                                <span
                                    *ngIf="getItemProp(processedItem, 'icon')"
                                    [class]="cn(cx('itemIcon'), getItemProp(processedItem, 'icon'))"
                                    [ngStyle]="getItemProp(processedItem, 'iconStyle')"
                                    [attr.data-pc-section]="'icon'"
                                    [attr.aria-hidden]="true"
                                    [attr.tabindex]="-1"
                                >
                                </span>
                                <span *ngIf="getItemProp(processedItem, 'escape'); else htmlLabel" [class]="cx('itemLabel')" [attr.data-pc-section]="'label'">
                                    {{ getItemLabel(processedItem) }}
                                </span>
                                <ng-template #htmlLabel>
                                    <span [class]="cx('itemLabel')" [innerHTML]="getItemLabel(processedItem)" [attr.data-pc-section]="'label'"></span>
                                </ng-template>
                                <p-badge *ngIf="getItemProp(processedItem, 'badge')" [class]="getItemProp(processedItem, 'badgeStyleClass')" [value]="getItemProp(processedItem, 'badge')" />
                                <ng-container *ngIf="isItemGroup(processedItem)">
                                    <AngleRightIcon *ngIf="!contextMenu.submenuIconTemplate && !contextMenu._submenuIconTemplate" [class]="cx('submenuIcon')" [attr.data-pc-section]="'submenuicon'" [attr.aria-hidden]="true" />
                                    <ng-template
                                        *ngTemplateOutlet="!contextMenu.submenuIconTemplate || !contextMenu._submenuIconTemplate; context: { class: 'p-contextmenu-submenu-icon' }"
                                        [attr.data-pc-section]="'submenuicon'"
                                        [attr.aria-hidden]="true"
                                    ></ng-template>
                                </ng-container>
                            </a>
                        </ng-container>
                        <ng-container *ngIf="itemTemplate">
                            <ng-template *ngTemplateOutlet="itemTemplate; context: { $implicit: processedItem.item }"></ng-template>
                        </ng-container>
                    </div>

                    <p-contextmenu-sub
                        *ngIf="isItemVisible(processedItem) && isItemGroup(processedItem)"
                        [items]="processedItem.items"
                        [itemTemplate]="itemTemplate"
                        [menuId]="menuId"
                        [visible]="isItemActive(processedItem) && isItemGroup(processedItem)"
                        [activeItemPath]="activeItemPath"
                        [focusedItemId]="focusedItemId"
                        [level]="level + 1"
                        (itemClick)="itemClick.emit($event)"
                        (itemMouseEnter)="onItemMouseEnter($event)"
                    />
                </li>
            </ng-template>
        </ul>
    `,
    animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0 })]), transition(':leave', [style({ opacity: 0 })])])],
    encapsulation: ViewEncapsulation.None,
    providers: [ContextMenuStyle]
})
export class ContextMenuSub extends BaseComponent {
    @Input({ transform: booleanAttribute }) visible: boolean = false;

    @Input() items: any[];

    @Input() itemTemplate: TemplateRef<any> | undefined;

    @Input({ transform: booleanAttribute }) root: boolean | undefined = false;

    @Input({ transform: booleanAttribute }) autoZIndex: boolean = true;

    @Input({ transform: numberAttribute }) baseZIndex: number = 0;

    @Input({ transform: booleanAttribute }) popup: boolean | undefined;

    @Input() menuId: string | undefined;

    @Input() ariaLabel: string | undefined;

    @Input() ariaLabelledBy: string | undefined;

    @Input({ transform: numberAttribute }) level: number = 0;

    @Input() focusedItemId: string | undefined;

    @Input() activeItemPath: any[];

    @Input({ transform: numberAttribute }) tabindex: number = 0;

    @Output() itemClick: EventEmitter<any> = new EventEmitter();

    @Output() itemMouseEnter: EventEmitter<any> = new EventEmitter();

    @Output() menuFocus: EventEmitter<any> = new EventEmitter();

    @Output() menuBlur: EventEmitter<any> = new EventEmitter();

    @Output() menuKeydown: EventEmitter<any> = new EventEmitter();

    @ViewChild('sublist') sublistViewChild: ElementRef;

    _componentStyle = inject(ContextMenuStyle);

    constructor(@Inject(forwardRef(() => ContextMenu)) public contextMenu: ContextMenu) {
        super();
    }

    getItemProp(processedItem: any, name: string, params: any | null = null): any {
        return processedItem && processedItem.item ? resolve(processedItem.item[name], params) : undefined;
    }

    getItemId(processedItem: any): string {
        return processedItem.item && processedItem.item?.id ? processedItem.item.id : `${this.menuId}_${processedItem.key}`;
    }

    getItemKey(processedItem: any): string {
        return this.getItemId(processedItem);
    }

    getItemLabel(processedItem: any): string {
        return this.getItemProp(processedItem, 'label');
    }

    getAriaSetSize() {
        return this.items.filter((processedItem) => this.isItemVisible(processedItem) && !this.getItemProp(processedItem, 'separator')).length;
    }

    getAriaPosInset(index: number) {
        return index - this.items.slice(0, index).filter((processedItem) => this.isItemVisible(processedItem) && this.getItemProp(processedItem, 'separator')).length + 1;
    }

    isItemVisible(processedItem: any): boolean {
        return this.getItemProp(processedItem, 'visible') !== false;
    }

    isItemActive(processedItem: any): boolean {
        if (this.activeItemPath) {
            return this.activeItemPath.some((path) => path.key === processedItem.key);
        }
    }

    isItemDisabled(processedItem: any): boolean {
        return this.getItemProp(processedItem, 'disabled');
    }

    isItemFocused(processedItem: any): boolean {
        return this.focusedItemId === this.getItemId(processedItem);
    }

    isItemGroup(processedItem: any): boolean {
        return isNotEmpty(processedItem.items);
    }

    onItemMouseEnter(param: any) {
        const { event, processedItem } = param;
        this.itemMouseEnter.emit({ originalEvent: event, processedItem });
    }

    onItemClick(event: any, processedItem: any) {
        this.getItemProp(processedItem, 'command', { originalEvent: event, item: processedItem.item });
        this.itemClick.emit({ originalEvent: event, processedItem, isFocus: true });
    }

    onEnter(event, sublist) {
        if (event.fromState === 'void' && event.toState) {
            const sublist = event.element;
            this.position(sublist);
        }
    }

    position(sublist) {
        const parentItem = sublist.parentElement.parentElement;
        const containerOffset = <any>getOffset(sublist.parentElement.parentElement);
        const viewport = getViewport();
        const sublistWidth = sublist.offsetParent ? sublist.offsetWidth : getHiddenElementOuterWidth(sublist);
        const itemOuterWidth = <any>getOuterWidth(parentItem.children[0]);

        sublist.style.top = '0px';

        if (parseInt(containerOffset.left, 10) + itemOuterWidth + sublistWidth > viewport.width - calculateScrollbarWidth()) {
            sublist.style.left = -1 * sublistWidth + 'px';
        } else {
            sublist.style.left = itemOuterWidth + 'px';
        }
    }
}
/**
 * ContextMenu displays an overlay menu on right click of its target. Note that components like Table has special integration with ContextMenu.
 * @group Components
 */
@Component({
    selector: 'p-contextmenu',
    standalone: true,
    imports: [CommonModule, ContextMenuSub, RouterModule, TooltipModule, BadgeModule, SharedModule],
    template: `
        <div
            #container
            [attr.data-pc-section]="'root'"
            [attr.data-pc-name]="'contextmenu'"
            [attr.id]="id"
            [class]="cx('root')"
            [ngStyle]="style"
            [@overlayAnimation]="{ value: 'visible' }"
            (@overlayAnimation.start)="onOverlayAnimationStart($event)"
            (@overlayAnimation.done)="onOverlayAnimationEnd($event)"
            *ngIf="visible()"
        >
            <p-contextmenu-sub
                #rootmenu
                [root]="true"
                [items]="processedItems"
                [itemTemplate]="itemTemplate || _itemTemplate"
                [menuId]="id"
                [tabindex]="!disabled ? tabindex : -1"
                [ariaLabel]="ariaLabel"
                [ariaLabelledBy]="ariaLabelledBy"
                [baseZIndex]="baseZIndex"
                [autoZIndex]="autoZIndex"
                [visible]="submenuVisible()"
                [focusedItemId]="focused ? focusedItemId : undefined"
                [activeItemPath]="activeItemPath()"
                (itemClick)="onItemClick($event)"
                (menuFocus)="onMenuFocus($event)"
                (menuBlur)="onMenuBlur($event)"
                (menuKeydown)="onKeyDown($event)"
                (itemMouseEnter)="onItemMouseEnter($event)"
            />
        </div>
    `,
    animations: [trigger('overlayAnimation', [transition(':enter', [style({ opacity: 0 }), animate('250ms')]), transition(':leave', [animate('.1s linear', style({ opacity: 0 }))])])],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ContextMenuStyle]
})
export class ContextMenu extends BaseComponent implements OnInit, AfterContentInit, OnDestroy {
    /**
     * An array of menuitems.
     * @group Props
     */
    @Input() set model(value: MenuItem[] | undefined) {
        this._model = value;
        this._processedItems = this.createProcessedItems(this._model || []);
    }
    get model(): MenuItem[] | undefined {
        return this._model;
    }
    /**
     * Event for which the menu must be displayed.
     * @group Props
     */
    @Input() triggerEvent: string = 'contextmenu';
    /**
     * Local template variable name of the element to attach the context menu.
     * @group Props
     */
    @Input() target: HTMLElement | string | undefined;
    /**
     * Attaches the menu to document instead of a particular item.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) global: boolean;
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
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element.
     * @group Props
     */
    @Input() appendTo: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autoZIndex: boolean = true;
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    @Input({ transform: numberAttribute }) baseZIndex: number = 0;
    /**
     * Current id state as a string.
     * @group Props
     */
    @Input() id: string | undefined;
    /**
     * The breakpoint to define the maximum width boundary.
     * @group Props
     */
    @Input() breakpoint: string = '960px';
    /**
     * Defines a string value that labels an interactive element.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Identifier of the underlying input element.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Press delay in touch devices as miliseconds.
     * @group Props
     */
    @Input({ transform: numberAttribute }) pressDelay: number | undefined = 500;
    /**
     * Callback to invoke when overlay menu is shown.
     * @group Emits
     */
    @Output() onShow: EventEmitter<null> = new EventEmitter<null>();
    /**
     * Callback to invoke when overlay menu is hidden.
     * @group Emits
     */
    @Output() onHide: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('rootmenu') rootmenu: ContextMenuSub | undefined;

    @ViewChild('container') containerViewChild: ElementRef<any> | undefined;

    container: HTMLDivElement | undefined;

    outsideClickListener: VoidListener;

    resizeListener: VoidListener;

    triggerEventListener: VoidListener;

    documentClickListener: VoidListener;

    documentTriggerListener: VoidListener;

    touchEndListener: VoidListener;

    pageX: number;

    pageY: number;

    visible = signal(false);

    relativeAlign: boolean | undefined;

    private window: Window;

    focused: boolean = false;

    activeItemPath = signal<any>([]);

    focusedItemInfo = signal<any>({ index: -1, level: 0, parentKey: '', item: null });

    submenuVisible = signal<boolean>(false);

    searchValue: string = '';

    searchTimeout: any;

    _processedItems: any[];

    _model: MenuItem[] | undefined;

    pressTimer: any;

    private matchMediaListener: () => void;

    private query: MediaQueryList;

    public queryMatches: boolean;

    _componentStyle = inject(ContextMenuStyle);

    get visibleItems() {
        const processedItem = this.activeItemPath().find((p) => p.key === this.focusedItemInfo().parentKey);

        return processedItem ? processedItem.items : this.processedItems;
    }

    get processedItems() {
        if (!this._processedItems || !this._processedItems.length) {
            this._processedItems = this.createProcessedItems(this.model || []);
        }
        return this._processedItems;
    }

    get focusedItemId() {
        const focusedItem = this.focusedItemInfo();
        return focusedItem.item && focusedItem.item?.id ? focusedItem.item.id : focusedItem.index !== -1 ? `${this.id}${isNotEmpty(focusedItem.parentKey) ? '_' + focusedItem.parentKey : ''}_${focusedItem.index}` : null;
    }

    constructor(public overlayService: OverlayService) {
        super();
        effect(() => {
            const path = this.activeItemPath();

            if (isNotEmpty(path)) {
                this.bindGlobalListeners();
            } else if (!this.visible()) {
                this.unbindGlobalListeners();
            }
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.id = this.id || uuid('pn_id_');
        this.bindMatchMediaListener();
        this.bindTriggerEventListener();
    }

    isMobile() {
        return isIOS() || isAndroid();
    }

    bindTriggerEventListener() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.triggerEventListener) {
                if (!this.isMobile()) {
                    if (this.global) {
                        this.triggerEventListener = this.renderer.listen(this.document, this.triggerEvent, (event) => {
                            this.show(event);
                        });
                    } else if (this.target) {
                        this.triggerEventListener = this.renderer.listen(this.target, this.triggerEvent, (event) => {
                            this.show(event);
                        });
                    }
                } else {
                    if (this.global) {
                        this.triggerEventListener = this.renderer.listen(this.document, 'touchstart', this.onTouchStart.bind(this));
                        this.touchEndListener = this.renderer.listen(this.document, 'touchend', this.onTouchEnd.bind(this));
                    } else if (this.target) {
                        this.triggerEventListener = this.renderer.listen(this.target, 'touchstart', this.onTouchStart.bind(this));
                        this.touchEndListener = this.renderer.listen(this.target, 'touchend', this.onTouchEnd.bind(this));
                    }
                }
            }
        }
    }

    bindGlobalListeners() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.documentClickListener) {
                const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : 'document';

                this.documentClickListener = this.renderer.listen(documentTarget, 'click', (event) => {
                    if (this.containerViewChild.nativeElement.offsetParent && this.isOutsideClicked(event) && !event.ctrlKey && event.button !== 2 && this.triggerEvent !== 'click') {
                        this.hide();
                    }
                });

                this.documentTriggerListener = this.renderer.listen(documentTarget, this.triggerEvent, (event) => {
                    if (this.containerViewChild.nativeElement.offsetParent && this.isOutsideClicked(event)) {
                        this.hide();
                    }
                });
            }
            if (!this.resizeListener) {
                this.resizeListener = this.renderer.listen(this.document.defaultView, 'resize', (event) => {
                    this.hide();
                });
            }
        }
    }
    /**
     * Defines template option for item.
     * @group Templates
     */
    @ContentChild('item', { descendants: false }) itemTemplate: TemplateRef<any> | undefined;

    /**
     * Defines template option for submenuIcon.
     * @group Templates
     */
    @ContentChild('submenuicon', { descendants: false }) submenuIconTemplate: TemplateRef<any> | undefined;

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    _submenuIconTemplate: TemplateRef<any> | undefined;

    _itemTemplate: TemplateRef<any> | undefined;

    ngAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'submenuicon':
                    this._submenuIconTemplate = item.template;
                    break;
                case 'item':
                    this._itemTemplate = item.template;
                    break;
                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    createProcessedItems(items: any, level: number = 0, parent: any = {}, parentKey: any = '') {
        const processedItems = [];

        items &&
            items.forEach((item, index) => {
                const key = (parentKey !== '' ? parentKey + '_' : '') + index;
                const newItem = {
                    item,
                    index,
                    level,
                    key,
                    parent,
                    parentKey
                };

                newItem['items'] = this.createProcessedItems(item.items, level + 1, newItem, key);
                processedItems.push(newItem);
            });

        return processedItems;
    }

    bindMatchMediaListener() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.matchMediaListener) {
                const query = window.matchMedia(`(max-width: ${this.breakpoint})`);

                this.query = query;
                this.queryMatches = query.matches;

                this.matchMediaListener = () => {
                    this.queryMatches = query.matches;
                };

                query.addEventListener('change', this.matchMediaListener);
            }
        }
    }

    unbindMatchMediaListener() {
        if (this.matchMediaListener) {
            this.query.removeEventListener('change', this.matchMediaListener);
            this.matchMediaListener = null;
        }
    }

    getItemProp(item: any, name: string) {
        return item ? resolve(item[name]) : undefined;
    }

    getProccessedItemLabel(processedItem: any) {
        return processedItem ? this.getItemLabel(processedItem.item) : undefined;
    }

    getItemLabel(item: any) {
        return this.getItemProp(item, 'label');
    }

    isProcessedItemGroup(processedItem: any): boolean {
        return processedItem && isNotEmpty(processedItem.items);
    }

    isSelected(processedItem: any): boolean {
        return this.activeItemPath().some((p) => p.key === processedItem.key);
    }

    isValidSelectedItem(processedItem: any): boolean {
        return this.isValidItem(processedItem) && this.isSelected(processedItem);
    }

    isValidItem(processedItem: any): boolean {
        return !!processedItem && !this.isItemDisabled(processedItem.item) && !this.isItemSeparator(processedItem.item);
    }

    isItemDisabled(item: any): boolean {
        return this.getItemProp(item, 'disabled');
    }

    isItemSeparator(item: any): boolean {
        return this.getItemProp(item, 'separator');
    }

    isItemMatched(processedItem: any): boolean {
        return this.isValidItem(processedItem) && this.getProccessedItemLabel(processedItem).toLocaleLowerCase().startsWith(this.searchValue.toLocaleLowerCase());
    }

    isProccessedItemGroup(processedItem: any): boolean {
        return processedItem && isNotEmpty(processedItem.items);
    }

    onItemClick(event: any) {
        const { processedItem } = event;
        const grouped = this.isProcessedItemGroup(processedItem);
        const selected = this.isSelected(processedItem);

        if (selected) {
            const { index, key, level, parentKey, item } = processedItem;

            this.activeItemPath.set(this.activeItemPath().filter((p) => key !== p.key && key.startsWith(p.key)));
            this.focusedItemInfo.set({ index, level, parentKey, item });

            focus(this.rootmenu.sublistViewChild.nativeElement);
        } else {
            grouped ? this.onItemChange(event) : this.hide();
        }
    }

    onItemMouseEnter(event: any) {
        this.onItemChange(event, 'hover');
    }

    onKeyDown(event: KeyboardEvent) {
        const metaKey = event.metaKey || event.ctrlKey;

        switch (event.code) {
            case 'ArrowDown':
                this.onArrowDownKey(event);
                break;

            case 'ArrowUp':
                this.onArrowUpKey(event);
                break;

            case 'ArrowLeft':
                this.onArrowLeftKey(event);
                break;

            case 'ArrowRight':
                this.onArrowRightKey(event);
                break;

            case 'Home':
                this.onHomeKey(event);
                break;

            case 'End':
                this.onEndKey(event);
                break;

            case 'Space':
                this.onSpaceKey(event);
                break;

            case 'Enter':
                this.onEnterKey(event);
                break;

            case 'Escape':
                this.onEscapeKey(event);
                break;

            case 'Tab':
                this.onTabKey(event);
                break;

            case 'PageDown':
            case 'PageUp':
            case 'Backspace':
            case 'ShiftLeft':
            case 'ShiftRight':
                //NOOP
                break;

            default:
                if (!metaKey && isPrintableCharacter(event.key)) {
                    this.searchItems(event, event.key);
                }

                break;
        }
    }

    onArrowDownKey(event: KeyboardEvent) {
        const itemIndex = this.focusedItemInfo().index !== -1 ? this.findNextItemIndex(this.focusedItemInfo().index) : this.findFirstFocusedItemIndex();

        this.changeFocusedItemIndex(event, itemIndex);
        event.preventDefault();
    }

    onArrowRightKey(event: KeyboardEvent) {
        const processedItem = this.visibleItems[this.focusedItemInfo().index];
        const grouped = this.isProccessedItemGroup(processedItem);

        if (grouped) {
            this.onItemChange({ originalEvent: event, processedItem });
            this.focusedItemInfo.set({ index: -1, parentKey: processedItem.key, item: processedItem.item });
            this.searchValue = '';
            this.onArrowDownKey(event);
        }

        event.preventDefault();
    }

    onArrowUpKey(event: KeyboardEvent) {
        if (event.altKey) {
            if (this.focusedItemInfo().index !== -1) {
                const processedItem = this.visibleItems[this.focusedItemInfo().index];
                const grouped = this.isProccessedItemGroup(processedItem);

                !grouped && this.onItemChange({ originalEvent: event, processedItem });
            }

            this.hide();
            event.preventDefault();
        } else {
            const itemIndex = this.focusedItemInfo().index !== -1 ? this.findPrevItemIndex(this.focusedItemInfo().index) : this.findLastFocusedItemIndex();

            this.changeFocusedItemIndex(event, itemIndex);
            event.preventDefault();
        }
    }

    onArrowLeftKey(event: KeyboardEvent) {
        const processedItem = this.visibleItems[this.focusedItemInfo().index];
        const parentItem = this.activeItemPath().find((p) => p.key === processedItem.parentKey);
        const root = isEmpty(processedItem.parent);

        if (!root) {
            this.focusedItemInfo.set({ index: -1, parentKey: parentItem ? parentItem.parentKey : '', item: processedItem.item });
            this.searchValue = '';
            this.onArrowDownKey(event);
        }

        const activeItemPath = this.activeItemPath().filter((p) => p.parentKey !== this.focusedItemInfo().parentKey);
        this.activeItemPath.set(activeItemPath);

        event.preventDefault();
    }

    onHomeKey(event: KeyboardEvent) {
        this.changeFocusedItemIndex(event, this.findFirstItemIndex());
        event.preventDefault();
    }

    onEndKey(event: KeyboardEvent) {
        this.changeFocusedItemIndex(event, this.findLastItemIndex());
        event.preventDefault();
    }

    onSpaceKey(event: KeyboardEvent) {
        this.onEnterKey(event);
    }

    onEscapeKey(event: KeyboardEvent) {
        this.hide();
        const processedItem = this.findVisibleItem(this.findFirstFocusedItemIndex());
        const focusedItemInfo = this.focusedItemInfo();
        this.focusedItemInfo.set({ ...focusedItemInfo, index: this.findFirstFocusedItemIndex(), item: processedItem.item });

        event.preventDefault();
    }

    onTabKey(event: KeyboardEvent) {
        if (this.focusedItemInfo().index !== -1) {
            const processedItem = this.visibleItems[this.focusedItemInfo().index];
            const grouped = this.isProccessedItemGroup(processedItem);

            !grouped && this.onItemChange({ originalEvent: event, processedItem });
        }

        this.hide();
    }

    onEnterKey(event: KeyboardEvent) {
        if (this.focusedItemInfo().index !== -1) {
            const element = <any>findSingle(this.rootmenu.el.nativeElement, `li[id="${`${this.focusedItemId}`}"]`);
            const anchorElement = element && <any>findSingle(element, 'a[data-pc-section="action"]');

            anchorElement ? anchorElement.click() : element && element.click();

            const processedItem = this.visibleItems[this.focusedItemInfo().index];
            const grouped = this.isProccessedItemGroup(processedItem);

            if (!grouped) {
                const focusedItemInfo = this.focusedItemInfo();
                this.focusedItemInfo.set({ ...focusedItemInfo, index: this.findFirstFocusedItemIndex() });
            }
        }

        event.preventDefault();
    }

    onItemChange(event: any, type?: string | undefined) {
        const { processedItem, isFocus } = event;
        if (isEmpty(processedItem)) return;

        const { index, key, level, parentKey, items } = processedItem;
        const grouped = isNotEmpty(items);
        const activeItemPath = this.activeItemPath().filter((p) => p.parentKey !== parentKey && p.parentKey !== key);

        if (grouped) {
            activeItemPath.push(processedItem);
            this.submenuVisible.set(true);
        }
        this.focusedItemInfo.set({ index, level, parentKey, item: processedItem.item });
        isFocus && focus(this.rootmenu.sublistViewChild.nativeElement);

        if (type === 'hover' && this.queryMatches) {
            return;
        }

        this.activeItemPath.set(activeItemPath);
    }

    onMenuFocus(event: any) {
        this.focused = true;
        const focusedItemInfo = this.focusedItemInfo().index !== -1 ? this.focusedItemInfo() : { index: -1, level: 0, parentKey: '', item: null };

        this.focusedItemInfo.set(focusedItemInfo);
    }

    onMenuBlur(event: any) {
        this.focused = false;
        this.focusedItemInfo.set({ index: -1, level: 0, parentKey: '', item: null });
        this.searchValue = '';
    }

    onOverlayAnimationStart(event: AnimationEvent) {
        switch (event.toState) {
            case 'visible':
                this.container = event.element;
                this.position();
                this.moveOnTop();
                this.appendOverlay();
                this.bindGlobalListeners();
                focus(this.rootmenu.sublistViewChild.nativeElement);
                break;
        }
    }

    onOverlayAnimationEnd(event: AnimationEvent) {
        switch (event.toState) {
            case 'void':
                this.onOverlayHide();
                break;
        }
    }

    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body') this.renderer.appendChild(this.document.body, this.containerViewChild.nativeElement);
            else appendChild(this.appendTo, this.containerViewChild.nativeElement);
        }
    }

    moveOnTop() {
        if (this.autoZIndex && this.containerViewChild) {
            ZIndexUtils.set('menu', this.containerViewChild.nativeElement, this.baseZIndex + this.config.zIndex.menu);
        }
    }

    onOverlayHide() {
        this.unbindGlobalListeners();

        if (!(this.cd as ViewRef).destroyed) {
            this.target = null;
        }

        if (this.container && this.autoZIndex) {
            ZIndexUtils.clear(this.container);
        }

        this.container = null;
    }

    onTouchStart(event: MouseEvent) {
        this.pressTimer = setTimeout(() => {
            this.show(event);
        }, this.pressDelay);
    }

    onTouchEnd() {
        clearTimeout(this.pressTimer);
    }

    hide() {
        this.visible.set(false);
        this.onHide.emit();
        this.activeItemPath.set([]);
        this.focusedItemInfo.set({ index: -1, level: 0, parentKey: '', item: null });
    }

    toggle(event?: any) {
        this.visible() ? this.hide() : this.show(event);
    }

    show(event: any) {
        this.activeItemPath.set([]);
        this.focusedItemInfo.set({ index: -1, level: 0, parentKey: '', item: null });

        this.pageX = event.pageX;
        this.pageY = event.pageY;

        this.onShow.emit();
        this.visible() ? this.position() : this.visible.set(true);

        event.stopPropagation();
        event.preventDefault();
    }

    position() {
        let left = this.pageX + 1;
        let top = this.pageY + 1;
        let width = this.containerViewChild.nativeElement.offsetParent ? this.containerViewChild.nativeElement.offsetWidth : getHiddenElementOuterWidth(this.containerViewChild.nativeElement);
        let height = this.containerViewChild.nativeElement.offsetParent ? this.containerViewChild.nativeElement.offsetHeight : getHiddenElementOuterHeight(this.containerViewChild.nativeElement);
        let viewport = getViewport();

        //flip
        if (left + width - this.document.scrollingElement.scrollLeft > viewport.width) {
            left -= width;
        }

        //flip
        if (top + height - this.document.scrollingElement.scrollTop > viewport.height) {
            top -= height;
        }

        //fit
        if (left < this.document.scrollingElement.scrollLeft) {
            left = this.document.scrollingElement.scrollLeft;
        }

        //fit
        if (top < this.document.scrollingElement.scrollTop) {
            top = this.document.scrollingElement.scrollTop;
        }

        this.containerViewChild.nativeElement.style.left = left + 'px';
        this.containerViewChild.nativeElement.style.top = top + 'px';
    }

    searchItems(event: any, char: string) {
        this.searchValue = (this.searchValue || '') + char;

        let itemIndex = -1;
        let matched = false;

        if (this.focusedItemInfo().index !== -1) {
            itemIndex = this.visibleItems.slice(this.focusedItemInfo().index).findIndex((processedItem) => this.isItemMatched(processedItem));
            itemIndex = itemIndex === -1 ? this.visibleItems.slice(0, this.focusedItemInfo().index).findIndex((processedItem) => this.isItemMatched(processedItem)) : itemIndex + this.focusedItemInfo().index;
        } else {
            itemIndex = this.visibleItems.findIndex((processedItem) => this.isItemMatched(processedItem));
        }

        if (itemIndex !== -1) {
            matched = true;
        }

        if (itemIndex === -1 && this.focusedItemInfo().index === -1) {
            itemIndex = this.findFirstFocusedItemIndex();
        }

        if (itemIndex !== -1) {
            this.changeFocusedItemIndex(event, itemIndex);
        }

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.searchValue = '';
            this.searchTimeout = null;
        }, 500);

        return matched;
    }

    findVisibleItem(index) {
        return isNotEmpty(this.visibleItems) ? this.visibleItems[index] : null;
    }

    findLastFocusedItemIndex() {
        const selectedIndex = this.findSelectedItemIndex();
        return selectedIndex < 0 ? this.findLastItemIndex() : selectedIndex;
    }

    findLastItemIndex() {
        return findLastIndex(this.visibleItems, (processedItem) => this.isValidItem(processedItem));
    }

    findPrevItemIndex(index: number) {
        const matchedItemIndex = index > 0 ? findLastIndex(this.visibleItems.slice(0, index), (processedItem) => this.isValidItem(processedItem)) : -1;

        return matchedItemIndex > -1 ? matchedItemIndex : index;
    }

    findNextItemIndex(index: number) {
        const matchedItemIndex = index < this.visibleItems.length - 1 ? this.visibleItems.slice(index + 1).findIndex((processedItem) => this.isValidItem(processedItem)) : -1;

        return matchedItemIndex > -1 ? matchedItemIndex + index + 1 : index;
    }

    findFirstFocusedItemIndex() {
        const selectedIndex = this.findSelectedItemIndex();

        return selectedIndex < 0 ? this.findFirstItemIndex() : selectedIndex;
    }

    findFirstItemIndex() {
        return this.visibleItems.findIndex((processedItem) => this.isValidItem(processedItem));
    }

    findSelectedItemIndex() {
        return this.visibleItems.findIndex((processedItem) => this.isValidSelectedItem(processedItem));
    }

    changeFocusedItemIndex(event: any, index: number) {
        const processedItem = this.findVisibleItem(index);
        const focusedItemInfo = this.focusedItemInfo();
        if (focusedItemInfo.index !== index) {
            this.focusedItemInfo.set({ ...focusedItemInfo, index, item: processedItem.item });
            this.scrollInView();
        }
    }

    scrollInView(index: number = -1) {
        const id = index !== -1 ? `${this.id}_${index}` : this.focusedItemId;
        const element = findSingle(this.rootmenu.el.nativeElement, `li[id="${id}"]`);

        if (element) {
            element.scrollIntoView && element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    bindResizeListener() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.resizeListener) {
                this.resizeListener = this.renderer.listen(this.document.defaultView, 'resize', (event) => {
                    this.hide();
                });
            }
        }
    }

    isOutsideClicked(event: Event) {
        return !(this.containerViewChild.nativeElement.isSameNode(event.target) || this.containerViewChild.nativeElement.contains(event.target));
    }

    unbindResizeListener() {
        if (this.resizeListener) {
            this.resizeListener();
            this.resizeListener = null;
        }
    }

    unbindGlobalListeners() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }

        if (this.documentTriggerListener) {
            this.documentTriggerListener();
            this.documentTriggerListener = null;
        }

        if (this.resizeListener) {
            this.resizeListener();
            this.resizeListener = null;
        }

        if (this.touchEndListener) {
            this.touchEndListener();
            this.touchEndListener = null;
        }
    }

    unbindTriggerEventListener() {
        if (this.triggerEventListener) {
            this.triggerEventListener();
            this.triggerEventListener = null;
        }
    }

    removeAppendedElements() {
        if (this.appendTo && this.containerViewChild) {
            if (this.appendTo === 'body') {
                this.renderer.removeChild(this.document.body, this.containerViewChild.nativeElement);
            } else {
                removeChild(this.containerViewChild.nativeElement, this.appendTo);
            }
        }
    }

    ngOnDestroy() {
        this.unbindGlobalListeners();
        this.unbindTriggerEventListener();
        this.unbindMatchMediaListener();
        this.removeAppendedElements();
        super.ngOnDestroy();
    }
}

@NgModule({
    imports: [ContextMenu, SharedModule],
    exports: [ContextMenu, SharedModule]
})
export class ContextMenuModule {}
