/**
 * 統計量計算を扱うclass
 * @constructor
 */
class Statistics {
    constructor() {

    }

    /**
     * 総和を計算
     * @param {Array} arr
     * @returns {Number}
     */
    static sum(arr) {
        var s = 0;
        for(var i = 0; i < arr.length; i++) {
            s += arr[i];
        }
        return s;
    }

    /**
     * 平均値を計算
     * @param {Array} arr
     * @returns {Number}
     */
    static average(arr) {
        const sum = this.sum(arr);
        return (sum/arr.length);
    }

    /**
     * 最大値を求める
     * @param {Array} arr
     * @returns {Number}
     */
    static max(arr) {
        var maximum = arr[0];
        for(var i = 0; i < arr.length; i++) {
            if(maximum < arr[i]) {
                maximum = arr[i];
            }
        }
        return maximum;
    }

    /**
     * 最小値を求める
     * @param {Array} arr
     * @returns {Number}
     */
    static min(arr) {
        var minimum = arr[0];
        for(var i = 0; i < arr.length; i++) {
            if(minimum > arr[i]) {
                minimum = arr[i];
            }
        }
        return minimum;
    }

    /**
     * 中央値を求める
     * @param {Array} arr
     * @returns {Number}
     */
    static median(arr) {
        var med = 0;
        const arr_s = this.sort(arr, "desc");
        if(arr_s.length % 2 == 0) {
            med = arr_s[arr_s.length/2];
        }
        else {
            med = arr_s[(arr_s.length-1)/2] + arr_s[(arr_s.length-1)/2+1];
            med /= 2;
        }
        return med;
    }

    /**
     * 第1四分位数を求める
     * @param {Array} arr
     * @returns {Number}
     */
    static firstQuaritile(arr) {
        const arr_s = this.sort(arr, "asc");
        if(arr_s.length % 2 === 0) {
            const arr_length = arr_s.length / 2;
            if(arr_length % 2 === 0) {
                return (arr_s[arr_length/2-1] + arr_s[arr_length/2])/2.0;
            }
            else {
                return (arr_s[(arr_length-1)/2]);
            }
        }
        else {
            const arr_length = (arr_s.length-1) / 2;
            if(arr_length % 2 === 0) {
                return (arr_s[arr_length/2-1] + arr_s[arr_length/2])/2.0;
            }
            else {
                return (arr_s[(arr_length-1)/2]);
            }
        }
    }

    /**
     * 第3四分位数を求める
     * @param {Array} arr
     * @returns {Number}
     */
    static thirdQuaritile(arr) {
        const arr_s = this.sort(arr, "desc");
        if(arr_s.length % 2 === 0) {
            const arr_length = arr_s.length/2;
            if(arr_length % 2 === 0) {
                return (arr_s[arr_length/2-1] + arr_s[arr_length/2])/2.0;
            }
            else {
                return (arr_s[(arr_length-1)/2]);
            }
        }
        else {
            const arr_length = (arr_s.length-1) / 2;
            if(arr_length % 2 === 0) {
                return (arr_s[arr_length/2-1] + arr_s[arr_length/2])/2.0;
            }
            else {
                return (arr_s[(arr_length-1)/2]);
            }
        }
    }

    /**
     * ソート
     * @param {Array} arr
     * @param {string} order - desc : 降順(大 -> 小), asc : 昇順(小 -> 大)
     * @returns {Array}
     */
    static sort(arr, order) {
        if(order === 'desc') {
            arr.sort(function(a, b) {
                if(a > b) {
                    return -1;
                }
                else if(a < b) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }
        else if(order === 'asc') {
            arr.sort(function(a, b) {
                if(a < b) {
                    return -1;
                }
                else if(a > b) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }
        else {
            console.log('order name is not found');
        }
        return arr;
    }
}
module.exports = Statistics;
