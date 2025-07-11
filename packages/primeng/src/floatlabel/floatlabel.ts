import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, NgModule, ViewEncapsulation } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { BaseComponent } from 'primeng/basecomponent';
import { FloatLabelStyle } from './style/floatlabelstyle';

/**
 * FloatLabel appears on top of the input field when focused.
 * @group Components
 */
@Component({
    selector: 'p-floatlabel',
    standalone: true,
    imports: [CommonModule, SharedModule],
    template: ` <ng-content></ng-content> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FloatLabelStyle],
    host: {
        '[class]': "cx('root')"
    }
})
export class FloatLabel extends BaseComponent {
    _componentStyle = inject(FloatLabelStyle);
    /**
     * Defines the positioning of the label relative to the input.
     * @group Props
     */
    @Input() variant: 'in' | 'over' | 'on' = 'over';
}

@NgModule({
    imports: [FloatLabel, SharedModule],
    exports: [FloatLabel, SharedModule]
})
export class FloatLabelModule {}
