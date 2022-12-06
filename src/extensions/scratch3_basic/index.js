const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

/**
 * @readonly
 * @enum {string}
 */
const rankParam = {
    ONE: 'one',
    TEN: 'ten',
    HANDRED: 'handred',
    THOUSAND: 'thousand'
}

/**
 * @readonly
 * @enum {string}
 */
const sizeParam = {
    BIG: 'big',
    SMALL: 'small'
}

/**
 * 基本構文のブロックを追加
 * @constructor
 */
class Scratch3Basic {
    constructor(runtime) {
        this.runtime = runtime;
    }

    // 位パラメーターの初期化
    _initRankParam() {
        return [
            {
                text: formatMessage({
                    id: 'basic.RankMenu.one',
                    default: '一の位',
                    description: '一の位'
                }),
                value: rankParam.ONE
            },
            {
                text: formatMessage({
                    id: 'basic.RankMenu.ten',
                    default: '十の位',
                    description: '十の位'
                }),
                value: rankParam.TEN
            },
            {
                text: formatMessage({
                    id: 'basic.RankMenu.handred',
                    default: '百の位',
                    description: '百の位'
                }),
                value: rankParam.HANDRED
            },
            {
                text: formatMessage({
                    id: 'basic.RankMenu.thousand',
                    default: '千の位',
                    description: '千の位'
                }),
                value: rankParam.THOUSAND
            }
        ];
    }

    /**
     * サイズパラメータの初期化
     */
    _initSizeParam() {
        return [
            {
                text: formatMessage({
                    id: 'basic.SizeMenu.big',
                    default: '大きい',
                    description: '大きい'
                }),
                value: sizeParam.BIG
            },
            {
                text: formatMessage({
                    id: 'basic.SizeMenu.small',
                    default: '小さい',
                    description: '小さい'
                }),
                value: sizeParam.SMALL
            }
        ];
    }

    /**
     * 追加するブロックを定義
     * @returns {object}
     */
    getInfo() {
        return {
            id: 'basic',
            name: '便利なブロック',
            blocks: [
                {
                    opcode: 'chooseMax',
                    blockType: BlockType.REPORTER,
                    text: '[VALUE1]と[VALUE2]のうち大きいほう',
                    arguments: {
                        VALUE1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'chooseMin',
                    blockType: BlockType.REPORTER,
                    text: '[VALUE1]と[VALUE2]のうち小さいほう',
                    arguments: {
                        VALUE1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'ifComparison',
                    blockType: BlockType.CONDITIONAL,
                    text: 'もし[VALUE1]より[VALUE2]のほうが[SIZE]なら',
                    arguments: {
                        VALUE1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        },
                        SIZE: {
                            type: ArgumentType.STRING,
                            menu: 'sizeparam',
                            defaultValue: sizeParam.BIG
                        }
                    }
                },
                {
                    opcode: 'floorNum',
                    blockType: BlockType.REPORTER,
                    text: '[VALUE]の[RANK]を切り捨て',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1234
                        },
                        RANK: {
                            type: ArgumentType.STRING,
                            menu: 'rankparam',
                            defaultValue: rankParam.TEN
                        }
                    }
                },
                {
                    opcode: 'ceilNum',
                    blockType: BlockType.REPORTER,
                    text: '[VALUE]の[RANK]を切り上げ',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1234
                        },
                        RANK: {
                            type: ArgumentType.STRING,
                            menu: 'rankparam',
                            defaultValue: rankParam.TEN
                        }
                    }
                },
                {
                    opcode: 'roundNum',
                    blockType: BlockType.REPORTER,
                    text: '[VALUE]の[RANK]を四捨五入',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1234
                        },
                        RANK: {
                            type: ArgumentType.STRING,
                            menu: 'rankparam',
                            defaultValue: rankParam.TEN
                        }
                    }
                }
            ],
            menus: {  
                rankparam: {
                    acceptReporters: true,
                    items: this._initRankParam()
                },
                sizeparam: {
                    acceptReporters: true,
                    items: this._initSizeParam()
                }
            }
        };
    }

    /**
     * VALUE1とVALUE2の大きい方を求める
     * @param {object} args 引数
     * @returns {number}
     */
     chooseMax(args) {
        const value1 = Cast.toNumber(args.VALUE1);
        const value2 = Cast.toNumber(args.VALUE2);
        var maximum = value1;
        if(value1 < value2) {
            maximum = value2;
        }
        return maximum;
    }

    /**
     * VALUE1とVALUE2の小さい方を求める
     * @param {object} args 引数
     * @returns {number}
     */
    chooseMin(args) {
        const value1 = Cast.toNumber(args.VALUE1);
        const value2 = Cast.toNumber(args.VALUE2);
        var minimum = value1;
        if(value1 > value2) {
            minimum = value2;
        }
        return minimum;
    }

    /**
     * 数値のnの位を切り捨て
     * @param {object} args
     */
    floorNum(args) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        const rank = Cast.toString(args.RANK);
        var result = 0;

        // 確認
        console.log(value);
        console.log(rank);

        // どの桁を切り上げするか
        if(rank === 'one') {
            result = value / 10.0;
            result = Math.floor(result);
            result *= 10;
        }
        else if(rank === 'ten') {
            result = value / 100.0;
            result = Math.floor(result);
            result *= 100;
        }
        else if(rank === 'handred') {
            result = value / 1000.0;
            result = Math.floor(result);
            result *= 1000;
        }
        else if(rank === 'thousand') {
            result = value / 10000.0;
            result = Math.floor(result);
            result *= 10000;
        }
        else {
            result = null;
        }

        return result;
    }

    /**
     * valueのnの位を切り上げ
     * @param {object} args
     */
    ceilNum(args) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        const rank = Cast.toString(args.RANK);
        var result = 0;

        // どの桁を切り上げするか
        if(rank === 'one') {
            result = value / 10.0;
            result = Math.ceil(result);
            result *= 10;
        }
        else if(rank === 'ten') {
            result = value / 100.0;
            result = Math.ceil(result);
            result *= 100;
        }
        else if(rank === 'handred') {
            result = value / 1000.0;
            result = Math.ceil(result);
            result *= 1000;
        }
        else if(rank === 'thousand') {
            result = value / 10000.0;
            result = Math.ceil(result);
            result *= 10000;
        }
        else {
            result = null;
        }

        return result;
    }

    /**
     * valueのnの位を四捨五入
     * @param {object} args 
     */
    roundNum(args) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        const rank = Cast.toString(args.RANK);
        var result = 0;

        // どの桁を切り上げするか
        if(rank === 'one') {
            result = value / 10.0;
            result = Math.round(result);
            result *= 10;
        }
        else if(rank === 'ten') {
            result = value / 100.0;
            result = Math.round(result);
            result *= 100;
        }
        else if(rank === 'handred') {
            result = value / 1000.0;
            result = Math.round(result);
            result *= 1000;
        }
        else if(rank === 'thousand') {
            result = value / 10000.0;
            result = Math.round(result);
            result *= 10000;
        }
        else {
            result = null;
        }

        return result;
    }

    /**
     * 2値数の比較を行う
     * @param {object} args 
     */
    ifComparison(args, util) {
        const value1 = Cast.toNumber(args.VALUE1);
        const value2 = Cast.toNumber(args.VALUE2);
        const size = Cast.toString(args.SIZE);
        if(size === sizeParam.BIG) {
            if(value1 < value2) {
                util.startBranch(1, false);
            }
        }
        else if(size === sizeParam.SMALL) {
            if(value1 > value2) {
                util.startBranch(1, false);
            }
        }
        else {
            console.log("size is not suitable parameter");
        }
    }
}

module.exports = Scratch3Basic;
