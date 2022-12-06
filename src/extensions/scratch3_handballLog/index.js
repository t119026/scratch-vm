const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');

/**
 * Enum for class parameter
 * @readonly
 * @enum {string}
 */
const classDataParam = {
    CLASS1: 'class1',
    CLASS2: 'class2',
    CLASS3: 'class3'
};

/**
 * @param {Runtime} runtime
 * @constructor
 */
class Scratch3HandballLog {
    constructor(runtime) {
        this.runtime = runtime;

        /**
         * 6-1　ハンドボールの記録
         * @type {array} 
         */
        this._array1 = [
            27, 17, 20, 22, 17, 32, 27, 18, 34, 41, 24, 28, 32, 37, 23, 20, 35, 14, 33, 30, 26, 28, 35, 13, 26, 19, 24, 26
        ];
        this._array2 = [
            22, 18, 30, 37, 22, 28, 28, 19, 31, 33, 25, 32, 24, 21, 28, 23, 34, 18, 33, 27, 19, 27, 34, 17, 36, 23
        ];
        this._array3 = [
            14, 24, 29, 14, 38, 24, 33, 24, 38, 40, 19, 25, 40, 33, 23, 37, 27, 24, 23, 32, 34, 28, 29, 19, 17, 18, 23
        ];
    }

    _initClassDataParam() {
        return [
            {
                text: formatMessage({
                    id: 'classdata.ClassDataMenu.class1',
                    default: '6年1組',
                    description: '6-1の記録'
                }),
                value: classDataParam.CLASS1
            },
            {
                text: formatMessage({
                    id: 'classdata.ClassDataMenu.class2',
                    default: '6年2組',
                    description: '6-2の記録'
                }),
                value: classDataParam.CLASS2
            },
            {
                text: formatMessage({
                    id: 'classdata.ClassDataMenu.class3',
                    default: '6年3組',
                    description: '6-3の記録'
                }),
                value: classDataParam.CLASS3
            }
        ];
    }

    getInfo() {
        return {
            id: 'classdata',
            name: '6年ソフトボール投げの結果',
            blocks: [
                {
                    opcode: 'getValue',
                    blockType: BlockType.REPORTER,
                    text: '[CLASS]の番号[VALUE]の記録',
                    arguments: {
                        CLASS: {
                            type: ArgumentType.STRING,
                            menu: 'classdataparam',
                            defaultValue: classDataParam.CLASS1
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getLength',
                    blockType: BlockType.REPORTER,
                    text: '[CLASS]の記録の長さ',
                    arguments: {
                        CLASS: {
                            type: ArgumentType.STRING,
                            menu: 'classdataparam',
                            defaultValue: classDataParam.CLASS1
                        }
                    }
                }
            ],
            menus: {
                classdataparam: {
                    acceptReporters: true,
                    items: this._initClassDataParam()
                }
            }
        };
    }

    getValue(args) {
        const c = Cast.toString(args.CLASS);
        const iter = Cast.toNumber(args.VALUE);

        if(c === classDataParam.CLASS1) {
            if(iter <= this._array1.length && iter > 0) {
                return this._array1[iter - 1];
            }
        }
        else if(c === classDataParam.CLASS2) {
            if(iter <= this._array2.length && iter > 0) {
                return this._array2[iter - 1];
            }
        }
        else if(c === classDataParam.CLASS3) {
            if(iter <= this._array3.length && iter > 0) {
                return this._array3[iter - 1];
            }
        }

        return null;
    }

    getLength(args) {
        const c = Cast.toString(args.CLASS);

        if(c === classDataParam.CLASS1) {
            return this._array1.length;
        }
        else if(c === classDataParam.CLASS2) {
            return this._array2.length;
        }
        else if(c === classDataParam.CLASS3) {
            return this._array3.length;
        }

        return null;
    }
}

module.exports = Scratch3HandballLog;
