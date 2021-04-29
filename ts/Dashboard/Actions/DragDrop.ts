import U from './../../Core/Utilities.js';
import type Row from './../Layout/Row.js';
import type Cell from './../Layout/Cell.js';
import DashboardGlobals from './../DashboardGlobals.js';
import EditMode from './../EditMode/EditMode.js';
import { HTMLDOMElement } from '../../Core/Renderer/DOMElementType.js';
import GUIElement from '../Layout/GUIElement.js';

const {
    addEvent,
    merge,
    css,
    createElement
} = U;

class DragDrop {
    /* *
    *
    *  Static Properties
    *
    * */
    protected static readonly defaultOptions: DragDrop.Options = {
        enabled: true
    }

    /* *
    *
    *  Constructors
    *
    * */
    constructor(
        editMode: EditMode,
        options?: DragDrop.Options
    ) {
        this.editMode = editMode;
        this.options = merge(DragDrop.defaultOptions, options);

        this.mockElement = createElement(
            'div', {
                className: 'drag-mock-element'
            }, {
                position: 'absolute',
                top: '100px',
                left: '100px',
                height: '50px',
                width: '50px',
                zIndex: 9999,
                display: 'none',
                cursor: 'grab',
                pointerEvents: 'none',
                backgroundColor: 'rgb(255, 255, 255)',
                boxShadow: 'rgb(4 9 20 / 3%) 0px 0.46875rem 2.1875rem, rgb(4 9 20 / 3%) 0px 0.9375rem 1.40625rem, ' +
                  'rgb(4 9 20 / 5%) 0px 0.25rem 0.53125rem, rgb(4 9 20 / 3%) 0px 0.125rem 0.1875rem'
            },
            editMode.dashboard.container
        );

        this.dropPointer = {
            isVisible: false,
            align: '',
            element: createElement(
                'div', {
                    className: 'drop-pointer'
                }, {
                    position: 'absolute',
                    zIndex: 9999,
                    display: 'none',
                    pointerEvents: 'none',
                    backgroundColor: '#e01d5a',
                    opacity: 0.5
                },
                editMode.dashboard.container
            )
        };

        this.isActive = false;
        this.initEvents();
    }

    /* *
    *
    *  Properties
    *
    * */
    public editMode: EditMode;
    public options: DragDrop.Options;
    public context?: Cell|Row; // Component icon from the sidebar
    public mockElement: HTMLDOMElement;
    public isActive?: boolean;
    public dropContext?: Cell|Row;
    public dropPointer: DragDrop.DropPointer;

    /* *
     *
     *  Functions
     *
     * */

    public initEvents(): void {
        const dragDrop = this;

        // DragDrop events.
        addEvent(document, 'mousemove', dragDrop.onDrag.bind(dragDrop));
        addEvent(document, 'mouseup', dragDrop.onDragEnd.bind(dragDrop));
    }

    public onDragStart(
        context: Cell|Row,
        event?: any
    ): void {
        const dragDrop = this;

        dragDrop.context = context;
        dragDrop.isActive = true;
        dragDrop.mockElement.style.cursor = 'grabbing';

        if (context.getType() === DashboardGlobals.guiElementType.cell) {
            dragDrop.onCellDragStart(event);
        }
    }

    public onDrag(e: any): void {
        const dragDrop = this;

        if (dragDrop.isActive) {
            const mockStyle = dragDrop.mockElement.style;

            mockStyle.left = +mockStyle.left.slice(0, -2) + e.movementX + 'px';
            mockStyle.top = +mockStyle.top.slice(0, -2) + e.movementY + 'px';

            if (dragDrop.context) {
                if (dragDrop.context.getType() === DashboardGlobals.guiElementType.cell) {
                    dragDrop.onCellDrag(e);
                }
            }
        }
    }

    public onDragEnd(): void {
        const dragDrop = this;

        if (dragDrop.isActive) {
            dragDrop.isActive = false;
            css(dragDrop.mockElement, {
                cursor: 'grab',
                display: 'none'
            });

            if (dragDrop.context) {
                if (dragDrop.context.getType() === DashboardGlobals.guiElementType.cell) {
                    dragDrop.onCellDragEnd();
                }
            }
        }
    }

    public hideDropPointer(): void {
        if (this.dropPointer.isVisible) {
            this.dropPointer.isVisible = false;
            this.dropPointer.align = '';

            this.dropPointer.element.style.display = 'none';
        }
    }

    public onCellDragStart(event: any): void {
        const dragDrop = this,
            editMode = dragDrop.editMode,
            cell = dragDrop.context as Cell;

        if (cell && editMode.cellToolbar) {
            const cellToolbarStyle = editMode.cellToolbar.container.style;

            dragDrop.setMockElementPosition(
                +cellToolbarStyle.left.slice(0, -2),
                +cellToolbarStyle.top.slice(0, -2)
            );
            dragDrop.mockElement.style.display = 'block';
            editMode.hideToolbars(['cell', 'row']);
            cell.hide();
        }
    }

    public onCellDrag(e: any): void {
        const dragDrop = this,
            dropContext = dragDrop.dropContext as Cell,
            width = 20,
            offset = 50;

        if (dropContext && dropContext.container) {
            const dropContextOffsets = GUIElement.getOffsets(
                    dropContext, dragDrop.editMode.dashboard.container),
                cellWidth = dropContextOffsets.right - dropContextOffsets.left,
                cellHeight = dropContextOffsets.bottom - dropContextOffsets.top;

            if (
                e.clientX >= dropContextOffsets.left - offset &&
                e.clientX <= dropContextOffsets.left + offset
            ) {
                dragDrop.dropPointer.align = 'left';

                if (!dragDrop.dropPointer.isVisible) {
                    dragDrop.dropPointer.isVisible = true;

                    css(dragDrop.dropPointer.element, {
                        display: 'block',
                        left: dropContextOffsets.left - width / 2 + 'px',
                        top: dropContextOffsets.top + 'px',
                        height: cellHeight + 'px',
                        width: width + 'px'
                    });
                }
            } else if (
                e.clientX >= dropContextOffsets.left + cellWidth - offset &&
                e.clientX <= dropContextOffsets.left + cellWidth + offset
            ) {
                dragDrop.dropPointer.align = 'right';

                if (!dragDrop.dropPointer.isVisible) {
                    dragDrop.dropPointer.isVisible = true;

                    css(dragDrop.dropPointer.element, {
                        display: 'block',
                        left: dropContextOffsets.left + cellWidth -
                          width / 2 + 'px',
                        top: dropContextOffsets.top + 'px',
                        height: cellHeight + 'px',
                        width: width + 'px'
                    });
                }
            } else {
                dragDrop.hideDropPointer();
            }
        }
    }

    public onCellDragEnd(): void {
        const dragDrop = this,
            draggedCell = dragDrop.context as Cell,
            dropContext = dragDrop.dropContext as Cell;

        if (dragDrop.dropPointer.align) {
            draggedCell.row.unmountCell(draggedCell);
            dropContext.row.mountCell(
                draggedCell,
                (dropContext.row.getCellIndex(dropContext) || 0) +
                    (dragDrop.dropPointer.align === 'right' ? 1 : 0)
            );
        }

        dragDrop.hideDropPointer();
        draggedCell.show();
    }

    public setMockElementPosition(
        x: number,
        y: number
    ): void {
        css(this.mockElement, {
            left: x + 'px',
            top: y + 'px'
        });
    }
}

namespace DragDrop {
    export interface Options {
        enabled: boolean;
    }

    export interface DropPointer {
        isVisible: boolean;
        element: HTMLDOMElement;
        align: string;
    }
}

export default DragDrop;