/** Merkle tree of MimcSponge hashes */
export declare class MerkleTree {
    root: TreeNode;
    leaves: TreeNode[];
    constructor(linkedRoot: TreeNode, linkedLeaves: TreeNode[]);
    /**
     * For a set of leaves recursively computes hashes of adjacent nodes upwards until reaching a root.
     * Note: Significantly slower than `MerkleTree.createFromStorageString` as it rehashes the whole tree.
     */
    static createFromLeaves(leaves: bigint[]): Promise<MerkleTree>;
    private static hashChildrenAndLinkToParent;
    static createFromStorageString(ss: string): MerkleTree;
    getMerkleProof(leafVal: bigint): MerkleProof;
    getStorageString(): string;
    leafExists(search: bigint): boolean;
    private static getChildRow;
    private findMatchingLeaf;
}
export declare class TreeNode {
    val: bigint;
    lChild?: TreeNode | undefined;
    rChild?: TreeNode | undefined;
    parent?: TreeNode | undefined;
    constructor(val: bigint, lChild?: TreeNode | undefined, rChild?: TreeNode | undefined, parent?: TreeNode | undefined);
}
export interface MerkleProof {
    vals: bigint[];
    indices: number[];
}
