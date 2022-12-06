const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Statistics = require('./statistics');

class Scratch3ElementaryStatistics {
    constructor(runtime) {
        this.runtime = runtime;
    }

    /**
     * 配列内に'NaN'がないか確認
     * @param {array} arr
     * @returns {boolean}
     */
    _checkArrayType_isNumber(arr) {
        for(var i = 0; i < arr.length; i++) {
            if(isNaN(arr[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * string型で受け取った引数を数値型の配列へ変換
     * @param {string} text
     * @return {Array}
     */
    _stringToArray(text) {
        const arr = text.split(/\s/).map(Number);
       if(!this._checkArrayType_isNumber(arr)) {
        return (new Array());
       }
        return arr;
    }

    getInfo() {
        return {
            id: 'statistics',
            name: '統計の計算',
            blocks: [
                {
                    opcode: 'sum',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の合計',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'average',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の平均値',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'max',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の最大値',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'min',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の最小値',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'range',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の範囲',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'median',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の中央値',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'firstQuaritile',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の第一四分位数',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'thirdQuaritile',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の第三四分位数',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'interquaritileRange',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]の四分位範囲',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'chooseNumToNum',
                    blockType: BlockType.REPORTER,
                    text: '[LIST]にある[VALUE1]以上[VALUE2]未満の数値の個数',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        },
                        VALUE1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                }
            ],
            menus: {
            }
        }
    }

    /**
     * 総和を求める
     * @param {object} args
     * @returns {Number}
     */
    sum(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.sum(arr);
    }

    /**
     * 平均値を求める
     * @param {object} args 
     * @returns {NUMBER}
     */
    average(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.average(arr);
    }

    /**
     * 最大値を求める
     * @param {object} args
     * @param {NUMBER}
     */
    max(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.max(arr);
    }

    /**
     * 最小値を求める
     * @param {object} args
     * @param {NUMBER}
     */
    min(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.min(arr);
    }

    /**
     * 範囲を求める
     * @param {object} args
     * @param {NUMBER}
     */
    range(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.max(arr) - Statistics.min(arr);
    }

    /**
     * 中央値を求める
     * @param {object} args
     * @param {NUMBER}
     */
    median(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.median(arr);
    }

    /**
     * 第一四分位数を求める
     * @param {object} args
     * @returns {Number}
     */
    firstQuaritile(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.firstQuaritile(arr);
    }

    /**
     * 第三四分位数を求める
     * @param {object} args
     * @returns {Number}
     */
    thirdQuaritile(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return Statistics.thirdQuaritile(arr);
    }

    /**
     * 四分位範囲を求める
     * @param {Object} args
     * @returns {Number}
     */
    interquaritileRange(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        return (Statistics.thirdQuaritile(arr) - Statistics.firstQuaritile(arr));
    }

    /**
     *  リスト内のVALUE1以上VALUE2未満の数値の個数を求める
     * @param {object} args 
     * @returns {int}
     */
    chooseNumToNum(args) {
        const arr = this._stringToArray(Cast.toString(args.LIST));
        const value1 = Cast.toNumber(args.VALUE1);
        const value2 = Cast.toNumber(args.VALUE2);
        var result = 0;
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] >= value1 && arr[i] < value2) {
                result++;
            }
        }
        return result;
    }
}

module.exports = Scratch3ElementaryStatistics;
