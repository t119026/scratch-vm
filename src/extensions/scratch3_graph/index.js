// グラフの描画を行うブロック
// "../scratch3_pen/index.js"をベースに作成
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Color = require('../../util/color');
const log = require('../../util/log');
const TargetType = require('../../extension-support/target-type');
const MathUtil = require('../../util/math-util');
const StageLayering = require('../../engine/stage-layering');
const RenderedTarget = require('../../sprites/rendered-target');
const formatMessage = require('format-message');
const Clone = require('../../util/clone');
const { MIN_WIDTH } = require('../../engine/comment');
const Statistics = require('../scratch3_elementarystatistics/statistics');
 
/**
 * ペンの色のパラメータ値を列挙
 * @readonly
 * @enum {string}
 */
const ColorParam = {
    COLOR: 'color',              // 色
    SATURATION: 'saturation',    //
    BRIGHTNESS: 'brightness',    // 輝度
    TRANSPARENCY: 'transparency' // 透明性
};
 
/**
 * @typedef {object} PenState   - 特定のターゲットに関連付けられているペンの状態
 * @property {Boolean} penDown  - ターゲットに対して描画する必要があるか
 * @property {number} color     - ペンの色(色相)
 * @property {PenAttributes} penAttributes  - ペンの属性
 */
 
/**
 * @param {Runtime} runtime - このパラメータでブロックのパッケージをインスタンス化する
 * @constructor
 */
class Scratch3Graph {
    constructor(runtime) {
        /**
         * ブロックパッケージをインスタンス化する
         * @type {Runtime}
         */
        this.runtime = runtime;
 
        /**
         * レイヤーに対応する描画できるレンダラーのID
         * @type {int}
         * @private
         */
        this._penDrawableId = -1;
 
        /**
         * レイヤーに対応するレンダラーのスキンID
         * @type {int}
         * @private
         */
        this._penSkinId = -1;
 
        // グラフ描画に用いる変数 //
        /**
         * グラフの縦軸の最大値
         * @type {int}
         * @private
         */
        this._maxVertical = 100;
        /**
         * 縦軸の分割数(メモリ描画に用いる)
         * @type {int}
         * @private
         */
        this._divisionVertical = 0;

        /**
         * 描画する数字の周りの余白
         * @type {int}
         * @private
         */
        this._margin = 1;
        /**
         * 描画する数字の横方向の線分の長さ
         * @type {int}
         * @private
         */
        this._numPerWidth = 5;
        /**
         * 描画する数字の縦方向の線分の長さ
         * @type {int}
         * @private
         */
        this._numPerHeight = 5;
        /**
         * 描画する数字の余白を含めた横方向の大きさ
         * @type {int}
         * @private
         */
        this._numWidth = this._numPerWidth + this._margin * 2;
 
        /**
         * 原点のx座標
         * @type {int}
         * @private
         */
        this._originX = -100;
        /**
         * 原点のy座標
         * @type {int}
         * @private
         */
        this._originY = -100;
        /**
         * y軸最上端のx座標
         * @type {int}
         * @private
         */
        this._verticalX = -100;
        /**
         * y軸最上端のy座標
         * @type {int}
         * @private
         */
        this._verticalY = 100;
        /**
         * x軸最右端のx座標
         * @type {int}
         * @private
         */
        this._horizontalX = 200;
        /**
         * x軸最右端のy座標
         * @type {int}
         * @private
         */
        this._horizontalY = -100;

        /**
         * 横軸のメモリ描画間隔
         * @type {int}
         * @private
         */
        this._plotWidth = 0;
        /**
         * 縦軸のメモリ描画間隔
         * @type {int}
         * @private
         */
        this._plotHeight = 0;

        this._onTargetCreated = this._onTargetCreated.bind(this);
        this._onTargetMoved = this._onTargetMoved.bind(this);
        runtime.on('targetWasCreated', this._onTargetCreated);
        runtime.on('RUNTIME_DISPOSED', this.clear.bind(this));
    }

    /**
     * 配列内の値が数値型で統一されているかを確認
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
     * 文字列をスペース区切りにし数値型に変換する
     * ただし、文字列が数値型に変換できない場合は空配列を返却
     * @param {array} arr
     * @returns {array}
     */
    _changeStringToNumberArray(arr) {
        // 文字列をスペース区切りで配列に格納(数値型に変換)
        const arr_split = arr.split(/\s/).map(Number);
        // 上記配列内がすべて数値型かを確認
        if(!this._checkArrayType_isNumber(arr_split)) {
            // 配列内がすべて数値型でない場合、空配列を返却
            return (new Array());
        }
        return arr_split;
    }
 
    /**
     * デフォルトのペンの状態。ターゲットにペンの状態がない場合に適用される
     * @type {PenState}
     */
    static get DEFAULT_PEN_STATE () {
        return {
            penDown: false,
            color: 66.66,
            saturation: 100,
            brightness: 100,
            transparency: 0,
            _shade: 50, // 色合いを変えるブロックのみに使われる
            penAttributes: {
                color4f: [0, 0, 1, 1],
                diameter: 1
            }
        };
    }
 
    /**
     * ペンのサイズの許容範囲(最小値, 最大値)
     * 最大値はステージの対角線の2倍で設定するため、
     * ステージ外のスプライトでも埋めることが可能
     * @type { {min: number, max: number} }
     */
    static get PEN_SIZE_RANGE() {
        return {min: 1, max: 1200}
    }
 
    /**
     * ターゲットのペンに関する状態をロード&保存する為のキー
     * @type {string}
     */
    static get STATE_KEY() {
        return 'Scratch.Graph';
    }
 
    /**
     * ペンのレイヤーに対するスキンIDを取得
     * ペンスキンが存在しない場合は、新たに作成する
     * @returns {int}   // ペンのレイヤーのスキンID。失敗時は-1
     * @private
     */
    _getPenLayerID() {
        if(this._penSkinId < 0 && this.runtime.renderer) {
            this._penSkinId = this.runtime.renderer.createPenSkin();
            this._penDrawableId = this.runtime.renderer.createDrawable(StageLayering.PEN_LAYER);
            this.runtime.renderer.updateDrawableSkinId(this._penDrawableId, this._penSkinId);
        }
        return this._penSkinId;
    }
 
    /**
     *
     * @param {Target} target ターゲットのペンの状態を収集。おそらくRenderedTarget
     * @returns {PenState}  ターゲットに関連付けられているペンの状態
     * @private
     */
    _getPenState(target) {
        var penState = target.getCustomState(Scratch3Graph.STATE_KEY);
        if(!penState) {
            penState = Clone.simple(Scratch3Graph.DEFAULT_PEN_STATE);
            target.setCustomState(Scratch3Graph.STATE_KEY, penState);
        }
        return penState;
    }
 
    /**
     * ペンを使用するターゲットがクローン化されたとき、ペンの状態もクローン化する
     * @param {Target} newTarget    // 新しく作成されたターゲット(クローン?)
     * @param {Target} [sourceTarget]   // 新しいクローンとして使用されるターゲット(既存の場合)
     * @listens Runtime#event: targetWasCreated
     * @private
     */
    _onTargetCreated(newTarget, sourceTarget) {
        if(sourceTarget) {  // ソースターゲットが既存か確認
            const penState = sourceTarget.getCustomState(Scratch3Graph.STATE_KEY);
            if(penState) {  // ペンの状態の取得が成功したか確認
                newTarget.setCustomState(Scratch3Graph.STATE_KEY, clone.simple(penState));
                if(penState.penDown) {  // ペンが下がっているか確認
                    newTarget.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
            }
        }
    }
 
    /**
     * 移動したターゲットを処理。ペンが下がっている時のみ発生
     * @param {RenderedTarget} target   移動したターゲット
     * @param {number} oldX 移動前のx座標
     * @param {number} oldY 移動前のy座標
     * @param {boolean} isForce 強制移動か
     * @private
     */
    _onTargetMoved(target, oldX, oldY, isFource) {
        // 強制移動ではない(ドラッグされていない)場合にのみ、ペンを移動
        if(!isFource) {
            const penSkinId = this._getPenLayerID();
            if(penSkinId >= 0) {    // ペンのスキンが存在するか確認
                const penState = this._getPenState(target);
                this.runtime.renderer.penLine(penSkinId, penState.penAttributes, oldX, oldY, target.x, target.y);   // 線を描画する為の設定
                this.runtime.requestRedraw();   // 再度描画する(設定に基づいて)
            }
        }
    }
 
    /**
     * 色の入力範囲を[0, 100]にラップ
     * @param {number} value    // ラップする値
     * @returns {number}        // ラップされた値
     * @private
     */
    _wrapColor(value) {
        return MathUtil.wrapClamp(value, 0, 100);
    }
 
    /**
     * ローカライズされた文字列でカラーパラメータメニューを初期化
     * @returns {array} ローカライズされたテキストと各メニュー要素の値
     * @private
     */
    _initColorParam() {
        return [
            {
                text: formatMessage({
                    id: 'Graph.colorMenu.color',
                    default: '色',
                    description: 'ペンの拡張機能用のカラー要素のラベル'
                }),
                value: ColorParam.COLOR
            },
            {
                text: formatMessage({
                    id: 'Graph.colorMenu.saturation',
                    default: '彩度',
                    description: 'ペン拡張機能用の飽和要素のラベル'
                }),
                value: ColorParam.SATURATION
            },
            {
                text: formatMessage({
                    id: 'Graph.colorMenu.brightness',
                    default: '輝度',
                    description: 'ペン拡張機能用の輝度要素のラベル'
                }),
                value: ColorParam.BRIGHTNESS
            },
            {
                text: formatMessage({
                    id: 'Graph.colorMenu.transparency',
                    default: '透明度',
                    description: 'ペン拡張機能用の透明要素のラベル'
                }),
                value: ColorParam.TRANSPARENCY
            }
        ];
    }
 
    /**
     * ペンの色の範囲を[0, 100]に固定
     * @param {number} value    固定する値
     * @returns {number}        固定された値
     * @private
     */
    _clampColorParam(value) {
        return MathUtil.clamp(value, 0, 100);
    }
 
    /**
     * ペンの透明度をアルファに変換
     * 透明度の範囲は[0, 100]で、0は不透明、100は透明
     * アルファの範囲は[0.0, 1.0]で、0は透明、1は不透明
     * @param {number} transparency
     * @returns {number}    アルファの値
     * @private
     */
    _transpancyToAlpha(transparency) {
        return 1.0 - (transparency / 100.0);
    }
 
    /**
     * penStateのオブジェクトの値を更新
     * @param {PenState} penState   アップデートするペンの状態
     * @private
     */
    _updatePenColor(penState) {
        // hsv色空間からRGBに変換
        const rgb = Color.hsvToRgb({
            h: penState.color * 360 / 100,
            s: penState.saturation / 100,
            v: penState.brightness / 100
        });
        // 変換後の値を設定
        penState.penAttributes.color4f[0] = rgb.r / 255.0;
        penState.penAttributes.color4f[1] = rgb.g / 255.0;
        penState.penAttributes.color4f[2] = rgb.b / 255.0;
        penState.penAttributes.color4f[3] = this._transpancyToAlpha(penState.transparency);
    }
 
    /**
     * 指定したパラメータを変更
     * @param {ColorParam} param    設定・変更するカラーパラメータ名
     * @param {number} value    パラメータを設定・変更する値
     * @param {PenState} penState   状態をアップデートする
     * @param {boolean} change  trueの場合、パラメータにvalueを加算し、falseの場合、パラメータをvalueに設定
     * @private
     */
    _setOrChangeColorParam(param, value, penState, change) {
        switch(param) {
            case ColorParam.COLOR:
                penState.color = this._wrapColor(value + (change ? penState.color : 0));
                break;
            case ColorParam.SATURATION:
                penState.saturation = this._clampColorParam(value + (change ? penState.saturation : 0));
                break;
            case ColorParam.BRIGHTNESS:
                penState.brightness = this._clampColorParam(value + (change ? penState.brightness : 0));
                break;
            case ColorParam.TRANSPARENCY:
                penState.transparency = this._clampColorParam(value + (change ? penState.transparency : 0));
                break;
            default:
                log.warn(`Tried to set or change unknown color parameter: ${param}`);
        }
        this._updatePenColor(penState);
    }
 
    /**
     * 拡張機能の追加
     * @returns {object}    ブロックのメタデータ
     */
    getInfo() {
        return {
            id: 'Graph',
            name: 'グラフ作成',
            blocks: [
                {
                    opcode: 'clear',
                    blockType: BlockType.COMMAND,
                    text: 'グラフを消す'
                },
                {
                    opcode: 'setPenColorToColor',
                    blockType: BlockType.COMMAND,
                    text: 'ペンの色を[COLOR]にする',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'changePenColorParamBy',
                    blockType: BlockType.COMMAND,
                    text: 'ペンの[COLOR_PARAM]を[VALUE]づつ変える',
                    arguments: {
                        COLOR_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'ColorParam',
                            defaultValue: ColorParam.COLOR
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'setPenColorParamTo',
                    blockType: BlockType.COMMAND,
                    text: 'ペンの[COLOR_PARAM]を[VALUE]にする',
                    arguments: {
                        COLOR_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'ColorParam',
                            defaultValue: ColorParam.COLOR
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'createBar',
                    blockType: BlockType.COMMAND,
                    text: '縦じくと横じくをかく',
                    filter: [TargetType.SPRITE]
                },
                {
                    opcode: 'plotPoint',
                    blockType: BlockType.COMMAND,
                    text: '縦じくを[VALUE]等分するメモリをかく',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        }
                    }
                },
                {
                    opcode: 'plotHorizontalPoint',
                    blockType: BlockType.COMMAND,
                    text: '横じくに[VALUE]個のメモリをかく',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 12
                        }
                    }
                },
                {
                    opcode: 'setMaxVertical',
                    blockType: BlockType.COMMAND,
                    text: '縦じくの最大値を[VALUE]にする',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'drawingLeftBar',
                    blockType: BlockType.COMMAND,
                    text: '縦じくの左にメモリの数値を書く'
                },
                {
                    opcode: 'drawingRightBar',
                    blockType: BlockType.COMMAND,
                    text: '縦じくの右にメモリの数値を書く'
                },
                {
                    opcode: 'createBarGraph',
                    blockType: BlockType.COMMAND,
                    text: '[LIST]を使って棒グラフをかく',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'plotBar',
                    blockType: BlockType.COMMAND,
                    text: "左から[NUM]個目のメモリの位置に大きさ[VALUE]の棒をかく",
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },
                {
                    opcode: 'plotLine',
                    blockType: BlockType.COMMAND,
                    text: '[LIST]を使って折れ線グラフをかく',
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'リスト'
                        }
                    }
                },
                {
                    opcode: 'plotCircle',
                    blockType: BlockType.COMMAND,
                    text: '[TEXT]を使って円グラフを作る',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'データ'
                        }
                    }
                },
                {
                    opcode: 'boxPlot',
                    blockType: BlockType.COMMAND,
                    text: '横じくの[VALUE]個目のメモリに[LIST]の箱ひげ図を作る',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'データ'
                        }
                    }
                },
                {
                    opcode: 'BandGraph',
                    blockType: BlockType.COMMAND,
                    text: '横じくの[VALUE]個目のメモリに[LIST]の帯グラフを作る',
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: 'データ'
                        }
                    }
                }
            ],
            menus: {
                ColorParam: {
                    acceptReporters: true,
                    items: this._initColorParam()
                }
            }
        };
    }

    /**
     * 数値を描画する
     * @param {double} x - 描画する数値の左上のx座標
     * @param {double} y - 描画する数値の左上のy座標
     * @param {object} target - ターゲット
     * @param {object} penState - ペンの状態
     * @param {object} number - 描画する数値
     */
    _moveNumber(x, y, target, penState, number) {
        // ターゲットの位置を初期化
        // 1を描画する場合
        if(number === 1) {
            // 中央に移動
            target.setXY(x + this._margin + 3, y);
        }
        // 1以外の数値を描画する場合
        else {
            // 左上に移動
            target.setXY(x + this._margin, y);
        }
        // ペンが下がっているか確認
        if(!penState.penDown) {
            penState.penDown = true;
            target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }
        const penSkinId = this._getPenLayerID();
        if(penSkinId >= 0) {
            this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
            this.runtime.requestRedraw();
        }
        // 数値を描画
        switch(number) {
            case 1:
                // 中央下に移動
                target.setXY(x + this._margin + 3, y - this._numPerHeight * 2);
                break;
            case 2:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                //左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                break;
            case 3:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                break; 
            case 4:
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                break;
            case 5:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 左上に移動
                target.setXY(x + this._margin, y);
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                break;
            case 6:
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                break;
            case 7:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                break;
            case 8:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                // 左上に移動
                target.setXY(x + this._margin, y);
                break;
            case 9:
                // 左中央に移動
                target.setXY(x + this._margin, y - this._numPerHeight);
                // 右中央に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 左上に移動
                target.setXY(x + this._margin, y);
                break;
            case 0:
                // 右上に移動
                target.setXY(x + this._margin + this._numPerWidth, y);
                // 右下に移動
                target.setXY(x + this._margin + this._numPerWidth, y - this._numPerHeight * 2);
                // 左下に移動
                target.setXY(x + this._margin, y - this._numPerHeight * 2);
                // 左上に移動
                target.setXY(x + this._margin, y);
                break;
        }
        // ペンを上げる
        if(penState.penDown) {
            penState.penDown = false;
            target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }
    }
 
    /**
     * レイヤーの描画を消す
     */
    clear() {
        const penSkinId = this._getPenLayerID();
        if(penSkinId >= 0) {
            this.runtime.renderer.penClear(penSkinId);
            this.runtime.requestRedraw();
        }
    }

    setPenColorToColor(args, util) {
        const penState = this._getPenState(util.target);
        const rgb = Cast.toRgbColorObject(args.COLOR);
        const hsv = Color.rgbToHsv(rgb);
        penState.color = (hsv.h / 360) * 100;
        penState.saturation = hsv.s * 100;
        penState.brightness = hsv.v * 100;
        if (rgb.hasOwnProperty('a')) {
            penState.transparency = 100 * (1 - (rgb.a / 255.0));
        } else {
            penState.transparency = 0;
        }

        // Set the legacy "shade" value the same way scratch 2 did.
        penState._shade = penState.brightness / 2;

        this._updatePenColor(penState);
    }

    changePenColorParamBy(args, util) {
        const penState = this._getPenState(util.target);
        this._setOrChangeColorParam(args.COLOR_PARAM, Cast.toNumber(args.VALUE), penState, true);
    }

    /**
     * ペンの状態をセットする
     */
    setPenColorParamTo(args, util) {
        const penState = this._getPenState(util.target);
        this._setOrChangeColorParam(args.COLOR_PARAM, Cast.toNumber(args.VALUE), penState, false);
    }
 
    /**
     * 縦軸と横軸を作成
     */
    createBar(args, util) {
        // 描画するターゲットを取得
        const target = util.target;
        // 状態を取得
        const penState = this._getPenState(target);
        // ターゲットの座標を初期化
        target.setXY(this._verticalX, this._verticalY);
        // penDownを利用
        // すでにペンが下がっているか確認
        if(!penState.penDown) {
            // ペンが下がっていない場合の処理
            penState.penDown = true;
            target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }
        const penSkinId = this._getPenLayerID();
        if(penSkinId >= 0) {
            this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
            this.runtime.requestRedraw();
        }
 
        // targetを移動し、グラフの縦軸と横軸を描画する
        target.setXY(this._originX, this._originY);   // 縦軸を描画
        target.setXY(this._horizontalX, this._horizontalY);    // 横軸を描画
       
        // penUpを利用
        if(penState.penDown) {
            penState.penDown = false;
            target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }
    }

    /**
     * 縦軸をn等分するメモリを描く
     * @param {object} args
     * @param {object} util
     */
    plotPoint(args, util) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        // ターゲットの取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 引数が数値型かを確認
        if(!isNaN(value)) {
            // メモリの幅を算出
            const h = Math.abs(this._verticalY - this._originY) / value;
            // 幅をプライベート変数に保管
            this._plotHeight = h;
            // 変数初期化
            var plotHeight = this._originY + h;
            // メモリ描画
            for(var i = 0; i < value; i++) {
                target.setXY(this._originX, plotHeight);
                // penDownを利用
                // すでにペンが下がっているか確認
                if(!penState.penDown) {
                    // ペンが下がっていない場合の処理
                    penState.penDown = true;
                    target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                const penSkinId = this._getPenLayerID();
                if(penSkinId >= 0) {
                    this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                    this.runtime.requestRedraw();
                }
        
                // targetを移動
                target.setXY(this._originX + 5, plotHeight);
        
                // penUpを利用
                if(penState.penDown) {
                    penState.penDown = false;
                    target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                plotHeight += h;
            }
            // 描画色を変更
            this._setOrChangeColorParam(ColorParam.COLOR, 0, penState, false);
            this._setOrChangeColorParam(ColorParam.SATURATION, 0, penState, false);
            this._setOrChangeColorParam(ColorParam.brightness, 50, penState, false);
            this._setOrChangeColorParam(ColorParam.brightness, 0, penState, false);
            
            // 補助線を描画
            plotHeight = this._originY + h;
            for(var i = 0; i < value; i++) {
                target.setXY(this._originX, plotHeight);
                // penDownを利用
                // すでにペンが下がっているか確認
                if(!penState.penDown) {
                    // ペンが下がっていない場合の処理
                    penState.penDown = true;
                    target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                const penSkinId = this._getPenLayerID();
                if(penSkinId >= 0) {
                    this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                    this.runtime.requestRedraw();
                }
        
                // targetを移動
                target.setXY(this._horizontalX, plotHeight);
        
                // penUpを利用
                if(penState.penDown) {
                    penState.penDown = false;
                    target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                plotHeight += h;
            }
            // 分割数を変数に保存
            this._divisionVertical = value;
        }
    }

    /**
     * 横軸にn個のメモリを振る
     * @param {object} args
     * @param {object} util
     */
    plotHorizontalPoint(args, util) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        // ターゲットの取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 引数が数値型かを確認
        if(!isNaN(value)) {
            // メモリの幅を算出
            this._plotWidth = Math.abs(this._horizontalX - this._originX) / value;
            // メモリの位置を表す変数
            var w = this._originX + this._plotWidth / 2.0;
            // メモリ描画
            for(var i = 0; i < value; i++){
                target.setXY(w, this._originY - 3);
                // penDownを利用
                // すでにペンが下がっているか確認
                if(!penState.penDown) {
                    // ペンが下がっていない場合の処理
                    penState.penDown = true;
                    target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                const penSkinId = this._getPenLayerID();
                if(penSkinId >= 0) {
                    this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                    this.runtime.requestRedraw();
                }
        
                // targetを移動
                target.setXY(w, this._originY + 3);
        
                // penUpを利用
                if(penState.penDown) {
                    penState.penDown = false;
                    target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                w += this._plotWidth;
            }

            // メモリに数値を振る //
            //　一番左にあるメモリのx座標を算出
            w = this._originX + this._plotWidth / 2.0;
            // 数値を描画
            for(var i = 0; i < value; i++) {
                // 数値が1桁の場合
                if(i < 9) {
                    this._moveNumber(w - 3, this._originY - 5, target, penState, i+1);
                }
                // 数値が2桁以上の場合
                else {
                    // 数値を文字列に変換
                    const str = String(i+1);
                    // 一桁ずつ描画していくため、1つづつに区切り、数値型に変換
                    const num_sprit = str.split("").map(Number);
                    // 配置場所を計算
                    var start_x = 0
                    // 数値が偶数桁の場合
                    if(num_sprit.length % 2 === 0) {
                        start_x = w - this._numWidth * (num_sprit.length / 2);
                    }
                    // 数値が奇数桁の場合
                    else {
                        start_x = w - this._numWidth * Math.floor(num_sprit.length / 2) - this._numWidth / 2.0;
                    }
                    // 描画開始地点の確認
                    // console.log(start_x);
                    for(var j = 0; j < num_sprit.length; j++) {
                        // 描画
                        this._moveNumber(start_x, this._originY - 5, target, penState, num_sprit[j]);
                        // 描画するx座標を更新
                        start_x += this._numWidth;
                    }
                }
                // 描画位置の更新
                w += this._plotWidth;
            }
        }
    }
 
    /**
     * 縦軸の最大値を設定する
     * @param {object} args 引数
     */
    setMaxVertical(args) {
        if(!isNaN(Cast.toNumber(args.VALUE))) {
            this._maxVertical = Cast.toNumber(args.VALUE);
        }
    }

    /**
     * 縦軸の左側に最大値valueのメモリを振る
     * @param {object} args 
     * @param {object} util 
     */
    drawingLeftBar(args, util) {
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);
        // メモリを振っていない場合、関数を終了する
        if(this._divisionVertical > 0 && this._plotHeight > 0) {
            // 下から描画する数値を計算
            var plotNum = Math.round(this._maxVertical / this._divisionVertical);
            // 描画する数値がいくつあるか確認するため, arrayを定義
            var num_sprit = [];
            var x = this._originX - this._numWidth - 3;
            var y = this._originY + this._numPerHeight;
            this._moveNumber(x, y, target, penState, 0);
            for(var i = 0; i < this._divisionVertical; i++) {
                // 描画する数値を更新
                plotNum = Math.round(this._maxVertical / this._divisionVertical * (i+1));
                // 配列を空にするために初期化
                num_sprit = []; 
                num_sprit = String(plotNum).split("").map(Number);
                // 描画するx座標の開始地点を算出
                x = this._originX - this._numWidth * num_sprit.length - 3;
                // 描画するy座標の開始地点を算出
                y = this._originY + this._plotHeight * (i+1) + this._numPerHeight;
                // 数値を描画
                for(var j = 0; j < num_sprit.length; j++) {
                    this._moveNumber(x, y, target, penState, num_sprit[j]);
                    x += this._numWidth;
                }
            }
        }
    }

    /**
     * 縦軸の右側に最大値valueのメモリを振る
     * @param {object} args 
     * @param {object} util 
     */
    drawingRightBar(args, util) {
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 縦軸にメモリを振っていない場合は関数を終了させる
        if(this._divisionVertical > 0 && this._plotHeight > 0) {
            // 下から描画する数値を計算
            var plotNum = Math.round(this._maxVertical / this._divisionVertical);
            // 描画する数値がいくつあるか確認するため, arrayを定義
            var num_sprit = [];
            var x = this._horizontalX + 3;
            var y = this._originY + this._numPerHeight;
            this._moveNumber(x, y, target, penState, 0);
            for(var i = 0; i < this._divisionVertical; i++) {
                // 描画する数値を更新
                plotNum = Math.round(this._maxVertical / this._divisionVertical * (i+1));
                // 配列を空にするために初期化
                num_sprit = []; 
                num_sprit = String(plotNum).split("").map(Number);
                // 描画するx座標の開始地点
                x = this._horizontalX + 3;
                // 描画するy座標の開始地点を算出
                y = this._originY + this._plotHeight * (i+1) + this._numPerHeight;
                // 数値を描画
                for(var j = 0; j < num_sprit.length; j++) {
                    this._moveNumber(x, y, target, penState, num_sprit[j]);
                    x += this._numWidth;
                }
            }
        }
    }

    /**
     * 棒グラフを描く
     * @param {object} args
     * @param {object} util
     */
    createBarGraph(args, util) {
        // 引数取得
        const list = Cast.toString(args.LIST);
        const arr = this._changeStringToNumberArray(list);
        // 引数取得確認
        // console.log(arr);
        // console.log(arr.length);
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);

        if(this._plotWidth !== 0) {
            // 棒の横の長さを決定
            // 描画範囲の80%
           // もし、this._plotWidth = 0なら、横軸全体の80%を指定
            const w = (this._plotWidth === 0 ? Math.abs(this._horizontalX - this._originX) : this._plotWidth) * 0.8;
            // 描画開始位置を算出
            var start = 0;
            // 縦の長さを算出
            var height = 0;
            // 棒の対角線を定義
            var vartex1_x = 0;
            var vartex1_y = 0;
            var vartex2_x = 0;
            var vartex2_y = 0;
            
            const success = new Promise(resolve => {
                for(var i = 0; i < arr.length; i++) {
                    if(arr[i] > 0) {
                        start = this._plotWidth === 0 ? (this._originX + this._horizontalX)/2.0 : (this._originX + this._plotWidth * (i + 0.5) - w / 2.0);
                        height = Math.abs(this._verticalY - this._originY) * (arr[i] / this._maxVertical);
                        console.log(start);
                        // 棒の対角線を定義
                        vartex1_x = start;
                        vartex1_y = this._originY;
                        vartex2_x = start + w;
                        vartex2_y = this._originY + height;
                        // ターゲットの座標を初期化
                        target.setXY(vartex1_x, vartex1_y);
                        // 棒(塗りつぶされた四角形)を描画
                        for(var y = 0; y < Math.abs(vartex1_y - vartex2_y); y += (Math.abs(vartex2_y - vartex1_y) / (vartex2_y - vartex1_y))) {
                            // すでにペンが下がっているか確認
                            if(!penState.penDown) {
                                // ペンが下がっていない場合の処理
                                penState.penDown = true;
                                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                            }
                            const penSkinId = this._getPenLayerID();
                            if(penSkinId >= 0) {
                                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                                this.runtime.requestRedraw();
                            }
            
                            // x座標をvartex2_xにする
                            target.setXY(vartex2_x, vartex1_y + y);
                            // x座標をvartex1_xにする
                            target.setXY(vartex1_x, vartex1_y + y);
            
                            // penUpを利用
                            if(penState.penDown) {
                                penState.penDown = false;
                                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                            }
                        }
                    }
                }
            });
        }
    }
 
    /**
     * 指定した位置に棒グラフを描画する
     * @param {object} args  引数
     */
    plotBar(args, util) {
        // 引数取得
        const num = Cast.toNumber(args.NUM);
        const value = Cast.toNumber(args.VALUE);
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 引数が数値型かを確認
        if(!isNaN(num) && !isNaN(value) && value > 0) {
            // 棒の横の長さを決定
            // 描画範囲の80%
            // もし、this._plotWidth = 0なら、横軸全体の80%を指定
            const w = (this._plotWidth === 0 ? Math.abs(this._horizontalX - this._originX) : this._plotWidth) * 0.8;
            // 描画開始位置を算出
            const start = (this._plotWidth === 0 ? (this._originX + this._horizontalX)/2.0 : (this._originX + this._plotWidth * (num - 0.5))) - w / 2.0;
            // 縦の長さを算出
            const height = Math.abs(this._verticalY - this._originY) * (value / this._maxVertical);
            
            // 棒の対角線を定義
            var vartex1_x = start;
            var vartex1_y = this._originY;
            var vartex2_x = start + w;
            var vartex2_y = this._originY + height;
            // ターゲットの座標を初期化
            target.setXY(vartex1_x, vartex1_y);
            // 棒(塗りつぶされた四角形)を描画
            for(var y = 0; y < Math.abs(vartex1_y - vartex2_y); y += (Math.abs(vartex2_y - vartex1_y) / (vartex2_y - vartex1_y))) {
                // すでにペンが下がっているか確認
                if(!penState.penDown) {
                    // ペンが下がっていない場合の処理
                    penState.penDown = true;
                    target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
                const penSkinId = this._getPenLayerID();
                if(penSkinId >= 0) {
                    this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                    this.runtime.requestRedraw();
                }
                // x座標をvartex2_xにする
                target.setXY(vartex2_x, vartex1_y + y);
                // x座標をvartex1_xにする
                target.setXY(vartex1_x, vartex1_y + y);
                // penUpを利用
                if(penState.penDown) {
                    penState.penDown = false;
                    target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
            }
        } 
    }
 
    /**
     * 折れ線グラフを描く
     * @param {object} args 引数
     */
    plotLine(args, util) {
        // 引数をstringで受け取る
        const text = Cast.toString(args.LIST);
        console.log(text);
        // スペース区切りで配列へ
        const arr = this._changeStringToNumberArray(text);
 
        // 線を描画するためのターゲットを取得
        const target = util.target;
        const penState = this._getPenState(target);
        
        // 横軸のメモリが設定されていない場合は何も描かない
        if(this._plotWidth > 0) {
            // ターゲットの初期位置を算出
            // 縦軸の算出
            var y = this._originY + Math.abs(this._verticalY - this._originY) * (arr[0] / this._maxVertical);
            var x = this._originX + this._plotWidth * 0.5;
            target.setXY(x, y);
    
            // penDownを利用
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            const penSkinId = this._getPenLayerID();
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
    
            // targetを移動し、折れ線を描画
            for(var i = 1; i < arr.length; i++) {
                // 縦軸の位置を算出
                y = this._originY + Math.abs(this._verticalY - this._originY) * (arr[i] / this._maxVertical);
                // 横軸の位置を算出
                x += this._plotWidth;

                // 確認
                // console.log("(x, y) = (", x, ", ", y, ")");
                target.setXY(x, y);
            }
        
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
        }
    }

    /**
     * 円グラフを描画
     * @param {object} args 
     */
     plotCircle(args, util) {
        /**
         * 引数をstringでキャストして受け取る
         * @type {string}
         */
        const text = Cast.toString(args.TEXT);
        
        const arr = this._changeStringToNumberArray(text);
        /**
         * 引数の配列を割合に変換
         * @type {Array}
         */
        var ratio_arr = Array(arr.length);
        /**
         * 総和
         * @type {double}
         */
        var sum = 0.0;
 
        // penDownを利用
        const target = util.target;
        const penState = this._getPenState(target);
 
        // 円グラフのサイズを設定
        const circleSize = 100;
 
        ratio_arr.fill(0);  // 割合の配列を0で初期化
        var arr_length = 0;
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] > 0) {
                sum += arr[i];
            }
            else {
                arr[i] = 0;
            }
        }
 
        for(var i = 0; i < arr.length; i++) {
            ratio_arr[i] = arr[i] / sum;
        }
        
        // 円グラフを描画
        // 円の中心点から線を引く
        var rad = 0.0
        var r = 0.0;
        for(var i = 0; i < ratio_arr.length; i++) {
            rad += ratio_arr[i] * 360;
            // ターゲットの座標を初期化
            target.setXY(0, 0);  
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            const penSkinId = this._getPenLayerID();
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
 
            while(r < rad) {
                // targetを移動し、線を描画する
                target.setXY(circleSize * Math.cos(Math.PI / 2.0 - 2.0 * r * Math.PI / 360.0), circleSize  *Math.sin(Math.PI / 2.0 - 2.0 * r * Math.PI / 360.0));
                target.setXY(0, 0);
                r += 0.1;
            }
 
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            // 描画色を変更
            this._setOrChangeColorParam(ColorParam.COLOR, 30, penState, true);
        }
    }

    /**
     * 箱ひげ図を作る
     * @param {object} args 
     * @param {object} util 
     */
    boxPlot(args, util) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        const str = Cast.toString(args.LIST);
        const arr = this._changeStringToNumberArray(str);
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 引数が数値型かを確認
        if(!isNaN(value) && arr.length !== 0) {
            // 最大値・平均値・最小値・中央値・第1四分位数・第3四分位数を算出
            const maximum = Statistics.max(arr);
            const minimum = Statistics.min(arr);
            const average = Statistics.average(arr);
            const median = Statistics.median(arr);
            const firstQuaritile = Statistics.firstQuaritile(arr);
            const thirdQuaritile = Statistics.thirdQuaritile(arr);
            console.log("第1四分位数 : ",firstQuaritile);
            console.log("第3四分位数 : ",thirdQuaritile);

            // 描画範囲を設定
            const w = (this._plotWidth === 0 ? Math.abs(this._horizontalX - this._originX) : this._plotWidth) * 0.8;

            // x座標の左端と右端を算出
            const x_left = (this._plotWidth === 0 ? (this._originX + this._horizontalX)/2 : this._originX + this._plotWidth * (value - 0.5))- w/2.0;
            const x_right = x_left + w;
            // 上の変数から中間地点を算出
            const x_mid = (x_left + x_right)/2.0;

            // 箱ひげ図を描画
            // 最小値を描画 //
            // ターゲット移動
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (minimum / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            const penSkinId = this._getPenLayerID();
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_right, this._originY + Math.abs(this._verticalY - this._originY) * (minimum / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }

            // 最小値から第1四分位数をつなぐ直線を描画
            // ターゲット移動
            target.setXY(x_mid, this._originY + Math.abs(this._verticalY - this._originY) * (minimum / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_mid, this._originY + Math.abs(this._verticalY - this._originY) * (firstQuaritile / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }

            // 第1四分位数と第3四分位数からなる四角形を描画
            // ターゲット移動
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (firstQuaritile / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_right, this._originY + Math.abs(this._verticalY - this._originY) * (firstQuaritile / this._maxVertical));
            target.setXY(x_right, this._originY + Math.abs(this._verticalY - this._originY) * (thirdQuaritile / this._maxVertical));
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (thirdQuaritile / this._maxVertical));
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (firstQuaritile / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }

            // 中央値を描画
            // ターゲット移動
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (median / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_right, this._originY + Math.abs(this._verticalY - this._originY) * (median / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }

            // 第3四分位数と最大値を結ぶ直線を描画
            // ターゲット移動
            target.setXY(x_mid, this._originY + Math.abs(this._verticalY - this._originY) * (thirdQuaritile / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_mid, this._originY + Math.abs(this._verticalY - this._originY) * (maximum / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }

            // 最大値を描画
            // ターゲット移動
            target.setXY(x_left, this._originY + Math.abs(this._verticalY - this._originY) * (maximum / this._maxVertical));
            // すでにペンが下がっているか確認
            if(!penState.penDown) {
                // ペンが下がっていない場合の処理
                penState.penDown = true;
                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
            if(penSkinId >= 0) {
                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                this.runtime.requestRedraw();
            }
            // ターゲット移動
            target.setXY(x_right, this._originY + Math.abs(this._verticalY - this._originY) * (maximum / this._maxVertical));
            // penUpを利用
            if(penState.penDown) {
                penState.penDown = false;
                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
            }
        }
    }

    /**
     * 帯グラフを描く
     * @param {object} args 
     * @param {object} util 
     */
    BandGraph(args, util) {
        // 引数取得
        const value = Cast.toNumber(args.VALUE);
        const str = Cast.toString(args.LIST);
        const arr = this._changeStringToNumberArray(str);
        // ターゲット取得
        const target = util.target;
        const penState = this._getPenState(target);
        // 引数が数値型かを判断 && 配列が空か判断
        if(!isNaN(value) && arr.length !== 0) {
            // 現在の色情報を格納
            const color_now = penState.color;
            // 割合を格納する配列を定義
            var ratio_arr = Array(arr.length);
            ratio_arr.fill(0);  // 0で初期化
            // 総和を計算
            var sum = 0.0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i] > 0) {
                    sum += arr[i];
                }
                else {
                    arr[i] = 0.0;
                }
            }
            // 割合を計算
            for(var i = 0; i < arr.length; i++) {
                ratio_arr[i] = arr[i] / sum * 100;
            }
            // 棒を描画するため、スタート地点を算出 // 
            // 描画範囲を算出
            const w = (this._plotWidth === 0 ? Math.abs(this._horizontalX - this._originX) : this._plotWidth) * 0.8;
            const start = (this._plotWidth === 0 ? (this._originX + this._horizontalX)/2.0 : this._originX + this._plotWidth * (value - 0.5)) - w/2.0;
            // 高さ算出に用いる変数を定義
            var h = 0.0;
            // 繰り返し
            const success = new Promise(resolve => {
                for(var i = 0; i < ratio_arr.length; i++) {
                    if(ratio_arr[i] > 0) {
                        // 高さを算出
                        const height = Math.abs(this._verticalY - this._originY) * ((h + ratio_arr[i]) / this._maxVertical);
                        // 棒の対角線を定義
                        var vartex1_x = start;
                        var vartex1_y = this._originY + Math.abs(this._verticalY - this._originY) * (h / this._maxVertical);
                        var vartex2_x = start + w;
                        var vartex2_y = this._originY + height;
                        // ターゲットの座標を初期化
                        target.setXY(vartex1_x, vartex1_y);
                        // 棒(塗りつぶされた四角形)を描画
                        for(var y = 0; y < Math.abs(vartex1_y - vartex2_y); y += (Math.abs(vartex2_y - vartex1_y) / (vartex2_y - vartex1_y))) {
                            // すでにペンが下がっているか確認
                            if(!penState.penDown) {
                                // ペンが下がっていない場合の処理
                                penState.penDown = true;
                                target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                            }
                            const penSkinId = this._getPenLayerID();
                            if(penSkinId >= 0) {
                                this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
                                this.runtime.requestRedraw();
                            }
            
                            // x座標をvartex2_xにする
                            target.setXY(vartex2_x, vartex1_y + y);
                            // x座標をvartex1_xにする
                            target.setXY(vartex1_x, vartex1_y + y);
            
                            // penUpを利用
                            if(penState.penDown) {
                                penState.penDown = false;
                                target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                            }
                        }
                        // 変数更新
                        h += ratio_arr[i];
                        // ペンの色を更新
                        this._setOrChangeColorParam(ColorParam.COLOR, 30, penState, true);
                    }
                }
            });
            console.log(success);
            // 描画終了後、元の色状態に戻す
            this._setOrChangeColorParam(ColorParam.COLOR, color_now, penState, false);
        }
    }
}
module.exports = Scratch3Graph;
