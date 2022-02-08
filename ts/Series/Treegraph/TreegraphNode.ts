/* *
 *
 *  (c) 2010-2022 Pawel Lysy Grzegorz Blachlinski
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

import TreegraphPoint from './TreegraphPoint.js';
import type TreegraphSeries from './TreegraphSeries.js';

class TreegraphNode extends TreegraphPoint {
    public mod: number = 0;
    public thread?: TreegraphNode;
    public ancestor: TreegraphNode = void 0 as any;
    public shift: number = 0;
    public change: number = 0;
    public preX: number = 0;
    public column: number = void 0 as any;
    public relativeXPosition: number = void 0 as any;
    public xPosition: number = void 0 as any;
    public yPosition: number = void 0 as any;
    public hidden = false;
    public linksFrom: Array<TreegraphPoint> = [];
    public linksTo: Array<TreegraphPoint> = [];
    public nodeSizeX: number = void 0 as any;
    public nodeSizeY: number = void 0 as any;
    public nodeHeight?: number;
    public series: TreegraphSeries = void 0 as any;
    public wasVisited = false;

    constructor() {
        super();
        this.linksFrom = [];
        this.linksTo = [];
        this.shapeArgs = {};
    }
    // get the next left node which is either first child or thread
    public nextLeft(this: TreegraphNode): TreegraphNode | undefined {
        return this.getLeftMostChild() || this.thread;
    }

    // get the next right node which is either last child or thread
    public nextRight(this: TreegraphNode): TreegraphNode | undefined {
        return this.getRightMostChild() || this.thread;
    }


    // return the left one of the greatest uncommon ancestors of a leftInternal
    // node and it's right neighbor
    public getAncestor(
        this: TreegraphNode,
        leftIntNode: TreegraphNode,
        defaultAncestor: TreegraphNode
    ): TreegraphNode {
        let leftAnc = leftIntNode.ancestor;
        if (leftAnc.linksTo[0].fromNode === this.linksTo[0].fromNode) {
            return leftIntNode.ancestor;
        }
        return defaultAncestor;
    }
    // get node's first sibling.
    public getLeftMostSibling(this: TreegraphNode): TreegraphNode | null {
        let parent = this.getParent();
        if (parent) {
            const children = parent.linksFrom;
            for (let i = 0; i < children.length; i++) {
                if (children[i] && !children[i].toNode.hidden) {
                    return children[i].toNode;
                }
            }
        }
        return null;
    }
    // get nodes left sibling (if it exists)
    public getLeftSibling(this: TreegraphNode): TreegraphNode | null {
        let parent = this.getParent();
        if (parent) {
            const children = parent.linksFrom;
            for (let i = this.relativeXPosition - 1; i >= 0; i--) {
                if (children[i] && !children[i].toNode.hidden) {
                    return children[i].toNode;
                }
            }
        }
        return null;
    }

    // get the node's first child (if it exists)
    public getLeftMostChild(this: TreegraphNode): TreegraphNode | null {
        const linksFrom = this.linksFrom;
        for (let i = 0; i < linksFrom.length; i++) {
            if (!linksFrom[i].toNode.hidden) {
                return linksFrom[i].toNode;
            }
        }
        return null;
    }

    // get the node's last child (if it exists)
    public getRightMostChild(this: TreegraphNode): TreegraphNode | null {
        const linksFrom = this.linksFrom;
        for (let i = linksFrom.length - 1; i >= 0; i--) {
            if (!linksFrom[i].toNode.hidden) {
                return linksFrom[i].toNode;
            }
        }
        return null;
    }

    // Get the parent of current node or return null for root of the tree.
    public getParent(this: TreegraphNode): TreegraphNode | null {
        return this.linksTo[0] ?
            (this.linksTo[0].fromNode as TreegraphNode) :
            null;
    }
    // Check if the node is a leaf, so if it has any children.
    public isLeaf(this: TreegraphNode): boolean {
        for (let i = 0; i < this.linksFrom.length; i++) {
            if (!this.linksFrom[i].toNode.hidden) {
                return false;
            }
        }
        return true;
    }

    public getFirstChild(this: TreegraphNode): TreegraphNode | null {
        for (let i = 0; i < this.linksFrom.length; i++) {
            if (!this.linksFrom[i].toNode.hidden) {
                return this.linksFrom[i].toNode;
            }
        }
        return null;
    }
}

export default TreegraphNode;
